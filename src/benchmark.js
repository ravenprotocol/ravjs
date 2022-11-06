import { RAVENVERSE_HOST } from "./config.js";
import {compute} from "./compute.js";
import fetch from 'node-fetch';

function benchmark(socket) {
    console.log("Benchmark")

    console.log("Fetching benchmark ops...")
    fetch("http://" + RAVENVERSE_HOST + '/ravenjs/get/benchmark/', {
        mode: "no-cors",
        method: "GET",
        headers: {"Content-type": "application/json", 'mode': "opaque", 'token': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjY4MzYwOTY4LCJpYXQiOjE2NjU3MzI5NjgsImp0aSI6IjExYTZjYzNlNTQ1MzQ1NDM5MmE4NzM1ZmZlMmVjOGQxIiwidXNlcl9pZCI6IjEwMDA0MTM3NzAifQ.XzaEhm_I8HHZsuKwwRx-_Ut_jXNqV6u1WR2RUU7Iw4Y"}
    }).then(r => r.json()).then(r => {
        console.log("Benchmarking ops received");
        let benchmark_results = {};
        for (let op in r) {
            let t1 = Date.now();
            compute(r[op]);
            let t2 = Date.now();
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
