import participate from './participate.js';
import Socket from "./socket.js"
import config from './config.js';


function initialize(args){

    let token = args && args.hasOwnProperty('token') &&  args.token;
    let ravenverse_host = args && args.hasOwnProperty('ravenverse_host') && args.ravenverse_host;

    if(!token && !ravenverse_host){
        throw new Error('token and ravenverse_host value is set as none');
    }

    config.setValue({
        TOKEN : token,
        RAVENVERSE_HOST: ravenverse_host,
    })

    Socket.initSocket();
    Socket.registerEvents();
    Socket.connect();

    return Socket.getSocket();
}

export { initialize, participate }