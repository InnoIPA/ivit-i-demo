// Basic Information

// Global Variable 
let uuid = "";
let gpu;
let intervalTime = 5000;

// Global Variable - results event
let inferSock
const inferSockEvent = "/results"
let info = new Array;

// Get uuid from route
const el_path = location.pathname.split("/");
for(let i=0; i < el_path.length; i++){
    if( el_path[i] == "task" ){ 
        uuid = el_path[i+1]; 
    };
};
 
// Set up the socketio address
const URL = `http://${SCRIPT_ROOT}/task/${uuid}/stream`;

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

async function app_alarm_event(val){
    // No Alarm
    if(val==="") return undefined;
    alert(dets[key]);
}

async function get_application_data(frameID, dets){

    // 更新 LOG
    const result_element=document.getElementById('result');
    let detsList = `<p> [ Frame ID: ${frameID} ] </p>`;
    if (dets.constructor == Object){

        for( const key in dets){
            
            if(key==='alarm'){
                const alarm = await app_alarm_event(dets[key]);
                if(!alarm) continue;
            }

            if ( Array.isArray(dets[key])) {
                const detsArr = dets[key];
                for(let i=0; i<detsArr.length; i++){
                    detsList += `[ ${i} ] \t`;
                    let detail = Object.keys(detsArr[i]);
                    detail.forEach(function(key, index){
                        detsList += `${key}: ${detsArr[i][key]} \t`;
                    })
                    detsList += "</p>";
                }
            }
            else{
                detsList += `<p> ${key}: ${dets[key]} </p>`;
            }
        }    
    } else if (Array.isArray(dets)){
        for(let i=0; i<dets.length; i++){
            detsList += `[ ${i} ] \t`;
            let detail = Object.keys(dets[i]);
            detail.forEach(function(key, index){
                detsList += `${key}: ${dets[i][key]} \t`;
            })
            detsList += "</p>";
        }
    } else {
        // detsList += ("<p>"+dets+"</p>") 
        detsList += `<p>${dets}</p>`;
    }
    
    // Keep Information in 10 Lines
    info.push(detsList);
    if(info.length>10){ info.shift(); }

    // Parse the inforamtion into HTML format and replace comma to <hr>
    html_info = ""
    info.forEach((line) => { html_info += (line+'<hr>'); });

    result_element.innerHTML = html_info;
    result_element.scrollTop = result_element.scrollHeight;
}

function inferSockMesgEvent(ev){
    let data = JSON.parse(ev.data);
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
}

function inferSockCloseEvent(){
    console.log('The connection has been closed successfully.');
}

$(document).ready(async function(){
    
    const data = await getAPI(`/task/${uuid}/status`)
    console.warn(data);
    if(!data) return undefined;

    
    if( data['message']==='run'){

        const rtc = await addWebRTC(uuid, `rtsp://127.0.0.1:8554/${uuid}`);
        // alert('Task is running')
        // Define Socket Event
        try{ 
            // Connect Socket
            inferSock = new WebSocket('ws://' + `${HOST}/ivit`+ inferSockEvent);
            inferSock.addEventListener('message', inferSockMesgEvent);
            inferSock.addEventListener('close', inferSockCloseEvent);
        } catch(e){ 
            console.warn(e) 
        }

        // Update Basic Information
        updateBasicInfo();

        // Start the stream
        connectWebRTC(uuid);

        // Seting Interval: Update GPU temperature every 5 seconds
        window.setInterval(updateGPUTemperature, intervalTime);

    }


});

function backEvent(){
    location.href='/';
    // streamStop(uuid);
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


async function updateBasicInfo(){

    let data = await getAPI(`/task/${uuid}/info`);
    if(!data) return undefined;
    data = data["data"]
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

}

async function updateGPUTemperature(){
   
    // Get GPU Information
    let gpuData = await getAPI('/device')
    if(!gpuData) return undefined;
    gpuData = gpuData["data"]
    console.log('......................');
    console.log(gpuData);
    // Check GPU is correct
    if(! gpu in gpuData){
        console.warn(`Could not find GPU (${gpu}) Information`);
        return undefined
    }

    // Get Target Info
    let temperature = gpuData[gpu]["temperature"];
    // let memoryUtil = gpuData[gpu]["memoryUtil"];
    
    // Keep data length is 6
    if (myLineChart.data.labels.length>=6) rmFirstData(myLineChart);

    // Define the chart parameters
    let today = new Date();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    // Add Data and draw
    addData(myLineChart, time, temperature);
    
};
