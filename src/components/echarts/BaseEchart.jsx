import React from 'react';
import { 
    observable, 
    action,
    // computed, 
    // autorun, 
    makeObservable,
    // configure,
    // runInAction,
    // when,
    // reaction,
} from 'mobx';
import * as echarts from "echarts";

class BaseEchart extends React.Component{
    charRef = React.createRef();
    chartInstance = null;
    // cnt = 0;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;

    constructor(props) {
        super(props);

        makeObservable(this, {
            charRef: observable,
            chartInstance: observable,
            // drawChart: action.bound,
            setChartInstance: action.bound,
        });
    }

    setChartInstance = () => {
        if (this.charRef.current) {
            this.chartInstance = echarts.init(this.charRef.current);
        }
    }

    drawChart = () => {
        if(this.chartInstance) {
            // console.time("drawChart");
            this.chartInstance.setOption(this.props.chartOpt);
            // console.timeEnd("drawChart");
        }
    }
    // 根据echart图表上的点，反算坐标位置
    convertFromPixel(event, seriesIndex=0) {
        let pointInPixel = [event.offsetX, event.offsetY];
        // 转换像素坐标值到逻辑坐标系上的点，获取点击位置对应的x轴数据的索引值，借助于索引值的获取到其它的信息
        let pointInGrid = this.chartInstance.convertFromPixel({ seriesIndex }, pointInPixel);
        //  索引值
        let xIndex = pointInGrid[0]; // pointInGrid是一个二维数组
        // console.log(xIndex);
        // 使用获取图表的option
        let op = this.chartInstance.getOption();
        // 获取坐标名称
        let xData = op.xAxis[0].data[xIndex];
        let yData = op.series[0].data[xIndex];
        console.log(xData, yData);
    }

    componentDidMount() {
        this.setChartInstance();
        // this.drawChart();
        if(this.chartInstance) {
            let _this = this;
            this.chartInstance.on('click', function(evt) {
                // 该监听器正在监听一个`echarts 事件`。
                // console.log(evt);
            });

            this.chartInstance.getZr().on('click', function(event) {
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                if (!event.target) {
                    // 点击在了空白处
                    // console.log("getZr", event);
                }
            });

            this.chartInstance.getZr().on('mousedown', function(event) {
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                if (!event.target) {
                    // 点击在了空白处
                    // console.log("mousedown", event);
                    _this.startX = event.offsetX;
                    _this.startY = event.offsetY;
                    _this.convertFromPixel(event);
                }
            });

            this.chartInstance.getZr().on('mouseup', function(event) {
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                if (!event.target) {
                    // 点击在了空白处
                    // console.log("mouseup", event);
                    _this.endX = event.offsetX;
                    _this.endY = event.offsetY;
                    _this.convertFromPixel(event);
                    if(_this.endX >= _this.startX) {
                        console.log("enlarge...");
                    } else {
                        console.log("mininum...");
                    }
                }
            });
        }
    }

    componentWillUpdate() {
        // this.drawChart();
        // console.log("BaseChart will update...");
    }
    
    componentDidUpdate() {
        // console.log("BaseChart updated...");
    }

    render() {
        // console.log("render...");
        this.drawChart();
        return (
            <div style={{ textAlign: "center" }}>
                <h2>{this.props.title}</h2>
                <div ref={this.charRef}
                    style={{
                        margin: "0 auto",
                        width: "1000px",
                        height: "400px"
                    }}></div>
            </div>
        )
    }
};

export default BaseEchart;
