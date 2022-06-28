const {tfjs, mathjs, io, SEAL, jsftp} = require("./imports")
const {compute} = require("./compute")
let {TOKEN} = require('./config');
const {benchmark} = require('./benchmark')
const {getSocket, initializeHandlers} = require("./connect");

function initialize(token){
    TOKEN = token
    socket = getSocket(token);
    initializeHandlers(socket);
    socket.connect();
    console.log("socket:", socket);

    benchmark(socket)

    return socket
}

/**
 * Third party libraries functions
 */
window.mathjs = mathjs;
window.socket_io = io;
window.tfjs = tfjs;
window.node_seal = SEAL;
window.jsftp = jsftp;

/**
 * Ravjs functions
 */
window.initialize = initialize
window.compute = compute
