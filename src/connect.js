import { io } from "socket.io-client";
import {benchmark} from './benchmark.js'
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
    console.log(" ==> Intializing Handler For Socket")
    console.log(socket)
    socket.on("connect", (res) => {
        console.log('===> Socket Connected'); // true
        benchmark(socket);
    });

    socket.on("disconnect", () => {
        console.log('===> Socket Disconnected'); // false
    });

    socket.io.on("reconnect_attempt", () => {
        console.log("===> Reconnection Attempted");
    });

    socket.on("connect_error", (e) => {
        console.log('===> Socket Connection Error');
        console.log(e);
    });
}


export {getSocket, initializeHandlers}
