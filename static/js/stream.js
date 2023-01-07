// Basic Information

const IMG_EVENT = "images";
const RES_EVENT = "results";

// Global Variable 
let uuid = "";
let gpu = 0;
let intervalTime = 5000;

// Global Variable - results event
let detsList="";
let gpuInfoCount = 0;
let info = new Array;

// Get uuid from route
const el_path = location.pathname.split("/");
for(let i=0; i < el_path.length; i++){
    if( el_path[i] == "task" ){ 
        uuid = el_path[i+1]; 
    };
};
 
// Set up the socketio address
const URL = `http://${DOMAIN}:${PORT}/task/${uuid}/stream`;

let socketStream

function get_detection_data(frameID, dets){

        // 更新 LOG
        const result_element=document.getElementById('result');
   
        let detsList = `<p> Frame ID: ${frameID} </p>`;
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

function get_application_data(frameID, dets){

    // 更新 LOG
    const result_element=document.getElementById('result');
    let detsList = `<p> [ Frame ID: ${frameID} ] </p>`;
    
    if (dets.constructor == Object){
        for( const key in dets){
            detsList += `<p> ${key}: ${dets[key]} </p>`;
        }    
    } else {
        detsList = dets;
    }
    
    info.push(detsList);
    if(info.length>10){ info.shift(); }
    result_element.innerHTML = info;
    result_element.scrollTop = result_element.scrollHeight;
}

$(document).ready(async function(){
    
    try{
        socketStream = new WebSocket('ws://' + `${DOMAIN}:${PORT}` + '/results');
        // socketStream = new WebSocket('ws://' + `${DOMAIN}:${PORT}` + '/results');

    } catch(e){ console.warn(e) }

    console.log('...');
    // Update Basic Information
    updateBasicInfo();

    // Start the stream
    connectWebRTC(uuid);

    
    // Update first frame
    // await getFirstFrame(uuid);
    // document.getElementById("loader").style.display = "block";
    // document.getElementById("image").style.display = "none";

    // Seting Interval: Update GPU temperature every 5 seconds
    // window.setInterval(updateGPUTemperature, intervalTime);

    
    socketStream.addEventListener('message', ev => {
        
        let data = JSON.parse(ev.data);
        // console.log(data);
        data = JSON.parse(data[uuid])
        
        let dets = data["detections"];
        let frameID = data["idx"];
        let inferTime = data["inference"];
        let fps = data["fps"];
        let liveTime = data["live_time"];
        // 更新 Information
        document.getElementById("fps").textContent = fps;
        document.getElementById("live_time").textContent = `${convertTime(liveTime)}`;
        
        // get_detection_data(frameID, dets)
        get_application_data(frameID, dets)

    });

    socketStream.addEventListener('close', ev => {
        console.log('The connection has been closed successfully.');
    });

});

function backEvent(){
    location.href='/';
    streamStop(uuid);
}

function convertTime(total_sec){
    // t -> sec
    let trg_d =0 , trg_h =0 , trg_m =0 , trg_c =0;
    let temp_m =0, temp_h =0;
    if (total_sec>=60){
        trg_c = total_sec%60;
        temp_m = total_sec/60;
        if (temp_m>=60){
            trg_m = temp_m%60;
            temp_h = temp_m/60;
            if (temp_h>=24){
                trg_h = temp_h%24;
                trg_d = temp_h/24;
            } else{
                trg_h = temp_h;
            }
        } else{
            trg_m = temp_m;
        }
    }else{
        trg_c = total_sec;
    }
    
    return `${parseInt(trg_d)} d ${parseInt(trg_h)} h ${parseInt(trg_m)} m ${parseInt(trg_c)} s`
}

function getSourceType(src){
    let ret;
    if (src.includes('video')){ 
        ret='V4L2';
    } else if (src.includes('mp4')) {
        ret='Video';
    } else if (src.includes('rtsp')) {
        ret='RTSP';
    } else {
        ret='Image';
    };
    return ret
}

async function streamStart(uuid){

    const data = getAPI(`/task/${uuid}/stream/start`, ALERT);
    if(!data) return undefined;

    console.log(data);
    
}

function streamStop(uuid){
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/stream/stop`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (err) {
            console.log(err);
        },
    });
}

async function setFullScreenEvent(){
    
    const img       = document.getElementById('image');
    const fullPage  = document.querySelector('#fullpage');

    img.addEventListener('click', function() {
        fullPage.style.backgroundImage = 'url(' + img.src + ')';
        fullPage.style.display = 'block';
    });
}

async function getFirstFrame(uuid){
    // Sending data via web api ( /add )
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/get_frame`,
        contentType: false,
        type: 'GET',
        success: function (data, textStatus, xhr) {
            console.log("Get first frame");
            const img=document.getElementById('image');
            img.src="data:image/jpeg;base64,"+data["image"];
        }
    })
}

