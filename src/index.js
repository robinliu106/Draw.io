const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

let count = 0;

io.on("connection", (socket) => {
    console.log("New web socket connection");

    socket.emit("message", "Welcome to the server :) !");
    socket.broadcast.emit("message", "A new user has joined!");
    socket.on("sendMessage", (message) => {
        io.emit("message", message);
    });

    socket.on("disconnect", () => {
        io.emit("message", "A user has left");
    });

    socket.on("sendLocation", (location) => {
        io.emit(
            "message",
            `https://google.com/maps?q=${location.latitude},${location.longitude}`
        );
    });
});

server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});
