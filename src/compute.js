import * as tfjs from '@tensorflow/tfjs';
import * as mathjs from 'mathjs';
import {tensor_mapping, mathjs_mapping, custom_fn} from './operator_mapping.js';


function getXY(values){
    
    let x = values[0].value;
    if (values.length == 2){
        let y = values[1].value;
        return [x, y];
    }

    return [x];
}

function makePayloadTensor(values){
    let x = tfjs.tensor(values[0]);
    
    if (values.length == 2){
       let y = tfjs.tensor(values[1]);
       return [x, y];
    } 

    return [x];
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
        console.log("function got in math.js function");

        fn = mathjs[payload.operator]    
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

    let args = getXY(payload.values);
    if(tensor){
        args = makePayloadTensor(args);
    }
    console.log({"values": JSON.stringify(payload.values) });

    return exeFunc(fn, args, payload.params)
}

function exeFunc(fn, values, params) {
    console.log({"values": JSON.stringify(values) });

    let result;
    try {
        result = fn.apply(null, values.concat(Object.values(params)));
    }catch (error){
        console.log({error})
        return {
            status: "error",
            error: error
        }
    }

    if (result.constructor.name === "Tensor") {
        result = result.arraySync()
    }
    // console.log({result});

    return {
        status: "success",
        result: result
    }
}

export {compute}
