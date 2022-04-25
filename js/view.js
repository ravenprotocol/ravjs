// Variables
let graphs = null;
let clientId = null;
let graphId = null;
let graphsCard = $("#graphsCard");
let spinnerGraphs = $("#spinnerGraphs");
let errorMessage = $("#showErrorMessage");
let clientIdForm = $("#clientIdForm");
let loggedInNav = $("#loggedInNav");
let loggedOutNav = $("#loggedOutNav");
let graphCard = $("#graphCard");
let rulePill = $(".rulePill");
let graphsList = $(".graphsList");
let clientIdInput = $("#clientIdInput");
let connectDisconnectButton = $("#connectDisconnectButton");
let activeGraphsCard = $("#activeGraphs");
let pastGraphsCard = $("#pastGraphs");
let currentParticipateButton = null;

Dropzone.autoDiscover = false;

Dropzone.options.myGreatDropzone = { // camelized version of the `id`
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 10, // MB
    uploadMultiple: false,
    parallelUploads: 1,
    maxFiles: 1,
    accept: function (file, done) {
        console.log("File added:", file, done);
    },
    autoProcessQueue: false,
    acceptedFiles: "text/csv",
    addRemoveLinks: true
};

const myDropzone = new Dropzone("form.dropzone", {url: "/file/post"});
let inputDataModal = new bootstrap.Modal(document.getElementById('addDataModal'), {
    keyboard: false
});

hideAll(function () {
    console.log(localStorage.getItem("clientId"));

    if (localStorage.getItem("clientId") !== null) {
        login(localStorage.getItem("clientId"));
        showGraphs();
    } else {
        console.log("Need to login in");
        showElement(clientIdForm);
        showElement(loggedOutNav);
    }
});

function showGraphs() {
    if (isConnected) {
        hideElement(errorMessage, function () {
            hideElement(graphsList, function () {
                showElement(spinnerGraphs, function () {
                    fetchGraphs(function () {
                        console.log("Graphs1:", graphs);
                        if (graphs === null) {
                            hideElement(spinnerGraphs, function () {
                                hideElement(graphsList, function () {
                                    showErrorMessage("Unable to fetch graphs");
                                });
                            });
                        } else if (graphs.length === 0) {
                            hideElement(spinnerGraphs, function () {
                                hideElement(graphsList, function () {
                                    showErrorMessage("No graphs available");
                                });
                            });
                        } else if (graphs.length > 0) {
                            renderGraphs();

                            showElement(activeGraphsCard);
                            showElement(pastGraphsCard);
                        } else {
                            hideElement(spinnerGraphs, function () {
                                hideElement(graphsList, function () {
                                    showErrorMessage("Unable to fetch graphs");
                                });
                            });
                        }
                    });
                });
            });
        });

        // hideElement(errorMessage);
        // hideElement(graphsCard, function () {
        //     showElement(spinnerGraphs);
        // });
        //
        // if ($("#graphsCard").is(":visible")) {
        //     $("#graphsCard").fadeOut("medium", function () {
        //         $("#spinnerGraphs").fadeIn("medium");
        //     });
        // } else {
        //     $("#spinnerGraphs").fadeIn("medium");
        // }
        //
        // fetch(GET_GRAPHS_URL).then(r => r.json()).then(r => {
        //     console.log("Graphs:", r);
        //     graphs = r;
        //     if (r.length > 0) {
        //         if ($("#spinnerGraphs").is(":visible")) {
        //             $("#spinnerGraphs").fadeOut("medium", function () {
        //                 $("#graphsCard").fadeIn("medium");
        //                 $("#graphsCard").empty();
        //                 if (r.length > 0) {
        //                     renderGraphs(r);
        //                 } else {
        //                     $("#showErrorMessage").fadeIn("medium");
        //                     $("#showErrorMessage .message").text("0 Graphs");
        //                 }
        //             });
        //         } else {
        //             $("#graphsCard").fadeIn("medium");
        //             $("#graphsCard").empty();
        //             if (r.length > 0) {
        //                 renderGraphs(r);
        //             } else {
        //                 $("#showErrorMessage").fadeIn("medium");
        //                 $("#showErrorMessage .message").text("0 Graphs");
        //             }
        //         }
        //     } else {
        //         if ($("#spinnerGraphs").is(":visible")) {
        //             $("#spinnerGraphs").fadeOut("medium", function () {
        //                 $("#showErrorMessage").fadeIn("medium");
        //                 $("#showErrorMessage .message").text("0 Graphs");
        //             });
        //         } else {
        //             if (!$("#showErrorMessage").is(":visible")) {
        //                 $("#showErrorMessage").fadeIn("medium");
        //                 $("#showErrorMessage .message").text("0 Graphs");
        //             }
        //         }
        //     }
        // }).catch(error => {
        //     if (!$("#spinnerGraphs").is(":visible")) {
        //         $("#spinnerGraphs").fadeOut("medium", function () {
        //             $("#showErrorMessage").fadeIn("medium");
        //             $("#showErrorMessage .message").text("Unable to load graphs");
        //         });
        //     } else {
        //         $("#showErrorMessage").fadeIn("medium");
        //         $("#showErrorMessage .message").text("Unable to load graphs");
        //     }
        // });
    } else {
        hideElement(spinnerGraphs, function () {
            hideElement(graphsList, function () {
                showElement(errorMessage);
            });
        });
    }
}

