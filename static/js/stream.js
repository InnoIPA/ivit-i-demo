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

// Define Socket in socket.js
// const socket = new WebSocket('ws://' + `${DOMAIN}:${PORT}` + '/ivit_i');
// const SOCK_SYS = "sys";
// const SOCK_RES = "result";

$(document).ready(async function(){

    // Start the stream
    connectWebRTC(uuid);

    // Update Basic Information
    updateBasicInfo();
    
    // Seting Interval: Update GPU temperature every 5 seconds
    window.setInterval(updateGPUTemperature, intervalTime);

    // Set Socket Send Event: which in socket.js
    window.setInterval(sendSocketInferResult, SOCK_RES_TIMEOUT)
    
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

let inferFlag = true, inferOpacity = 30;
async function inferController(){
    inferFlag = !inferFlag;
    inferOpacity = inferFlag===true ? 0.5 : 0.2
    document.getElementById('inferIcon').style.opacity = inferOpacity;
    let jsonData = { "data": inferFlag }; 
    const retData = await putAPI( `/task/${uuid}/stream/infer`, jsonData, JSON_FMT, ALERT )
    if(!retData) return(undefined);

    console.log(retData);
}

let drawResultFlag = true, drawOpacity = 30;
async function inferResultController(){
    
    drawResultFlag = !drawResultFlag;
    drawOpacity = drawResultFlag===true ? 0.5 : 0.2
    document.getElementById('drawIcon').style.opacity = drawOpacity;

    let jsonData = { "data": drawResultFlag }; 
    const retData = await putAPI( `/task/${uuid}/stream/draw`, jsonData, JSON_FMT, ALERT )
    if(!retData) return(undefined);

    console.log(retData);
}