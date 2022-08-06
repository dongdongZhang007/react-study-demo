const _1KHz = 1000;
const _1MHz = _1KHz * _1KHz;
const start = 100 * _1MHz;
const end = 9000 * _1MHz;
const step = 500 * _1KHz;
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

const PieceNum = 2048;
const TotalNumber = Math.floor((end - start) / step);
const TotalPiece = TotalNumber / PieceNum;
let currPiece = 1;
let done = false; // 片结束的标志
// 生成一段固定长度的数据，不足的
export function create_piece(cb) {
    // let x = [], y = [];
    let data = [];
    if(currPiece === 1) {
        done = false;
    }

    for(let i = 0; i < PieceNum; i++) {
        let freq = start + step * (currPiece - 1) * PieceNum + i * step;
        if(freq > end) {
            break;
        }
        // x.push(freq);
        let amp = 0;
        if(cnt % 2 === 1) {
            // y.push(-100 + Math.random() * 10);
            amp = -100 + Math.random() * 10;
        } else {
            // y.push( -40 + Math.random() * 10);
            amp = -40 + Math.random() * 10;
        }
        data.push([freq, amp])
    }
    
    currPiece++;
    // console.log(currPiece);
    if(currPiece > TotalPiece) {
        currPiece = 1;
        done = true;
    }
    // cb(x, y, done);
    cb(data, done);
}

// 消息结构体声明
const msgObj = {
    "DataTypeNum": 0,
    "DataFormat": 8,
    "CurrBlockNum": 1,
    "TotalBlockNum": 2,
    "DataLen": 40,
    "StartFreqHighWordHz": 0,
    "StartFreqLowWordHz": 1000,
    "StepBWHz": 300,
    "res": [],
    "mid": 3043
};

export function create_msg_obj(cb) {
    const TotalBlcNum = 60, step = 300;
    let start = 1000, totalLen = 100;
    // 新创建
    for (let i = 1; i <= TotalBlcNum; i++) {
        let msg = Object.assign({}, msgObj);
        msg.CurrBlockNum = i;
        msg.TotalBlockNum = TotalBlcNum;
        msg.DataLen = totalLen;
        msg.StartFreqLowWordHz = i === 1 ? start : (start + totalLen * step);

        let resLen = msg.DataFormat === 8 ? totalLen : totalLen * 2;
        let arr = new Array(resLen).fill(-100 + Math.random() * 10);
        msg.res = arr;
        // console.log(msg.res.length);
        cb(msg)
    }
    // console.log("done...");
    // 替换
    // for (let i = 1; i <= TotalBlcNum; i++) {
    //     let msg = Object.assign({}, msgObj);
    //     msg.CurrBlockNum = i;
    //     msg.TotalBlockNum = TotalBlcNum;
    //     msg.DataLen = totalLen;
    //     msg.StartFreqLowWordHz = i === 1 ? start : (start + totalLen * step);

    //     let resLen = msg.DataFormat === 8 ? totalLen : totalLen * 2;
    //     let arr = new Array(resLen).fill(-10 * Math.random());
    //     msg.res = arr;
    // }
    // console.log("done...");
}
