const users = [];

const addUser = ({ id, username, room, score }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    score = 0;

    //Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required",
        };
    }

    //Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //Validate username
    if (existingUser) {
        return {
            error: "Username is in use!",
        };
    }

    //Store user
    const user = { id, username, room, score };
    users.push(user);
    return { user };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUser = (id) => {
    return users.find((user) => user.id === id);
};

//find and filter gives you access to the user object
const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
};
