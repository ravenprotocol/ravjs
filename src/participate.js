import {Config} from './config.js';
import {compute} from './compute.js';

function askForGraph(socket){
    console.log('==> Subgraph Ask');

    socket.emit("get_op", "asking for subgraph", ()=>{
        console.log('==> Subgraph Asked');
    })
}

function startAskingForSubgraph(socket){

    const askingForSubgraph = setInterval(askForGraph.bind(null, socket), 2000);
    
    return ()=>{
        clearInterval(askingForSubgraph)
    }
}

function participate(socket){
    const config = new Config()
    if(!config.initialized){
        console.log('initialize before participating');
        return;
    }

    const stopFn = startAskingForSubgraph(socket);

    console.log("===> Registering Subgraph Events");

    socket.on('subgraph', function (d) {
        stopFn();
        console.log("==> Subgraph Received...");
        console.log("==> Graph Id : " + d['graph_id']);
        console.log("==> Sub Graph Id : " + d['subgraph_id']);
       
        
        let data = d['payloads'];
        console.log(data)
        let ops = {};
        for (let index in data) {
            ops[data[index].op_id] = {
                id: data[index].op_id,
                status: 'pending',
                startTime: Date.now(),
                endTime: null,
                data: data[index]
            };

            //Acknowledge op
            console.log("==> Acknowledging Ops")
            socket.emit("acknowledge", JSON.stringify({
                "op_id": data[index].op_id,
                "message": "Op received"
            }), ()=>{
                console.log("Acknowlegded Ops")
            });

            // Perform
            console.log("==> Computing Started for Op ");
            console.log(data[index])
            let operation_type = data[index]["op_type"];
            let operator = data[index]["operator"];


            if (operation_type && operator) {
                compute(data[index]);
            }
        }
    });
}

export default participate
