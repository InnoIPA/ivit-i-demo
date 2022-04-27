// 取得本地端的網址
const TRG_URL = document.URL;

// ---------------------------------------------------------------------------------------------------------------------------------------
// 設定 對應 Socket 路徑
const PATH = location.pathname;
const PATH_ELE = PATH.split("/");
let uuid = "";
let port = "5001";
let gpu = 0;
for(let i=0; i<PATH_ELE.length; i++){
    if(PATH_ELE[i]=="app"){ uuid = PATH_ELE[i+1]; };
};
const URL = `http://${document.domain}:${port}/app/${uuid}/stream`;
const stream_socket = io.connect(URL);

// 換算時間
function cal_time(total_sec){
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
            }
        } else{
            trg_m = temp_m;
        }
    }else{
        trg_c = total_sec;
    }
    
    return `${parseInt(trg_d)} d ${parseInt(trg_h)} h ${parseInt(trg_m)} m ${parseInt(trg_c)} s`
}
// 
function get_src_type(src){
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

// ---------------------------------------------------------------------------------------------------------------------------------------
// setup the default infromation
const SCRIPT_ROOT = "http://172.16.92.130:5000/trt";
$(document).ready(function(){
    // Get the default
    $.ajax({  
        type: 'GET',
        url: SCRIPT_ROOT + `/app/${uuid}/info`,
        dataType: "json",
        success: function (data, textStatus, xhr) {
            // const data = JSON.parse(data);
            
            document.getElementById("title").textContent = data['app_name'];
            document.getElementById("category").textContent = data['category'];
            document.getElementById("application").textContent = data['application'];
            document.getElementById("device").textContent = data['device'];
            
            document.getElementById("source").textContent = data['source'];
            document.getElementById("status").textContent = data['status'];

            document.getElementById("input_type").textContent = get_src_type(data['source']);
        },
        // error: function (xhr, textStatus, errorThrown) {
        //     alert('err');
        // }
    });
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// Update GPU temperature every 5 seconds
let intervalTime = 5000;
let intervalGPU = window.setInterval(capture_gpu, intervalTime);
function capture_gpu(){
   // 更新 GPU 的溫度
    $.ajax({
        type: 'GET',
        url: SCRIPT_ROOT + '/gpu',
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
// ---------------------------------------------------------------------------------------------------------------------------------------
// 註冊 image 事件
stream_socket.on('image', function(msg){  
    const image_element=document.getElementById('image');
    image_element.src="data:image/jpeg;base64,"+msg;
});

// ---------------------------------------------------------------------------------------------------------------------------------------
// 註冊 result 事件
let detsList;
let gpuInfoCount = 0;
let info = new Array;
stream_socket.on('result', function(msg){

    // 解析資料
    const data = JSON.parse(msg);
    let dets = data["detections"];
    let frameID = data["idx"];
    let inferTime = data["inference"];
    let fps = data["fps"];
    let liveTime = data["live_time"];
    
    // 更新 Information
    document.getElementById("fps").textContent = fps;
    document.getElementById("live_time").textContent = `${cal_time(liveTime)}`;
    
    // 更新 LOG
    const result_element=document.getElementById('result');
    detsList = `<p> Frame ID: ${frameID}</p>`;
    if (Array.isArray(dets)) {
        dets.forEach((v,i) => {
            let val = v;
            let val_ls = Object.keys(val);
            // 只顯示一組資訊的方式
                // detsList += `<p>Label: ${v.label}</p>`;
                // detsList += `<p>Score: ${Number(v.score).toFixed(2)}</p>`;
                // detsList += `<p>Bbox (x1, y1, x2, y2): (${v.xmin}, ${v.ymin}, ${v.xmax}, ${v.ymax})</p>`;

            // 目前採用顯示多個的方式
            detsInfo = "<p>";
            for(i==0; i<val_ls.length; i++){
                detsInfo += `${val[val_ls[i]]} \t`;    
            }
            detsInfo += '</p>';
            detsList += detsInfo;
        });
    }
    info.push(detsList);
    if(info.length>10){ info.shift(); }
    result_element.innerHTML = info;
    result_element.scrollTop = result_element.scrollHeight;
 
});