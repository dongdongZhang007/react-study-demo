import React from 'react';
import {
    observable,
    makeObservable,
    runInAction,
    autorun,
} from 'mobx';
import { observer, inject } from 'mobx-react';
import BaseEchart from '../components/echarts/BaseEchart';
// import BaseEchartAppend from '../components/echarts/BaseEchartAppend';
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
    menuShow = false;
    menuPos = [];

    constructor(props) {
        super(props);
        makeObservable(this, {
            menuShow: observable,
        });
    }

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

    add_marker = (point) => {
        const { lineChartStore } = this.props;
        lineChartStore.add_marker(point);
    }

    show_contextMenu = (params) => {
        let { 
            showMenu, // 显示菜单
            clientPoint, // 视窗像素点
            // dataPoint // 曲线上的数据点
        } = params;
        runInAction(() => {
            // 如果是打开菜单栏，需要移动菜单栏位置
            this.menuShow = showMenu;
            if(showMenu) {
                this.menuPos = clientPoint;
            }
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
                <BaseEchart 
                    chartOpt={lineChartStore.getChartOpt} 
                    addMarker={this.add_marker} 
                    showContextMenu={this.show_contextMenu}/>
                {this.menuShow && (
                    <ContextMenu
                        menuShow={this.menuShow}
                        menuPos={this.menuPos}
                    ></ContextMenu>
                )}
                <hr/>
                {/* <h4>分片渲染数据</h4>
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
                <BaseEchartAppend chartOpt={lineChartStore.getChartOpt2}></BaseEchartAppend> */}
            </div>
        )
    }
}));

class ContextMenu extends React.Component {
    menuRef = React.createRef();

    constructor(props) {
        super(props);
        makeObservable(this, {
            menuRef: observable,
        });

        autorun(() => {
            if(this.props.menuShow) {
                if(this.menuRef != null && this.menuRef.current) {
                    // 保证菜单组件能获取到ref
                    runInAction(()=>{
                        console.log(this.props.menuPos, "contextmenu");
                        let [offsetX, offsetY] = this.props.menuPos;
                        this.menuRef.current.style.left = offsetX + 'px';
                        this.menuRef.current.style.top = offsetY + 'px';
                    });
                }
            }
        });
    }

    render() {
        return (
            <div ref={this.menuRef} id="cxtMenu" className="contextmenu">
                <div className="contextmenu__item" >视频还原</div>
                <div className="contextmenu__item" >音频还原</div>
            </div>
        )
    }
}

export default LineChart;