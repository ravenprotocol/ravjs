const percentile = (arr, val) =>
    (100 *
        arr.reduce(
            (acc, v) => acc + (v < val ? 1 : 0) + (v === val ? 0.5 : 0),
            0
        )) /
    arr.length;


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

export default {percentile, getRandom}
