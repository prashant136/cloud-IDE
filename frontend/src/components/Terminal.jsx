import React, { useRef, useEffect } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import socket from '../socket';

const Terminal = () => {
    const terminalRef = useRef(null); // To reference the terminal DOM element

    useEffect(() => {
        // Initialize the terminal and the addon
        const terminal = new XTerminal({
            rows: 20
        });

        terminal.open(terminalRef.current);

        // Handle terminal input
        terminal.onData((data) => {
            // console.log('terminal.onData--', data);
            socket.emit('terminal:write', data);
        });
        socket.on('terminal:data', (data) => {
            // console.log('terminal:data in UI 👋', data);
            terminal.write(data);
        })

        return () => {
            terminal.dispose();
        };
    }, []);

    return (
        <div
            ref={terminalRef}
            id="terminal"
        ></div>
    );
};

export default Terminal;
