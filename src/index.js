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

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
    console.log("New web socket connection");

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
        });

        callback();
    });

    socket.on("sendMessage", async (message, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);

        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed");
        }

        //async await version
        const translationPromise = util.promisify(googleTranslate.translate);

        try {
            const translateOne = await translationPromise(message, "es"); //translate to another language

            //translate back to english
            const translationTwo = await translationPromise(
                translateOne.translatedText,
                "en"
            );

            //emit english message
            io.to(user.room).emit(
                "message",
                generateMessage(user.username, translationTwo.translatedText)
            );
        } catch (error) {
            console.log("Translation Error: ", error);
        }

        //callback version
        // googleTranslate.translate(message, "zh", (error, translation) => {
        //     const translationOne = translation.translatedText;
        //     googleTranslate.translate(
        //         translationOne,
        //         "en",
        //         (error, translationTwo) => {
        //             const messageFinal = translationTwo.translatedText;

        //             io.to(user.room).emit(
        //                 "message",
        //                 generateMessage(user.username, messageFinal)
        //             );
        //         }
        //     );
        // });

        //promise version
        // const translationPromise = util.promisify(googleTranslate.translate);

        // translationPromise(message, "zh")
        //     .then((translatedOne) => {
        //         console.log("translatedOne", translatedOne);
        //         translationPromise(translatedOne.translatedText, "en")
        //             .then((translateTwo) => {
        //                 io.to(user.room).emit(
        //                     "message",
        //                     generateMessage(
        //                         user.username,
        //                         translateTwo.translatedText
        //                     )
        //                 );
        //             })
        //             .catch((error) => console.log(error));
        //     })
        //     .catch((error) => console.log(error));

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
            });
        }
    });

    socket.on("sendLocation", (location, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit(
            "locationMessage",
            generateLocationMessage(
                user.username,
                `https://google.com/maps?q=${location.latitude},${location.longitude}`
            )
        );

        callback();
    });
});

server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});

// const googleTranslate = require("google-translate")(
//     process.env.TRANSLATION_API_KEY
// );

// const textToTranslate = "my name is robin, I like Marvel movies, what about you?";
// googleTranslate.translate(textToTranslate, "es", (error, translation) => {
//     console.log(translation);
// });

// const doTranslate = (message) => {
//     return googleTranslate
//         .translate(message, "zh", (error, translation) => {
//             // return translation.translatedText;
//         })
//         .asPromise();
//     // return response;
// };

// googleTranslate.translate(translationOne, "en", (error, translationTwo) => {
//     const messageFinal = translationTwo.translatedText;
// });

// io.to(user.room).emit("message", generateMessage(user.username, messageFinal));
