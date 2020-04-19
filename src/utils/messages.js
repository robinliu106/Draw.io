const date = new Date();

const generateMessage = (text) => {
    return {
        text,
        createdAt: date.getTime(),
    };
};

const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: date.getTime(),
    };
};

module.exports = { generateMessage, generateLocationMessage };
