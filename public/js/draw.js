function drawLine(context, x1, y1, x2, y2) {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

document.addEventListener("DOMContentLoaded", function () {
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    canvas.width = (window.innerWidth / 3) * 2;
    canvas.height = window.innerHeight;

    var drawing = false;
    var x, y, prevX, prevY;

    var socket = io.connect();

    canvas.onmousedown = function (e) {
        drawing = true;
        prevX = x;
        prevY = y;
    };

    canvas.onmouseup = function (e) {
        drawing = false;
    };

    canvas.onmousemove = function (e) {
        x = e.clientX - 220;
        y = e.clientY;
        console.log("x,y", x, y);
        if (drawing) {
            socket.emit("draw", {
                x1: prevX,
                y1: prevY,
                x2: x,
                y2: y,
            });

            drawLine(context, prevX, prevY, x, y);
            prevX = x;
            prevY = y;
        }
    };

    socket.on("draw", function (data) {
        drawLine(context, data.x1, data.y1, data.x2, data.y2);
    });
});
