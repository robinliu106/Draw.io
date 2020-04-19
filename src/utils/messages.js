const generateMessage = (text) => {
    const date = new Date();
    return {
        text,
        createdAt: date.getTime(),
    };
};

module.exports = { generateMessage };
