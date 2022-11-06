function participate(socket){

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

            // stopTimer();
            // timeoutId = setTimeout(waitInterval(), opTimeout);
        }

        stopTimer();
        timeoutId = setTimeout(waitInterval(), opTimeout);
    });
}

export default participate