function fetchGraphs(func) {
    fetch(GET_GRAPHS_URL).then(r => r.json()).then(r => {
        graphs = r;
        func(graphs);
    }).catch(error => {
        func(null);
    });
}

function isVisible(element) {
    return element.is(":visible");
}

function showElement(element, func) {
    console.log(element, func, element.is(":visible"));
    if (!element.is(":visible")) {
        element.fadeIn("medium", function () {
            if (func !== undefined) {
                func();
            }
        });
    } else {
        if (func !== undefined) {
            func();
        }
    }
}

function showErrorMessage(message) {
    if (message !== undefined) {
        errorMessage.find(".message").text(message);
    }
    showElement(errorMessage);
}

function hideElement(element, func, anim, mode) {
    if (mode === undefined) {
        mode = "medium";
    }

    if (anim === undefined) {
        anim = "fadeOut";
    }

    if (element.is(":visible")) {
        if (anim === "fadeOut") {
            element.fadeOut(mode, function () {
                if (func !== undefined) {
                    func();
                }
            });
        } else if (anim === "hide") {
            element.hide(function () {
                func()
            });
        }
    } else {
        if (func !== undefined) {
            func();
        }
    }
}

function renderGraphs() {
    graphsList.empty();

    for (let i = 0; i < graphs.length; i++) {
        let graph_data = graphs[i];
        console.log(graphs[i]);
        let algorithm = graph_data.algorithm;
        if (algorithm === null) {
            algorithm = "NA";
        }

        let graphCard1 = graphCard.clone();
        graphCard1.removeAttr("id");
        graphCard1.css("display", "block");
        graphCard1.find(".card-title").text(graph_data.name);
        graphCard1.find(".card-body .graphId").text("Graph Id-" + graph_data.id);
        graphCard1.find(".card-body .algorithm").text("Algorithm-" + algorithm);
        graphCard1.find(".card-body .approach").text("Approach-" + capitalizeFirstLetter(graph_data.approach) + " Learning");
        graphCard1.find(".card-body .participateButton").data("graph-id", graph_data.id);

        if (isInActiveGraphs(graph_data.id)) {
            graphCard1.find(".card-body .participateButton").text("Participating");
            graphCard1.find(".card-body .participateButton").attr("disabled", "disabled");
            graphCard1.find(".card-body .participateButton").removeClass();
            graphCard1.find(".card-body .participateButton").addClass("btn btn-outline-warning participateButton");
        } else if (isInPastGraphs(graph_data.id)) {
            graphCard1.find(".card-body .participateButton").text("Participated");
            graphCard1.find(".card-body .participateButton").attr("disabled", "disabled");
            graphCard1.find(".card-body .participateButton").removeClass();
            graphCard1.find(".card-body .participateButton").addClass("btn btn-outline-secondary participateButton");
        }

        if (graph_data.rules !== null) {
            graphCard1.find(".card-body .rules").append(formatRules(JSON.parse(graph_data.rules).rules));
        } else {
            graphCard1.find(".card-body .rules").text("NA");
        }

        graphsList.append(graphCard1);
    }

    hideElement(spinnerGraphs, function () {
        hideElement(errorMessage, function () {
            showElement(graphsList);
        });
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatRules(rules) {
    console.log(rules);
    let b = $("<div></div>");
    for (const key in rules) {
        console.log(key, rules[key]);

        //output = output + "<span style='font-weight:bold;text-transform: uppercase;'>" + key + "</span>: ";
        let a = $("<div style='margin-bottom: 1.2em;border: 1px solid rgba(236, 240, 241,0.7);background-color: rgba(236, 240, 241,0.4);padding: 1em;border-radius: 5px;display: inline-block;margin-right: 1em;'>" + capitalizeFirstLetter(key) + ": </div>");
        let rules1 = rules[key];
        console.log(rules1);
        for (const ruleKye in rules1) {
            console.log(ruleKye, rules1[ruleKye]);
            let rulePill = $(".rulePill").clone();
            rulePill.find(".key").text(capitalizeFirstLetter(ruleKye));
            rulePill.find(".value").text(rules1[ruleKye]);
            rulePill.css("display", "inline");
            a.append(rulePill);
            //output = output + ruleKye + "=" + rules1[ruleKye] + ", ";
        }

        if (Object.keys(rules1).length === 0) {
            a.append("NA");
        }

        //output = output + "</br>";
        b.append(a);
    }
    //output = output + "</div>";
    //console.log(output);
    console.log(b);
    return b;
}

$(document).on('click', '#clientIdButton', function () {
    clientId = $("#clientIdInput").val();
    if (clientId === "") {
        return;
    } else {
        login(clientId);
    }
    return false;
});

$(document).on('click', '#reloadGraphsButton', function () {
    if (isConnected) {
        showGraphs();
    } else {
        Swal.fire("Oops!", "Connect to Ravsock to load graphs", "error");
    }
});

function login(clientId) {
    console.log("Login:", clientId);
    if (clientId === null || clientId === undefined) {
        return;
    }
    localStorage.setItem("clientId", clientId);

    clientIdInput.val("");
    $("#clientIdShow .clientIdValue").text(clientId);

    hideElement(clientIdForm, function () {
        hideElement(loggedOutNav, function () {
            showElement(loggedInNav);
            showElement(graphsCard);
            showElement(errorMessage);
            showElement(connectDisconnectButton, function () {
                reloadActiveGraphsList();
                reloadPastGraphsList();
            });
        });
    });
}

function logout() {
    localStorage.removeItem("clientId");
    $("#graphsCard").fadeOut("medium", function () {
        hideAll(function () {
            socket.disconnect();
            graphsList.empty();
            isConnected = false;
            showElement(loggedOutNav);
            showElement(clientIdForm);
        });
    });
}

$(document).on('click', '#logoutButton', function () {
    logout();
});

$(document).on('click', '#loginButton', function () {
    login();
});

$(document).on('click', '.participateButton', function () {
    currentParticipateButton = $(this);

    graphId = $(this).data("graph-id");
    let activeGraphs = localStorage.getItem("ActiveGraphs")
    if (activeGraphs !== null && activeGraphs !== undefined) {
        activeGraphs = JSON.parse(activeGraphs);
        if (activeGraphs[graphId] === null || activeGraphs[graphId] === undefined) {
            inputDataModal.show();
        } else {
            Swal.fire("Oops!", "Choose another model", "error");
        }
    } else {
        inputDataModal.show();
    }
});

$(document).on('click', '#addDataButton', function () {
    let files = myDropzone.files;
    let data = $("#inputData").val();
    if (data === "" && files.length === 0) {
        Swal.fire("Oops!", "Add file", "error");
    } else {
        $(this).html('<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>\n' +
            '  <span class="sr-only"> Adding</span>');
        if (data !== "") {
            // process data
            runPythonScript(data, null);
        } else if (files.length > 0) {
            // process files
            runPythonScript(null, files[0].path);
        }
    }
});

$(document).on('click', '#closeModalButton', function () {
    $("#inputData").val("");
    myDropzone.removeAllFiles();
    graphId = null;
});

function runPythonScript(data, file_path) {
    console.log(data, file_path);
    let args = ["-a", "participate", "-c", localStorage.getItem("clientId"), "-g", graphId];

    if (data !== null) {
        args.push("-d");
        args.push(data);
    } else if (file_path !== null) {
        args.push("-f");
        args.push(file_path);
    }

    console.log(args);

    let options = {
        mode: 'text',
        args: args,
        pythonOptions: ['-u'],
        pythonPath: "/Users/apple/miniconda3/envs/ravpy/bin/python",
        scriptPath: "/Users/apple/RavenProtocol/codebase/ravpy"
    };

    let pyshell = new PythonShell('run2.py', options);

    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message, typeof message);

        let output = JSON.parse(message);
        console.log(output, typeof output);

        if (output.code !== undefined && output.code === 1000) {
            console.log(output.message);
            $(this).text("Add");
            inputDataModal.hide();
            clearInputDataModal();

            /**
             * Add graph id to active graphs list
             */
            let activeGraphs = getActiveGraphs();
            if (activeGraphs !== null) {
                activeGraphs[graphId] = graphId;
            } else {
                activeGraphs = {};
                activeGraphs[graphId] = graphId;
            }
            localStorage.setItem("ActiveGraphs", JSON.stringify(activeGraphs));

            reloadActiveGraphsList();
            reloadPastGraphsList();

            currentParticipateButton.text("Participating")
            currentParticipateButton.attr("disabled", "disabled")
            currentParticipateButton.removeAttr("class");
            currentParticipateButton.attr("class", "btn btn-outline-warning participateButton");

        } else if (output.code !== undefined && output.code === 1001) {
            console.log(output.message);
            Swal.fire("Success", "Successfully participated", "success");

            /**
             * Add graph id to past graphs
             */
            let pastGraphs = getPastGraphs();
            if (pastGraphs !== null) {
                pastGraphs[graphId] = graphId;
            } else {
                pastGraphs = {}
                pastGraphs[graphId] = graphId;
            }
            localStorage.setItem("PastGraphs", JSON.stringify(pastGraphs));

            // Remove it from the active graphs list
            removeActiveGraphId(graphId);

            reloadActiveGraphsList();
            reloadPastGraphsList();

            currentParticipateButton.text("Participated")
            currentParticipateButton.attr("disabled", "disabled")
            currentParticipateButton.removeAttr("class");
            currentParticipateButton.attr("class", "btn btn-outline-secondary participateButton");

            graphId = null;
        }
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
    });

    // pyshell.run('run.py', options, function (err, results) {
    //     if (err) throw err;
    //     console.log('results', results);
    // });
}

