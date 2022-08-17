/*

Parameters from common.js

- DOMAIN        : IP Address
- PORT          : Port Number
- SCRIPT_ROOT   : Full IP Address with Port

*/

// Define global variable "model_app_map", it will updated by updateModel
let model_app_map;   
let model_task_map;  
let trg_model_name;
let trg_task_uuid;

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

async function addStreamHref(uuid){
    const url = await getDocURL();
    const eleTaskName = document.getElementById(`${uuid}_name`);
    eleTaskName.href=`${url}/task/${uuid}/stream`;
    eleTaskName.setAttribute("onclick", `streamStart("${uuid}");`);
}

async function rmStramHref(uuid){
    const eleTaskName = document.getElementById(`${uuid}_name`);
    eleTaskName.removeAttribute("href");
    eleTaskName.removeAttribute("onclick");
}

// Control the status button
function statusEvent(uuid, stats, debug=false){

    const name    = document.getElementById(`${uuid}_name`).textContent;
    const run     = 'run';
    const stop    = 'stop';
    const error   = 'error';

    const statsButton = document.getElementById( `${uuid}_status_btn`);
    const optionButton = document.getElementById(`${uuid}_more`);
    const launchButton = document.getElementById(`${uuid}_switch`)
    
    if (debug === true) console.log(`- ${name} (${uuid}) is ${stats}`);
    
    if(stats === run){
        
        statsButton.innerText = run;
        statsButton.setAttribute("class", "btn btn-green custom");
        addStreamHref(uuid);
        disableButton(optionButton);

    } else if ( stats === stop ) {
        
        statsButton.innerText = stop;
        statsButton.setAttribute("class", "btn btn-gray custom");
        rmStramHref(uuid);
        enableButton(optionButton);

    } else if ( stats === error ) {
        
        statsButton.innerText = error;
        statsButton.setAttribute("class", "btn btn-red custom");
        addErrorHref(uuid);
        disableButtonParent(launchButton);
    };
}

// Setting up error name link when the task is unavailable
function addErrorHref(uuid){
    const ele = document.getElementById(`${uuid}_name`);
    ele.setAttribute("class"        , "err-name");
    ele.setAttribute("data-toggle"  , "modal");
    ele.setAttribute("data-target"  , "#errModal");
    ele.setAttribute("onclick"      , "errModalEvent(this);");
}

// ==================================================================
// Testing
function atLeastOneRadio() {
    var radios = document.querySelectorAll('.app-opt:checked');
    var value = radios.length>0 ? radios.length: 0;
    document.getElementById("label_list_menu").textContent = `Select ${value} Labels`
    console.log(checkLabelFunction());
}

// check function
function checkLabelFunction() {

    let a, i, depend_on=[], checkboxes;
    
    div = document.getElementById("label_list");
    optDiv = div.getElementsByTagName("div");
    a = div.getElementsByTagName("a");
    checkboxes = div.getElementsByClassName("app-opt");
    
    for (i = 0; i < checkboxes.length; i++) {
        if ( checkboxes[i].checked ){
            if(a[i+1].innerText !== "Select All"){
                depend_on.push( a[i+1].innerText );    
    }}}

    return depend_on;
}

// ==================================================================
// Set Default Modal

// Set default value on Add Modal
function setDefaultModal(){
    document.getElementById("name").placeholder = "Ex. Defect detection";
    document.getElementById("thres").value = 0.9;
    updateSource('default', 'source');

    try {
        document.getElementById("model_app_menu").setAttribute("style", "display: none");
        document.getElementById("model_app_menu_def").setAttribute("style", "cursor: auto");    
    } catch ( error ){
        console.log(error);
    }

    document.getElementById("custom_file_label").textContent = "Choose file";
    document.getElementById("model_menu").textContent = "Please select one";
    document.getElementById("source_type_menu").textContent = "Please select one";
    document.getElementById("device_menu").textContent = "Please select one";
}

