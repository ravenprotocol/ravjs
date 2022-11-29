import * as mathjs from 'mathjs';


const custom_fn = {
    "cube_root": {
        "fn" : (o)=>{
            let arr = o[0];
            return arr.map(e => {
                return mathjs.cbrt(e)
            });
        }
    }
}

const mathjs_mapping = {
    'inv': {
        "fn": "inv",
        "params": {}
    },
    'mode': {
        "fn": "mode",
        "params": {}
    },
    'median': {
        "fn": "median",
        "params": {}
    },
    'std': {
        "fn": "std",
        "params": {}
    },
    'variance': {
        "fn": "variance",
        "params": {}
    },

}

const tensor_mapping = {
    "subtraction": {
        "fn": "sub",
        "params": {}
    },
    "addition": {
        "fn": "add",
        "params": {}
    },
    "multiplication": {
        "fn": "mul",
        "params": {}
    },
    "multiply": {
        "fn": "mul",
        "params": {}
    },
    "division": {
        "fn": "div",
        "params": {}
    },
    "cube": {
        "fn": "pow",
        "params": {
            "exp": 3
        }
    },
    "power": {
        "fn": "pow",
        "params": {}
    },
    "absolute": {
        "fn": "abs",
        "params": {}
    },
    "matrix_sum": {
        "fn": "sum",
        "params": {}
    },
    "argmax": {
        "fn": "argMax",
        "params": {}
    },
    "argmin": {
        "fn": "argMin",
        "params": {}
    },
    "exponential": {
        "fn": "exp",
        "params": {}
    }
}

export {mathjs_mapping,tensor_mapping, custom_fn}