// 先 寫死路徑，方便產出 DEMO 版本
const DOMAIN = '172.16.92.130';
const PORT = '818';
const FRAMEWORK = 'trt';
const SCRIPT_ROOT = `http://${DOMAIN}:${PORT}`;
let edit_mode = false;

// ==================================================================
// Start Up Function

// Start streaming when press the name superlink
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

// Stop task when turn off the swich
function stopTask(uuid){
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

// Add superlink when task is avaible
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

// Control the status button
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
        //     stopTask(uuid);
        // };
    };
}

// Setting up error name link when the task is unavailable
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

// ==================================================================
// Start Up

// Setting up when start the web demo up
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
        
        // run app or stop app
        $.ajax({  
            type: 'GET',
            url: SCRIPT_ROOT + `/task/${uuid}/${stats}`,
            // url: `http://0.0.0.0:4999/${stats}`,
            dataType: "json",
            success: function (data, textStatus, xhr) {
                console.log(`${data}`);
                statusEvent(uuid, stats);
            },
            error: function (xhr, textStatus, errorThrown) {
                
                document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-red custom")
                document.getElementById(`${uuid}_switch`).checked = false;
                hrefEvent('remove', uuid);
                
                console.log('Run application error ... stop application')
                const err = xhr.responseJSON;
                console.log(err);
                stopTask(uuid);
                
                errNameEvent(uuid);
                // alert(err);
            },
        });
    });
});

// ==================================================================
// Set Default Modal

// Set default value on Add Modal
function setDefaultModal(){
    document.getElementById("name").placeholder = "Ex. Defect detection";
    document.getElementById("thres").value = 0.9;
    updateSource('default', 'source');
    document.getElementById("model_app_menu").setAttribute("style", "display: none");
    document.getElementById("model_app_menu_def").setAttribute("style", "cursor: auto");
    document.getElementById("custom_file_label").textContent = "Choose file";
    document.getElementById("model_menu").textContent = "Please select one";
    document.getElementById("source_type_menu").textContent = "Please select one";
    document.getElementById("device_menu").textContent = "Please select one";
}

// Set default value on Edit Modal 
function setEditDefaultModal(){
    document.getElementById("edit_name").placeholder = "Ex. Defect detection";
    document.getElementById("edit_thres").value = 0.9;
    updateSource("default", "edit_source", "");
    document.getElementById("edit_model_app_menu").setAttribute("style", "display: none");
    document.getElementById("edit_model_app_menu_def").setAttribute("style", "cursor: auto");
    document.getElementById("custom_file_label").textContent = "Choose file";
    document.getElementById("edit_model_menu").textContent = "Please select one";
    document.getElementById("edit_source_type_menu").textContent = "Please select one";
    document.getElementById("edit_device_menu").textContent = "Please select one";
}

// Set default value on Import Modal 
function setImportDefaultModal(){
    document.getElementById("import_name").placeholder = "Ex. Defect detection";
    document.getElementById("import_thres").value = 0.9;
    updateSource("default", "import_source", "");
    document.getElementById("import_model_app_menu").setAttribute("style", "display: none");
    document.getElementById("import_model_app_menu_def").setAttribute("style", "cursor: auto");
    
    document.getElementById("import_model_file_label").textContent = "Choose file";
    document.getElementById("import_label_file_label").textContent = "Choose file";
    document.getElementById("import_config_file_label").textContent = "Choose file";
    // document.getElementById("import_model_menu").textContent = "Please select one";
    document.getElementById("import_source_type_menu").textContent = "Please select one";
    document.getElementById("import_device_menu").textContent = "Please select one";
}

// ==================================================================
// Update & Control Dialog ( Modal )
// Define global variable "map", it will updated by updateModel
let map;    

// Select dropdown object event
function dropdownSelectEvent(obj) {
    
    let srcType = obj.innerText;
    let srcKey = obj.id;
    
    // Combine the target key , split the _type
    const srcKeyList = srcKey.split("_");
    let trgKey = srcKey.replace( `_${srcKeyList[srcKeyList.length-1]}`, "");
    
    console.log(`Selected:\n* ID:${srcKey}\n* TEXT: ${srcType}\n* KEY:${trgKey}`);
    
    // 更新按鈕文字
    document.getElementById(`${srcKey}_menu`).textContent = srcType;
    // 如果是類別的話要更新 APP 清單
    if (srcKey === 'model'){    
        updateModelApp(srcKey, srcType);
    } 
    else if ( srcKey.includes("device") ) {
        document.getElementById(`${srcKey}_menu`).textContent = `${srcType}`;
        document.getElementById(`${srcKey}_menu`).value = `${srcType}`;
    }
    else if ( srcKey.includes("source")) {
        updateSource(srcType, trgKey, "");
    };
}

// Clear modal
function clearModalDropdown(key=""){
    console.log(`Clear ${key} modal drop down item ...`);
    if(key!==""){
        key=`${key}_`;
    }
    let keyList = [ `${key}model_list`, `${key}model_app_list`, `${key}source_type_list`, `${key}input_source_list`, `${key}device_list` ];
    keyList.forEach( function(val, idx){
        const el = document.getElementById(val);
        if(el){
            document.getElementById(val).innerHTML = "";
        } else {
            console.log(val);
        }
    });
}

