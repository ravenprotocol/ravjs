import {compute} from "./compute.js";
import participate from "./participate.js";
import {getBenchMarkOps} from './requests.js';



function benchmark(socket) {
    console.log(" ----------------- Benchmark ----------------- ")

    console.log("===> Fetching Benchmark Ops")
    getBenchMarkOps().then(r => {

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
            participate();
        });

    });
}


export {benchmark}
