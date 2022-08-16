import Long from "long";
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
const startLong = Long.fromNumber(100_000_000);
const msgObj = {
    "DataTypeNum": 0,
    "DataFormat": 8,
    "CurrBlockNum": 1,
    "TotalBlockNum": 2,
    "DataLen": 40,
    "StartFreqHighWordHz": startLong.getHighBitsUnsigned(),
    "StartFreqLowWordHz": startLong.getLowBitsUnsigned(),
    "StepBWHz": 300,
    "res": [],
    "mid": 3043
};

export function create_msg_obj(cb) {
    const TotalBlcNum = 9, step = 500 * _1KHz;
    let start = 100_000_000, totalLen = 2000;
    // 新创建
    for (let i = 1; i <= TotalBlcNum; i++) {
        let msg = Object.assign({}, msgObj);
        msg.CurrBlockNum = i;
        msg.TotalBlockNum = TotalBlcNum;
        msg.DataLen = totalLen;
        msg.StepBWHz = step;
        if(i !== 1) {
            let startLong = Long.fromNumber(start + totalLen * step * i);
            msg.StartFreqHighWordHz = startLong.getHighBitsUnsigned();
            msg.StartFreqLowWordHz = startLong.getLowBitsUnsigned();
        }
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

const ExtractType = {
    MAX: 'max',
    MIN: 'min',
    AVG: 'avg',
    RLT: 'rlt',
}

const TOTAL_FRAME_SIZE = (end - start)/step;
const EXTRACT_FRAME_NUMS = 4000;
export const INTVL = Math.floor(TOTAL_FRAME_SIZE/EXTRACT_FRAME_NUMS);

// 实时上报数据，对应的不一定是全频带的数据
export function extract(xData, yData, intvl, valid_left, valid_right, extractType) {
    let ext_x_data = [], ext_y_data = [];

    if(extractType === ExtractType.MAX) {
        // 最大值抽取
        let max_x = 0, max_y = 0;
        if ((valid_left !== -1) && (valid_right !== -1)) {
            let i = 0;
            for(i = valid_left; i <= valid_right - intvl; i += intvl) {
                max_x = xData[i];
                max_y = yData[i];
                for(let j = 1; j < intvl; j++) {
                    if(max_y < yData[i + j]) {
                        max_y = yData[i + j];
                        max_x = xData[i + j];
                    }
                }
                ext_x_data.push(max_x);
                ext_y_data.push(max_y);
            }

            // 剩余不满intvl_num点进行最大值抽取
            i -= intvl;
            i++;
            max_x = xData[i];
            max_y = yData[i];
            for(; i <= valid_right; i++) {
                if(max_y < yData[i]) {
                    max_y = yData[i];
                    max_x = xData[i];
                }
            }

            ext_x_data.push(max_x);
            ext_y_data.push(max_y);
        }
    } 
    else if(extractType === ExtractType.MIN) {
        // 最小值抽取
        let min_x = 0, min_y = Infinity;
        if((valid_left !== -1) && (valid_right !== -1)) {
            let i = 0;
            for(i = valid_left; i <= valid_right - intvl; i += intvl) {
                min_x = xData[i];
                min_y = yData[i];
                for(let j = 1; j < intvl; j++) {
                    if(min_y > yData[i + j]) {
                        min_y = yData[i + j];
                        min_x = xData[i + j];
                    }
                }
                ext_x_data.push(min_x);
                ext_y_data.push(min_y);
            }

            // 剩余不满intvl_num点进行最大值抽取
            i -= intvl;
            i++;
            min_x = xData[i];
            min_y = yData[i];
            for(; i <= valid_right; i++) {
                if(min_y > yData[i]) {
                    min_y = yData[i];
                    min_x = xData[i];
                }
            }

            ext_x_data.push(min_x);
            ext_y_data.push(min_y);
        }
    } 
    else if(extractType === ExtractType.AVG) {
        // 平均值抽取
        let avg_y = 0;
        if ((valid_left !== -1) && (valid_right !== -1)) {
            let i = 0;
            for (i = valid_left; i <= valid_right - intvl; i += intvl)
            {
                avg_y = yData[i];
                for (let j = 1; j < intvl; j++)
                {
                    avg_y += yData[i + j];
                }
                
                ext_x_data.push(xData[i + intvl / 2]);
                ext_y_data.push(avg_y / intvl);
            }

            // 剩余不满intvl_num点进行平均值抽取
            let cnt = 0;
            i -= intvl;
            i++;
            avg_y = 0;
            for (; i <= valid_right; i++)
            {
                avg_y += yData[i + cnt];
            }
            ext_x_data.push(xData[i + cnt / 2]);
            ext_y_data.push(avg_y / intvl);
        }
    } 
    else if(extractType === ExtractType.RLT) {
        // 实时值
        if ((valid_left !== -1) && (valid_right !== -1))
        {
            let i = 0;
            for (i = valid_left; i <= valid_right - intvl; i += intvl)
            {
                ext_x_data.push(xData[i + intvl / 2]);
                ext_y_data.push(yData[i]);
            }

            // 剩余不满intvl_num点进行平均值抽取
            let cnt = 0;
            i -= intvl;
            i++;
            ext_x_data.push(xData[i + cnt / 2]);
            ext_y_data.push(yData[i + cnt]);
        }
    }

    return {
        ext_x_data,
        ext_y_data,
    }
}
