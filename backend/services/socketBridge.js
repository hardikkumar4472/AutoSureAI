import { io } from "socket.io-client";
const flaskSocket = io(/, { transports: ["websocket"] });
flaskSocket.on("connect", () => console.log("Connected to Flask Microservice"));
flaskSocket.on("disconnect", () => console.log("Disconnected from Flask"));
export default flaskSocket;
