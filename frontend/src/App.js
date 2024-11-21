import { useEffect, useState, useCallback } from "react";
import "./App.scss";
import Terminal from "./components/Terminal";
import FileTree from "./components/FileTree";
import socket from "./socket";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

function App() {
    const [fileTree, setFileTree] = useState({});
    const [selectedFile, setSelectedFile] = useState("");
    const [selectedFileContent, setSelectedFileContent] = useState("");
    const [code, setCode] = useState("");

    const getFileTree = () => {
        fetch("http://localhost:9000/files")
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                setFileTree(res.tree);
            })
            .catch((err) => {
                console.log("err-", err);
            });
    };

    const getFileContent = async () => {
        if (!selectedFile) return;
        const res = await fetch("http://localhost:9000/files/content");
        const json = await res.json();
        console.log("json", json);
        setSelectedFileContent(json.content);
    };

    useEffect(() => {
        getFileTree();
    }, []);

    useEffect(() => {
        socket.on("file:refresh", getFileTree);
        return () => {
            socket.off("file:refresh", getFileTree);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            console.log("save code", code);
            socket.emit("file:change", {
                path: selectedFile,
                content: code
            });
        }, 3 * 1000);

        return () => {
            clearTimeout(timer);
        };
    }, [code]);

    useEffect(() => {
        if (selectedFile) getFileContent();
    }, [selectedFile]);

    const onChange = useCallback((val, viewUpdate) => {
        setCode(val);
    }, []);

    return (
        <div className='playground'>
            <div className='editor-container'>
                <div className='file-explorer'>
                    <FileTree
                        onSelect={(path) => setSelectedFile(path)}
                        tree={fileTree}
                    />
                </div>
                <div className='editor'>
                    {selectedFile && (
                        <p>{selectedFile.replaceAll("/", " / ")}</p>
                    )}
                    <CodeMirror
                        value={code}
                        height='500px'
                        width='500px'
                        extensions={[javascript({ jsx: true })]}
                        onChange={onChange}
                    />
                </div>
            </div>
            <div className='terminal-container'>
                <Terminal />
            </div>
        </div>
    );
}

export default App;
