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
                nameLocation: "center",
                nameTextStyle: {
                    color: "#ccc",
                    padding: [10, 0, 0, 0],
                },
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
                    nameLocation: "center",
                    nameTextStyle: {
                        color: "#ccc",
                        padding: [0, 0, 20, 0],
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
            dataZoom: [
                {
                    id: 'dataZoomX',
                    type: 'inside',
                    xAxisIndex: [0],
                    filterMode: 'filter'
                }
            ],
            // dataZoom: [                                      //区域缩放
            //     {
            //         id: 'dataZoomX',
            //         show:true,                              //是否显示 组件。如果设置为 false，不会显示，但是数据过滤的功能还存在。
            //         backgroundColor:"rgba(47,69,84,0)",  //组件的背景颜色
            //         type: 'slider',                         //slider表示有滑动块的，inside表示内置的
            //         dataBackground:{                        //数据阴影的样式。
            //             // lineStyle:mylineStyle,              //阴影的线条样式
            //             // areaStyle:myareaStyle,              //阴影的填充样式
            //         },
            //         fillerColor:"rgba(167,183,204,0.4)",  //选中范围的填充颜色。
            //         borderColor:"#ddd",                     //边框颜色。
            //         filterMode: 'filter',                   //'filter'：当前数据窗口外的数据，被 过滤掉。即 会 影响其他轴的数据范围。每个数据项，只要有一个维度在数据窗口外，整个数据项就会被过滤掉。
            //                                                 //'weakFilter'：当前数据窗口外的数据，被 过滤掉。即 会 影响其他轴的数据范围。每个数据项，只有当全部维度都在数据窗口同侧外部，整个数据项才会被过滤掉。
            //                                                 //'empty'：当前数据窗口外的数据，被 设置为空。即 不会 影响其他轴的数据范围。
            //                                                 //'none': 不过滤数据，只改变数轴范围。
            //         xAxisIndex:0,                            //设置 dataZoom-inside 组件控制的 x轴,可以用数组表示多个轴
            //         yAxisIndex:0, 
            //         // yAxisIndex:[0,2],                        //设置 dataZoom-inside 组件控制的 y轴,可以用数组表示多个轴
            //         radiusAxisIndex:3,                       //设置 dataZoom-inside 组件控制的 radius 轴,可以用数组表示多个轴
            //         angleAxisIndex:[0,2],                    //设置 dataZoom-inside 组件控制的 angle 轴,可以用数组表示多个轴
            //         start: 30,                                //数据窗口范围的起始百分比,表示30%
            //         end: 70,                                  //数据窗口范围的结束百分比,表示70%
            //         startValue:10,                           //数据窗口范围的起始数值
            //         endValue:100,                            //数据窗口范围的结束数值。
            //         orient:"horizontal",                    //布局方式是横还是竖。不仅是布局方式，对于直角坐标系而言，也决定了，缺省情况控制横向数轴还是纵向数轴。'horizontal'：水平。'vertical'：竖直。
            //         zoomLock:false,                          //是否锁定选择区域（或叫做数据窗口）的大小。如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
            //         throttle:100,                             //设置触发视图刷新的频率。单位为毫秒（ms）。
            //         zoomOnMouseWheel:true,                  //如何触发缩放。可选值为：true：表示不按任何功能键，鼠标滚轮能触发缩放。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标滚轮能触发缩放。'ctrl'：表示按住 ctrl 和鼠标滚轮能触发缩放。'alt'：表示按住 alt 和鼠标滚轮能触发缩放。
            //         moveOnMouseMove:true,                   //如何触发数据窗口平移。true：表示不按任何功能键，鼠标移动能触发数据窗口平移。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标移动能触发数据窗口平移。'ctrl'：表示按住 ctrl 和鼠标移动能触发数据窗口平移。'alt'：表示按住 alt 和鼠标移动能触发数据窗口平移。
            //         left:"center",                           //组件离容器左侧的距离,'left', 'center', 'right','20%'
            //         top:"top",                                //组件离容器上侧的距离,'top', 'middle', 'bottom','20%'
            //         right:"auto",                             //组件离容器右侧的距离,'20%'
            //         bottom:"auto",                            //组件离容器下侧的距离,'20%'
            
            //     },
            //     {
            //         id: 'dataZoomY',
            //         type: 'inside',
            //         filterMode: 'empty',
            //         disabled:false,                         //是否停止组件的功能。
            //         xAxisIndex:0,                           //设置 dataZoom-inside 组件控制的 x轴,可以用数组表示多个轴
            //         yAxisIndex:0,
            //         // yAxisIndex:[0,2],                       //设置 dataZoom-inside 组件控制的 y轴,可以用数组表示多个轴
            //         radiusAxisIndex:3,                      //设置 dataZoom-inside 组件控制的 radius 轴,可以用数组表示多个轴
            //         angleAxisIndex:[0,2],                   //设置 dataZoom-inside 组件控制的 angle 轴,可以用数组表示多个轴
            //         start: 30,                               //数据窗口范围的起始百分比,表示30%
            //         end: 70,                                  //数据窗口范围的结束百分比,表示70%
            //         startValue:10,                           //数据窗口范围的起始数值
            //         endValue:100,                            //数据窗口范围的结束数值。
            //         orient:"horizontal",                    //布局方式是横还是竖。不仅是布局方式，对于直角坐标系而言，也决定了，缺省情况控制横向数轴还是纵向数轴。'horizontal'：水平。'vertical'：竖直。
            //         zoomLock:false,                          //是否锁定选择区域（或叫做数据窗口）的大小。如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
            //         throttle:100,                             //设置触发视图刷新的频率。单位为毫秒（ms）。
            //         zoomOnMouseWheel:true,                   //如何触发缩放。可选值为：true：表示不按任何功能键，鼠标滚轮能触发缩放。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标滚轮能触发缩放。'ctrl'：表示按住 ctrl 和鼠标滚轮能触发缩放。'alt'：表示按住 alt 和鼠标滚轮能触发缩放。
            //         moveOnMouseMove:true,                    //如何触发数据窗口平移。true：表示不按任何功能键，鼠标移动能触发数据窗口平移。false：表示鼠标滚轮不能触发缩放。'shift'：表示按住 shift 和鼠标移动能触发数据窗口平移。'ctrl'：表示按住 ctrl 和鼠标移动能触发数据窗口平移。'alt'：表示按住 alt 和鼠标移动能触发数据窗口平移。
            //     }
            // ],
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
                formatter: function (param) {
                    var value = param[0].value;
                    // console.log(param);
                    // prettier-ignore
                    return `<span style="color:greenyellow;">${value[0] / _1MHz}MHz</span><br>
                            <span style="color:greenyellow;">${value[1]}</span><br>`
                }
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
                // console.log(this.xData[this.xData.length-1] + ", " + this.yData[this.yData.length-1]);
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