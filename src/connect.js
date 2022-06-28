const {io} = require("socket.io-client");
const {RAVENVERSE_URL, CLIENT_TYPE, RECONNECTION_ATTEMPTS, RECONNECTION} = require('./config');


function getSocket(token) {
    return io(RAVENVERSE_URL, {
        query: {
            "type": CLIENT_TYPE
        },
        autoConnect: false,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnection: RECONNECTION,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: {
            "token": token
        }
    });
}

function initializeHandlers(socket){
    socket.on("connect", () => {
        console.log(socket.connected); // true
    });

    socket.on("disconnect", () => {
        console.log(socket.connected); // false
    });

    socket.io.on("reconnect_attempt", () => {
        console.log("reconnection attempted");
    });

    socket.on("connect_error", () => {
        socket.auth.token = "abcd";
        socket.connect();
        console.log("error")
    });
}


module.exports = {getSocket, initializeHandlers}
