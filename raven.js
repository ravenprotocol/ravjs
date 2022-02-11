(function () {

    /*
 1. Connect
 2. Receive benchmark graph
 3. Share benchmark results
 4. Wait for compute graph
 5. Receive compute graph
 6. Perform and share results back with the platform
 */
    const RAVSOCK_SERVER_URL = "localhost";
    //const RAVSOCK_SERVER_URL = "host.docker.internal";
    const RAVSOCK_SERVER_PORT = "9999";
    const CLIENT_TYPE = "client";
    const CID = "4";
    const socket_server_url = 'ws://' + RAVSOCK_SERVER_URL + ':' + RAVSOCK_SERVER_PORT + '/' + CLIENT_TYPE;
    let socket = null;
    let graphs = null;

    // Create socket and try to connect
    //socket = io();

    socket = io(socket_server_url, {
        query: {
            "type": CLIENT_TYPE,
            "cid": CID
        }
    });

    function disconnect() {
        socket.disconnect();
        socket = null;
    }

    // Hyperparamters
    let timeoutId = null;
    let ops = {};
    const opTimeout = 6000;
    const initialTimeout = 1000;

    // On connection started
    socket.on('connect', function (d) {
        console.log("Connected");

        // Update the status to connected
        $("#client_status").text("Connected");
        $("#client_status").css("color", "green");

        // fetch('http://' + RAVSOCK_SERVER_URL + ':' + RAVSOCK_SERVER_PORT + '/graph/get/all/?approach=federated').then(r => r.json()).then(r => {
        //     console.log("Graphs:", r);
        //     graphs = r;
        //     $("#spinnerGraphs").fadeOut();
        //
        //     for(let i=0;i<r.length;i++){
        //         let graph_data = r[i];
        //         console.log(r[i]);
        //         $("#graphs tbody").append("<tr><td>"+graph_data.id+"</td><td>"+graph_data.name+"</td><td>"+graph_data.algorithm+"</td><td>"+graph_data.approach+"</td><td>"+graph_data.rules+"</td><td><button type='button'" +
        //             " class='btn btn-outline-success openButton' data-id='"+r[i].id+"'>Participate</button></td></tr>");
        //     }
        //     $("#graphs").fadeIn();
        // });
    });

    $(document).on("click", ".openButton", function () {
         $("#enterValuesModal").modal('toggle');
         $("#submitValuesButton").data("graph_id", $(this).data("id"));
    });

    $("#submitValuesButton").on("click", function () {
        let graph_id = $(this).data("graph_id");
        let values = $("#inputValues").val();

        console.log(values);

        // Check if this value meets its requirements

    });

    $("#participateButton").click(function () {
        fetch('http://localhost:9999/ravenjs/get/benchmark/', {
            method: "GET",
            headers: {"Content-type": "application/json", 'mode':"opaque"}
        }).then(r => r.json()).then(r => {
            console.log(r);
            benchmark_results = {};
            for (op in r) {
                t1 = performance.now();
                computeforbm(r[op]);
                t2 = performance.now();
                compute_time = t2 - t1;
                benchmark_results[r[op].operator] = compute_time;
            }
            console.log("RESULTS");
            console.log(benchmark_results);
            // Send benchmark results
            console.log('Emitting Benchmark Results');
            socket.emit("benchmark_callback", JSON.stringify(benchmark_results));

            // Start timer
            setTimeout(waitInterval(), initialTimeout);
        });
    });

    // On connection closed
    socket.on("disconnect", function (d) {
        console.log("Disconnected");
        $("#client_status").text("Disconnected");
        $("#client_status").css("color", "red");
    });

    // Check if the client is connected
    socket.on("check_status", function (d) {
        socket.emit("check_callback", d);
    });

    // To check if this client is still connected or not
    socket.on("ping", function (message) {
        console.log(message);
        console.log("Received PING");

        console.log("Sending PONG");
        socket.emit("pong", JSON.stringify({
            "message": "PONG"
        }));
    });

    // Receive payload
    function compute(payload) {
        console.log("Computing " + payload.operator);
        console.log(payload);

        let values = [];
        for (let i = 0; i < payload.values.length; i++) {
            if (payload.values[i].value !== undefined) {
                console.log("From server");
                values.push(payload.values[i].value);
            }
            if (payload.values[i].op_id !== undefined) {
                console.log("From client");
                values.push(outputs[payload.values[i].op_id]);
            }
        }
        payload.values = values;

        console.log("Payload Values: ", payload.values);

        switch (payload.operator) {
            case "linear":
                try {
                    emit_result(payload, payload.values[0]);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "addition":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.add(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "subtraction":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.sub(y).arraySync();
                    emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "multiplication":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.mul(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    result = error.message;
                    emit_error(payload, result);
                }
                break;
            case "division":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.div(y).arraySync();
                    emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "positive":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = +(x.arraySync());
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error)
                }
                break;
            case "negation":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.neg().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error)
                }
                break;
            case "exponential":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.exp().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "natural_log":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.log().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "power":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.pow(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "square":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.square().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "cube":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.mul(x).mul(x).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "square_root":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.sqrt().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "cube_root":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.pow(1.0 / 3.0).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "absolute":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.abs().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "matrix_multiplication":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.matMul(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "multiply":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.mul(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "dot":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.dot(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "transpose":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.transpose().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "matrix_sum":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.sum(axis).arraySync();
                    } else {
                        result = x.sum().arraySync();

                    }
                    console.log(result);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "sort":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length !== 1)
                        emit_error(payload, {message: "Invalid Input"});
                    result = tf.reverse(tf.topk(x, x.shape[0]).values).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "split":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    let numOrSizeSplits = null;
                    let axis = null;

                    if ('numOrSizeSplits' in params) {
                        numOrSizeSplits = params.numOrSizeSplits;
                    }
                    if ('axis' in params) {
                        axis = params.axis;
                    }

                    if (numOrSizeSplits !== undefined && axis !== undefined) {
                        let result = tf.split(x, numOrSizeSplits, axis);
                        let finaL_result = [];
                        result.forEach(a => finaL_result.push(a.arraySync()));
                        emit_result(payload, finaL_result);
                    } else if (axis === undefined) {
                        let result = tf.split(x, numOrSizeSplits);
                        let finaL_result = [];
                        result.forEach(a => finaL_result.push(a.arraySync()));
                        emit_result(payload, finaL_result);
                    } else {
                        emit_error(payload, {message: "Parameter 'numOrSizeSplits' is missing"});
                        return;
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "reshape":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('shape' in params) {
                        let shape = params.shape;
                        result = x.reshape(shape).arraySync();
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "Parameter 'shape' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "concatenate":
                try {
                    let values = payload.values;
                    let tensors = [];
                    for (let i = 0; i < values.length; i++) {
                        tensors.push(tf.tensor(values[i]));
                    }
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        if (axis !== undefined) {
                            let result = tf.concat(tensors, axis).arraySync();
                            emit_result(payload, result);
                        } else {
                            let result = tf.concat(tensors).arraySync();
                            emit_result(payload, result);
                        }
                    } else {
                        let result = tf.concat(tensors).arraySync();
                        emit_result(payload, result);
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "min":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.min().arraySync();
                    emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "max":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.max().arraySync();
                    emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "unique":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        let result = tf.unique(x, axis).values.arraySync();
                        emit_result(payload, result);
                    } else {
                        let result = tf.unique(x).values.arraySync();
                        emit_result(payload, result);
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "argmax":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.argMax(axis).arraySync();
                    } else {
                        result = x.argMax().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "argmin":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.argMin(axis).arraySync();
                    } else {
                        result = x.argMin().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "expand_dims":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.expandDims(axis).arraySync();
                    } else {
                        result = x.expandDims().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "inv":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = math.inv(x.arraySync());
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "gather":
                try {
                    x = tf.tensor(payload.values[0]);
                    indices = payload.values[1];
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.gather(indices, axis).arraySync();
                    } else {
                        result = x.gather(indices).arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "reverse":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.reverse(axis).arraySync();
                    } else {
                        result = x.reverse().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "stack":
                try {
                    let x = [];
                    for (let i = 0; i < payload.values.length; i++) {
                        x[i] = tf.tensor(payload.values[i])
                    }
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = tf.stack(x, axis).arraySync();
                    } else {
                        result = tf.stack(x).arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "tile":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('reps' in params) {
                        let reps = params.reps;
                        result = x.tile(reps).arraySync();
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "The parameter 'reps' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "slice":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('begin' in params) {
                        let begin = params.begin;
                        if ('size' in params) {
                            let size = params.size;
                            result = x.slice(begin, size).arraySync();
                        } else {
                            result = x.slice(begin).arraySync();
                        }
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "The parameter 'begin' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "find_indices":
                try {
                    x = payload.values[0];
                    values = payload.values[1];
                    result = tf.findIndices(x, values);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "shape":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.shape;
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "greater":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.greater(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "greater_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.greaterEqual(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "less":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.less(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "less_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.lessEqual(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.equal(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "not_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.notEqual(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_and":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalAnd(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_or":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalOr(y).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_not":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    result = x.logicalNot().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_xor":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalXor().arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "mean":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.mean(axis).arraySync();
                        if (x.shape.length === 2) {
                            if (axis === 0) {
                                result = tf.tensor2d(result, [1, result.length]).arraySync();
                            } else if (axis === 1) {
                                result = tf.tensor2d(result, [result.length, 1]).arraySync();
                            }
                        }
                    } else {
                        result = x.mean().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "average":
                try {
                    x = tf.tensor(payload.values[0]);
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.mean(axis).arraySync();
                    } else {
                        result = x.mean().arraySync();
                    }
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "mode":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.mode(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.mode(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.mode(x.arraySync());
                        }
                    }
                    console.log(result);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "median":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.median(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.median(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.median(x.arraySync());
                        }
                    }
                    console.log(result);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "variance":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.variance(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.variance(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.variance(x.arraySync());
                        }
                    }
                    console.log(result);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "standard_deviation":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.std(x.arraySync(), "uncorrected");
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.std(x.arraySync(), axis, "uncorrected");

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.std(x.arraySync(), "uncorrected");
                        }
                    }
                    console.log(result);
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "percentile":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('value' in params) {
                        let value = params.value;
                        let result = percentile(x.arraySync(), value);
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, "Parameter 'value' is missing");
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "random":
                try {
                    let x = payload.values[0];
                    let params = payload.params;
                    if ('size' in params) {
                        size = params.size;
                        result = getRandom(x, size);
                    } else {
                        result = getRandom(x, undefined);
                    }
                    emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;

            case "bincount":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    let weights = params.weights;
                    let minlength = params.minlength;
                    if ('weights' in params && 'minlength' in params) {
                        let result = tf.bincount(x.arraySync(), weights, minlength);
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, "Parameter 'weights' or 'minlength is missing");
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "where":
                try {
                    let a = tf.tensor(payload.values[0]);
                    let b = tf.tensor(payload.values[1]);
                    let params = payload.params;
                    if ('condition' in params) {
                        let condition = params.condition;
                        let result = a.where(condition, b).arraySync();
                        emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "Parameter 'condition' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "sign":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = tf.sign(x).arraysync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "foreach":
                try {
                    x = tf.data.array(payload.values[0]);
                    let params = payload.params;
                    if ('operation' in params) {
                        let operation = params.operation;
                        let outputs = [];
                        x.forEachAsync(function (a) {
                            let params1 = params;
                            delete params1.operation;
                            let paramsNames = Object.keys(params1);
                            let paramsString = "";
                            for (let i = 0; i < paramsNames.length; i++) {
                                paramsString = paramsString + "," + params1[paramsNames[i]];
                            }
                            console.log(paramsString, a, "tf." + operation + "(" + JSON.stringify(a) + paramsString + ").arraySync()");
                            output = eval("tf." + operation + "(" + JSON.stringify(a) + paramsString + ").arraySync()");
                            console.log(output);
                            outputs.push(output);

                            // TODO: fix the logic
                            if (outputs.length === x.size) {
                                emit_result(payload, outputs);
                            }
                        });
                    } else {
                        emit_error(payload, {message: "Parameter 'operation' is missing"});
                    }

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "one_hot_encoding":
                try {
                    x = tf.tensor(payload.values[0], null, 'int32');
                    let params = payload.params;
                    if ('depth' in params) {
                        depth = params.depth;
                        result = tf.oneHot(x, depth).arraySync();
                        emit_result(payload, result);
                    } else {
                        emit_result(payload, {message: "Parameter 'depth' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "set_value":
                try {
                    let arr = payload.values[0];
                    let params = payload.params;
                    let index = params.index;
                    let value = params.value;
                    let t = '';
                    for (let i = 0; i < index.length; i++) {
                        t = t.concat('[%s]'.format(index[i]));
                    }
                    query = 'arr';
                    query = query.concat(t);
                    query = query.concat('=%s'.format(value));
                    p = eval(query);
                    emit_result(payload, arr);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "zeros_like":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = tf.zerosLike(x).arraySync();
                    emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error)
                }
                break;
            case "test_qr":
                try {
                    console.log("Paaaayyyyyyylllooaaad : ", payload.values[0]);
                    const a = tf.tensor2d([[1, 2], [3, 4]]);
                    let [q, r] = tf.linalg.qr(a);
                    console.log("Q : ", q.arraySync());
                    // result = [q,r]
                    // emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error)
                }
                break;
        }
    }

    String.prototype.format = function () {
        return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
    };

    function computeforbm(payload) {
        console.log("Computing " + payload.operator);
        console.log(payload);
        switch (payload.operator) {
            case "linear":
                try {

                } catch (e) {
                    emit_error(payload);
                }
                break;
            case "addition":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.add(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "subtraction":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.sub(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "multiplication":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.mul(y).arraySync();

                } catch (error) {
                    result = error.message;
                    emit_error(payload, result);
                }
                break;
            case "division":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.div(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "positive":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = +(x.arraySync());

                } catch (error) {
                    emit_error(payload, error)
                }
                break;
            case "negation":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.neg().arraySync();

                } catch (error) {
                    emit_error(payload, error)
                }
                break;
            case "exponential":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.exp().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "natural_log":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.log().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "power":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.pow(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "square":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.square().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "cube":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.mul(x).mul(x).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "square_root":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.sqrt().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "cube_root":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.pow(1.0 / 3.0).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "absolute":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.abs().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "matrix_multiplication":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.matMul(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "multiply":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.mul(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "dot":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.dot(y).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "transpose":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.transpose().arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "matrix_sum":
                try {
                    q1 = performance.now()
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.sum(axis).arraySync();
                    } else {
                        result = x.sum().arraySync();

                    }
                    console.log(performance.now() - q1)
                    console.log(result);


                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "sort":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length !== 1)
                        emit_error(payload, {message: "Invalid Input"});
                    result = tf.reverse(tf.topk(x, x.shape[0]).values).arraySync();

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "split":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    let numOrSizeSplits = null;
                    let axis = null;

                    if ('numOrSizeSplits' in params) {
                        numOrSizeSplits = params.numOrSizeSplits;
                    }
                    if ('axis' in params) {
                        axis = params.axis;
                    }

                    if (numOrSizeSplits !== undefined && axis !== undefined) {
                        let result = tf.split(x, numOrSizeSplits, axis);
                        let finaL_result = [];
                        result.forEach(a => finaL_result.push(a.arraySync()));
                        //emit_result(payload, finaL_result);
                    } else if (axis === undefined) {
                        let result = tf.split(x, numOrSizeSplits);
                        let finaL_result = [];
                        result.forEach(a => finaL_result.push(a.arraySync()));
                        //emit_result(payload, finaL_result);
                    } else {
                        //emit_error(payload, {message: "Parameter 'numOrSizeSplits' is missing"});
                        return;
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "reshape":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('shape' in params) {
                        let shape = params.shape;
                        result = x.reshape(shape).arraySync();
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "Parameter 'shape' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "concatenate":
                try {
                    let values = payload.values;
                    let tensors = [];
                    for (let i = 0; i < values.length; i++) {
                        tensors.push(tf.tensor(values[i]));
                    }
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        if (axis !== undefined) {
                            let result = tf.concat(tensors, axis).arraySync();
                            //emit_result(payload, result);
                        } else {
                            let result = tf.concat(tensors).arraySync();
                            //emit_result(payload, result);
                        }
                    } else {
                        let result = tf.concat(tensors).arraySync();
                        //emit_result(payload, result);
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "min":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.min().arraySync();
                    //emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "max":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.max().arraySync();
                    //emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "unique":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        let result = tf.unique(x, axis).values.arraySync();
                        //emit_result(payload, result);
                    } else {
                        let result = tf.unique(x).values.arraySync();
                        //emit_result(payload, result);
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "argmax":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.argMax(axis).arraySync();
                    } else {
                        result = x.argMax().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "argmin":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.argMin(axis).arraySync();
                    } else {
                        result = x.argMin().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "expand_dims":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.expandDims(axis).arraySync();
                    } else {
                        result = x.expandDims().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "inv":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = math.inv(x.arraySync());
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "gather":
                try {
                    x = tf.tensor(payload.values[0]);
                    indices = payload.values[1];
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.gather(indices, axis).arraySync();
                    } else {
                        result = x.gather(indices).arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "reverse":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.reverse(axis).arraySync();
                    } else {
                        result = x.reverse().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "stack":
                try {
                    let x = [];
                    for (let i = 0; i < payload.values.length; i++) {
                        x[i] = tf.tensor(payload.values[i])
                    }
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = tf.stack(x, axis).arraySync();
                    } else {
                        result = tf.stack(x).arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "tile":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('reps' in params) {
                        let reps = params.reps;
                        result = x.tile(reps).arraySync();
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "The parameter 'reps' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "slice":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('begin' in params) {
                        let begin = params.begin;
                        if ('size' in params) {
                            let size = params.size;
                            result = x.slice(begin, size).arraySync();
                        } else {
                            result = x.slice(begin).arraySync();
                        }
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "The parameter 'begin' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "find_indices":
                try {
                    x = payload.values[0];
                    values = payload.values[1];
                    result = tf.findIndices(x, values);
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "shape":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = x.shape;
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "greater":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.greater(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "greater_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.greaterEqual(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "less":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.less(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "less_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.lessEqual(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.equal(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "not_equal":
                try {
                    x = tf.tensor(payload.values[0]);
                    y = tf.tensor(payload.values[1]);
                    result = x.notEqual(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_and":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalAnd(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_or":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalOr(y).arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_not":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    result = x.logicalNot().arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "logical_xor":
                try {
                    x = tf.tensor(payload.values[0], undefined, 'bool');
                    y = tf.tensor(payload.values[1], undefined, 'bool');
                    result = x.logicalXor().arraySync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "mean":
                try {
                    x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.mean(axis).arraySync();
                        if (x.shape.length === 2) {
                            if (axis === 0) {
                                result = tf.tensor2d(result, [1, result.length]).arraySync();
                            } else if (axis === 1) {
                                result = tf.tensor2d(result, [result.length, 1]).arraySync();
                            }
                        }
                    } else {
                        result = x.mean().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "average":
                try {
                    x = tf.tensor(payload.values[0]);
                    if ('axis' in params) {
                        let axis = params.axis;
                        result = x.mean(axis).arraySync();
                    } else {
                        result = x.mean().arraySync();
                    }
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "mode":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.mode(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.mode(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.mode(x.arraySync());
                        }
                    }
                    console.log(result);
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "median":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.median(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.median(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.median(x.arraySync());
                        }
                    }
                    console.log(result);
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "variance":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.variance(x.arraySync());
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.variance(x.arraySync(), axis);

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.variance(x.arraySync());
                        }
                    }
                    console.log(result);
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "standard_deviation":
                try {
                    x = tf.tensor(payload.values[0]);
                    if (x.shape.length === 1) {
                        result = math.std(x.arraySync(), "uncorrected");
                    } else if (x.shape.length === 2) {
                        let params = payload.params;
                        if ('axis' in params) {
                            let axis = params.axis;
                            result = math.std(x.arraySync(), axis, "uncorrected");

                            if (x.shape.length === 2) {
                                if (axis === 0) {
                                    result = tf.tensor2d(result, [1, result.length]).arraySync();
                                } else if (axis === 1) {
                                    result = tf.tensor2d(result, [result.length, 1]).arraySync();
                                }
                            }
                        } else {
                            result = math.std(x.arraySync(), "uncorrected");
                        }
                    }
                    console.log(result);
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "percentile":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    if ('value' in params) {
                        let value = params.value;
                        let result = percentile(x.arraySync(), value);
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, "Parameter 'value' is missing");
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "random":
                try {
                    let x = payload.values[0];
                    let params = payload.params;
                    if ('size' in params) {
                        size = params.size;
                        result = getRandom(x, size);
                    } else {
                        result = getRandom(x, undefined);
                    }
                    //emit_result(payload, result)
                } catch (error) {
                    emit_error(payload, error);
                }
                break;

            case "bincount":
                try {
                    let x = tf.tensor(payload.values[0]);
                    let params = payload.params;
                    let weights = params.weights;
                    let minlength = params.minlength;
                    if ('weights' in params && 'minlength' in params) {
                        let result = tf.bincount(x.arraySync(), weights, minlength);
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, "Parameter 'weights' or 'minlength is missing");
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "where":
                try {
                    let a = tf.tensor(payload.values[0]);
                    let b = tf.tensor(payload.values[1]);
                    let params = payload.params;
                    if ('condition' in params) {
                        let condition = params.condition;
                        let result = a.where(condition, b).arraySync();
                        //emit_result(payload, result);
                    } else {
                        emit_error(payload, {message: "Parameter 'condition' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "sign":
                try {
                    x = tf.tensor(payload.values[0]);
                    result = tf.sign(x).arraysync();
                    //emit_result(payload, result);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "foreach":
                try {
                    x = tf.data.array(payload.values[0]);
                    let params = payload.params;
                    if ('operation' in params) {
                        let operation = params.operation;
                        let outputs = [];
                        x.forEachAsync(function (a) {
                            let params1 = params;
                            delete params1.operation;
                            let paramsNames = Object.keys(params1);
                            let paramsString = "";
                            for (let i = 0; i < paramsNames.length; i++) {
                                paramsString = paramsString + "," + params1[paramsNames[i]];
                            }
                            console.log(paramsString, a, "tf." + operation + "(" + JSON.stringify(a) + paramsString + ").arraySync()");
                            output = eval("tf." + operation + "(" + JSON.stringify(a) + paramsString + ").arraySync()");
                            console.log(output);
                            outputs.push(output);

                            // TODO: fix the logic
                            if (outputs.length === x.size) {
                                // emit_result(payload, outputs);
                            }
                        });
                    } else {
                        emit_error(payload, {message: "Parameter 'operation' is missing"});
                    }

                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "one_hot_encoding":
                try {
                    x = tf.tensor(payload.values[0], null, 'int32');
                    let params = payload.params;
                    if ('depth' in params) {
                        depth = params.depth;
                        result = tf.oneHot(x, depth).arraySync();
                        //emit_result(payload, result);
                    } else {
                        //emit_result(payload, {message: "Parameter 'depth' is missing"});
                    }
                } catch (error) {
                    emit_error(payload, error);
                }
                break;
            case "set_value":
                try {
                    let arr = payload.values[0];
                    let params = payload.params;
                    let index = params.index;
                    let value = params.value;
                    let t = '';
                    for (let i = 0; i < index.length; i++) {
                        t = t.concat('[%s]'.format(index[i]));
                    }
                    query = 'arr';
                    query = query.concat(t);
                    query = query.concat('=%s'.format(value));
                    p = eval(query);
                    //emit_result(payload, arr);
                } catch (error) {
                    emit_error(payload, error);
                }
                break;


        }
    }

    let outputs = {};

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

            stopTimer();
            timeoutId = setTimeout(waitInterval(), opTimeout);
        }
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


    /**
     * To find indices of values in a particular array
     * @param x
     * @param values
     * @returns {{}}
     */
    tf.findIndices = function (x, values) {
        let indices = [];
        console.log("values:", values);
        for (let i = 0; i < values.length; i++) {
            let localIndices = [];
            for (let j = 0; j < x.length; j++) {
                if (values[i] === x[j]) {
                    localIndices.push([j]);
                }
            }
            indices.push(localIndices);
        }
        console.log("before:", indices);
        return indices;
    };

    /**
     * Sort an array
     */
    tf.sort = function (x) {
        x = tf.tensor(x);
        try {
            if (x.shape.length !== 1)
                return null;
            return tf.reverse(tf.topk(x, x.shape[0]).values);
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    function emit_result(payload, result) {

        console.log("Emit Success");
        console.log(payload);
        console.log(result, JSON.stringify({
            'op_type': payload.op_type,
            'result': result,
            'values': payload.values,
            'operator': payload.operator,
            "op_id": payload.op_id,
            "status": "success"
        }));

        outputs[payload.op_id] = result;

        socket.emit("op_completed", JSON.stringify({
            'op_type': payload.op_type,
            'result': result,
            'values': payload.values,
            'operator': payload.operator,
            "op_id": payload.op_id,
            "status": "success"
        }));

        let op = ops[payload.op_id];
        op.status = "success";
        op.endTime = Date.now();
        ops[payload.op_id] = op;
    }

    function emit_error(payload, error) {
        console.log("Emit Error");
        console.log(payload);
        console.log(error);

        socket.emit("op_completed", JSON.stringify({
            'op_type': payload.op_type,
            'result': error.message,
            'values': payload.values,
            'operator': payload.operator,
            "op_id": payload.op_id,
            "status": "failure"
        }));

        let op = ops[payload.op_id];
        op.status = "failure";
        op.endTime = Date.now();
        ops[payload.op_id] = op;
    }

    function getRandom(x, size) {
        if (size === undefined) {
            return x[Math.floor(Math.random() * x.length)];
        } else {
            let result = [];
            for (let i = 0; i < size; i++) {
                result[i] = x.splice(Math.floor(Math.random() * x.length), 1)[0]
            }
            return result;
        }
    }

    $(window).bind('beforeunload', function () {
        $(".clientStatus").html("Disconnected");
        socket.disconnect();
        return 'Are you sure you want to leave?';
    });

    // Calculate median of an array
    function median(values) {
        if (values.length === 0) return 0;

        values.sort(function (a, b) {
            return a - b;
        });

        var half = Math.floor(values.length / 2);

        if (values.length % 2)
            return values[half];

        return (values[half - 1] + values[half]) / 2.0;
    }

    // Calculate mode
    function mode(arr) {
        return arr.reduce(function (current, num) {
            const freq = (num in current.numMap) ? ++current.numMap[num] : (current.numMap[num] = 1);
            if (freq > current.modeFreq && freq > 1) {
                current.modeFreq = freq;
                current.mode = num;
            }
            return current;
        }, {mode: null, modeFreq: 0, numMap: {}}).mode
    }

    // Calculate the frequency distribution of an array
    function calculateFrequencyDistribution(arr) {
        return arr.reduce((op, inp) => {
            op[inp] = op[inp] || 0;
            op[inp]++;
            return op;
        }, {})
    }

    const percentile = (arr, val) =>
        (100 *
            arr.reduce(
                (acc, v) => acc + (v < val ? 1 : 0) + (v === val ? 0.5 : 0),
                0
            )) /
        arr.length;
})();

