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

async function parseOps(ops, payload){
    /**
     * Here payload would be it this format
     * {
     *      op_id: 7024,
     *      values: [
     *          { value: 7021, path: '/5488317417/data_6207.pkl' },
     *          { op_id: 7023 }
     *      ],
     *      op_type: 'binary',
     *      operator: 'division',
     *      params: {}
     *  }
     */

    let values = [];

    // make copy of payload so manipulation won;t affect the 
    // original object, in case of broken, we can restart the 
    // ops
    let payload_cp = {};
    Object.assign(payload_cp, payload);
    const values_payload = payload_cp['values'];
    delete payload_cp['values'];

    // build values
    for(let i in values_payload){
        if ('path' in values_payload[i]){
            // download the file
            let value = await fetch("http://" + config.RAVENVERSE_HOST + '/ravenjs/get/benchmark/', {
                mode: "no-cors",
                method: "GET",
                headers: {
                    "Content-type": "application/json", 
                    mode: "opaque", 
                    token: config.TOKEN
                }
            })
            values.push({value})
            continue;
        }
        else if('op_id' in values_payload[i]){
            // see results in computed tasks
            let op_id =  values_payload[i]['op_id']
            values.push({'value': ops[op_id]['result']});
            continue;
        }

        values.push({'value': values_payload[i]['value']})
        // get values 
    }

    payload_cp['values'] = values;
    return payload_cp
}

function participate(socket){
    const config = new Config()
    if(!config.initialized){
        console.log('initialize before participating');
        return;
    }

    const stopFn = startAskingForSubgraph(socket);

    console.log("===> Registering Subgraph Events");

    socket.on('subgraph', async (d) => {
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
        }


        for(const op_id of Object.keys(ops)){
            let op = ops[op_id]['data'];
            
            //Acknowledge op
            console.log("==> Acknowledging Ops")
            socket.emit("acknowledge", JSON.stringify({
                "op_id": op_id,
                "message": "Op received"
            }), ()=>{
                console.log("Acknowlegded Ops");
            });

            let compute_payload = await parseOps(ops, op);
            const result = compute(compute_payload);

            op['result'] = result;
            
            uploadResult(op);
        }


    });
}



export default participate
