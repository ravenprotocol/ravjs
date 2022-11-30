import { io } from "socket.io-client";
import {benchmark} from './benchmark.js'
import Config from './config.js';


class Socket{

    constructor(){
        this.socket = null;
    }

    getSocket(){
        if (this.socket){
            return this.socket;
        }

        throw new Error('Socket Not Initialized');
    }

    initSocket(){
        this.socket = io(Config.RAVENVERSE_URL, {
            transports: ['websocket'],
            query: {
                "type": Config.CLIENT_TYPE
            },
            autoConnect: false,
            reconnectionAttempts: Config.RECONNECTION_ATTEMPTS,
            reconnection: Config.RECONNECTION,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 50000,
            auth: {
                "token": Config.TOKEN
            }
        });
    }


    connect(){
        this.socket.connect();
    }

    registerEvents(){
        console.log(" ==> Intializing Handler For Socket");
        this.socket.on("connect", (res) => {
            console.log('===> Socket Connected'); // true
            console.log(res);
            benchmark(this.socket);
        });
    
        this.socket.on("disconnect", () => {
            console.log('===> Socket Disconnected'); // false
        });
    
        this.socket.io.on("reconnect_attempt", () => {
            console.log("===> Reconnection Attempted");
        });
    
        this.socket.on("error", (e) => {
            console.log('===> Socket Connection Error');
            console.log(e);
            socket.disconnect()
        });
    }

}


class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new Socket();
        }
    }
  
    getInstance() {
        return Singleton.instance;
    }
  
  }
  
export default new Singleton().getInstance();
