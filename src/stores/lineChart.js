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
} from '../api/lineChart';
const SCALE_X = 1;
const SCALE_Y = 100;
const _1MHz = Math.pow(10, 6);

export default class LineChartStore {

    rootStore;
    xData = [];
    yData = [];
    xTmpData = [];
    yTmpData = [];
    xData1 = [];
    yData1 = [];
    index_of_freq = -1;
    pieceData;

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
            interval: observable,
            pieceData: observable,
            getChartOpt: computed,
            getChartOpt2: computed,
            get_frame: action.bound,
            get_frames: action.bound,
            clearTimeOut: action.bound,
            parse_data: action.bound,
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
                this.xData = x;
                this.yData = y;
            });
        })
    }

    get_frames() {
        runInAction(() => {
            this.interval = setInterval(() => {
                this.get_frame();
                console.log("interval...");
            }, 100);
        });
    }

    clearTimeOut() {
        // console.log("clearTimeOut");
        clearInterval(this.interval);
        runInAction(() => {
            this.interval = null;
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
        this.yData1 = this.yTmpData.slice(0); // 副本
        this.xData1 = [];
        for(let i = 0; i < this.xTmpData.length; i++) {
            this.xData1.push(Number.parseInt(this.xTmpData[i].toString()));
        }
    }
}