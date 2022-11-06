import * as tfjs from '@tensorflow/tfjs';
import * as mathjs from 'mathjs';
import { tfjs_functions, mathjs_functions } from './config.js';


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

function compute(payload) {

    let f;
    // var used to transform function parameters to be ts.tensor(array)
    let tensor = false;


    if(tfjs_functions.includes(payload.operator)){
        tensor = true;

        if(payload.operator === 'cube'){
            f = tfjs['pow']
            payload.params.exp = 3
        }else if(payload.operator === 'foreach'){

        }
    }else {
        if (mathjs_functions.includes(payload.operator)) {
            f = mathjs[payload.operator]
        } else if (typeof tfjs[payload.operator] === 'function') {
            f = tfjs[payload.operator]
            tensor = true
        } 
    }

    return exeFunc(payload, f, getXY(payload.values, tensor))
}

function exeFunc(payload, f, values) {
    let result;

    try {
        result = f.apply(null, values.concat(Object.values(payload.params)))
        if (result.constructor.name === "Tensor") {
            result = result.arraySync()
        }

        return {
            status: "success",
            result: result
        }
    }catch (error){
        return {
            status: "error",
            error: error
        }
    }
}

export {compute}
