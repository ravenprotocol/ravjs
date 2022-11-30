import config from './config.js';
import fetch from 'node-fetch';


async function getBenchMarkOps(){
    const res = await fetch("http://" + config.RAVENVERSE_HOST + '/ravenjs/get/benchmark/', {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-type": "application/json", 
            mode: "opaque", 
            token: config.TOKEN
        }
    })

    if(!res.ok){
        throw new Error('BenchMark Request Failed');
    }

    return await res.json();
}


export {
    getBenchMarkOps
}