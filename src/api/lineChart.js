const _1KHz = 1000;
const _1MHz = _1KHz * _1KHz;
const start = 100 * _1MHz;
const end = 9000 * _1MHz;
const step = 100 * _1KHz;
let cnt = 1; // 奇偶次数反转

export function create_frame(cb) {
    // console.log("create_frame...");
    let x = [];
    let y = [];
    for(let i = start; i <= end; i += step) {
        x.push(i);
        if(cnt % 2 === 1) {
            y.push(-100 + Math.random() * 10);
        } else {
            y.push( -40 + Math.random() * 10)
        }
    }
    cnt++;
    cb(x, y);
}
