import React from 'react';
import {
    // observable,
    makeObservable,
    // runInAction,
    // autorun,
} from 'mobx';
import { observer } from 'mobx-react';

// https://segmentfault.com/a/1190000018809821
// https://github.com/pkjy/blog/issues/2
// https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API/Using_Web_Audio_API#%E9%9F%B3%E9%A2%91%E4%B8%8A%E4%B8%8B%E6%96%87
// 二进制的音频文件流测试
const AudioView = observer(class AudioView extends React.Component {
    constructor(props) {
        super(props);
        makeObservable(this, {
        });
    }

    componentDidMount() {
        
    }

    play = (arrayBuffer) => {
        // 创建AudioContext上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext,
            audioCxt = new AudioContext();
        // 创建一个 AudioBufferSourceNode 对象，使用 AudioContext 的工厂函数创建
        let audioNode = audioCxt.createBufferSource();
        // 解码音频，可以使用 Promise , 理解为去掉音频文件中有关的格式信息
        audioCxt.decodeAudioData(arrayBuffer, function(audioBuffer) {
            // console.log("after full parse:", audioBuffer);
            audioNode.buffer = audioBuffer;
            audioNode.connect(audioCxt.destination);
            // 从 0s 开始播放
            audioNode.start(0);
        });
    }

    playRawData = (arrayBuffer) => {
        // 去除文件头之后的音频数据
        const wavHeaderLen = 44;
        // 创建AudioContext上下文
        const AudioContext = window.AudioContext || window.webkitAudioContext,
            audioCxt = new AudioContext();
        // 创建一个 AudioBufferSourceNode 对象，使用 AudioContext 的工厂函数创建
        const audioNode = audioCxt.createBufferSource();
        const channels = 1, sampleRate = 48000;
        const data = new DataView(arrayBuffer); 
        // Create an empty 12h buffer at the sample rate
        const frameCount = (data.byteLength - wavHeaderLen) / 2;
        // console.log(frameCount);
        // https://developer.mozilla.org/zh-CN/docs/Web/API/AudioBuffer
        let audioBuffer = audioCxt.createBuffer(channels, frameCount, sampleRate);
        
        for (let channel = 0; channel < channels; channel++) {
            // This gives us the actual array that contains the data
            let nowBuffering = audioBuffer.getChannelData(channel);
            let j = 0;
            for (let i = wavHeaderLen; i < data.byteLength; i+=2) {
                nowBuffering[j++] = data.getInt16(i);
            }
        }

        audioNode.buffer = audioBuffer;
        // console.log("without header parse:", audioBuffer);
        audioNode.connect(audioCxt.destination);
        // 从 0s 开始播放
        audioNode.start(0);
    }

    playMusic = (target) => {
        if(!target.value) return;
        const fileReader = new FileReader();
        const file = target.files[0];
        let _this = this;
        fileReader.onload = function (event) {
            let arrayBuffer = event.target.result;
            // console.log(arrayBuffer);

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
            // _this.play(arrayBuffer);

            // 方式4:
            if(file.type === 'audio/wav') { 
                _this.playRawData(arrayBuffer);
            }
        }
        fileReader.readAsArrayBuffer(file);
    }

    render() {
        return (
            <div>
                <h4>音频API Web测试</h4>
                <input type="file" onChange={(event) => {
                    // console.log(event);
                    this.playMusic(event.target)
                }} />
                <audio className="audio-node" autoPlay></audio>
            </div>
        )
    }
});

export default AudioView;