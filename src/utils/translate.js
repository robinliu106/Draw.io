const getDumbTranslation = async (message) => {
    //async await version
    const translationPromise = util.promisify(googleTranslate.translate);

    try {
        //translate to another language
        const translateOne = await translationPromise(message, "es");

        //translate back to english
        const translationTwo = await translationPromise(
            translateOne.translatedText,
            "en"
        );

        return translationTwo.translatedText;
    } catch (error) {
        console.log("Translation Error: ", error);

        return "Message could not be translated";
    }
};

module.exports = getDumbTranslation;

//callback version of translate message
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

//promise version of translate message
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
