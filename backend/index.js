const http = require("http");
const express = require("express");
const { Server: SocketServer } = require("socket.io");
const pty = require("node-pty");
const fs = require("fs/promises");
const path = require("path");
const cors = require("cors");
const chokidar = require("chokidar");

// Start a new pseudo-terminal process
const ptyProcess = pty.spawn("bash", [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: path.resolve(__dirname, "user"),
    env: process.env
});

// console.log("INTI_CMD:", process.env.INTI_CMD);
// console.log("path--->", path.resolve(__dirname, "user"));

const app = express();
const server = http.createServer(app); // Use this server instance
const io = new SocketServer(server, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"] // Allowed methods
    }
});

// cors enable for rest-api
app.use(cors());

chokidar.watch("./user").on("all", (event, path) => {
    // console.log(event, path);
    // console.log("chowkidar---", { event, path });

    io.emit("file:refresh", path);
});

ptyProcess.onData((data) => {
    // console.log("ptyProcess onData-", data);
    io.emit("terminal:data", data);
});

io.on("connection", (socket) => {
    // console.log(`Socket connected:`, socket.id);
    socket.on("terminal:write", (data) => {
        // console.log("ptyProcess write-", data);
        ptyProcess.write(data);
    });

    socket.on("file:change", async ({ path, content }) => {
        console.log({ path, content });
        await fs.writeFile(`./user${path}`, content);
    });
});

app.get("/files", async (req, res) => {
    const fileTree = await generateFileTree(path.resolve(__dirname, "user"));
    res.json({ tree: fileTree });
});

// read content from file and send to ui
app.get("/files/content", async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, "utf-8");
    res.json({ content });
});

// Ensure the server listens on port 9000
server.listen(9000, () =>
    console.log("Docker 🐳 server is running at port 9000")
);

async function generateFileTree(directory) {
    // console.log("generateFileTree runs..", directory);

    const tree = {};

    async function buildTree(currentDir, currentTree) {
        // console.log("buildTree called 👋", { currentDir, currentTree });

        const files = await fs.readdir(currentDir);
        // console.log("files---", files);

        for (const file of files) {
            const filePath = path.join(currentDir, file);
            // console.log("filePath >>>", filePath);

            const stat = await fs.stat(filePath);
            // console.log("stat", stat);

            if (stat.isDirectory()) {
                // console.log("if... isDirectory\n");

                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                // console.log("else\n");
                currentTree[file] = null;
            }
        }
    }
    await buildTree(directory, tree);
    return tree;
}
