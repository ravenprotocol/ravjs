
import {compute} from "./compute.js"
import {benchmark} from './benchmark.js'
import {getSocket, initializeHandlers} from "./connect.js"

function initialize(token){

    let socket = getSocket(token);
    initializeHandlers(socket);
    socket.connect();
    console.log("socket:", socket);

    benchmark(socket)

    return socket
}

initialize('')