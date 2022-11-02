import { RAVENVERSE_HOST } from "./config.js";
import {performance} from 'perf_hooks'
import {compute} from "./compute.js";
import fetch from 'node-fetch';

function benchmark(socket) {
    console.log("Benchmark")

    console.log("Fetching benchmark ops...")
    fetch("http://" + RAVENVERSE_HOST + '/ravenjs/get/benchmark/', {
        mode: "no-cors",
        method: "GET",
        headers: {"Content-type": "application/json", 'mode': "opaque", 'token': "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjU2MzczMTMyLCJpYXQiOjE2NTYxNTcxMzIsImp0aSI6IjFmZjQ2YjczZDhjYjQ0YmM4YWFjOTU5ZTBjNjBhY2ExIiwidXNlcl9pZCI6IjAwMjY3MDgwNTgifQ.CW-YkAkcIdMaNthDq-BcjoGdq4TjOHaRC5u2U_N8A3M"}
    }).then(r => r.json()).then(r => {
        console.log("Benchmarking ops received");
        let benchmark_results = {};
        for (op in r) {
            let t1 = performance.now();
            compute(r[op]);
            let t2 = performance.now();
            benchmark_results[r[op].operator] = t2 - t1;
        }
        console.log("RESULTS");
        console.log(benchmark_results);
        // Send benchmark results
        console.log('Emitting Benchmark Results');
        socket.emit("benchmark_callback", JSON.stringify(benchmark_results), function (error, response){
            console.log(error, response);
        });

        // Start timer
        //setTimeout(waitInterval(), initialTimeout);
    });
}


export {benchmark}
