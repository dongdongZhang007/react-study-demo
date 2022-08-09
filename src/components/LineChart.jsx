import React from 'react';
import { observer, inject } from 'mobx-react';
import BaseEchart from '../components/echarts/BaseEchart';
import BaseEchartAppend from '../components/echarts/BaseEchartAppend';
import {
    create_msg_obj,
} from '../api/lineChart';

const ExtractType = [
    { label: "最大值", value: "max", id: 1 },
    { label: "最小值", value: "min", id: 2 },
    { label: "平均值", value: "avg", id: 3 },
    { label: "实时值", value: "rlt", id: 4 },
];

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
                <div>
                    <button disabled={!(lineChartStore.interval == null)} onClick={()=> lineChartStore.get_frames()}>启动定时加载</button>
                    &nbsp;
                    <button disabled={lineChartStore.interval == null} onClick={()=> lineChartStore.clearTimeOut()}>停止定时数据</button>
                    &nbsp;
                    <span>采样点抽取方法：</span>
                    <select name=""
                        onChange={(evt) => {
                            lineChartStore.set_ext_type(evt.target.value);
                        }}
                    >
                        {
                            ExtractType.map((extract)=> {
                                return (<option 
                                    key={extract.id} 
                                    value={extract.value}>{extract.label}
                                </option>)
                            })
                        }
                    </select>
                </div>
                <BaseEchart chartOpt={lineChartStore.getChartOpt}/>
                <hr/>
                <h4>分片渲染数据</h4>
                <div>
                    <button onClick={()=> this.loadData()}>加载数据</button> &nbsp;
                    <span>采样点抽取方法：</span>
                    <select name=""
                        onChange={(evt) => {
                            lineChartStore.set_ext_type(evt.target.value);
                        }}
                    >
                        {
                            ExtractType.map((extract)=> {
                                return (<option 
                                    key={extract.id} 
                                    value={extract.value}>{extract.label}
                                </option>)
                            })
                        }
                    </select>
                </div>
                <hr/>
                <BaseEchartAppend chartOpt={lineChartStore.getChartOpt2}></BaseEchartAppend>
            </div>
        )
    }
}));

export default LineChart;