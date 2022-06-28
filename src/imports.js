const mathjs = require("mathjs");
const tfjs = require("@tensorflow/tfjs");
const SEAL = require("node-seal");
const jsftp = require("jsftp");
const {io} = require('socket.io-client')
const fetch = require("node-fetch")
const {performance} = require("perf_hooks")

/**
 * To find indices of values in a particular array
 * @param x
 * @param values
 * @returns {{}}
 */
tfjs.findIndices = function (x, values) {
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
tfjs.sort = function (x) {
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

module.exports = {mathjs, tfjs, SEAL, jsftp, io, fetch, performance}
