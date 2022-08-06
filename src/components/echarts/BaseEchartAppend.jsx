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
import { observer, inject } from 'mobx-react';
import * as echarts from "echarts";

const BaseEchartAppend = inject('lineChartStore')(observer(class BaseEchartAppend extends React.Component{
    charRef = React.createRef();
    chartInstance = null;
    
    constructor(props) {
        super(props);

        makeObservable(this, {
            charRef: observable,
            chartInstance: observable,
            drawChart: action.bound,
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
            this.chartInstance.setOption(this.props.chartOpt);
        }
    }

    componentDidMount() {
        this.setChartInstance();
        this.drawChart();
    }

    componentDidUpdate() {
        // this.drawChart();
        // console.log("BaseChart will update...");
        const { lineChartStore } = this.props;
        lineChartStore.get_piece();
    }

    render() {
        // console.log("append render...");
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
}));

export default BaseEchartAppend;
