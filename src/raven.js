const {outputs, ops} = require('./config')

// Hyperparamters
let timeoutId = null;
const opTimeout = 6000;
const initialTimeout = 1000;

String.prototype.format = function () {
    return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};


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


function waitInterval() {
    console.log("Time started");
    return function () {
        console.log("Function called");
        for (const key in ops) {
            let op = ops[key];
            if (op.status === "pending" || Date.now() - op.startTime < opTimeout) {
                stopTimer();
                timeoutId = setTimeout(waitInterval(), opTimeout);
                return
            }

            if (op.status === "pending" && Date.now() - op.startTime > opTimeout) {
                op.status = "failure";
                op.endTime = Date.now();
                ops[key] = ops;

                emit_error(op.data, {message: "OpTimeout error"})
            }
        }

        socket.emit("get_op", JSON.stringify({
            "message": "Send me an aop"
        }));

        stopTimer();
        timeoutId = setTimeout(waitInterval(), opTimeout);
    }
}

function stopTimer() {
    console.log("Timer stopped");
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }
}

//timeoutId = setTimeout(waitInterval(), initialTimeout);



module.exports = {compute}
