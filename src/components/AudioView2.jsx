import React from 'react';
import {
    action,
    observable,
    makeObservable,
    runInAction,
    // autorun,
} from 'mobx';
import { observer } from 'mobx-react';

const size = 1024;

// https://segmentfault.com/a/1190000018809821
// https://github.com/pkjy/blog/issues/2
// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Using_Web_Audio_API#%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87
// 二进制的音频文件流测试
const AudioView = observer(class AudioView extends React.Component {
    vol = 30;
    canvasBox = null;
    canvasDom = null;
    canvasCtx = null;
    boxWidth = 0;
    boxHeight = 0;

    constructor(props) {
        super(props);
        makeObservable(this, {
            vol: observable,
            changeVol: action.bound,
            visualizer: action.bound,
            resize: action.bound,
            createCanvas: action.bound,
            draw: action.bound,
        });
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.createCanvas();
        this.resize();
    }

    play = (arrayBuffer) => {
        // 创建AudioContext上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext,
            audioCxt = new AudioContext();
        // 创建一个 AudioBufferSourceNode 对象，使用 AudioContext 的工厂函数创建
        // console.log(audioCxt);
        const audioNode = audioCxt.createBufferSource();
        // console.log(audioNode);
        // 解码音频，可以使用 Promise , 理解为去掉音频文件中有关的格式信息
        audioCxt.decodeAudioData(arrayBuffer, function(audioBuffer) {
            // console.log("after full parse:", audioBuffer);
            // let chanNum = audioBuffer.numberOfChannels;
            // for (let i = 0; i < chanNum; i++)
            // {
            //     let chanData0 = audioBuffer.getChannelData(i);
            //     console.log(chanData0);
            // }
            audioNode.buffer = audioBuffer;
            audioNode.connect(audioCxt.destination);
            // 从 0s 开始播放
            audioNode.start(0);
        });
    }

    playRawData = (arrayBuffer) => {
        // 去除文件头之后的音频数据
        const IsLittleEndian = true;
        // 创建AudioContext上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCxt = new AudioContext();
        let _this = this;
        this.audioCxt.onstatechange = function () {
            console.log(_this.audioCxt.state);
        };

        // 创建一个 AudioBufferSourceNode 对象，使用 AudioContext 的工厂函数创建
        this.audioNode = this.audioCxt.createBufferSource();

        // 创建一个控制音量大小的节点对象
        this.gainNode = this.audioCxt[this.audioCxt.createGain?"createGain":"createGainNode"]();
        this.gainNode.connect(this.audioCxt.destination);

        // 创建音频分析对象
        this.analyserNode = this.audioCxt.createAnalyser();
        this.analyserNode.connect(this.gainNode);
        this.analyserNode.ffzSize = size * 2;

        // https://www.cnblogs.com/douzujun/p/10600793.html
        const dv = new DataView(arrayBuffer); 

        let offset = 0;
        let chunkId = String.fromCharCode(dv.getUint8(offset)) + 
        String.fromCharCode(dv.getUint8(offset + 1)) + 
        String.fromCharCode(dv.getUint8(offset + 2)) +
        String.fromCharCode(dv.getUint8(offset + 3));
        offset += 4;
        console.log("chunkId", chunkId);

        let chunkSize = dv.getUint32(offset, IsLittleEndian);
        offset += 4;
        console.log("chunkSize", chunkSize);

        let Format = String.fromCharCode(dv.getUint8(offset)) + 
        String.fromCharCode(dv.getUint8(offset + 1)) + 
        String.fromCharCode(dv.getUint8(offset + 2)) +
        String.fromCharCode(dv.getUint8(offset + 3));
        offset += 4;
        console.log("Format", Format);

        let SubChunk1ID = String.fromCharCode(dv.getUint8(offset)) + 
        String.fromCharCode(dv.getUint8(offset + 1)) + 
        String.fromCharCode(dv.getUint8(offset + 2)) +
        String.fromCharCode(dv.getUint8(offset + 3));
        offset += 4;
        console.log("SubChunk1ID", SubChunk1ID);

        let SubChunk1Size = dv.getUint32(offset, IsLittleEndian);
        offset += 4;
        console.log("SubChunk1Size", SubChunk1Size);

        let AudioFormat = dv.getUint16(offset, IsLittleEndian);
        offset += 2;
        console.log("AudioFormat", AudioFormat);

        let NumChannnels = dv.getUint16(offset, IsLittleEndian);
        offset += 2;
        console.log("NumChannnels", NumChannnels);

        let SampleRate = dv.getUint32(offset, IsLittleEndian);
        offset += 4;
        console.log("SampleRate", SampleRate);

        let ByteRate = dv.getUint32(offset, IsLittleEndian);
        offset += 4;
        console.log("ByteRate", ByteRate);

        let BlockAlign = dv.getUint16(offset, IsLittleEndian);
        offset += 2;
        console.log("BlockAlign", BlockAlign);

        let BitsPerSample = dv.getUint16(offset, IsLittleEndian);
        offset += 2;
        console.log("BitsPerSample", BitsPerSample);
        
        let SubChunk2ID = String.fromCharCode(dv.getUint8(offset)) + 
        String.fromCharCode(dv.getUint8(offset + 1)) + 
        String.fromCharCode(dv.getUint8(offset + 2)) +
        String.fromCharCode(dv.getUint8(offset + 3));
        offset += 4;
        console.log("SubChunk2ID", SubChunk2ID);

        let SubChunk2Size = dv.getUint32(offset, IsLittleEndian);
        offset += 4;
        console.log("SubChunk2Size", SubChunk2Size);

        const frameCount = (function(size, blockAlign){
            return size / blockAlign;
        })(chunkSize - offset, BlockAlign);
        console.log(frameCount);
        // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioBuffer
        // let audioBuffer = audioCxt.createBuffer(NumChannnels, frameCount, SampleRate);
        let audioBuffer = this.audioCxt.createBuffer(NumChannnels, frameCount, SampleRate);

        // https://blog.csdn.net/zhihu008/article/details/7854529
        // 16bit 单声道 8bit 单声道
        if(NumChannnels === 1) {
            let nowBuffering = audioBuffer.getChannelData(0);
            let j = 0, i = offset;
            while(i < dv.byteLength) {
                if(BitsPerSample === 8) {
                    nowBuffering[j++] = dv.getInt8(i) / 256;
                    i++;
                } else if(BitsPerSample === 16) {
                    nowBuffering[j++] = dv.getInt16(i, IsLittleEndian)/65536;
                    i += 2;
                }
            }
            // console.log(nowBuffering);
        }

        // 16bit 双声道
        if(BitsPerSample === 16 && NumChannnels === 2) {
            let leftBuffer = audioBuffer.getChannelData(0);
            let rightBuffer = audioBuffer.getChannelData(1);
            let j = 0, i = offset;

            while(i < dv.byteLength) {
                leftBuffer[j] = dv.getInt16(i, IsLittleEndian)/65536;
                i += 2;
                rightBuffer[j] = dv.getInt16(i, IsLittleEndian)/65536;
                i += 2;
                j++;
            }
        }

        this.audioNode.buffer = audioBuffer;
        console.log("without header parse:", audioBuffer);
        this.audioNode.connect(this.analyserNode);
        // 从 0s 开始播放
        this.audioNode[this.audioNode.start?"start":"noteOn"](0);
        this.visualizer();
    }

    visualizer() {
        let arr = new Uint8Array(this.analyserNode.frequencyBinCount);
        let requestAnimationFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame;

        const v = () => {
            this.analyserNode.getByteFrequencyData(arr);
            this.draw(arr); // 绘制图形
            // console.log(arr);
            requestAnimationFrame(v);
        };

        requestAnimationFrame(v);
    }

    playMusic = (target) => {
        if(!target.value) return;
        const fileReader = new FileReader();
        const file = target.files[0];
        let _this = this;
        fileReader.onload = function (event) {
            let arrayBuffer = event.target.result;
            // console.log("playMusic" , arrayBuffer);

            // // 方式1：
            // // 转成一个blob
            // let blob = new Blob([new Int8Array(arrayBuffer)]);
            // // 生成一个本地的blob url
            // let blobUrl = URL.createObjectURL(blob);
            // console.log(blobUrl);
            // // 给audio标签的src属性
            // document.querySelector('.audio-node').src = blobUrl;

            // 方式2：
            // let blobUrl = URL.createObjectURL(file);
            // // 给audio标签的src属性
            // document.querySelector('.audio-node').src = blobUrl;

            // 方式3：
            _this.play(arrayBuffer);

            // 方式4:
            // if(file.type === 'audio/wav') { 
            //     _this.playRawData(arrayBuffer);
            // }
        }
        fileReader.readAsArrayBuffer(file);
    }

    playMusic1 = (target) => {
        if(!target.value) return;
        const fileReader = new FileReader();
        const file = target.files[0];
        let _this = this;
        fileReader.onload = function (event) {
            let arrayBuffer = event.target.result;
            console.log("playMusic1" , arrayBuffer);
            // 方式4:
            if(file.type === 'audio/wav') { 
                _this.playRawData(arrayBuffer);
            }
        }
        fileReader.readAsArrayBuffer(file);
    }

    changeVol(val) {
        this.gainNode.gain.value = val * val;
    }

    resize() {
        this.boxHeight = this.canvasBox.clientHeight ? this.canvasBox.clientHeight : 0;
        this.boxWidth = this.canvasBox.clientWidth ? this.canvasBox.clientWidth : 0;
        this.canvasDom.height = this.boxHeight;
        this.canvasDom.width = this.boxWidth;
        // 创建渐变色
        let line = this.canvasCtx.createLinearGradient(0, 0, 0, this.boxHeight);
        line.addColorStop(0, "red");
        line.addColorStop(0.5, "yellow");
        line.addColorStop(1, "green");
        this.canvasCtx.fillStyle = line; // 填充渐变色
    }

    createCanvas() {
        this.canvasBox = document.getElementById('canvasBox1');
        this.canvasDom = document.createElement("canvas");
        this.canvasBox.appendChild(this.canvasDom);
        this.canvasCtx = this.canvasDom.getContext("2d");
    }

    draw(arr) {
        this.canvasCtx.clearRect(0, 0, this.boxWidth, this.boxHeight);
        let w = this.boxWidth / size;
        // 绘制矩形
        for(let i = 0; i < size; i++) {
            let h = arr[i] / 256 * this.boxHeight;
            this.canvasCtx.fillRect(w * i, this.boxHeight - h, w * 0.6, h);
        }
    }

    render() {
        return (
            <div>
                <h4>音频API Web测试</h4>
                <input type="file" onChange={(event) => {
                    // console.log(event);
                    this.playMusic(event.target)
                }} />
                <div>
                    <span>音量控制：</span>&nbsp;
                    <input type="range" 
                        min="0" 
                        max="100"
                        onChange={(evt) => {
                            runInAction(()=> {
                                this.vol = evt.target.value;
                                this.changeVol(this.vol);
                            });
                        }} />
                    <input type="file" onChange={(event) => {
                        // console.log(event);
                        this.playMusic1(event.target)
                    }} />
                </div>
                <div className="canvas-box" id="canvasBox1"></div>
                <audio className="audio-node" autoPlay></audio>
            </div>
        )
    }
});

export default AudioView;