// Add Model arguments and update the "map" ( global variable )
function updateModel(key="model_list"){
    console.log(`Update model, element:${key}`);
    
    $.ajax({
        url: SCRIPT_ROOT + `/model_app`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            let el = document.getElementById(`${key}`);
            map = data;
            for (const key of Object.keys(data)) {
                el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="model" name="${key}">${key}</a>`;
            };
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in modelMap");
        },
    });
}

// Update Model and Application
function updateModelApp(eleKey, appKey){
    console.log('Update model application');
    
    const appName = `${eleKey}_app`
    const appListName = `${appName}_list`;
    const appMenuName = `${appName}_menu`;
    const appDefNmae = `${appMenuName}_def`;
    
    let appList = document.getElementById(appListName);
    let appMenu = document.getElementById(appMenuName);
    
    // Clear and set default
    appList.innerHTML = "";
    appMenu.textContent = "Please select one";
    
    // Update content
    map[appKey].forEach(function(item, i){
        appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
    });

    // Display
    document.getElementById(appDefNmae).style.display = "none";
    document.getElementById(appMenuName).removeAttribute("style");
}

// Update Source
function updateSource(srcType, key="source", srcData=""){

    // Block element helper
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

    // init
    const el_def = document.getElementById(`${key}_def`);
    const el_menu = document.getElementById(`${key}_menu`);
    const el_text_name = `${key}_text`;
    const el_file_name = `${key}_file`;
    const el_drop_name = `${key}_dropdown`;

    // reset and block text, file, dropdown element if name "default"
    if (srcType==='default'){
        el_def.setAttribute("style", "cursor: auto");
        sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "none", "none"] );

    } else {
        
        // block the default element
        if (el_def) {
            el_def.setAttribute("style", "display: none");
        };
        
        // RTSP
        if (srcType==='RTSP'){
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["block", "none", "none"] );
            if (srcData!==""){
                document.getElementById(el_text_name).value = srcData;
            }

        // Video and Image
        } else if (srcType==='Video' || srcType==='Image'){
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "block", "none"] );
            if (srcData!==""){
                let srcDataArr = srcData.split('/');
                console.log(srcDataArr);
                document.getElementById(el_file_name).textContent = srcDataArr[srcDataArr.length-1];
            }
        
        // V4L2
        } else if (srcType==='V4L2') {
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "none", "block"] );
            if (srcData!==""){
                el_menu.innerText = srcData;
            }
        }
    }
}

// Update Source Type
function updateSourceType(key="source_type", data=""){
    
    let srcTypeList = ['V4L2', 'Video', 'Image', 'RTSP'];
    let el_list = document.getElementById(`${key}_list`);
    let el_menu = document.getElementById(`${key}_menu`);
    
    if (data===""){
        console.log(`Add the source type (${srcTypeList})`);
        for(let step=0; step<srcTypeList.length; step++){
            el_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" name=${ srcTypeList[step] } >${ srcTypeList[step] }</a>`;
        }
    } else {
        if (data.includes('Video')){ 
            el_menu.textContent='Video';
        } else if (data.includes('V4L2')) {
            el_menu.textContent='V4L2';
        } else if (data.includes('RTSP')) {
            el_menu.textContent='RTSP';
        } else if (data.includes('Image')) {
            el_menu.textContent='Image';
        } else {
            console.log('Error in update source type')
        };
    }

}

// Update V4L2 list
function updateSourceV4L2(key="input_source"){
    console.log(`Update v4l2, element:${key}`);
    
    let el_source_list = document.getElementById(`${key}_list`);
    
    $.ajax({
        url: SCRIPT_ROOT + `/v4l2`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            if (Array.isArray(data)) {
                data.forEach((v, i) => {
                    el_source_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" value="${v}">${v}</a>`;
                });
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in capture input source");
        },
    });

}

// Update GPU information
function updateGPU(el_key="device"){
    console.log(`Update gpu device, element:${el_key}`);    
    let el_device_list = document.getElementById(`${el_key}_list`);
    
    $.ajax({
        url: SCRIPT_ROOT + `/device`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            for (const key of Object.keys(data)) {
                const deviceName = data[key]['name'];
                el_device_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${el_key}" value="${deviceName}}">${deviceName}</a>`;
            };
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in capture device");
        },
    });
}

// ==================================================================
// Behavior

