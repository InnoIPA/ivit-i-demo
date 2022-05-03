// 先 寫死路徑，方便產出 DEMO 版本
const DOMAIN = '172.16.92.130';
const PORT = '5000';
const FRAMEWORK = 'trt';
const SCRIPT_ROOT = `http://${DOMAIN}:${PORT}/${FRAMEWORK}`;
let edit_mode = false;

// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下 Switch 的時候開啟串流
function stream_start(uuid){
    $.ajax({
        url: SCRIPT_ROOT + `/app/${uuid}/stream/start`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當關閉 Switch 的時候關閉 APP
function stop_app(uuid){
    $.ajax({
        url: SCRIPT_ROOT + `/app/${uuid}/stream/stop`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
    $.ajax({
        url: SCRIPT_ROOT + `/app/${uuid}/stop`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
}

function change_status_behavior(uuid, stats, firstTime=false){
    // run app or stop app
    const status_ele = $(`#${uuid}_status`);

    if(stats==='run'){
        document.getElementById( `${uuid}_status_btn`).innerText = 'run';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-green custom")
        // status_ele.css("color", "Green");
        document.getElementById(`${uuid}_name`).href = `http://${DOMAIN}:4999/app/${uuid}/stream`;
        document.getElementById(`${uuid}_name`).setAttribute("onclick", `stream_start("${uuid}");`);
        //   document.getElementById(`${uuid}_name`).onclick = stream_start(uuid);
    }else{
        // status_ele.css("color", "Gray");
        document.getElementById( `${uuid}_status_btn`).innerText = 'stop';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-gray custom")
        document.getElementById(`${uuid}_name`).removeAttribute("href");
        if(firstTime===false){
            stop_app(uuid);
        };
    };
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當連線的時候 判斷 switch 的狀態，並做對應的動作
$(document).ready(function () {

    let ele = document.querySelectorAll('input[type=checkbox]');
    for(let i=0; i<ele.length; i++){
        // let stats = ( ele[i].checked ? 'run' : 'stop' );
        const uuid = ele[i].value;
        $.ajax({
            url: SCRIPT_ROOT + `/app/${uuid}`,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                // 如果 ready == false 的話就沒有 status
                let stats = 'err';
                if ('status' in data){
                    stats = data['status'];
                    if ( stats==='run'){
                        ele[i].checked=true;
                    } else{
                        ele[i].checked=false;
                    };
                    change_status_behavior(uuid, stats, true);
                };  
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Error in categoryMap");
            },
        });
    }
    
    $('.switch :checkbox').change(function(){
        
        let stats = ( this.checked ? 'run' : 'stop' )
        const uuid = this.value
        const af = document.getElementById(`${uuid}_framework`).textContent;
        // Loading
        document.getElementById( `${uuid}_status_btn`).innerText = 'loading';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-gray custom");
        document.getElementById(`${uuid}_name`).removeAttribute("href");
        

        alert(`${stats} application (${uuid}), please wait a seconds. `);
        // run app or stop app
        $.ajax({  
            type: 'GET',
            url: SCRIPT_ROOT + `/app/${uuid}/${stats}`,
            // url: `http://0.0.0.0:4999/${stats}`,
            dataType: "json",
            success: function (data, textStatus, xhr) {
                change_status_behavior(uuid, stats);
            },
            error: function (xhr, textStatus, errorThrown) {
                // status_ele.css("color", "Gray");
                document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-red custom")
                document.getElementById(`${uuid}_name`).removeAttribute("href");
                stop_app(uuid);
            },
        });
    });
});
// ---------------------------------------------------------------------------------------------------------------------------------------
// clear modal
function clear_modal_dropdown(){
    document.getElementById("categoryList").innerHTML = "";
    document.getElementById("categoryAppList").innerHTML = "";
    document.getElementById("inputTypeList").innerHTML = "";
    document.getElementById("inputSourceList").innerHTML = "";
    document.getElementById("deviceList").innerHTML = "";

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// modal 的預設
function modal_default_content(){
    // Set default value
    document.getElementById("app_name").value = "";
    document.getElementById("thres").value = "";

    document.getElementById("source_text").style.display = "block";
    document.getElementById("source_file").style.display = "none";
    document.getElementById("source_dropdown").style.display = "none";

    document.getElementById("custom-file-label").textContent = "Choose file";
    document.getElementById("source").value = "";

    document.getElementById("categoryMenu").textContent = "--- please select ---";
    document.getElementById("categoryAppMenu").textContent = "--- please select ---";
    document.getElementById("inputTypeMenu").textContent = "--- please select ---";
    document.getElementById("deviceMenu").textContent = "--- please select ---";
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update category
let map;    
function update_category(){
    $.ajax({
        url: SCRIPT_ROOT + `/categoryMap`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            let el = document.getElementById("categoryList");
            map = data;
            for (const key of Object.keys(data)) {
                el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this); return false;" id="category" name="${key}">${key}</a>`;
            };
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in categoryMap");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當選則某個項目的時候更新 表單內容
function selected_item(obj) {
    // 更新按鈕文字
    document.getElementById(`${obj.id}Menu`).textContent = obj.innerHTML;
    // 如果是類別的話要更新 APP 清單
    if (obj.id === 'category'){    
        update_category_app(obj.id, obj.innerHTML);
    };
    if (obj.id === 'inputType'){
        if (obj.innerText==='RTSP'){
            document.getElementById("source_text").style.display = "block";
            document.getElementById("source_file").style.display = "none";
            document.getElementById("source_dropdown").style.display = "none";
        } else if (obj.innerText==='Video' || obj.innerText==='Image'){
            document.getElementById("source_text").style.display = "none";
            document.getElementById("source_file").style.display = "block";
            document.getElementById("source_dropdown").style.display = "none";
        } else {
            document.getElementById("source_text").style.display = "none";
            document.getElementById("source_file").style.display = "none";
            document.getElementById("source_dropdown").style.display = "block";
        }
    };
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update category applications
function update_category_app(eleName, trgKey){
    // Set name object
    const appName = `${eleName}App`
    const appListName = `${appName}List`;
    const appMenuName = `${appName}Menu`;
    // Get elements
    let appList = document.getElementById(appListName);
    let appMenu = document.getElementById(appMenuName);
    // Clear and set default
    appList.innerHTML = "";
    appMenu.textContent = "--- please select ---";
    // Update content
    for (const key of Object.keys(map[trgKey])) {
        appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this); return false;" id="${appName}" name="${key}">${key}</a>`;
    };    
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update input type
function update_input_type(){

    var el = document.getElementById("inputTypeList");
    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="inputType" name="V4L2" >V4L2</a>`;  
    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="inputType" name="video">Video</a>`;
    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="inputType" name="image">Image</a>`;
    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="inputType" name="rtsp">RTSP</a>`;
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update input source
function update_input_source(){

    var el = document.getElementById("inputSourceList");

    // Update device list
    $.ajax({
        url: SCRIPT_ROOT + `/v4l2`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            if (Array.isArray(data)) {
                data.forEach((v, i) => {
                    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="inputSource" value="${v}">${v}</a>`;
                    console.log(v);
                });
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Old Ver - 更新 modal 的 Category 選項
    // function update_category(){
    //     // Update category list
    //     $.ajax({
    //         url: SCRIPT_ROOT + `/category`,
    //         type: "GET",
    //         dataType: "json",
    //         success: function (data, textStatus, xhr) {
    //             if (Array.isArray(data)) {
    //                 var el = document.getElementById("categoryList");
    //                 data.forEach((v, i) => {
    //                     el.innerHTML += `<a class="dropdown-item" href="#" onclick="selected_item(this); return false;" id="category" name="${v}">${v}</a>`;
    //                 });
    //             }
    //         },
    //         error: function (xhr, textStatus, errorThrown) {
    //             console.log("Error in Database");
    //         },
    //     });
    // }
// ---------------------------------------------------------------------------------------------------------------------------------------
// Old Ver - 更新 modal 的 Category APP 選項
    // function update_category_app(){
    //     // Update application category list
    //     $.ajax({
    //         url: SCRIPT_ROOT + `/application`,
    //         type: "GET",
    //         dataType: "json",
    //         success: function (data, textStatus, xhr) {
    //             console.log(data);
    //             const keys = Object.keys(data);
    //             if (Array.isArray(keys)) {
    //                 var el = document.getElementById("categoryAppList");
    //                 keys.forEach((v, i) => {
    //                     el.innerHTML += `<a class="dropdown-item" href="#" onclick="selected_item(this);" id="categoryApp" name="${v}">${v}</a>`;
    //                 });
    //             }
    //         },
    //         error: function (xhr, textStatus, errorThrown) {
    //             console.log("Error in Database");
    //         },
    //     });
    // }
// ---------------------------------------------------------------------------------------------------------------------------------------
// 更新 modal 的 GPU 選項
function update_gpu(){
    // Update device list
    $.ajax({
        url: SCRIPT_ROOT + `/gpu`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            if (Array.isArray(data)) {
                var el = document.getElementById("deviceList");
                data.forEach((v, i) => {
                    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="selected_item(this);" id="device" value="gpu_${v.id}">${v.name}</a>`;
                    document.getElementById("deviceMenu").value = `gpu_${v.id}`;
                    console.log(v.name);
                });
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 APP JSON 版本，無法傳檔案，已棄用
function add_submit() {

    // var data = {
    //     app_name: document.getElementById("app_name").value,
    //     source: document.getElementById("source").value,
    //     thres: document.getElementById("thres").value,
    //     category: document.getElementById("categoryMenu").innerText,
    //     application: document.getElementById("categoryAppMenu").innerText,
    //     input_type: document.getElementById("inputTypeMenu").innerText,
    //     device: document.getElementById("deviceMenu").innerText,
    // };
    
    // console.log(data);

    // $.ajax({
    //     url: SCRIPT_ROOT + '/add',
    //     // url: 'http://172.16.92.130:4999' + '/add',
    //     type: "POST",
    //     data: JSON.stringify(data),
    //     processData: false,
    //     contentType: "application/json; charset=UTF-8",
    //     success: function (data, textStatus, xhr) {
    //         modal_default_content();
    //         location.reload();
    //     },
    //     error: function (xhr, textStatus, errorThrown) {
    //         console.log("Error in add application");
    //     },
    // });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 APP
function add_submit_form() {

    let data = {
        app_name: document.getElementById("app_name").value,
        thres: document.getElementById("thres").value,
        category: document.getElementById("categoryMenu").innerText,
        application: document.getElementById("categoryAppMenu").innerText,
        input_type: document.getElementById("inputTypeMenu").innerText,
        device: document.getElementById("deviceMenu").innerText,
    };

    let form_data = new FormData();

    for ( let key in data ) {
        console.log(key);
        console.log(data[key]);
        form_data.append(key, data[key]);
    };

    if (data['input_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['input_type']=='Video' || data['input_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("inputSourceMenu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    console.log(form_data);

    $.ajax({
        url: SCRIPT_ROOT + '/add',
        // url: 'http://172.16.92.130:4999' + '/add',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {
            console.log(data);
            modal_default_content();
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Add error");
        },
    });

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 編輯 APP
function edit_submit(obj) {
    // var data = {
    //     app_name: document.getElementById("app_name").value,
    //     source: document.getElementById("source").value,
    //     thres: document.getElementById("thres").value,
    //     category: document.getElementById("categoryMenu").innerText,
    //     application: document.getElementById("categoryAppMenu").innerText,
    //     input_type: document.getElementById("inputTypeMenu").innerText,
    //     device: document.getElementById("deviceMenu").innerText,
    // };
    
    // console.log(data);

    // $.ajax({
    //     url: SCRIPT_ROOT + `/edit/${obj.value}`,
    //     type: "POST",
    //     data: JSON.stringify(data),
    //     processData: false,
    //     contentType: "application/json; charset=UTF-8",
    // });
    // modal_default_content();
    // location.reload();
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 編輯 APP
function edit_submit_form(obj) {
    let data = {
        app_name: document.getElementById("app_name").value,
        thres: document.getElementById("thres").value,
        category: document.getElementById("categoryMenu").innerText,
        application: document.getElementById("categoryAppMenu").innerText,
        input_type: document.getElementById("inputTypeMenu").innerText,
        device: document.getElementById("deviceMenu").innerText,
    };

    let form_data = new FormData();

    for ( let key in data ) {
        console.log(key);
        console.log(data[key]);
        form_data.append(key, data[key]);
    };

    if (data['input_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['input_type']=='Video' || data['input_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("inputSourceMenu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    console.log(form_data);

    $.ajax({
        url: SCRIPT_ROOT + `/edit/${obj.value}`,
        // url: 'http://172.16.92.130:4999' + '/add',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {
            console.log(data);
            modal_default_content();
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Add error");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 刪除 APP
function del_event(obj) {
    // Get uuid
    var data = { uuid: obj.id };
    $.ajax({
        url: SCRIPT_ROOT + `/remove`,
        type: "POST",
        data: JSON.stringify(data),
        processData: false,
        contentType: "application/json; charset=UTF-8",
    });
    modal_default_content();
    location.reload();
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 Modal 應有的資訊
function add_modal_event() {
    
    document.getElementById("modal_add_submit").style.display = 'block';
    document.getElementById("modal_edit_submit").style.display = 'none';
    clear_modal_dropdown();
    update_gpu();
    update_input_type();
    update_category();
    update_input_source();
    document.getElementById("categoryMenu").disabled = false;
    document.getElementById("categoryAppMenu").disabled = false;
    document.getElementById("deviceMenu").disabled = false;
    // update_category_app();
    
    document.getElementById("categoryAppMenu").disabled = false;
    document.getElementById("deviceMenu").disabled = false;
    modal_default_content();
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 Modal 應有的資訊
function err_modal_event(obj) {
    const id = obj.id;
    let uuid=id.split('_')[0];
    $.ajax({
        url: SCRIPT_ROOT + `/app/${uuid}/error`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            document.getElementById("errMsg").textContent = data;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下 addModal 的按鈕，將會採用 add_model_event
// $("#addModal").click(add_modal_event);

// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下編輯的按鈕會新增相關資訊
function editModal(obj) {
    clear_modal_dropdown();
    update_gpu();
    update_input_type();
    update_category();
    update_input_source();
    // update_category_app();
    $.ajax({
        url: SCRIPT_ROOT + `/app/${obj.id}/info`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            // framework, app_name, source, input_type, device, thres, category, application, thres
            document.getElementById("modal_add_submit").style.display = 'none';
            document.getElementById("modal_edit_submit").style.display = 'block';
            
            const af = data["framework"];

            document.getElementById("app_name").value = data["app_name"];
            
            
            if (data["source"].includes('video')){ 
                document.getElementById("inputTypeMenu").textContent='V4L2';

            } else if (data["source"].includes('mp4')) {
                document.getElementById("inputTypeMenu").textContent='Video';
            } else if (data["source"].includes('rtsp')) {
                document.getElementById("inputTypeMenu").textContent='RTSP';
            } else {
                document.getElementById("inputTypeMenu").textContent='Image';
            };

            const inTypeEle = document.getElementById("inputTypeMenu");
            
            if (inTypeEle.innerText==='RTSP'){
                document.getElementById("source_text").style.display = "block";
                document.getElementById("source_file").style.display = "none";
                document.getElementById("source_dropdown").style.display = "none";
                document.getElementById("source").value = data["source"];
            } else if (inTypeEle.innerText==='Video' || inTypeEle.innerText==='Image'){
                document.getElementById("source_text").style.display = "none";
                document.getElementById("source_file").style.display = "block";
                let src_data = data["source"].split('/')
                document.getElementById("custom-file-label").textContent = src_data[src_data.length-1];
            } else{
                document.getElementById("source_text").style.display = "none";
                document.getElementById("source_file").style.display = "none";
                document.getElementById("source_dropdown").style.display = "block";
                document.getElementById("inputSourceMenu").innerText = data["source"];
            }
        
            document.getElementById("categoryMenu").textContent = data["category"];
            document.getElementById("categoryAppMenu").textContent = data["application"];

            document.getElementById("deviceMenu").textContent = data['device'];
            document.getElementById("thres").value = data['thres'];

            document.getElementById("modal_edit_submit").value = obj.id;

            document.getElementById("categoryMenu").disabled = true;
            document.getElementById("categoryAppMenu").disabled = true;
            document.getElementById("deviceMenu").disabled = true;
        }
    });
}
