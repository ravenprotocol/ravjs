import participate from './participate.js';
import {getSocket, initializeHandlers} from "./connect.js"
import { Config } from './config.js';


function initialize(args){
    const config = new Config({
        TOKEN : args && args.hasOwnProperty('token') &&  args.token,
        RAVENVERSE_HOST: args && args.hasOwnProperty('ravenverse_host') && args.ravenverse_host,
    })


    let socket = getSocket(config.TOKEN);
    initializeHandlers(socket);
    socket.connect();
}

export { initialize, participate }