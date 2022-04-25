let attemptsMade = 0;
let isConnected = false;
let bt = $("#connectDisconnectButton");

socket = io(SOCKET_SERVER_URL, {
    query: {
        "type": CLIENT_TYPE,
        "cid": 4
    },
    autoConnect: false,
    reconnectionAttempts: RECONNECTION_ATTEMPTS,
    reconnection: RECONNECTION,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000
});

// On connection started
socket.on('connect', function (d) {
    console.log("Connected");
    changeConnectDisconnectButton("connected");

    // reset attempts made
    attemptsMade = 0;
    isConnected = true;

    showGraphs();
});

// On connection closed
socket.on("disconnect", function (d) {
    console.log("Disconnected");
    changeConnectDisconnectButton("disconnected");

    // reset attempts made
    attemptsMade = 0;
    isConnected = false;

    showGraphs();
    $("#activeGraphs").fadeOut("medium");
    $("#pastGraphs").fadeOut("medium");
});

socket.on("connect_error", () => {
    console.log("connection_error");
    attemptsMade += 1;
    if(attemptsMade === 5){
        Swal.fire("Oops!", "Connection error", "error");
        changeConnectDisconnectButton("disconnected");
    }

    isConnected = false;
});

// Check if the client is connected
socket.on("check_status", function (d) {
    socket.emit("check_callback", d);
});

// To check if this client is still connected or not
socket.on("ping", function (message) {
    console.log(message);
    console.log("Received PING");

    console.log("Sending PONG");
    socket.emit("pong", JSON.stringify({
        "message": "PONG"
    }));
});

$(document).on('click', '#connectDisconnectButton', function () {
    console.log("Log");
    if ($(this).data('status') === "connected") {
        socket.disconnect();
    } else if ($(this).data('status') === "disconnected") {
        socket.connect();
        changeConnectDisconnectButton("connecting");
    }
});

function changeConnectDisconnectButton(status) {
    if(status === "connected"){
        bt.text("Disconnect");
        bt.removeAttr("class");
        bt.attr('class', '');
        bt.addClass("btn btn-outline-danger");
        bt.data('status', "connected");
    }else if(status === "disconnected"){
        bt.text("Connect");
        bt.removeAttr("class");
        bt.attr('class', '');
        bt.addClass("btn btn-outline-primary");
        bt.data('status', "disconnected");
    }else if(status === "connecting"){
        bt.text("Connecting...");
        bt.removeAttr("class");
        bt.attr('class', '');
        bt.addClass("btn btn-outline-warning");
        bt.data('status', "connecting");
    }
}
