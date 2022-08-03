const _1KHz = 1000;
const _1MHz = _1KHz * _1KHz;
const start = 100 * _1MHz;
const end = 5000 * _1MHz;
const step = 200 * _1KHz;

export function create_frame(cb) {
    // console.log("create_frame...");
    let x = [];
    let y = [];
    for(let i = start; i <= end; i += step) {
        x.push(i);
        y.push(-100 + Math.random() * 10)
    }
    cb(x, y);
}
