/*
MIT License

Copyright (c) 2021 Andrey Semochkin
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Create P2P Service
let webrtc;

const videoEl = document.querySelector('#webrtc-video')

// Setup WebRTC: Asking for remote
async function setWebRTC(streamID){
    console.log('Ask for setting webrtc');
    // Check URL
    let trg_url = `http://${DOMAIN}:8083/stream/${streamID}/channel/0/webrtc`;
    try{
        await $.post(trg_url, { data: btoa(webrtc.localDescription.sdp) })
        .done(async function (data) {
            // console.log(data);
            // 如果同意的話就會回傳資訊，透過該資訊設定 WebRTC Remote 端的資訊
            // 當雙方都 setRemoteDescription 就可以開始連線
            try{
                webrtc.setRemoteDescription(
                    new RTCSessionDescription({
                        type: 'answer',
                        sdp: atob(data)
                    }))
                return true    
            } catch (e){
                console.warn('WebRTC Server has been crashed, please refresh page')
                return false;    
            }
        })
        .fail(async function(xhr, textStatus, errorThrown){
            console.warn('WebRTC Server has been crashed, please refresh page')
            // if(!xhr) console.log('Error: ', JSON.parse(xhr.responseText)['payload']);
            // else alert('WebRTC Server has been crashed, please restart ivit-i !')
            return false
        })
    } catch (e){
        console.warn('WebRTC Server has been crashed, please refresh page')
    }


    return false;
}

// Connect to RTSPtoWeb Project
async function connectWebRTC(streamID) {
    
    if(!streamID){
        alert('Empty Stream ID'); return undefined;
    }

    // Create RTCPeerConnection
    console.log("Create Peer Connection");
    webrtc = new RTCPeerConnection({
        iceServers: [{
            urls: ['stun:stun.l.google.com:19302']
        }],
        sdpSemantics: 'unified-plan'
    })

    // Add Track or Transceiver to capture the video
    // 建立 RTP Stream 每次隨機產生 SSRC， 在 createOffer 的 SDP 當中會帶入
    // 並且建立 media session，當 ICE 成功建立 SRTP 連線就會把 Media Packet 送出去
    console.log("Add Transceiver");
    webrtc.addTransceiver('video', { 'direction': 'sendrecv' })

    // onnegotiationneeded
    // 每當 RTCPeerConnection 要進行會話溝通(連線)時，第一次也就是在addTrack後會觸發該事件， 通常會在此處理createOffer，來通知remote peer與我們連線。
    console.log("Define Negotiation");
    webrtc.onnegotiationneeded = async function handleNegotiationNeeded() {

        console.log('Create Offer');

        // 建立請求
        const offer = await webrtc.createOffer()

        // 提供本地端的資訊
        await webrtc.setLocalDescription(offer)
        
        // 使用 http 與 remote 進行請求，需要透過 sdp 去請求
        // setWebRTCInterval(streamID);
        await setWebRTC(streamID);
    }

    // ontrack
    // 完成連線後，透過該事件能夠在發現遠端傳輸的多媒體檔案時觸發，來處理/接收多媒體數據。
    console.log("Define Track Event");
    webrtc.ontrack = function (event) {
        document.getElementById('webrtc-video').style.display = '';
        document.getElementById('loader').style.display = 'none';
        // console.log(event.streams.length + ' track is delivered')
        videoEl.srcObject = event.streams[0]
        videoEl.play()
    }

    // 建立 P2P 中雙向資料傳輸的通道
    console.log("Create Data Channel");
    const webrtcSendChannel = webrtc.createDataChannel('rtsptowebSendChannel')

    // 當兩邊資料都對接上的時候會執行這個動作
    webrtcSendChannel.onopen = (event) => {
        console.log(`${webrtcSendChannel.label} has opened`)
        webrtcSendChannel.send('ping')
    }
    // 當呼叫 close() method 的時候
    webrtcSendChannel.onclose = (_event) => {
        console.log(`${webrtcSendChannel.label} has closed`);
        connectWebRTC(streamID);
    }
    // 呼叫 send() 並且兩邊都連接上的時候
    webrtcSendChannel.onmessage = event => console.log(event.data)
    
}

// Play Video Element
async function startStream() {
    document.getElementById('webrtc-video').controls = true;
    console.log("Start Video");
    videoEl.play();
}

// Pause Video Element
async function pauseStream() {
    console.log("Pause Video");
    videoEl.pause();
}

// Stop WebRTC Connection
async function stopStream() {
    console.log("Stop Stream");
    videoEl.pause();
    webrtc.close();
}

// Delete WebRTC
async function delWebRTC(streamID){
    
    if(!streamID) { alert("Empty streamID ... " ); return undefined; };

    let url = `http://${DOMAIN}:8083/stream/${streamID}/delete`;
    
    let data = await getAPI( url, LOG, true, "demo:demo");
    if(!data) return undefined;
    
    // For debug
    getStreamList();
}

// Add WebRTC
async function addWebRTC(streamID, streamURL){
    let api;

    // Create WebRTC
    if(!streamID) streamID = document.getElementById("rtsp-name").value;
    if(!streamURL) { alert("Unkown Stream URL"); return undefined; }

    api = `http://${DOMAIN}:8083/stream/${streamID}/add`;
    
    let inData =  {
        "name": streamID,
        "channels": {
            "0": {
                "name": "ch1",
                "url": streamURL,
                "on_demand": false,
                "debug": false,
                "status": 0
            }
        }
    }

    let runRtcData = await postAPI( api, inData, JSON_FMT, LOG, true, "demo:demo");
    if(!runRtcData) return undefined;
    console.log(runRtcData);
    
    // For debug
    getStreamList();

}

// Get WebRTC List
async function getStreamList(){
    let url;
    // url = "http://demo:demo@127.0.0.1:8083/streams";
    // url = "http://172.16.92.130:8083/streams"
    url = `http://${DOMAIN}:8083/streams`;

    let data = await getAPI( url, LOG, true, "demo:demo");
    if(!data){
        alert('webrtc server is crash !!')
        return undefined;
    }
    
    // get data
    data = data['payload'];
    const logData = [];
    for ( const key in data){ logData.push( data[key]['name'] ) }
    console.log( 'Check webrtc stream: ',  ...logData );
    return data;
}
