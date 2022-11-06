/**
 * Configuration file
 */
const RAVENVERSE_HOST = "server.ravenverse.ai";
const CLIENT_TYPE = "client";
const GET_GRAPHS_URL = 'http://' + RAVENVERSE_HOST + '/graph/get/all/';
const RAVENVERSE_URL = 'ws://' + RAVENVERSE_HOST + '/' + CLIENT_TYPE;
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION = true;
let outputs = {}
let ops = []
let TOKEN=null

const mathjs_functions = ['inv', 'mode', 'median', 'std', 'variance']
const tfjs_functions = ['cube', 'foreach', 'find']


class Config {
    constructor(config) {
        if (Config._instance) {
        return Config._instance;
        }
        Config._instance = this;

        // ... your rest of the constructor code goes after this
        this.initialized = false;
        this.RAVENVERSE_HOST = config && config['RAVENVERSE_HOST']
        this.TOKEN = config && config['TOKEN']
    }

    initialize(){
        this.initialized = true;
    }
}


export  {
    RAVENVERSE_HOST,
    CLIENT_TYPE,
    GET_GRAPHS_URL,
    RAVENVERSE_URL,
    RECONNECTION_ATTEMPTS,
    RECONNECTION,
    outputs,
    ops,
    TOKEN,
    mathjs_functions,
    tfjs_functions,
    Config
}
