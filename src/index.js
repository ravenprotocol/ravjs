import participate from './participate.js';
import {getSocket, initializeHandlers} from "./connect.js"
import { Config } from './config.js';


function initialize(args){
    const config = new Config({
        TOKEN : args && args.hasOwnProperty('token') &&  args.token,
        RAVENVERSE_HOST: args && args.hasOwnProperty('ravenverse_host') && args.ravenverse_host,
    })
    config.initialize();

    let socket = getSocket(config.TOKEN);
    console.log(socket)
    initializeHandlers(socket);
    socket.connect();

    return socket;
}

export { initialize, participate }