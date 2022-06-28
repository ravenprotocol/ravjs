/**
 * Configuration file
 */
const RAVENVERSE_HOST = "0.0.0.0:9999";
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

module.exports = {
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
    tfjs_functions
}