// Set default value on ap 
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
    
    updateSource("default", "import_source", "");
    // document.getElementById("import_model_app_menu").setAttribute("style", "display: none");
    // document.getElementById("import_model_app_menu_def").setAttribute("style", "cursor: auto");
    document.getElementById("import_model_app_menu").setAttribute("style", "cursor: auto");
    document.getElementById("import_model_app_menu_def").setAttribute("style", "display: none");

    // document.getElementById("import_model_file_label").textContent = "Choose file";
    // document.getElementById("import_label_file_label").textContent = "Choose file";
    // document.getElementById("import_config_file_label").textContent = "Choose file";
    document.getElementById("import_zip_model_label").textContent = "Choose file";

    // document.getElementById("import-model-file-uploader").value = null;
    // document.getElementById("import-label-file-uploader").value = null;
    // document.getElementById("import-config-file-uploader").value = null;
    document.getElementById("import-zip-file-uploader").value = null;

    // document.getElementById("import_model_menu").textContent = "Please select one";
    document.getElementById("import_source_type_menu").textContent = "Please select one";
    document.getElementById("import_device_menu").textContent = "Please select one";
    
    document.getElementById("import_thres").value = 0.9;
}

// ==================================================================
// Update & Control Dialog ( Modal )

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
    else if ( srcKey.includes("source_type")) {

        if (srcKey.includes("model")) {
            updateModelSource(srcType )
        }else{
            updateSource(srcType, trgKey, "");
        }
    }
    else if ( srcKey.includes("model_app")) {
        if (srcType.includes('area')) {
            setArea( document.getElementById("modal_app_submit").value );
        } else {
            document.getElementById("area_div").style = "display: none";
        };
    }
    ;
}

// Clear modal dropdown
function clearModalDropdown(key=""){
    console.log(`Clear ${key} modal drop down item ...`);
    if(key!==""){
        key=`${key}_`;
    }
    let keyList = [ `${key}model_list`, `${key}model_app_list`, `${key}source_type_list`, `${key}model_source_type_list`, `${key}source_list`, `${key}device_list` ];
    keyList.forEach( function(val, idx){
        const el = document.getElementById(val);
        if(el){
            document.getElementById(val).innerHTML = "";
        } else {
            console.log("Could not found the element: ", val);
        }
    });
}

