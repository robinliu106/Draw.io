const date = new Date();

const generateMessage = (text) => {
    return {
        text,
        createdAt: date.getTime(),
    };
};

const generateLocationMessage = (username, url) => {
    return {
        username,
        url,
        createdAt: date.getTime(),
    };
};

module.exports = { generateMessage, generateLocationMessage };
