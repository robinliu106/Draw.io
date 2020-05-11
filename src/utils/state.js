const words = [
    "beautiful",
    "pig",
    "pyramid",
    "house",
    "triangle",
    "Egypt",
    "apartment",
];
const maxRounds = 3;

/*
server will instantiate words and maxRounds

*/

const updateRoundCount = (currentRound) => {
    //need to add logic for rounds
    console.log("in update count");
    if (currentRound < maxRounds) {
        console.log("updating");
        return (currentRound += 1);
    }
};

module.exports = { words, updateRoundCount };