async function updateBasicInfo(){

    let data = await getAPI(`/task/${uuid}/info`);

    if(!data){
        return undefined;
    }
    else {
        console.log(data);
        document.getElementById("title").textContent = data['name'];
        // document.getElementById("app_name").textContent = data['app_name'];
        document.getElementById("model").textContent = data['model'];
        document.getElementById("application").textContent = data['application']["name"];
        document.getElementById("device").textContent = data['device'];
        
        document.getElementById("source").textContent = data['source'];
        // document.getElementById("status").textContent = data['status'];

        document.getElementById("input_type").textContent = getSourceType(data['source']);

        gpu=data['device'];
        updateGPUTemperature();
    };
}

function updateBasicInfoLegacy(){

    $.ajax({
        type: 'GET',
        url: SCRIPT_ROOT + '/device',
        dataType: "json",
        success: function (gpuData){
            // Get the default
            console.log("Get device")
            $.ajax({  
                type: 'GET',
                url: SCRIPT_ROOT + `/task/${uuid}/info`,
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    // const data = JSON.parse(data);
                    console.log(data);
                    document.getElementById("title").textContent = data['name'];
                    // document.getElementById("app_name").textContent = data['app_name'];
                    document.getElementById("model").textContent = data['model'];
                    document.getElementById("application").textContent = data['application']["name"];
                    document.getElementById("device").textContent = data['device'];
                    
                    document.getElementById("source").textContent = data['source'];
                    document.getElementById("status").textContent = data['status'];

                    document.getElementById("input_type").textContent = getSourceType(data['source']);

                    gpu=data['device'];
                    // for(let i=0;i<gpuData.length;i++){
                    //     console.log(i)
                    //     if (gpuData[i]['name']==data['device']){
                    //         gpu=i;
                    //     };
                    // };
                    updateGPUTemperature();
                },
                // error: function (xhr, textStatus, errorThrown) {
                //     alert('err');
                // }
            });
        },
    });
}

function updateGPUTemperature(){
   // 更新 GPU 的溫度
    $.ajax({
        type: 'GET',
        url: SCRIPT_ROOT + '/device',
        dataType: "json",
        success: function (data){

            if (gpu !== null){
                var today = new Date();
                var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
                var temperature = data[gpu]["temperature"];
                var memoryUtil = data[gpu]["memoryUtil"];
                
                // 當資訊大於 5 的時候也刪除第一筆資料
                if (myLineChart.data.labels.length>5){
                    rmFirstData(myLineChart);
                };
                addData(myLineChart, time, temperature);
            } else{
                for(let i=0; i<data.length; i++){
                    if (document.getElementById("device").textContent===data[i]['name']){
                        console.log('Got gpu index');
                        gpu=i;
                    }
                };
            };
        }
    })
};

// const streamSocket = io.connect(URL);
// let firstFrame = true
// streamSocket.on(IMG_EVENT, function(msg){  
    
//     // if (firstFrame==true){
//     //     document.getElementById("loader").style.display = "none";
//     //     document.getElementById("image").removeAttribute("style");
//     // }
//     firstFrame = false
//     const img=document.getElementById('image');
//     img.src="data:image/jpeg;base64,"+msg;
//     document.querySelector('#fullpage').style.backgroundImage = 'url(' + img.src + ')';
// });

// streamSocket.on(RES_EVENT, function(msg){

//     // 解析資料
//     const data = JSON.parse(msg);
//     let dets = data["detections"];
//     let frameID = data["idx"];
//     let inferTime = data["inference"];
//     let fps = data["fps"];
//     let liveTime = data["live_time"];
    
//     // 更新 Information
//     document.getElementById("fps").textContent = fps;
//     document.getElementById("live_time").textContent = `${convertTime(liveTime)}`;
    
//     // 更新 LOG
//     const result_element=document.getElementById('result');

//     detsList += `<p> Frame ID: ${frameID} </p>`;
//     if (Array.isArray(dets)) {

//         for(let i=0; i<dets.length; i++){
//             detsList += `[ ${i} ] \t`;
            
//             let detail = Object.keys(dets[i]);
//             detail.forEach(function(key, index){
//                 detsList += `${key}: ${dets[i][key]} \t`;
//             })
//             detsList += "</p>";
//         }
//         detsList += "<hr>";
//     }
//     info.push(detsList);
//     if(info.length>10){ 
//         detsList = "";
//         info.shift(); 
//     }
//     result_element.innerHTML = info;
//     result_element.scrollTop = result_element.scrollHeight;
// });