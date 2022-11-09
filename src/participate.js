import {Config} from './config.js'

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
        console.log("Subgraph Received...");
        console.log(d);
        let data = d;
        for (index in data) {
            ops[data[index].op_id] = {
                id: data[index].op_id,
                status: 'pending',
                startTime: Date.now(),
                endTime: null,
                data: data[index]
            };

            //Acknowledge op
            socket.emit("acknowledge", JSON.stringify({
                "op_id": data[index].op_id,
                "message": "Op received"
            }));

            // Perform
            let operation_type = data[index]["op_type"];
            let operator = data[index]["operator"];
            if (operation_type && operator) {
                compute(data[index]);
            }
        }
    });
}

export default participate
