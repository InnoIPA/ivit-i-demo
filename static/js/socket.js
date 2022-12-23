// Define Socket
const socket = new WebSocket('ws://' + `${DOMAIN}:${PORT}` + '/ivit_i');

// Define Socket Key
const SOCK_SYS = "sys";
const SOCK_RES = "result";

// Define Socket Event Timeout
const SOCK_RES_TIMEOUT = 1000;

// Send Socket Key to get the inference result
function sendSocketInferResult(){ 
    socket.send( SOCK_RES );
}


// Parsing Inference Result from Socket
function parseSockInferResult(data){

    data = JSON.parse(data[uuid])
    
    if(!data){ 
        console.log('Null data');
        return undefined
    };

    let dets = data["detections"];
    let frameID = data["idx"];
    let inferTime = data["inference"];
    let fps = data["fps"];
    let liveTime = data["live_time"];

    // 更新 Information
    document.getElementById("fps").textContent = fps;
    document.getElementById("live_time").textContent = `${convertTime(liveTime)}`;
    
    // 更新 LOG
    const result_element=document.getElementById('result');

    detsList += `<p> Frame ID: ${frameID} </p>`;
    if (Array.isArray(dets)) {

        for(let i=0; i<dets.length; i++){
            detsList += `[ ${i} ] \t`;
            
            let detail = Object.keys(dets[i]);
            detail.forEach(function(key, index){
                detsList += `${key}: ${dets[i][key]} \t`;
            })
            detsList += "</p>";
        }
        detsList += "<hr>";
    }
    info.push(detsList);
    if(info.length>10){ 
        detsList = "";
        info.shift(); 
    }
    result_element.innerHTML = info;
    result_element.scrollTop = result_element.scrollHeight;
}

// Receive Socket Entrance
function receiveSockEvent(ev){

    let data = JSON.parse(ev.data);
    
    /* 
        自定義的資料格式
        1. sys: 與系統相關的資訊
        2. result: 與辨識相關，其中又以 uuid 為 key
        3. ...
    */
    if( SOCK_RES in data ){ parseSockInferResult(data[SOCK_RES]); }
    else if( SOCK_SYS in data ){ console.log(data[SOCK_SYS]); }
}

// Close Socket
function closedSockEvent(ev){
    console.log('The connection has been closed successfully.');
}

// Entrance
$(document).ready(async function(){

    // Define Socket Receive Event
    socket.addEventListener('message', receiveSockEvent);

    // Close Socket
    socket.addEventListener('close', closedSockEvent );

});
