import participate from './participate.js';
import {benchmark} from './benchmark.js'
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

    // run benchmark so we can submit result to server and get the results
    benchmark(socket);
}

export { initialize, participate }