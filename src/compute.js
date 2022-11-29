import * as tfjs from '@tensorflow/tfjs';
import * as mathjs from 'mathjs';
import {tensor_mapping, mathjs_mapping, custom_fn} from './operator_mapping.js';


function getXY(values, tensor=false){
    
    let x = values[0].value
    let y
    if (values.length == 2){
        y = values[1].value
    }

    if (tensor){
        return [tfjs.tensor(x), y && tfjs.tensor(y)]
    }

    return [x, y]
}

function getFunctionNameAndPayload(payload){
    // var used to transform function parameters to be ts.tensor(array)
    let tensor = false;
    let fn;

    if(payload.operator in tensor_mapping){
        console.log("function got in tensor");
        let params = tensor_mapping[payload.operator]["params"];
        let fn_name = tensor_mapping[payload.operator]["fn"]

        fn = tfjs[fn_name];
        Object.assign(payload.params, params)
        tensor = true;
    }
    else if(payload.operator in mathjs_mapping){
        console.log("function got in mathjs");

        let params = mathjs_mapping[payload.operator]["params"];
        let fn_name = mathjs_mapping[payload.operator]["fn"]

        fn = mathjs[fn_name];
        Object.assign(payload.params, params)
    }
    else if(payload.operator in custom_fn){
        fn = custom_fn[payload.operator]["fn"];
    }
    else if (typeof tfjs[payload.operator] === 'function') {
        console.log("function got in tensor function");

        fn = tfjs[payload.operator]
        tensor = true
    
    }
    else if (typeof mathjs[payload.operator] === 'function') {
        console.log("function got in tensor function");

        fn = mathjs[payload.operator]
        tensor = true
    
    }
    else {
        throw new Error(`Couldn't figure out function for the operator ${payload.operator}`)
    }

    return {
        payload,
        tensor,
        fn
    }
}

function compute(payload) {
    console.log({"compute": payload})
    const {tensor, fn} = getFunctionNameAndPayload(payload)

    if(fn == null){
        throw new Error(`function ${payload.operator} not defined`);
    }
    return exeFunc(payload, fn, getXY(payload.values, tensor))
}

function exeFunc(payload, f, values) {
    let result;
    console.log({"values": JSON.stringify(payload.values) })
    try {
        result = f.apply(null, values.concat(Object.values(payload.params)))
        if (result.constructor.name === "Tensor") {
            result = result.arraySync()
        }
        console.log({result});

        return {
            status: "success",
            result: result
        }
    }catch (error){
        console.log({error})
        return {
            status: "error",
            error: error
        }
    }
}

export {compute}