function reloadActiveGraphsList() {
    $("#activeGraphs .card-text").empty();

    let activeGraphs = localStorage.getItem("ActiveGraphs")
    if (activeGraphs !== undefined && activeGraphs !== null) {
        activeGraphs = JSON.parse(activeGraphs)

        if (Object.keys(activeGraphs).length > 0) {
            for (let key in activeGraphs) {
                $("#activeGraphs .card-text").append("<p>" + key + "</p>");
            }
        } else {
            $("#activeGraphs .card-text").append("<p>No active graphs</p>");
        }
    } else {
        $("#activeGraphs .card-text").append("<p>No active graphs</p>");
    }
}

function reloadPastGraphsList() {
    $("#pastGraphs .card-text").empty();

    let pastGraphs = localStorage.getItem("PastGraphs")
    if (pastGraphs !== undefined && pastGraphs !== null) {
        pastGraphs = JSON.parse(pastGraphs)

        if (Object.keys(pastGraphs).length > 0) {
            for (let key in pastGraphs) {
                $("#pastGraphs .card-text").append("<p>" + key + "</p>");
            }
        } else {
            $("#pastGraphs .card-text").append("<p>No past graphs</p>");
        }
    } else {
        $("#pastGraphs .card-text").append("<p>No past graphs</p>");
    }
}

