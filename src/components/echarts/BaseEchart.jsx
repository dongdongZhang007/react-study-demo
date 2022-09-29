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
    startPoint = null;
    endPoint = null;

    constructor(props) {
        super(props);

        makeObservable(this, {
            charRef: observable,
            // chartInstance: observable,
            // drawChart: action.bound,
            setChartInstance: action.bound,
        });
    }

    setChartInstance = () => {
        if (this.charRef.current && this.chartInstance == null) {
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
        // console.log(pointInGrid);
        // 使用获取图表的option
        let op = this.chartInstance.getOption();
        //  索引值
        let xIndex = op.series[0].data.findIndex((point, index) => {
            // console.log(point);
            return point[0] >= pointInGrid[0] // pointInGrid是一个二维数组
        });
        // console.log(xIndex);
        // console.log(op.series[0].data[xIndex]);
        // 获取坐标
        if(xIndex > -1) {
            return [op.series[0].data[xIndex][0], op.series[0].data[xIndex][1]];
        }
        return [];
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
                let pointPixel = [event.offsetX, event.offsetY];
                if(_this.chartInstance.containPixel('grid', pointPixel)) {
                    // 画图区域
                    if (!event.target) {
                        // 点击在了空白处
                        // console.log("getZr", event);
                    } else {
                        // 点击行为发生在曲线上，获取当前坐标点
                        // console.log(event);
                        let currPoint = _this.convertFromPixel(event);
                        // 图表中有toolbox点击不应发生添加marker操作
                        if(_this.props.addMarker && currPoint.length > 0) {
                            _this.props.addMarker(currPoint);
                        }
                    }
                }

                // 取消右键菜单栏
                _this.props.showContextMenu && _this.props.showContextMenu({
                    showMenu: false
                });
            });

            this.chartInstance.getZr().on('mousedown', function(event) {
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                let pointPixel = [event.offsetX, event.offsetY];
                if(_this.chartInstance.containPixel('grid', pointPixel)) {
                    if (!event.target) {
                        // 点击在了空白处
                        // console.log("mousedown", event);
                        _this.startX = event.offsetX;
                        _this.startY = event.offsetY;
                        _this.startPoint = _this.convertFromPixel(event);
                        // console.log(_this.startPoint);
                    }
                }
            });

            this.chartInstance.getZr().on('mouseup', function(event) {
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                let pointPixel = [event.offsetX, event.offsetY];
                if(_this.chartInstance.containPixel('grid', pointPixel)) {
                    if (!event.target) {
                        // 点击在了空白处
                        // console.log("mouseup", event);
                        _this.endX = event.offsetX;
                        _this.endY = event.offsetY;
                        _this.endPoint = _this.convertFromPixel(event);
                        // console.log(_this.endPoint);
                        if(_this.endX >= _this.startX) {
                            // console.log("enlarge...");
                        } else {
                            // console.log("mininum...");
                        }
                    }
                }
            });

            this.chartInstance.getZr().on('contextmenu', function (event) {
                // console.log('contextmenu');
                // 没有 target 意味着鼠标/指针不在任何一个图形元素上，它是从“空白处”触发的。
                // console.log("右击菜单");
                let offsetPoint = [event.offsetX, event.offsetY];
                if(_this.chartInstance.containPixel('grid', offsetPoint)) {
                    // 画图区域内部
                    let dataPoint = _this.convertFromPixel(event);
                    // 展示右键菜单
                    let clientPoint = [event.event.clientX, event.event.clientY];
                    // let screenPoint = [event.event.screenX, event.event.screenY];
                    _this.props.showContextMenu && _this.props.showContextMenu({
                        showMenu: true,
                        clientPoint, // 视窗像素点
                        // screenPoint, // 屏幕像素点
                        // offsetPoint, 
                        dataPoint // 曲线上的数据点
                    });
                }
            });
        }
    }

    // componentWillUpdate() {
    //     // this.drawChart();
    //     // console.log("BaseChart will update...");
    // }
    
    // componentDidUpdate() {
    //     // console.log("BaseChart updated...");
    // }

    render() {
        // console.log("base render...");
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
