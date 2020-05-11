const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const util = require("util");
const Filter = require("bad-words");
const googleTranslate = require("google-translate")(
    process.env.TRANSLATION_API_KEY
);

const {
    generateMessage,
    generateLocationMessage,
} = require("./utils/messages");

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./utils/users");
let currentRound = 1;
const { words, updateRoundCount } = require("./utils/state");

const getDumbTranslation = require("./utils/translate");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("New web socket connection");
    const currentWord = words[1];

    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options }); //...spread operator

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit("message", generateMessage("Admin", "Welcome!"));

        socket.broadcast
            .to(user.room)
            .emit(
                "message",
                generateMessage("Admin", `${user.username} has joined!`)
            );
        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room),
            currentRound,
        });

        callback();
    });

    socket.on("sendMessage", async (message, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);
        const dumbTranslate = false;

        // if (filter.isProfane(message)) {
        //     message = filter.clean(message);
        //     // return callback("Profanity is not allowed");
        // }

        // if (dumbTranslate) {
        //     try {
        //         message = await getDumbTranslation(message);
        //     } catch (error) {
        //         console.log("translation error");
        //         callback(error);
        //     }
        // }

        if (message === currentWord) {
            if (user.score < currentRound) {
                user.score += 1;
                console.log("user score updated", user);
            }

            io.to(user.room).emit(
                "message",
                generateMessage(user.username, "Got the word!")
            );

            currentRound = updateRoundCount(currentRound);
            console.log("currentRound", currentRound);

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
                score: user.score,
                currentRound,
            });
        } else {
            io.to(user.room).emit(
                "message",
                generateMessage(user.username, message)
            );
        }

        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit(
                "message",
                generateMessage(
                    "Admin",
                    `${user.username} has left Room:${user.room}`
                )
            );

            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
                // score: user.score,
            });
        }
    });

    socket.on("draw", function (data) {
        socket.broadcast.emit("draw", data);
    });

    socket.on("emitClearCanvas", function (data) {
        const user = getUser(socket.id);
        io.in(user.room).emit("doClearCanvas");
    });

    socket.on("emitChangeColor", function (color) {
        const user = getUser(socket.id);
        io.in(user.room).emit("doChangeColor", color);
    });
});

server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});
