import { Config } from "./config.js";
import {compute} from "./compute.js";
import fetch from 'node-fetch';



function benchmark(socket) {
    const config = new Config()
    console.log(" ----------------- Benchmark ----------------- ")

    console.log("===> Fetching Benchmark Ops")
    fetch("http://" + config.RAVENVERSE_HOST + '/ravenjs/get/benchmark/', {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-type": "application/json", 
            mode: "opaque", 
            token: config.TOKEN
        }
    }).then(res =>  Promise.all([res.status, res.json()])).then(([s,r]) => {

        if (s != 200){
            console.log("==> Error Fetching Benchmark Ops");
            console.log(r.Error);
            return;
        }

        console.log("===> Benchmarking ops received");
       
        let benchmark_results = {};
        for (let op in r) {
            let t1 = Date.now();
            compute(r[op]);
            let t2 = Date.now();
            benchmark_results[r[op].operator] = t2 - t1;
        }
        console.log("===> RESULTS");
        console.log(benchmark_results);
        // Send benchmark results
        console.log('Emitting Benchmark Results');
        socket.emit("benchmark_callback", JSON.stringify(benchmark_results), function (error, response){
            console.log(error, response);
        });

    });
}


export {benchmark}