function getModelApp(key){
    $.ajax({
        url: SCRIPT_ROOT + `/model_app`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            let el = document.getElementById(`${key}`);
            model_app_map = data;
            console.log(model_app_map);

            if(key!==""){
                for (const key of Object.keys(data)) {
                    el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="model" name="${key}">${key}</a>`;
                };
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in model_app");
        },
    });
}

function getTaskModel(key){
    $.ajax({
        url: SCRIPT_ROOT + `/model`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            let el = document.getElementById(`${key}`);
            model_task_map = data;
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in model");
        },
    });
}

// Add Model arguments and update the "model_app_map" ( global variable )
function updateModel(key=""){

    console.log(`Update model, element:${key}`);
    getModelApp(key);
    getTaskModel(key);
}

// Update Model and Application
function updateModelApp(eleKey, appKey){
    /*
        Update Model and Application
        - Args
            - eleKey: choose target elements, if is add mode it will be "", edit mode will be "edit"
            - appKey: appKey is the model you choose.
     */
    
    // Get taget element
    const appName = `${eleKey}_app`
    const appListName = `${appName}_list`;
    const appMenuName = `${appName}_menu`;
    const appDefNmae = `${appMenuName}_def`;
    
    const appList = document.getElementById(appListName);
    const appMenu = document.getElementById(appMenuName);

    // Show LOG
    console.log(`Update model application.\n
    * Element   : ${eleKey},
    * Model     : ${appKey},
    * 
    * Show Dropdown (${appMenuName}), set ${appDefNmae} display to none
    * 
    * `);

    // Display
    try { 
        document.getElementById(appDefNmae).style = "display: none";
        appMenu.style = "display: block";
        // appMenu.removeAttribute("style");
    } catch ( error ) {
        console.log("Error: ", error);
    }

    
    // Update dropdown items
    if ( appKey in model_app_map){
        // Clear and set default
        appList.innerHTML   = "";
        appMenu.textContent = "Please select one";
        console.log(model_app_map);
        
        model_app_map[appKey].forEach(function(item, i){
            appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
        });
    }
}

// Update Source
function updateSource(srcType, key="source", srcData=""){

    // Block element helper
    function sourceTypeEvent(typeList, typeStatus){
        if (typeList.length !== typeStatus.length){
            console.log("error in control source type");
        } else {
            for(let step=0; step<typeList.length; step++){
                document.getElementById(typeList[step]).style.display = typeStatus[step];
            }
        }
    }

    // init
    const el_def = document.getElementById(`${key}_def`);
    const el_menu = document.getElementById(`${key}_menu`);
    const el_text_name = `${key}_text`;
    const el_file_name = `${key}_file`; 
    const el_file_label_name = `${el_file_name}_label`;
    const el_drop_name = `${key}_dropdown`;
    const el_drop_menu = `${key}`

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
                document.getElementById(el_file_label_name).textContent = srcDataArr[srcDataArr.length-1];
                document.getElementById(el_file_label_name).value = srcData;
            }
        
        // V4L2
        } else if (srcType==='V4L2') {
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "none", "block"] );
            updateSourceV4L2(`${key}`);
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
    
    
    console.log(`Add the source type (${srcTypeList})`);
    for(let step=0; step<srcTypeList.length; step++){
        el_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" name=${ srcTypeList[step] } >${ srcTypeList[step] }</a>`;
    }
    if (data!=="") {
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

// Update Model
function updateModelSource(srcType){

    const eleModelSrcDef = document.getElementById("model_def");
    const eleModelSrcURL = document.getElementById("import_url_model");
    const eleModelSrcZIP = document.getElementById("import_zip_model");
    const eleModelSrcExist = document.getElementById("model_dropdown");

    const eleModelList = [ eleModelSrcDef, eleModelSrcURL, eleModelSrcZIP, eleModelSrcExist ];

    for( let i=0; i<eleModelList.length; i++){
        eleModelList[i].style = "display: none";
    }

    if(srcType.includes("Exist")){
        eleModelSrcExist.style = "display: block";
    } else if (srcType.includes("ZIP")) {
        eleModelSrcZIP.style = "display: block";
        document.getElementsByName("bt_modal_app")[0].value = "Import";
    } else if (srcType.includes("URL")) {
        eleModelSrcURL.style = "display: block";
        document.getElementsByName("bt_modal_app")[0].value = "Import";
    }

}

// Update Model Source Type
function updateModelSourceType(key="model_source_type", data=""){
    
    let srcTypeList = ['From Exist Model', 'Import ZIP File', 'Enter The URL'];
    let el_list = document.getElementById(`${key}_list`);
    let el_menu = document.getElementById(`${key}_menu`);
    
    console.log(`Add the model source type (${srcTypeList})`);
    for(let step=0; step<srcTypeList.length; step++){
        el_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" name=${ srcTypeList[step] } >${ srcTypeList[step] }</a>`;
    }
}


// Update V4L2 list
function updateSourceV4L2(key="source"){
    console.log(`Update v4l2, element:${key}`);
    
    const el_source_menu = document.getElementById(`${key}_menu`);
    const el_source_list = document.getElementById(`${key}_list`);

    el_source_menu.disabled = false;
    el_source_list.innerHTML = "";

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
            alert(xhr.responseText);
            el_source_menu.disabled = true;
        },
    });

}

// Update GPU information
function updateGPU(el_key="device"){
    console.log(`Update gpu device, element:${el_key}`);   
    
    const el_device_menu = document.getElementById(`${el_key}_menu`);
    const el_device_list = document.getElementById(`${el_key}_list`);
    
    $.ajax({
        url: SCRIPT_ROOT + `/device`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {

            for (const key of Object.keys(data)) {
                const deviceName = data[key]['name'];
                el_device_menu.textContent = deviceName;
                el_device_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${el_key}" value="${deviceName}}">${deviceName}</a>`;
            };

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in capture device");
        },
    });
}

// ===============================================s===================
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
    console.log(document.getElementById("app_info").innerText);
    let data = {
        name: document.getElementById("name").value,
        thres: document.getElementById("thres").value,
        model: document.getElementById("model_menu").innerText,
        application: {},
        source_type: document.getElementById("source_type_menu").innerText,
        device: document.getElementById("device_menu").innerText,
    };

    // Update application
    data["application"] = JSON.stringify({
        name: document.getElementById("model_app_menu").innerText,
        area_points: `[ ${document.getElementById("app_info").innerText} ]`,
        depend_on: JSON.stringify(checkLabelFunction()),
    });

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
        form_data.append( "source", document.getElementById("source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
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
            alert(xhr.responseText);
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
        application: {},
        source_type: document.getElementById("edit_source_type_menu").innerText,
        device: document.getElementById("edit_device_menu").innerText,
    };

    // Update application
    data["application"] = JSON.stringify({
        name: document.getElementById("edit_model_app_menu").innerText,
        area_points: `[ ${document.getElementById("app_info").innerText} ]`,
        depend_on: JSON.stringify(checkLabelFunction()),
    });

    // Create and append information
    let formData = new FormData();
    for ( let key in data ) {
        console.log(`${key}->${data[key]}`);
        formData.append(key, data[key]);
    };
    // Check and append source data
    if (data['source_type']=='RTSP' ){
        formData.append( "source", document.getElementById("edit_source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('#edit-source-file-uploader');
        if( ele.files.length==0){
            formData.append( "source", document.getElementById("edit_source_file_label").value);
        } else {
            formData.append( "source", ele.files[0]);
        }
    } else {
        formData.append( "source", document.getElementById("edit_source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    for (const value of formData.values()) {
        console.log(value);
    }
      
    $.ajax({
        url: SCRIPT_ROOT + `/edit/${obj.value}`,
        data: formData,
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

// import task
function importSubmit() {
    console.log('Import a task');

    // Collection the related data from Import modal
    let data = {
        name: document.getElementById("name").value,
        thres: document.getElementById("thres").value,
        application: {},
        source_type: document.getElementById("source_type_menu").innerText,
        device: document.getElementById("device_menu").innerText,
    };

    // Update application
    data["application"] = JSON.stringify({
        name: document.getElementById("model_app_menu").innerText,
        area_points: `[ ${document.getElementById("app_info").innerText} ]`,
        depend_on: JSON.stringify(checkLabelFunction()),
    });

    // Create and append information
    let form_data = new FormData();
    for ( let key in data ) {
        form_data.append(key, data[key]);
    };

    // Check and append source data
    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        const ele = document.querySelector('[data-target="file-uploader"]');
        form_data.append( "source", ele.files[0])
    } else {
        form_data.append( "source", document.getElementById("source_menu").innerText.replace(/(\r\n|\n|\r)/gm, ""));
    };

    // Add other information: capture from /import_proc, it's the same with the return infor of /import_zip (web api)
    const eleZipDiv = document.getElementById('import_zip_model')
    const eleUrlDiv = document.getElementById('import_url_model')
    let file_name;
    if ( eleZipDiv.style.display==='block' ){
        file_name = eleZipDiv.textContent.trim().split(".")[0];
        console.log(eleZipDiv.textContent.trim());
        console.log(file_name);
    } else {
        file_name = eleUrlDiv.value;
    };
    

    $.ajax({
        url: SCRIPT_ROOT + '/import_proc',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'GET',
        success: function (data, textStatus, xhr) {
            console.log(data);
            let trg_data = data[file_name]["info"];
            form_data.append( "path", trg_data["path"] );
            form_data.append( "model_path", trg_data["model_path"] );
            form_data.append( "label_path", trg_data["label_path"] );
            form_data.append( "config_path", trg_data["config_path"] );
            form_data.append( "json_path", trg_data["json_path"] );
            form_data.append( "tag", trg_data["tag"] );
    
            // Sending data via web api ( /import )
            console.log("/import ");
            console.log("-----------------------------------");
            for(var pair of form_data.entries()) {
                console.log(pair[0]+ ', '+ pair[1]); 
            }

            $.ajax({
                url: SCRIPT_ROOT + '/import',
                data: form_data,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (data, textStatus, xhr) {
                    console.log(data);
                    setImportDefaultModal();
                    location.reload();
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert(`Import error: ${xhr.responseText}`);
                    location.reload();
                },
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            alert(`Extract error when convert import model: ${xhr.responseText}`);
            location.reload();
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

            console.log("Reload Page");
            location.reload();
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Remove error", xhr.responseText);
            alert(`Remove Task (${uuid}) Failed: \n${xhr.responseText}`);
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
function addModalEvent(init=false) {
    console.log(`Open "ADD" modal`);
    clearModalDropdown();
    updateGPU("device");
    updateModelSourceType();
    updateSourceType("source_type");
    updateModel("model_list");
    // updateSourceV4L2("source");

    document.getElementById("model_menu").disabled = false;

    document.getElementById("model_app_menu").disabled = false;
    document.getElementById("device_menu").disabled = false;
    if(init){
        setDefaultModal();
    }

    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.value = "Add"
    })
    
}

// Add related information when open the EDIT modal
function editModalEvent(obj) {
    console.log(`Open "EDIT" modal`);
    updateModel();
    clearModalDropdown("edit");
    updateGPU("edit_device");
    
    let task_uuid = obj.value;

    $.ajax({
        url: SCRIPT_ROOT + `/task/${task_uuid}/info`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {

            console.log(data);

            document.getElementById("edit_name").value = data["name"];
            // update source type and source
            updateSourceType("edit_source_type", data["source_type"]);

            // change source
            updateSource(data["source_type"], "edit_source", data["source"]);

            // update model information and disable it
            document.getElementById("edit_model_menu").textContent = data["model"];
            document.getElementById("edit_model_menu").disabled = true;
            
            // model_app
            // NOTICE!!!!!!! must add application choice in here....
            updateModelApp("edit_model", data["model"]);
            document.getElementById("edit_model_app_menu").textContent = data["application"]["name"];
            
            // update device information 
            document.getElementById("edit_device_menu").textContent = data['device'];
            document.getElementById("edit_device_menu").disabled = true;
            // update threshold
            document.getElementById("edit_thres").value = data['thres'];
            
            // set the value of the submit button to uuid
            // document.getElementById("modal_edit_submit").value = obj.id;
            document.getElementById("modal_app_submit").value = task_uuid;
            
        }
    });

    document.getElementById("modal_back_bt").setAttribute("onclick", `editModalEvent(this); return false;`);
    document.getElementById("modal_back_bt").value = task_uuid;

    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.value = "Edit"
    })
}

// Add related information when open the IMPORT modal
function importModalEvent() {
    console.log(`Open "IMPORT" modal`);

    clearModalDropdown("import");
    updateGPU("import_device");
    updateModel();
    updateSourceType("import_source_type");
    // updateSourceV4L2("import_source");

    document.getElementById("import_model_app_menu").disabled = false;
    document.getElementById("import_device_menu").disabled = false;
    
    setImportDefaultModal();
    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.value = "Import"
    })
}

// Double check and show information modal when deleting the task
function delModalEvent(obj) {
    const uuid = obj.id;
    const name = document.getElementById(`${uuid}_name`).textContent;

    console.log(`User want to delete application ${name}, which uuid is ${uuid}`)
    document.getElementById("del_content").textContent = `The application ( ${name} , ${uuid} ) will be delete`;
    document.getElementById("del_uuid").textContent = uuid;
}

function appModalEvent(mode='Add', needArea=false){
    /*
        Application Setting Event

        - Args
            - mode: define mode to capture target element
            - needArea: legacy argument
        
        
    */
    let trg_mode = "";
    let app_menu_name = "model_app_menu";
    let model_name = "model_menu"

    // Check label
    const el_app_name = document.getElementById("app_name");

    // Update Button and related function : Add , Edit, Import
    // src_bt value will be change when open the Add, Edit, Import dialog.
    const src_bt = document.getElementsByName("bt_modal_app")[0];
    const trg_bt = document.getElementById("modal_app_submit");
    const back_bt = document.getElementById("modal_back_bt");

    
    // Add
    if (src_bt.value === "Add"){
        console.log("Setting Add button");
        trg_mode = "";
        // el_app_name.value = document.getElementById(`${trg_mode}${app_menu_name}`).textContent;
        trg_model_name = document.getElementById(`${trg_mode}${model_name}`).textContent;

        trg_bt.textContent = src_bt.value;
        trg_bt.setAttribute("data-dismiss", "modal");
        trg_bt.setAttribute("onclick", "addSubmit()");
        trg_bt.value = mode;

        back_bt.setAttribute("data-dismiss", "modal");
        back_bt.setAttribute("data-toggle", "modal");
        back_bt.setAttribute("data-target", "#addModal");
        
        back_bt.setAttribute("onclick", "addModalEvent(); return false;");

        eleModelId      = "model"
        eleModel        = document.getElementById("model_menu");
        eleModelApp     = document.getElementById("model_app_menu")
        modelName       = eleModel.textContent;
        modelAppName    = eleModelApp.textContent;

        updateModelApp(eleModelId, modelName);
        eleModelApp.textContent = modelAppName;

    // Edit
    }else if (src_bt.value === "Edit"){
        
        console.log("Setting Edit button");
        trg_mode = "edit_";
        el_app_name.value = document.getElementById(`${trg_mode}${app_menu_name}`).textContent;
        trg_model_name = document.getElementById(`${trg_mode}${model_name}`).textContent;

        trg_bt.textContent = src_bt.value;
        trg_bt.setAttribute("data-dismiss", "modal");
        trg_bt.setAttribute("onclick", "editSubmit(this)");

        back_bt.setAttribute("data-dismiss", "modal");
        back_bt.setAttribute("data-toggle", "modal");
        back_bt.setAttribute("data-target", "#editModal");
        
        back_bt.setAttribute("onclick", "editModalEvent(this); return false;");
    
        // Import
    }else if (src_bt.value === "Import"){
        console.log("Setting Import button");
        trg_mode = "import_";
        // el_app_name.value = document.getElementById(`${trg_mode}${app_menu_name}`).textContent;
        // trg_model_name = document.getElementById(`${trg_mode}${model_name}`).textContent;

        trg_bt.textContent = src_bt.value;
        trg_bt.setAttribute("data-dismiss", "modal");
        trg_bt.setAttribute("onclick", "importSubmit()");

        back_bt.setAttribute("data-dismiss", "modal");
        back_bt.setAttribute("data-toggle", "modal");
        back_bt.setAttribute("data-target", "#addModal");
        
        back_bt.setAttribute("onclick", "addModalEvent(); return false;");
    }

    // Update label
    if (src_bt.value !== "Import"){
        // Update depend_on
        const appOptList = document.getElementById("label_list");
        
        // Clear dropdown-div
        document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
            ele.remove();
        })

        $.ajax({
            url: SCRIPT_ROOT + `/model`,
            type: "GET",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                console.log(data, trg_model_name);
                model_task_map = data;
                trg_task_uuid = model_task_map[trg_model_name][0];
                console.log(`Similar Task UUID: ${trg_task_uuid}`)
                $.ajax({
                    url: SCRIPT_ROOT + `/task/${trg_task_uuid}/label`,
                    type: "GET",
                    dataType: "json",
                    success: function (data, textStatus, xhr) {

                        for(let i=0; i<data.length; i++){
                            appOptList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
                                '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
                                `<a class="app-opt-text">${data[i]}</a>` +
                                '</div>'
                            document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
                        }
                    }
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("Error in model");
            },
        });
    }

}

function setArea(trg_mode=""){
    
    trg_mode = trg_mode.toLowerCase();

    if (trg_mode==='add'){
        console.log("ADDDDDDDDD");
        trg_mode = "";
    }

    console.log("Update Area Setting");

    document.getElementById("area_div").style.display = "block";

    let appCanvas = document.getElementById("app_canvas");
    let appFrame = document.getElementById("app_frame");
    let appCtx = appCanvas.getContext("2d");
    let appScale = document.getElementById("app_scale");
    let img = new Image();
    let imgHeight;
    let imgWidth;
    let imgScale;
    let imgRate;

    // Create and append information
    
    // Get source type
    let data = { source_type: document.getElementById(`${trg_mode}source_type_menu`).innerText };
    
    // Update source uploader
    let srcLoader = "file-uploader"
    if (trg_mode.includes("edit")){
        srcLoader = `edit-source-${srcLoader}`;
    } else if (trg_mode.includes("import")){
        srcLoader = `import-source-${srcLoader}`;
    }

    let form_data = new FormData();
    for ( let key in data ) form_data.append(key, data[key]);

    // Check and append source data
    if (data['source_type']=='RTSP' ){
        form_data.append( "source", document.getElementById("source").value);
    } else if (data['source_type']=='Video' || data['source_type']=='Image') {
        
        const ele = document.querySelector(`[data-target="${srcLoader}"]`);
        if( ele.files.length==0){
            form_data.append( "source", document.getElementById("edit_source_file_label").value);
        } else {
            form_data.append( "source", ele.files[0]);
        }

    } else {
        form_data.append( "source", document.getElementById(`${trg_mode}source_menu`).innerText.replace(/(\r\n|\n|\r)/gm, ""));
        console.log(document.getElementById(`${trg_mode}source_menu`).innerText);
    };

    // Display the key/value pairs
    for (var pair of form_data.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }
    $.ajax({
        url: SCRIPT_ROOT + '/update_src',
        data: form_data,
        processData: false,
        contentType: false,
        type: 'POST',
        success: function (data, textStatus, xhr) {

            imgHeight = data["height"];
            imgWidth = data["width"];

            // setup canvas width and height
            imgRate = imgHeight/imgWidth;
            appCanvas.height = appCanvas.width*imgRate;

            // load image
            img.src="data:image/jpeg;base64,"+data["image"];
            appCanvas.style.backgroundImage = `url(${img.src})`;

            // calculate scale
            console.log(`Canvas width: ${appCanvas.style.width}`);
            appScale.textContent = appCanvas.width/imgWidth;

            console.log(`H:${imgHeight}, W:${imgWidth}, Ratio:${imgRate}`);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Update source error");
            console.log(xhr);
            console.log(xhr.responseJSON);
        },
    });
}


async function getPlatform(){
    
    const data = await $.ajax({  
        type: "GET",
        url: SCRIPT_ROOT + "/platform",
        dataType: "json",
        error: logError
    });

    if (data) return data.toUpperCase();
    else return undefined;
    
}

async function defineLaunchButton(){
    // When switch change
    $('.switch-custom :checkbox').change(function(){
        
        const eventTarget = this;
        let stats = ( eventTarget.checked ? 'run' : 'stop' )
        const uuid = eventTarget.value
    
        // Loading
        document.getElementById( `${uuid}_status_btn`).innerText = 'loading';
        document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-gray custom");
        
        // Freeze switch button
        eventTarget.disabled = true;
        const parentTarget = eventTarget.parentElement;
        parentTarget.style = `pointer-events: none; opacity: ${DISABLE_OPACITY};`;


        // run app or stop appdefineLaunchButton
        $.ajax({  
            type: 'GET',
            url: SCRIPT_ROOT + `/task/${uuid}/${stats}`,
            dataType: "json",
            success: function (data, textStatus, xhr) {
                console.log(`${data}`);
                eventTarget.disabled = false;
        
                
                parentTarget.style = `pointer-events: all; opacity: ${ENABLE_OPACITY};`;
                statusEvent(uuid, stats);
                
            },
            error: function (xhr, textStatus, errorThrown) {
                
                document.getElementById( `${uuid}_status_btn`).setAttribute("class", "btn btn-red custom")
                document.getElementById(`${uuid}_switch`).checked = false;
                rmStramHref(uuid);
                
                console.log('Run application error ... stop application')
                const err = xhr.responseJSON;
                console.log(err);
                stopTask(uuid);
                
                statusEvent(uuid, 'error');
                // errNameEvent(uuid);
                // alert(err);
            },
        });
    });
}

async function checkTaskStatus() {
    // Get all check box of AI task
    let ele = Array.from(document.querySelectorAll('input[type=checkbox]'));
    
    for ( let i=0; i<ele.length; i++){
        if ( ! ele[i].id.includes("_switch") ) ele.splice(i, 1);
    }
    console.log(`Found ${ele.length} AI Tasks ...`)

    // Get each AI Task's status
    for(let i=0; i<ele.length; i++){
        
        const uuid = ele[i].value;
        
        if ( uuid === "" && uuid.length<=6 ) continue

        const data = await getAPI(`/task/${uuid}/status`)
        if (data) {
            let stats = data;
            if ( stats==='run') ele[i].checked = true;
            else ele[i].checked = false;
            statusEvent(uuid, stats, debug=true); 
        }
    }
}

// ==================================================================
// Start Up

// Setting up when start the web demo up
let isCheckedAll = true;
$(document).ready( async function () {

    // Capture the platform
    const pla = await getPlatform();
    if (pla) document.getElementById("title_framework").textContent = `( ${pla} )`
    
    checkTaskStatus()

    defineLaunchButton()

});
