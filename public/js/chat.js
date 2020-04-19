const socket = io();

// Elements
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");

const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector(
    "#location-message-template"
).innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm:a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", (url) => {
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        url,
        createdAt: moment(url.createdAt).format("h:mm:a"),
    });
    $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute("disabled", "disabled");

    const message = e.target.elements.message.value;

    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute("disabled");
        $messageFormInput.value = "";
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
    });
});

$sendLocationButton.addEventListener("click", (e) => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser");
    }

    $sendLocationButton.setAttribute("disabled", "disabled");

    navigator.geolocation.getCurrentPosition((position) => {
        const locationObject = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };

        socket.emit("sendLocation", locationObject, (error) => {
            $sendLocationButton.removeAttribute("disabled");
            if (error) {
                return console.log(error);
            }
            console.log("Location shared!");
        });
    });
});

socket.emit("join", { username, room });