// Add Task
function addSubmit() {
    console.log('ADD a task');
    // {
    //     "name": "test_from_added_task",
    //     "application": "counting_number":string,
    //     "model": "resnet50.engine",
    //     "device": "NVIDIA GeForce GTX 1050 Ti",
    //     "source": "/dev/video0",
    //     "source_type": "V4L2",
    //     "thres": 0.7
    // }
    
    // Collection the related data from ADD modal
    let data = {
        name: document.getElementById("name").value,
        thres: document.getElementById("thres").value,
        model: document.getElementById("model_menu").innerText,
        application: document.getElementById("model_app_menu").innerText,
        source_type: document.getElementById("source_type_menu").innerText,
        device: document.getElementById("device_menu").innerText,
    };

    // Create and append information
    let form_data = new FormData();
    for ( let key in data ) {
        console.log(`${key}:${data[key]}`);
        form_data.append(key, data[key]);
    };

    // Check and append source data
    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("input_source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    // Sending data via web api ( /add )
    console.log(`Sending data: ${form_data}`);
    $.ajax({
        url: SCRIPT_ROOT + '/add',
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

// Edit Task
function editSubmit(obj) {
    // {
    //     "name": "test_from_added_task",
    //     "application": "counting_number": string,
    //     "model": "resnet50.engine",
    //     "device": "NVIDIA GeForce GTX 1050 Ti",
    //     "source": "/dev/video0",
    //     "source_type": "V4L2",
    //     "thres": 0.7
    // }
    console.log(`EDIT a task`);
    // Collection the related data from ADD modal
    let data = {
        name: document.getElementById("edit_name").value,
        thres: document.getElementById("edit_thres").value,
        application: document.getElementById("edit_model_app_menu").innerText,
        source_type: document.getElementById("edit_source_type_menu").innerText,
        device: document.getElementById("edit_device_menu").innerText,
    };

    // Create and append information
    let form_data = new FormData();
    for ( let key in data ) {
        console.log(`${key}:${data[key]}`);
        form_data.append(key, data[key]);
    };
    
    // Check and append source data
    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("input_source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    // Sending data via web api ( /add )
    console.log(`Sending data: ${form_data}`);
    $.ajax({
        url: SCRIPT_ROOT + `/edit/${obj.value}`,
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {
            console.log(data);
            setEditDefaultModal();
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("edit error");
        },
    });
}

// Delete Task
function delSubmit(obj) {
    console.log('delete the application')
    const uuid = document.getElementById("del_uuid").textContent;
    let data = { "uuid": uuid };
    console.log(`Remove application ${uuid}`);
    $.ajax({
        url: SCRIPT_ROOT + "/remove/",
        data: JSON.stringify(data),
        type: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        success: function (data, textStatus, xhr) {
            console.log(data);
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("edit error");
        },
    });
}

// ==================================================================
// Dialog Modal

// Capture error message via calling web api ( /task/<uuid>/error )
function errModalEvent(obj) {
    console.log(`Open "ERROR" modal`);
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

// Add related information when open the ADD modal
function addModalEvent() {
    console.log(`Open "ADD" modal`);
    clearModalDropdown();
    updateGPU("device");
    updateSourceType("source_type");
    updateModel("model_list");
    updateSourceV4L2("input_source");
    document.getElementById("model_menu").disabled = false;
    document.getElementById("model_app_menu").disabled = false;
    document.getElementById("device_menu").disabled = false;
    setDefaultModal();
}

// Add related information when open the EDIT modal
function editModalEvent(obj) {
    console.log(`Open "EDIT" modal`);

    clearModalDropdown("edit");
    updateGPU("edit_device");
    updateSourceV4L2("edit_input_source");

    $.ajax({
        url: SCRIPT_ROOT + `/task/${obj.id}/info`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            document.getElementById("edit_name").value = data["name"];
            // update source type and source
            updateSourceType("edit_source_type", data["source_type"]);
            // change source
            document.getElementById("edit_source_def").textContent = data["source"];
            // update model information and disable it
            document.getElementById("edit_model_menu").textContent = data["model"];
            document.getElementById("edit_model_menu").disabled = true;
            // model_app
            // NOTICE!!!!!!! must add application choice in here....
            document.getElementById("edit_model_app_menu").disabled = true;
            document.getElementById("edit_model_app_menu_def").style.display = 'none';
            document.getElementById("edit_model_app_menu").removeAttribute('style');
            document.getElementById("edit_model_app_menu").textContent = data["application"]["name"];
            // update device information 
            document.getElementById("edit_device_menu").textContent = data['device'];
            document.getElementById("edit_device_menu").disabled = true;
            // update threshold
            document.getElementById("edit_thres").value = data['thres'];
            // set the value of the submit button to uuid
            document.getElementById("modal_edit_submit").value = obj.id;
            
        }
    });
}

// Add related information when open the IMPORT modal
function importModalEvent() {
    console.log(`Open "IMPORT" modal`);

    clearModalDropdown("import");
    updateGPU("import_device");
    updateSourceType("import_source_type");
    updateSourceV4L2("import_input_source");
    
    document.getElementById("import_model_app_menu").disabled = false;
    document.getElementById("import_device_menu").disabled = false;
    
    setDefaultModal();
}

// Double check and show information modal when deleting the task
function delModalEvent(obj) {
    const uuid = obj.id;
    const name = document.getElementById(`${uuid}_name`).textContent;

    console.log(`User want to delete application ${name}, which uuid is ${uuid}`)
    document.getElementById("del_content").textContent = `The application ( ${name} , ${uuid} ) will be delete`;
    document.getElementById("del_uuid").textContent = uuid;
}
