// 先 寫死路徑，方便產出 DEMO 版本
const DOMAIN = '172.16.92.130';
const PORT = '818';
const FRAMEWORK = 'trt';
const SCRIPT_ROOT = `http://${DOMAIN}:${PORT}`;
let edit_mode = false;

// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下 Switch 的時候開啟串流
function streamStart(uuid){
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/stream/start`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("error in start streaming");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當關閉 Switch 的時候關閉 APP
function stopApp(uuid){
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/stream/stop`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            console.log(data);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("error in stopping application");
        },
    });
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/stop`,
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
// 加入以及刪除 href
function hrefEvent(behavior, uuid){
    // console.log(`href event: ${behavior} ${uuid}`);
    if (behavior==='add'){
        document.getElementById(`${uuid}_name`).href=`http://${DOMAIN}:4999/task/${uuid}/stream`;
        document.getElementById(`${uuid}_name`).setAttribute("onclick", `streamStart("${uuid}");`);
    } else {
        document.getElementById(`${uuid}_name`).removeAttribute("href");
        document.getElementById(`${uuid}_name`).removeAttribute("onclick");
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 控制 狀態的事件
function statusEvent(uuid, stats, firstTime=false){
    console.log(`capture the application: ${uuid}, status: ${stats}, first time: ${firstTime}`);
    // run app or stop app
    // const status_ele = $(`#${uuid}_status`);

    if(stats==='run'){
        hrefEvent('add', uuid);
        document.getElementById( `${uuid}_status_btn`).innerText = 'run';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-green custom")
        document.getElementById(`${uuid}_more`).disabled=true;
    }else if(stats==='stop'){
        hrefEvent('remove',uuid);
        document.getElementById( `${uuid}_status_btn`).innerText = 'stop';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-gray custom")
        document.getElementById(`${uuid}_more`).disabled=false;
        // if(firstTime===false){
        //     stopApp(uuid);
        // };
    };
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 
function freezeCheckbox(status){
    let checkboxes = document.querySelectorAll('input[type=checkbox]');
    for (var i = 0; i < checkboxes.length; i++) {
        if(document.getElementById(`${checkboxes[i].value}_status_btn`).textContent!=='error'){
            
            checkboxes[i].disabled=status;
        }
    }
}

function errNameEvent(uuid){
    // class="err-name" data-toggle="modal" data-target="#errModal" onclick="errModalEvent(this);"
    let ele = document.getElementById(`${uuid}_name`);
    document.getElementById( `${uuid}_status_btn`).innerText = 'error';
    document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-red custom")
    ele.setAttribute("class", "err-name");
    ele.setAttribute("data-toggle", "modal");
    ele.setAttribute("data-target", "#errModal");
    ele.setAttribute("onclick", "errModalEvent(this);");
    
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當連線的時候 判斷 switch 的狀態，並做對應的動作
$(document).ready(function () {
    // 更新子標題
    let af_title;
    if(FRAMEWORK==='vino'){
        af_title = 'Intel';
    } else if(FRAMEWORK==='trt'){
        af_title = 'NVIDIA';
    } else {
        af_title = 'Unkwon';
    }
    document.getElementById("title_framework").textContent=`( ${af_title} )`;
    // 
    let ele = document.querySelectorAll('input[type=checkbox]');
    for(let i=0; i<ele.length; i++){
        // let stats = ( ele[i].checked ? 'run' : 'stop' );
        const uuid = ele[i].value;
        $.ajax({
            url: SCRIPT_ROOT + `/task/${uuid}/status`,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                // 如果 ready == false 的話就沒有 status
                let stats = data;
                if ( stats==='run'){
                    ele[i].checked=true;
                } else{
                    ele[i].checked=false;
                };
                statusEvent(uuid, stats, true); 
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Error in capture status");
                console.log(xhr);
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
        
        // freezeCheckbox(true);
        // run app or stop app
        $.ajax({  
            type: 'GET',
            url: SCRIPT_ROOT + `/task/${uuid}/${stats}`,
            // url: `http://0.0.0.0:4999/${stats}`,
            dataType: "json",
            success: function (data, textStatus, xhr) {
                console.log(`${data}`);
                statusEvent(uuid, stats);
                // freezeCheckbox(false);
            },
            error: function (xhr, textStatus, errorThrown) {
                
                document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-red custom")
                document.getElementById(`${uuid}_switch`).checked = false;
                hrefEvent('remove', uuid);
                
                console.log('Run application error ... stop application')
                const err = xhr.responseJSON;
                console.log(err);
                stopApp(uuid);
                
                errNameEvent(uuid);
                // alert(err);
            },
        });
    });
});
// ---------------------------------------------------------------------------------------------------------------------------------------
// clear modal
function clearModalDropdown(){
    console.log('clear modal drop down item ..');
    document.getElementById("model_list").innerHTML = "";
    document.getElementById("model_app_list").innerHTML = "";
    document.getElementById("input_type_list").innerHTML = "";
    document.getElementById("input_source_list").innerHTML = "";
    document.getElementById("device_list").innerHTML = "";

}
// ---------------------------------------------------------------------------------------------------------------------------------------
function sourceTypeEvent(typeList, typeStatus){
    if (typeList.length !== typeStatus.length){
        console.log("error in control source type");
    } else {
        let step;
        for(step=0; step<typeList.length; step++){
            document.getElementById(typeList[step]).style.display = typeStatus[step];
        }
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// modal 的預設
function setDefaultModal(){
    console.log('set the default value of the modal item ...');
    // Set default value
    // document.getElementById("name").value = "";
    document.getElementById("name").placeholder = "Ex. Defect detection";
    
    document.getElementById("thres").value = 0.9;

    // document.getElementById("source_def").setAttribute("style", "cursor: auto");
    updateSourceType('default');
    sourceTypeEvent( ["source_text", "source_file", "source_dropdown"], ["none", "none", "none"] );

    // Application default is NULL
    document.getElementById("model_app_menu").setAttribute("style", "display: none");
    document.getElementById("model_app_menu_def").setAttribute("style", "cursor: auto");
    
    document.getElementById("custom_file_label").textContent = "Choose file";
    // document.getElementById("source").value = "";

    document.getElementById("model_menu").textContent = "Please select one";
    
    document.getElementById("input_type_menu").textContent = "Please select one";
    document.getElementById("device_menu").textContent = "Please select one";
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update model
let map;    
function updateModel(){
    console.log('update model');
    $.ajax({
        url: SCRIPT_ROOT + `/model_app`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            let el = document.getElementById("model_list");
            map = data;
            console.log(map);
            for (const key of Object.keys(data)) {
                el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="model" name="${key}">${key}</a>`;
            };
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in modelMap");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------------
// 當選則某個項目的時候更新 表單內容
function dropdownSelectEvent(obj) {
    console.log(`selected ${obj.id} -> ${obj.innerText}`);
    // 更新按鈕文字
    document.getElementById(`${obj.id}_menu`).textContent = obj.innerHTML;
    // 如果是類別的話要更新 APP 清單
    if (obj.id === 'model'){    
        updateModelApp(obj.id, obj.innerHTML);
        document.getElementById("model_app_menu_def").style.display = "none";
        document.getElementById("model_app_menu").removeAttribute("style");
    };
    if (obj.id === 'input_type'){
        updateSourceType(obj.innerText);
    };
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update model applications
function updateModelApp(eleName, trgKey){
    console.log('update model application');
    // Set name object
    const appName = `${eleName}_app`
    const appListName = `${appName}_list`;
    const appMenuName = `${appName}_menu`;
    // Get elements
    let appList = document.getElementById(appListName);
    let appMenu = document.getElementById(appMenuName);
    // Clear and set default
    appList.innerHTML = "";
    appMenu.textContent = "Please select one";
    // Update content
    map[trgKey].forEach(function(item, i){
        appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
    });
    // for (const key of Object.keys(map[trgKey])) {
    //     appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${key}">${key}</a>`;
    // };    
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update input source type
function updateSourceType(srcType, srcData=""){
    if (srcType==='default'){
        document.getElementById("source_def").setAttribute("style", "cursor: auto");
    } else {
        document.getElementById("source_def").setAttribute("style", "display: none");

        if (srcType==='RTSP'){
            sourceTypeEvent( ["source_text", "source_file", "source_dropdown"], ["block", "none", "none"] );
            if (srcData!==""){
                document.getElementById("source").value = srcData;
            }
        } else if (srcType==='Video' || srcType==='Image'){
            sourceTypeEvent( ["source_text", "source_file", "source_dropdown"], ["none", "block", "none"] );
            if (srcData!==""){
                let srcDataArr = srcData.split('/');
                console.log(srcDataArr);
                document.getElementById("custom_file_label").textContent = srcDataArr[srcDataArr.length-1];
            }
        } else {
            sourceTypeEvent( ["source_text", "source_file", "source_dropdown"], ["none", "none", "block"] );
            if (srcData!==""){
                document.getElementById("input_source_menu").innerText = srcData;
            }
        }
    }
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update input type
function updateInputType(data=""){
    let el = document.getElementById("input_type_list");
    let inputTypeList = ['V4L2', 'Video', 'Image', 'RTSP'];

    if (data===""){
        console.log('update input type');
        for(let step=0; step<inputTypeList.length; step++){
            el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="input_type" name="V4L2" >${ inputTypeList[step] }</a>`;
        }
    } else {
        if (data.includes('video')){ 
            document.getElementById("input_type_menu").textContent='V4L2';
        } else if (data.includes('mp4')) {
            document.getElementById("input_type_menu").textContent='Video';
        } else if (data.includes('rtsp')) {
            document.getElementById("input_type_menu").textContent='RTSP';
        } else {
            document.getElementById("input_type_menu").textContent='Image';
        };
    }

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// Update input source
function updateInputSource(){
    console.log('update input source');
    var el = document.getElementById("input_source_list");
    // Update device list
    $.ajax({
        url: SCRIPT_ROOT + `/v4l2`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            if (Array.isArray(data)) {
                data.forEach((v, i) => {
                    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="input_source" value="${v}">${v}</a>`;
                });
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in capture input source");
        },
    });

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 更新 modal 的 GPU 選項
function updateGPU(){
    console.log('update device list');
    // Update device list
    $.ajax({
        url: SCRIPT_ROOT + `/device`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            // if (Array.isArray(data)) {
            //     var el = document.getElementById("device_list");
            //     data.forEach((v, i) => {
            //         el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="device" value="gpu_${v.id}">${v.name}</a>`;
            //         document.getElementById("device_menu").value = `gpu_${v.id}`;
            //         // console.log(v.name);
            //     });
            // }
            for (const key of Object.keys(data)) {
                const deviceName = data[key]['name'];
                var el = document.getElementById("device_list");
                el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="device" value="${deviceName}}">${deviceName}</a>`;
                document.getElementById("device_menu").value = `${deviceName}}`;
                // el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="device" value="gpu_${v.id}">${deviceName}</a>`;
                // document.getElementById("device_menu").value = `gpu_${v.id}`;
            };    
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in Database");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 APP
function addSubmit() {
    console.log('add a task');
    // {
    //     "name": "test_from_added_task",
    //     "application": [ "counting_number" ],
    //     "model": "resnet50.engine",
    //     "device": "NVIDIA GeForce GTX 1050 Ti",
    //     "source": "/dev/video0",
    //     "source_type": "V4L2",
    //     "thres": 0.7
    // }
    let data = {
        name: document.getElementById("name").value,
        thres: document.getElementById("thres").value,
        model: document.getElementById("model_menu").innerText,
        application: document.getElementById("model_app_menu").innerText,
        source_type: document.getElementById("input_type_menu").innerText,
        device: document.getElementById("device_menu").innerText,
    };

    let form_data = new FormData();

    for ( let key in data ) {
        console.log(key);
        console.log(data[key]);
        form_data.append(key, data[key]);
    };

    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("input_source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    console.log(`send data:`);
    console.log(form_data)

    $.ajax({
        url: SCRIPT_ROOT + '/add',
        // url: 'http://172.16.92.130:4999' + '/add',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {
            console.log(data);
            setDefaultModal();
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Add error");
            console.log(xhr);
            console.log(xhr.responseJSON);
        },
    });

}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 編輯 APP
function editSubmit(obj) {
    console.log(`edit an application`);
    let data = {
        name: document.getElementById("name").value,
        thres: document.getElementById("thres").value,
        application: document.getElementById("model_app_menu").innerText,
        source_type: document.getElementById("input_type_menu").innerText,
        device: document.getElementById("device_menu").innerText,
    };

    let form_data = new FormData();

    for ( let key in data ) {
        console.log(`${key}:${data[key]}`);
        form_data.append(key, data[key]);
    };

    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("input_source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    console.log(`edit data:`);
    console.log(form_data)

    $.ajax({
        url: SCRIPT_ROOT + `/edit/${obj.value}`,
        // url: 'http://172.16.92.130:4999' + '/add',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {
            console.log(data);
            setDefaultModal();
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("edit error");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 刪除 APP
function delSubmit(obj) {
    console.log('delete the application')
    const uuid = document.getElementById("del_uuid").textContent;
    let data = { "uuid": uuid };
    console.log(`Remove application ${uuid}`);
    $.ajax({
        url: SCRIPT_ROOT + `/remove`,
        type: "POST",
        data: JSON.stringify(data),
        processData: false,
        contentType: "application/json; charset=UTF-8",
    });
    location.reload();
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 刪除 APP
function delModal(obj) {
    const uuid = obj.id;
    const name = document.getElementById(`${uuid}_name`).textContent;

    console.log(`User want to delete application ${name}, which uuid is ${uuid}`)
    document.getElementById("del_content").textContent = `The application ( ${name} , ${uuid} ) will be delete`;
    document.getElementById("del_uuid").textContent = uuid;
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 Modal 應有的資訊
function addModalEvent() {
    console.log(`open add modal`);
    document.getElementById("modal_add_submit").style.display = 'block';
    document.getElementById("modal_edit_submit").style.display = 'none';
    clearModalDropdown();
    updateGPU();
    updateInputType();
    updateModel();
    updateInputSource();
    document.getElementById("model_menu").disabled = false;
    document.getElementById("model_app_menu").disabled = false;
    document.getElementById("device_menu").disabled = false;
    // updateModelApp();
    
    document.getElementById("model_app_menu").disabled = false;
    document.getElementById("device_menu").disabled = false;
    setDefaultModal();
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 加入 Modal 應有的資訊
function errModalEvent(obj) {
    console.log(`open error modal`);
    const id = obj.id;
    let uuid=id.split('_')[0];
    $.ajax({
        url: SCRIPT_ROOT + `/task/${uuid}/error`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            document.getElementById("errMsg").textContent = data;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in capturing error message");
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下 addModal 的按鈕，將會採用 add_model_event
// $("#addModal").click(addModalEvent);

// ---------------------------------------------------------------------------------------------------------------------------------------
// 當按下編輯的按鈕會新增相關資訊
function editModal(obj) {
    console.log(`open edit modal`);
    clearModalDropdown();
    updateGPU();
    updateInputType();
    updateModel();
    updateInputSource();
    // updateModelApp();
    $.ajax({
        url: SCRIPT_ROOT + `/task/${obj.id}/info`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            // framework, name, source, input_type, device, thres, model, application, thres
            document.getElementById("modal_add_submit").style.display = 'none';
            document.getElementById("modal_edit_submit").style.display = 'block';
            
            const af = data["framework"];

            document.getElementById("name").value = data["name"];
            
            // update source type
            updateInputType(data["source"]);
            
            // change source
            const inTypeEle = document.getElementById("input_type_menu");
            updateSourceType( inTypeEle.innerText, data["source"] );
        
            // model
            document.getElementById("model_menu").textContent = data["model"];
            document.getElementById("model_menu").disabled = true;

            // model_app
            document.getElementById("model_app_menu_def").style.display = 'none';
            document.getElementById("model_app_menu").removeAttribute('style');
            document.getElementById("model_app_menu").textContent = data["application"];
            document.getElementById("model_app_menu").disabled = true;

            document.getElementById("device_menu").textContent = data['device'];
            document.getElementById("thres").value = data['thres'];
            document.getElementById("modal_edit_submit").value = obj.id;
            document.getElementById("device_menu").disabled = true;
        }
    });
}
