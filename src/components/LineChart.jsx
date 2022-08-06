import React from 'react';
import { observer, inject } from 'mobx-react';
import BaseEchart from '../components/echarts/BaseEchart';
import BaseEchartAppend from '../components/echarts/BaseEchartAppend';
import {
    create_msg_obj,
} from '../api/lineChart';

const LineChart = inject('lineChartStore')(observer(class LineChart extends React.Component {

    componentDidMount() {
        const { lineChartStore } = this.props;
        lineChartStore.get_frame();
    }
    // 加载数组
    loadData = () => {
        const { lineChartStore } = this.props;
        create_msg_obj((msg) => {
            lineChartStore.parse_data(msg);
        });
    }

    render() {
        const { lineChartStore } = this.props;
        // console.log(lineChartStore.getChartOpt2);
        return (
            <div>
                <h4>完整帧渲染</h4>
                <button disabled={!(lineChartStore.interval == null)} onClick={()=> lineChartStore.get_frames()}>启动定时加载</button>
                &nbsp;
                <button disabled={lineChartStore.interval == null} onClick={()=> lineChartStore.clearTimeOut()}>停止定时数据</button>
                <BaseEchart chartOpt={lineChartStore.getChartOpt}/>
                <hr/>
                <h4>分片渲染数据</h4>
                <button onClick={()=> this.loadData()}>加载数据</button>
                <BaseEchartAppend chartOpt={lineChartStore.getChartOpt2}></BaseEchartAppend>
            </div>
        )
    }
}));

export default LineChart;