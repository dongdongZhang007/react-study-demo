import {
    observable,
    action,
    makeObservable,
    computed,
    runInAction,
} from 'mobx';
import Long from 'long';
import {
    create_frame,
    create_piece,
    extract,
    INTVL,
} from '../api/lineChart';
const SCALE_X = 1;
const SCALE_Y = 100;
const _1MHz = Math.pow(10, 6);

export default class LineChartStore {

    rootStore;
    xData = [];
    yData = [];
    xTmpData = []; // 临时存储备份
    yTmpData = []; // 临时存储备份
    xData1 = []; // 抽取图表所使用的xData
    yData1 = []; // 抽取图表所使用的yData
    index_of_freq = -1;
    ext_type = 'max'; // 抽取类型
    pieceData;
    cnt = 1;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.xData = [];
        this.yData = [];
        this.pieceData = [];
        this.xData1 = [];
        this.yData1 = [];

        this.interval = null; // 设置定时器

        makeObservable(this, {
            xData: observable,
            yData: observable,
            xData1: observable,
            yData1: observable,
            ext_type: observable,
            interval: observable,
            pieceData: observable,
            getChartOpt: computed,
            getChartOpt2: computed,
            get_frame: action.bound,
            get_frames: action.bound,
            clearTimeOut: action.bound,
            parse_data: action.bound,
            set_ext_type: action.bound, // 设置数据抽样类型
        });
    }

    get getChartOpt() {
        let xData = this.xData, yData = this.yData;
        let opt = {
            legend: {
                data: [
                    "PSCAN频谱点图",
                ],
            },
            xAxis: {
                type: "category",
                data: xData,
                name: '频率/MHz',
                axisLabel: {
                    formatter: function(value) {
                        return value / _1MHz
                    }
                }
            },
            yAxis: [
                { type: "value" },
                {
                    type: "value",
                    name: "dBm",
                    nameTextStyle: {
                        color: "#ccc",
                        padding: [0, 0, 10, -30],
                    },
                    position: 'left',
                    splitNumber: 5,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: "dashed",
                            width: 1,
                            color: ["#ccc", "#ccc"],
                        },
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            fontSize: 12,
                        },
                        // formatter: function() {
                            
                        // }
                    },
                    min: -120,
                    max: -20,
                    // sampling: 'max',//降采样策略,
                },
            ],
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                textStyle: {
                    color: "#fff",
                    align: "left",
                    fontSize: 14,
                },
                backgroundColor: "rgba(0,0,0,0.8)",
            },
            series: [
                {
                    name: "PSCAN频谱点图",
                    data: yData,
                    yAxisIndex: 1,
                    type: "line",
                    smooth: true,
                    showSymbol: false, // 未显示圆点
                }
            ],
        };
        // console.log("getChartOpt => ", opt);

        return opt;
    }

    get getChartOpt2() {
        let xData = this.xData1, yData = this.yData1;
        let opt = {
            legend: {
                data: [
                    "PSCAN频谱点图",
                ],
            },
            xAxis: {
                type: "category",
                data: xData,
                name: '频率/MHz',
                axisLabel: {
                    formatter: function(value) {
                        return value / _1MHz;
                    }
                }
            },
            yAxis: [
                { type: "value" },
                {
                    type: "value",
                    name: "dBm",
                    nameTextStyle: {
                        color: "#ccc",
                        padding: [0, 0, 10, -30],
                    },
                    position: 'left',
                    splitNumber: 5,
                    splitLine: {
                        show: true,
                        lineStyle: {
                            type: "dashed",
                            width: 1,
                            color: ["#ccc", "#ccc"],
                        },
                    },
                    axisLabel: {
                        show: true,
                        textStyle: {
                            fontSize: 12,
                        },
                    },
                    // min: -120,
                    // max: -20,
                    // sampling: 'max',//降采样策略,
                },
            ],
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow",
                },
                textStyle: {
                    color: "#fff",
                    align: "left",
                    fontSize: 14,
                },
                backgroundColor: "rgba(0,0,0,0.8)",
            },
            series: [
                {
                    name: "PSCAN频谱点图",
                    data: yData,
                    yAxisIndex: 1,
                    type: "line",
                    smooth: true,
                    showSymbol: false, // 未显示圆点
                }
            ],
        };
        // console.log("getChartOpt => ", opt);
        return opt;
    }

    get_frame() {
        create_frame((x,y) => {
            // console.log("cb1...");
            runInAction(() => {
                // console.log("cb2...");
                // 源数据
                // this.xData = x;
                // this.yData = y;

                // 添加抽取，必须保留第一个点和最后一个点
                let valid_left = 1, valid_right = x.length - 2;
                let ret = extract(x, y, INTVL, valid_left, valid_right, this.ext_type);
                // console.log(ret);
                this.xData = [x[0], ...ret.ext_x_data, x[x.length-1]];
                this.yData = [y[0], ...ret.ext_y_data, y[y.length-1]];
            });
        })
    }

    get_frames() {
        runInAction(() => {
            this.interval = setInterval(() => {
                this.get_frame();
                // console.log("interval...");
                console.log(this.cnt++);
            }, 50);
        });
    }

    clearTimeOut() {
        // console.log("clearTimeOut");
        clearInterval(this.interval);
        runInAction(() => {
            this.interval = null;
            this.cnt = 0;
        });
    }

    get_piece() {
        create_piece((data, done) => {
            // console.log(data);
            runInAction(() => {
                this.pieceData = data;
                // console.log(this.pieceData);
            });

            if(!done) {
                this.get_piece();
            }
        })
    }

    parse_data = (msgObj) => {
        // console.log("parse_data => ", args);
        let i = 0;
        let startFreq = new Long(msgObj.StartFreqLowWordHz, msgObj.StartFreqHighWordHz);
        let stepFreq = msgObj.StepBWHz * SCALE_X;
        let DataLen = msgObj.DataLen;
        let res = msgObj.res;
        let dataFormat = msgObj.DataFormat;

        // 根据起始频率
        if ((this.xTmpData.length > 0) && (this.xTmpData[0].equals(startFreq))) {
            // console.log("1st block...");
            this.index_of_freq = -1;
        } else if (this.xTmpData.length === 0) {
            // console.log("empty block...");
            this.index_of_freq = -1;
        }
        // console.log("1: ", this.index_of_freq);

        // 在当前存储的数组中找到起始频率相同的点的索引
        for (i = this.index_of_freq + 1; i < this.xTmpData.length; i++) {
            if (this.xTmpData[i].equals(startFreq)) {
                this.index_of_freq = i;
                break;
            }
        }
        // console.log("2: ", this.index_of_freq);

        // not hit
        if (this.index_of_freq < i) {
            this.index_of_freq = this.xTmpData.length;
            // 数组新增长度
        }
        // console.log("3: ", this.index_of_freq);

        if (dataFormat === 8) {
            // 8bit_dBm
            for (let i = 0; i < DataLen; i++) {
                this.xTmpData[this.index_of_freq + i] = startFreq.add(stepFreq * i);
                this.yTmpData[this.index_of_freq + i] = res[i] / SCALE_Y;
            }
        } else if (dataFormat === 9) {
            // 16bit_dBm
            for (let i = 0; i < DataLen; i++) {
                this.xTmpData[this.index_of_freq + i] = startFreq.add(stepFreq * i);
                let y = (res[2 * i + 1] << 8) | res[2 * i];
                // 无符号数转有符号数
                let signedY = ((y ^ 0xFFFF) + 1) * (-1);
                // console.log(res[2 * i + 1] << 8, res[2 * 1], signedY / SCALE_Y);
                this.yTmpData[this.index_of_freq + i] = signedY / SCALE_Y;
            }
        }
        this.index_of_freq += DataLen - 1;
        // console.log("4: ", this.index_of_freq);
        // console.log("xTmpData: ", this.xTmpData.length);
        // console.log("yTmpData: ", this.yTmpData.length);

        // 抽取点数, 必须保留第一个点和最后一个点
        let valid_left = 1, valid_right = this.xTmpData.length - 2;
        let ret = extract(this.xTmpData, this.yTmpData, INTVL, 
                valid_left, valid_right, this.ext_type);
        // console.log(ret);

        this.xData1 = [this.xTmpData[0].toNumber()];
        for(let i = 0; i < ret.ext_x_data.length; i++) {
            // this.xData1.push(Number.parseInt(ret.ext_x_data.toString()));
            this.xData1.push(ret.ext_x_data[i].toNumber())
        }
        this.xData1.push(this.xTmpData[this.xTmpData.length-1].toNumber());
        this.yData1 = [this.yTmpData[0], ...ret.ext_y_data, this.yTmpData[this.yTmpData.length-1]];
    }

    set_ext_type(ext_type) {
        // console.log(ext_type);
        this.ext_type = ext_type;
    }
}