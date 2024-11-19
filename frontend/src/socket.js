import { io } from "socket.io-client";

const socket = io("http://localhost:9000", {
    transports: ["websocket"] // Ensure WebSocket transport
});

export default socket;
