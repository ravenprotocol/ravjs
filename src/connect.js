import { io } from "socket.io-client";
import { RAVENVERSE_URL, CLIENT_TYPE, RECONNECTION_ATTEMPTS, RECONNECTION } from './config.js';


function getSocket(token) {
    return io(RAVENVERSE_URL, {
        transports: ['websocket'],
        query: {
            "type": CLIENT_TYPE
        },
        autoConnect: false,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        reconnection: RECONNECTION,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 50000,
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

    socket.on("connect_error", (e) => {
        console.log(e)
        // socket.auth.token = "abcd";
        socket.connect();
        console.log("error")
    });
}


export {getSocket, initializeHandlers}
