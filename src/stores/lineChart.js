import {
    observable,
    action,
    makeObservable,
    computed,
    runInAction,
} from 'mobx';
import {
    create_frame,
} from '../api/lineChart';

export default class LineChartStore {

    rootStore;
    xData;
    yData;

    constructor(rootStore) {
        this.rootStore = rootStore;
        this.xData = [];
        this.yData = [];

        this.interval = null; // 设置定时器

        makeObservable(this, {
            xData: observable,
            yData: observable,
            getChartOpt: computed,
            get_frame: action.bound,
            get_frames: action.bound,
            clearTimeOut: action.bound,
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
        this.interval = setInterval(() => {
            this.get_frame();
            console.log("interval...");
        }, 100);
    }

    clearTimeOut() {
        // console.log("clearTimeOut");
        clearInterval(this.interval);
    }
}