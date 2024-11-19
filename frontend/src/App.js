import { useEffect, useState, useCallback } from "react";
import "./App.css";
import Terminal from "./components/Terminal";
import FileTree from "./components/FileTree";
import socket from "./socket";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";

function App() {
    const [fileTree, setFileTree] = useState({});
    const [selectedFile, setSelectedFile] = useState("");
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

    useEffect(() => {
        getFileTree();
    }, []);

    console.log("filetree-", fileTree);

    useEffect(() => {
        socket.on("file:refresh", getFileTree);
        return () => {
            socket.off("file:refresh", getFileTree);
        };
    }, []);

    const [value, setValue] = useState("console.log('hello world!');");
    const onChange = useCallback((val, viewUpdate) => {
        console.log("val:", val);
        setValue(val);
    }, []);

    return (
        <div className='playground'>
            <div className='editor-container'>
                <div className='file-explorer'>
                    <FileTree
                        onSelect={(path) => console.log("Select-", path)}
                        tree={fileTree}
                    />
                </div>
                <div className='editor'>
                    <CodeMirror
                        value={value}
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
