const RAVSOCK_HOST = "localhost";
const RAVSOCK_PORT = "9999";
const CLIENT_TYPE = "client";
const GET_GRAPHS_URL = 'http://' + RAVSOCK_HOST + ':' + RAVSOCK_PORT + '/graph/get/all/';
const SOCKET_SERVER_URL = 'ws://' + RAVSOCK_HOST + ':' + RAVSOCK_PORT + '/' + CLIENT_TYPE;
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION = true;
