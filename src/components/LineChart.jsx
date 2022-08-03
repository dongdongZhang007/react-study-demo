import React from 'react';
import { observer, inject } from 'mobx-react';
import BaseEchart from '../components/echarts/BaseEchart';

const LineChart = inject('lineChartStore')(observer(class LineChart extends React.Component {

    componentDidMount() {
        const { lineChartStore } = this.props;
        lineChartStore.get_frame();
    }

    render() {
        const { lineChartStore } = this.props;
        return (
            <div>
                <button onClick={()=> lineChartStore.get_frames()}>启动定时加载</button>
                <button onClick={()=> lineChartStore.clearTimeOut()}>停止定时数据</button>
                <BaseEchart chartOpt={lineChartStore.getChartOpt}/>
            </div>
        )
    }
}));

export default LineChart;