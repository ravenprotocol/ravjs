const RAVSOCK_HOST = location.host;
const CLIENT_TYPE = "client";
const GET_GRAPHS_URL = 'http://' + RAVSOCK_HOST + '/graph/get/all/';
const SOCKET_SERVER_URL = 'ws://' + RAVSOCK_HOST + '/' + CLIENT_TYPE;
const RECONNECTION_ATTEMPTS = 5;
const RECONNECTION = true;