// let options = {
//     mode: 'text',
//     args: ["-a", "participate", "-c", "12345", "-g", "1", "-f", "../ravpy/data/data1.csv"],
//     pythonOptions: ['-u'],
//     pythonPath: "/Users/apple/miniconda3/envs/ravpy/bin/python",
//     scriptPath: "/Users/apple/RavenProtocol/codebase/ravpy"
// };

function clearInputDataModal() {
    $("#inputData").val("");
    myDropzone.removeAllFiles();
    $("#addDataButton").text("Add");
}

function hideAll(func) {
    spinnerGraphs.hide();
    loggedOutNav.hide();
    loggedInNav.hide();
    activeGraphsCard.hide();
    graphsCard.hide();
    clientIdForm.hide();
    connectDisconnectButton.hide();
    pastGraphsCard.hide();
    func()
}

function removeActiveGraphId(graphId) {
    let activeGraphs = getActiveGraphs();
    delete activeGraphs[graphId];
    localStorage.setItem("ActiveGraphs", JSON.stringify(activeGraphs));
}

function getActiveGraphs() {
    let activeGraphs = localStorage.getItem("ActiveGraphs")
    if (activeGraphs !== undefined && activeGraphs !== null) {
        activeGraphs = JSON.parse(activeGraphs)
        return activeGraphs
    }

    return null
}

function getPastGraphs() {
    let pastGraphs = localStorage.getItem("PastGraphs")
    if (pastGraphs !== undefined && pastGraphs !== null) {
        pastGraphs = JSON.parse(pastGraphs)
        return pastGraphs
    }

    return null
}

function isInActiveGraphs(graphId) {
    let activeGraphs = getActiveGraphs();

    if (activeGraphs !== null) {
        if (activeGraphs[graphId] !== null && activeGraphs[graphId] !== undefined) {
            return true
        }
    }

    return false
}

function isInPastGraphs(graphId) {
    let pastGraphs = getPastGraphs();

    if (pastGraphs !== null) {
        if (pastGraphs[graphId] !== null && pastGraphs[graphId] !== undefined) {
            return true
        }
    }

    return false
}
