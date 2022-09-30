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
        const AudioContext = window.AudioContext || window.webkitAudioContext,
            audioCxt = new AudioContext();
        // 创建一个 AudioBufferSourceNode 对象，使用 AudioContext 的工厂函数创建
        const audioNode = audioCxt.createBufferSource();

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
        let audioBuffer = audioCxt.createBuffer(NumChannnels, frameCount, SampleRate);

        // https://blog.csdn.net/zhihu008/article/details/7854529
        // 16bit 单声道 8bit 单声道
        if(NumChannnels === 1) {
            let nowBuffering = audioBuffer.getChannelData(0);
            let j = 0, i = offset;
            while(i < dv.byteLength) {
                if(BitsPerSample === 8) {
                    nowBuffering[j++] = dv.getInt8(i)/64;
                    i++;
                } else if(BitsPerSample === 16) {
                    nowBuffering[j++] = dv.getInt16(i, IsLittleEndian)/65536;
                    i += 2;
                }
            }
            console.log(nowBuffering);
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

        audioNode.buffer = audioBuffer;
        console.log("without header parse:", audioBuffer);
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

    render() {
        return (
            <div>
                <h4>音频API Web测试</h4>
                <input type="file" onChange={(event) => {
                    // console.log(event);
                    this.playMusic(event.target)
                }} />
                <input type="file" onChange={(event) => {
                    // console.log(event);
                    this.playMusic1(event.target)
                }} />
                <audio className="audio-node" autoPlay></audio>
            </div>
        )
    }
});

export default AudioView;