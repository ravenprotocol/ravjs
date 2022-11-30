

class Config {

    constructor(config) {
        this.RAVENVERSE_HOST = config && config['RAVENVERSE_HOST']
        this.TOKEN = config && config['TOKEN']
        this.CLIENT_TYPE = "client";
        this.GET_GRAPHS_URL = 'http://' + this.RAVENVERSE_HOST + '/graph/get/all/';
        this.RAVENVERSE_URL = 'ws://' + this.RAVENVERSE_HOST + '/' + this.CLIENT_TYPE;
        this.RECONNECTION_ATTEMPTS = 5;
        this.RECONNECTION = true;
    }

    setValue(config){
        this.RAVENVERSE_HOST = config && config['RAVENVERSE_HOST']
        this.TOKEN = config && config['TOKEN']
        this.CLIENT_TYPE = "client";
        this.GET_GRAPHS_URL = 'http://' + this.RAVENVERSE_HOST + '/graph/get/all/';
        this.RAVENVERSE_URL = 'ws://' + this.RAVENVERSE_HOST + '/' + this.CLIENT_TYPE;
        this.RECONNECTION_ATTEMPTS = 5;
        this.RECONNECTION = true;
    }

}


class Singleton {

    constructor() {
        if (!Singleton.instance) {
            Singleton.instance = new Config();
        }
    }
  
    getInstance() {
        return Singleton.instance;
    }
  
  }
  
export default new Singleton().getInstance();