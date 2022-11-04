import * as tfjs from '@tensorflow/tfjs';
import { tfjs_functions, mathjs_functions } from './config.js';

function compute(payload) {
    console.log(payload)

    let f;
    let y;

    let x = payload.values[0].value

    if(payload.op_type === "binary") {
        y = payload.values[1].value
    }

    if(tfjs_functions.includes(payload.operator)){
        x = tfjs.tensor(x)
        if(y !== undefined){
            y = tfjs.tensor(y)
        }
        if(payload.operator === 'cube'){
            f = `tfjs.pow`
            payload.params.exp = 3
        }else if(payload.operator === 'foreach'){

        }
    }else {
        if (mathjs_functions.includes(payload.operator)) {
            f = `mathjs.${payload.operator}`
        } else if (typeof eval(`tfjs.${payload.operator}`) === 'function') {
            f = `tfjs.${payload.operator}`
            x = tfjs.tensor(x)
            if(y !== undefined){
                y = tfjs.tensor(y)
            }
        } else {
            f = ""
        }
    }

    return a(payload, f, [x, y])
}

function a(payload, f, values) {
    let result;

    try {
        result = eval(f).apply(null, values.concat(Object.values(payload.params)))
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
