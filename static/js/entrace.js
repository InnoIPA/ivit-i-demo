/*

Parameters from common.js

- DOMAIN        : IP Address
- PORT          : Port Number
- SCRIPT_ROOT   : Full IP Address with Port

*/

// Start streaming when press the name superlink
async function streamStart(uuid){
    const data = await getAPI(`/task/${uuid}/stream/start`, errType=ALERT);
    if(data) console.log(data);
    else return undefined;
}

// Stop task when turn off the swich
async function stopTask(uuid){

    const stopStreamLog = await getAPI(`/task/${uuid}/stream/stop`, ALERT)
    if(stopStreamLog) console.log(stopStreamLog);
    else return undefined;

    const stopTaskLog = await getAPI(`/task/${uuid}/stop`, ALERT)
    if(stopTaskLog) console.log(stopTaskLog);
    else return undefined;
}

// Add superlink when task is avaible
async function addStreamHref(uuid){
    const url = await getDocURL();
    const eleTaskName = document.getElementById(`${uuid}_name`);
    eleTaskName.href=`${url}`+`task/${uuid}/stream`;
    eleTaskName.setAttribute("onclick", `streamStart("${uuid}");`);
}

async function rmStramHref(uuid){
    const eleTaskName = document.getElementById(`${uuid}_name`);
    eleTaskName.removeAttribute("href");
    eleTaskName.removeAttribute("onclick");
}

// Control the status button
let statusDict = [];
async function statusEvent(uuid, stats, debug=false){

    const name    = document.getElementById(`${uuid}_name`).textContent;

    const statsButton = document.getElementById( `${uuid}_status_btn`);
    const optionButton = document.getElementById(`${uuid}_more`);
    const launchButton = document.getElementById(`${uuid}_switch`);
    
    if (debug === true) console.log(`- ${name} (${uuid}) is ${stats}`);
    
    if(stats === RUN){
        
        statsButton.innerText = RUN;
        statsButton.setAttribute("class", "btn btn-green custom");
        
        // Start the stream
        streamStart(uuid);
        await addWebRTC(uuid, `rtsp://127.0.0.1:8554/${uuid}`);
        statusDict.push(uuid);

        addStreamHref(uuid);
        disableButton(optionButton);

    } else if ( stats === STOP ) {
        
        statsButton.innerText = STOP;
        statsButton.setAttribute("class", "btn btn-gray custom");

        if(statusDict.includes(uuid) ){
            
            delWebRTC(uuid);
            statusDict.pop[uuid];
        }

        rmStramHref(uuid);
        enableButton(optionButton);

    } else if ( stats === ERROR ) {
        
        statsButton.innerText = ERROR;
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

// check function
async function checkLabelFunction() {

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

// search function
async function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("label_list");
    a = div.getElementsByTagName("a");
    optDiv = div.getElementsByTagName("div");

    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            optDiv[i].setAttribute('style', '');
        } else {
            optDiv[i].setAttribute('style', 'display:none !important');
        }
    }
}

// Set Default Modal
function setDefaultContent(eleName, content){
    document.getElementById(eleName).textContent = content;
    document.getElementById(eleName).value = "";
}

async function setDefaultModal(){

    console.log("Set the Modal to Default Status");

    let head = ""
    if (window[MODE] == EDIT_MODE) head = "edit_";

    document.getElementById(`${head}name`).value = "";
    document.getElementById(`${head}name`).placeholder = "Ex. Defect detection";
    document.getElementById(`${head}thres`).value = 0.9;
    updateSourceOption(DEFAULT, `${head}source`);

    // Share items: Application Dialog 
    document.getElementById("model_app_menu").textContent = "";
    document.getElementById("model_app_menu").value = "";
    document.getElementById(`model_app_menu`).setAttribute("style", "display: none");
    document.getElementById(`model_app_menu_def`).setAttribute("style", "cursor: auto");    
    document.getElementById("custom_file_label").textContent = "Choose file";
    clearAppArea();

    // Other
    const defaultContent = "Please select one"
    setDefaultContent(`${head}model_source_type_menu`, defaultContent);
    setDefaultContent(`${head}model_menu`, defaultContent);
    updateModelSource();

    setDefaultContent(`${head}source_type_menu`, defaultContent)
    setDefaultContent(`${head}device_menu`, defaultContent)
    setDefaultContent(`${head}source_menu`, defaultContent)
    
    setDefaultContent("import_zip_model_label", "Choose file");

}

// Update & Control Dialog ( Modal )

function updateDropdownMenu(selectElement, selectContent){
    document.getElementById(`${selectElement}_menu`).textContent = `${selectContent}`;
    document.getElementById(`${selectElement}_menu`).value = `${selectContent}`;
}

// Select dropdown object event
function dropdownSelectEvent(obj) {
    
    // Combine the target key , split the _type
    const srcType = obj.innerText;
    const srcKey = obj.id;
    const srcKeyList = srcKey.split("_");
    const trgKey = srcKey.replace( `_${srcKeyList[srcKeyList.length-1]}`, "");
    
    // console.log(`Selected:\n* ID:${srcKey}\n* TEXT: ${srcType}\n* KEY:${trgKey}`);
    
    // Update drop down menu
    updateDropdownMenu(srcKey, srcType)
    
    if (srcKey === 'model') updateModelAppOption(srcKey, srcType);
    else if ( srcKey.includes("model_source_type")) updateModelSource(srcType );
    else if ( srcKey.includes("source_type")) updateSourceOption(srcType, trgKey, "");
    else if ( srcKey.includes("model_app")) updateAppItem(srcType);
    // else if ( srcKey.includes("logic")) updateLogicItem(srcType);
}

// Clear Dropdown Item
function clearDropdownItem(element){
    if(element) element.innerHTML = "";
    else console.log("Could not find the element: ", element );
}

// Clear modal dropdown
function clearModalDropdown(key=""){

    // console.log(`Clear ${key} modal drop down item ...`);

    if(key!=="") key=`${key}_`;
    let keyList = [ 
        `${key}model_list`, 
        `${key}model_app_list`, 
        `${key}source_type_list`, 
        `${key}model_source_type_list`, 
        `${key}source_list`, 
        `${key}device_list` 
    ];

    keyList.forEach( function(val, idx){
        clearDropdownItem(document.getElementById(val));
    });
}

// Add Model arguments and update the "window[MODEL_APP]" ( global variable )
function updateModelOption(key){
    if(key!==""){
        let el = document.getElementById(`${key}`);
        for (const key of Object.keys(window[MODEL_APP])) {
            el.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="model" name="${key}">${key}</a>`;
        };
    } else return(undefined);
}

// Update Model and Application
function updateModelAppOption(eleName, modelName, defaultApp){
    /*
        Update Model and Application
        - Args
            - eleName: choose target elements, if is add mode it will be "", edit mode will be "edit"
            - modelName: modelName is the model you choose.
     */
    
    console.log("Update Model App ...")

    // Get taget element
    const appName = `${eleName}_app`
    const appListName = `${appName}_list`;
    const appMenuName = `${appName}_menu`;
    const appDefNmae = `${appMenuName}_def`;
    
    const appList = document.getElementById(appListName);
    const appMenu = document.getElementById(appMenuName);

    // Display item
    document.getElementById(appDefNmae).style = "display: none";
    appMenu.style = "display: block";

    // Update dropdown items
    if ( modelName in window[MODEL_APP]){
        // Clear and set default
        appList.innerHTML   = "";
        appMenu.textContent = "Please select one";
        
        window[MODEL_APP][modelName].forEach(function(item, i){
            appList.innerHTML += `<a class="dropdown-item custom" 
            href="#" onclick="dropdownSelectEvent(this); return false;" 
            id="${appName}" name="${item}">${item}</a>
            `;
        });
    }

    // Update default text
    if (defaultApp) {
        appMenu.textContent = defaultApp;
        // updateAppItem(defaultApp);
    }
}

// Update Source
function updateSourceOption(srcType, key="source", srcData=""){

    // Block element helper
    function sourceTypeEvent(typeList, typeStatus){
        
        // Double Check
        if (typeList.length !== typeStatus.length){
            console.log("error in control source type");
            return undefined;
        }
        // Setup the status
        for(let step = 0; step < typeList.length; step++){
            document.getElementById(typeList[step]).style.display = typeStatus[step];
        }
    }

    // init
    const el_def = document.getElementById(`${key}_def`);
    const el_menu = document.getElementById(`${key}_menu`);
    const el_text_name = `${key}_text`;
    const el_file_name = `${key}_file`; 
    let el_file_label_name = "custom_file_label"

    if ( window[MODE]===EDIT_MODE) el_file_label_name = `${el_file_name}_label`;

    const el_drop_name = `${key}_dropdown`;

    let tempVar = ""
    if (window[MODE]===EDIT_MODE) tempVar = `edit-source-file-uploader`;
    else tempVar = `file-uploader`;
    const eleFileUploader = document.getElementById(tempVar);

    
    // reset and block text, file, dropdown element if name "default"
    if ( srcType===DEFAULT ){
        
        el_def.style = "pointer-events: none";
        sourceTypeEvent( 
            typeList    = [ el_text_name , el_file_name , el_drop_name ],
            typeStatus  = [ "none"       , "none"       , "none"] 
        );

    } else {
        
        // block the default element
        if (el_def) el_def.setAttribute("style", "display: none");
        
        // RTSP
        if (srcType===RTSP){
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["block", "none", "none"] );
            if (srcData!==""){
                document.getElementById(el_text_name).value = srcData;
            }

        // Video and Image
        } else if (srcType===VIDEO || srcType===IMAGE){
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "block", "none"] );   

            // Setup file uploader via accept
            if ( srcType === IMAGE ) eleFileUploader.setAttribute("accept", "image/png, image/bmp, image/jpeg, image/jpg") 
            else eleFileUploader.setAttribute("accept", "video/mp4, video/avi, video/wmv") 

            // Check if have the default value, like in Edit Mode
            if (srcData!==""){
                let srcDataArr = srcData.split('/');

                document.getElementById(el_file_label_name).textContent = srcDataArr[srcDataArr.length-1];
                document.getElementById(el_file_label_name).value = srcData;
            } else {
                document.getElementById(el_file_label_name).textContent = "Choose file";
                document.getElementById(el_file_label_name).value = "";
            }
        
        // USB Cam
        } else {
            sourceTypeEvent( [el_text_name, el_file_name, el_drop_name], ["none", "none", "block"] );
            updateSourceV4L2(`${key}`);
            if (srcData!==""){
                el_menu.innerText = srcData;
                el_menu.value = srcData;
            }
        }
    }
}

// Update Source Type
function updateSourceType(key="source_type", data=""){
    
    let srcTypeList = ['USB CAM', VIDEO, IMAGE, RTSP];
    let el_list = document.getElementById(`${key}_list`);
    let el_menu = document.getElementById(`${key}_menu`);
    
    
    console.log(`Add the source type (${srcTypeList})`);
    for(let step=0; step<srcTypeList.length; step++){
        el_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" name=${ srcTypeList[step] } >${ srcTypeList[step] }</a>`;
    }

    function setTextValue(ele, val){
        ele.textContent = val;
        ele.value = val;
    }

    if (data!=="") {
        if (data.includes(VIDEO)){ 
            setTextValue(el_menu, VIDEO);
        } else if (data.includes('V4L2')) {
            setTextValue(el_menu, 'USB CAM');
        } else if (data.includes(RTSP)) {
            setTextValue(el_menu, RTSP);
        } else if (data.includes(IMAGE)) {
            setTextValue(el_menu, IMAGE);
            
        } else {
            console.log('Error in update source type')
        };
    }

}

// Update Model
function updateModelSource(srcType){
    /*
    
    */
    const eleModelSrcDef = document.getElementById("model_def");
    const eleModelSrcURL = document.getElementById("import_url_model");
    const eleModelSrcZIP = document.getElementById("import_zip_model");
    const eleModelSrcExist = document.getElementById("model_dropdown");

    const eleModelList = [ eleModelSrcDef, eleModelSrcURL, eleModelSrcZIP, eleModelSrcExist ];


    for( let i=0; i<eleModelList.length; i++) eleModelList[i].style = "display: none";

    if(srcType===undefined){
        eleModelSrcDef.style = "display: block";
        return undefined;
    }

    if ( srcType.includes("Exist") ) {
        eleModelSrcExist.style = "display: block";

    } else {
        document.getElementsByName("bt_modal_app")[0].value = IMPORT_MODE;
        window[MODE] = IMPORT_MODE;

        if (srcType.includes("ZIP")) eleModelSrcZIP.style = "display: block";
        else if (srcType.includes("URL")) eleModelSrcURL.style = "display: block";
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

// About AI Task Behavior - START

// Get the source content, return { sourceType, sourceContent }
async function getSourceContent(){
    
    let sourceType, sourceContent;
    let head = "";
    let uploader = "file-uploader"

    // Update Name when Edit Mode
    if (window[MODE]===EDIT_MODE){
        head        = "edit_";
        uploader    = "edit-source-file-uploader"
    }

    // Check and append source data
    sourceType = document.getElementById(`${head}source_type_menu`).innerText;

    // RTSP
    if ( sourceType==RTSP ) sourceContent = document.getElementById(`${head}source`).value;
    
    // VIDEO and IMAGE
    else if (   sourceType==VIDEO || sourceType==IMAGE ) {
        
        const uploaderFiles = document.querySelector(`#${uploader}`).files;

        if (window[MODE] === EDIT_MODE && uploaderFiles.length === 0 ){
            // Maybe user don't want to change the source file
            // We will keep the source file name and send back to server
            sourceContent = document.getElementById("edit_source_file_label").value;
        }
        else sourceContent = uploaderFiles[0];
    } 

    // USB Cam
    else {
        sourceContent = document.getElementById(`${head}source_menu`)
                .innerText.replace(/(\r\n|\n|\r)/gm, "");
        sourceType = "V4L2"
    }

    return { sourceType, sourceContent }
}

// Parsing Application Information For Add, Edit Form
async function parseAppInfo(){
    console.log("Parsing Application Infomation from Website");

    const appName     = "name";
    const appDepend   = "depend_on";
    const appSens     = "sensitivity"
    const appArea     = "area_points";
    const appVector   = "area_vector";
    const appLogic    = "logic";
    const appThres    = "logic_thres";
    const appAlarm    = "alarm";
    let appData     = {};

    // Update application which on shared dialog
    appData[appName] = document.getElementById("model_app_menu").innerText;

    // Double Check
    if (appData[appName]==="Please select one") return undefined;

    const getAllLabels = await checkLabelFunction()
    appData[`${appDepend}`] = JSON.stringify( getAllLabels );

    // Condition ( Counting )
    const _logic      = document.getElementById('logic_menu').value;
    const _logicThres = document.getElementById('logic_thres').value;
    if ( _logic !== undefined && _logicThres !== '' ){
            appData[appLogic]   = _logic;
            appData[appThres]   = _logicThres; }

    // Alarm
    const _alarm = document.getElementById('app_alarm').value;
    if ( _alarm ) appData[appAlarm]   = _alarm;
    
    // Area Information
    const _retArea = await getRescaleAreaPoint();
    if(_retArea) appData[appArea] = _retArea;

    // Moving Direction 
    const _retVec = await getRescaleVectorPoint();
    if(_retVec) appData[appVector] = _retVec;

    // Sensitivity
    const _retSens = document.getElementById('sensitive_menu').value;
    if ( _retSens !== undefined && _retSens !== '' ){
        appData[appSens] = _retSens;
    }

    return JSON.stringify(appData)
}

// Parsing Information For Add, Edit Form
async function parseInfoToForm(){
    console.log("Parsing Information from Website");
    let head        = "";
    let uploader    = "file-uploader";
    
    if (window[MODE] === EDIT_MODE) {
        head        = "edit_";
        uploader    = "edit-source-file-uploader";
    }

    let data        = {};
    let formData    = new FormData();
    
    // Define Data Key
    const dName     = "name"
    const dThres    = "thres"
    const dModel    = "model"
    const dApp      = "application"
    const dSrc      = "source"
    const dSrcType  = "source_type"
    const dDevice   = "device"

    // Collection the related data from ADD modal
    data[dName]     = document.getElementById(`${head}name`).value;
    data[dThres]    = document.getElementById(`${head}thres`).value;
    data[dModel]    = document.getElementById(`${head}model_menu`).innerText;
    data[dDevice]   = document.getElementById(`${head}device_menu`).innerText;

    // Check and append source data
    let { sourceType, sourceContent } = await getSourceContent();
    data[dSrc]      = sourceContent;
    data[dSrcType]  = sourceType;

    // Application
    data[dApp]      = await parseAppInfo();

    // Create and append information
    console.log(data); 
    for ( const key in data ) { formData.append(key, data[key]); }
    console.log(formData);
    return formData;
}

// Add Task
async function addSubmit() {
    console.log('ADD a task');

    // Get formData from each element
    const formData = await parseInfoToForm();

    if(!formData) {
        alert("Not Setup Application");
        return undefined;
    } else {
        // Add data-target
    }

    // Add TASK
    const retData = await postAPI( `/add`, formData, FORM_FMT, ALERT )
    if(!retData) return(undefined);

    // If success
    hideModal("appModal");
    if(!DEBUG_MODE) location.reload();
    console.log(retData);
    setDefaultModal();        
}

// Edit Task
async function editSubmit(obj) {
    console.log(`EDIT a task ${obj.value}`);

    // Get formData from each element
    const formData = await parseInfoToForm();
    if(!formData) {
        alert("Not Setup Application");
        return undefined;
    };
    // Edit TASK
    // postAPI(api, inData, inType=JSON_FMT, errType=LOG)
    const retData = await postAPI( `/edit/${obj.value}`, formData, FORM_FMT, ALERT )
    if(!retData) return(undefined);

    // if success
    hideModal("appModal");
    if(!DEBUG_MODE) location.reload(); 
    console.log(retData);
    setDefaultModal();        
    
}

// import task
async function importSubmit() {

    console.log('Import a task');

    let fileName;

    // Get formData from each element
    const formData = await parseInfoToForm();
    if(!formData) {
        alert("Not Setup Application");
        return undefined;
    };

    // Add other information: capture from /import_proc, it's the same with the return infor of /import_zip (web api)
    const eleZipDiv = document.getElementById('import_zip_model')
    const eleUrlDiv = document.getElementById('import_url_model')
    
    // Show the file name on ZIP div
    if ( eleZipDiv.style.display==='block' ) fileName = eleZipDiv.textContent.trim().split(".")[0];
    else fileName = eleUrlDiv.value;
    
    // Get extracted information from /import_porc
    const importProcData = await getAPI( `/import_proc`, ALERT);

    // If Failed
    if(!importProcData) {
        alert("Parsing Extract Data Error!"); return undefined;
    }

    // Parse output from importProcData
    let trg_data = importProcData[fileName]["info"];

    // Add more data into formData
    formData.append( "path"         , trg_data["path"] );
    formData.append( "model_path"   , trg_data["model_path"] );
    formData.append( "label_path"   , trg_data["label_path"] );
    formData.append( "config_path"  , trg_data["config_path"] );
    formData.append( "json_path"    , trg_data["json_path"] );
    formData.append( "tag"          , trg_data["tag"] );

    // Log
    console.log("/import \n", "********");
    for(var pair of formData.entries()) console.log(pair[0]+ ', '+ pair[1]);

    // Import Event
    const retData = await postAPI( `/import`, formData, FORM_FMT, ALERT )
    if(!retData) return undefined;
    
    // if success
    console.log(retData);
    location.reload();
    setDefaultModal();
        
}

// Delete Task
async function delSubmit(obj) {
    console.log('delete the application')
    const uuid = document.getElementById("del_uuid").textContent;
    let data = { "uuid": uuid };

    console.log(`Remove application ${uuid}`);

    const retData = await postAPI( "/remove/", data, JSON_FMT, ALERT );

    if(retData) { console.log(retData); location.reload(); }
    else return undefined;

}

// Dialog Modal - START

// Capture error message via calling web api ( /task/<uuid>/error )
async function errModalEvent(obj) {
    
    const uuid  = obj.id.split('_')[0];
    const data  = await getAPI(`/task/${uuid}/error`);

    if (data) document.getElementById("errMsg").textContent = data;
    else return undefined;
}

// Add related information when open the ADD modal
async function addModalEvent(init=false) {

    console.log(`Open "ADD" modal`);
    clearModalDropdown();
    updateGPU("device");
    updateModelSourceType();
    updateSourceType("source_type");
    updateModelOption("model_list");
    // updateSourceV4L2("source");

    window[MODE] = ADD_MODE;

    document.getElementById("model_menu").disabled      = false;
    document.getElementById("model_app_menu").disabled  = false;
    document.getElementById("device_menu").disabled     = false;
    if(init) setDefaultModal();

    const nextBtn = document.getElementById("bt_modal_app");
    nextBtn.value = ADD_MODE;
    // nextBtn.disabled = true;
    
}

// Add related information when open the EDIT modal
async function editModalEvent(obj, init=false) {
    

    console.log(`Open "EDIT" modal`);
    // if (init) setDefaultModal();

    window[MODE] = EDIT_MODE;
    const task_uuid = obj.value;

    // updateModelOption("edit_model_list");

    const data = await getAPI(`/task/${task_uuid}/info`)
    
    if(!data) return(undefined);
    
    console.log(task_uuid, data);
    document.getElementById("edit_name").value = data["name"];
    
    // update source type and source
    updateSourceType("edit_source_type", data["source_type"]);
    updateSourceOption(data["source_type"], "edit_source", data["source"]);

    // fix model source
    document.getElementById("edit_model_source_type_menu").textContent = "From Exist Model";
    document.getElementById("edit_model_source_type_menu").value = "From Exist Model";
    document.getElementById("edit_model_source_type_menu").disabled = true;

    // update model information and disable it
    document.getElementById("edit_model_menu").textContent = data["model"];
    document.getElementById("edit_model_menu").value = data["model"];
    document.getElementById("edit_model_menu").disabled = true;
    
    // update model_app and setup default value
    // updateModelAppOption("model", data["model"], data["application"]["name"]);
    updateApplication(data)
    
    // update device information 
    document.getElementById("edit_device_menu").textContent = data['device'];
    document.getElementById("edit_device_menu").disabled = true;
    
    // update threshold
    document.getElementById("edit_thres").value = data['thres'];
    
    // set the value of the submit button to uuid
    // document.getElementById("modal_edit_submit").value = obj.id;
    document.getElementById("modal_app_submit").value = task_uuid;
    
    document.getElementById("modal_back_bt").value = task_uuid;

    const nextBtn = document.getElementById("edit_bt_modal_app");
    nextBtn.value = "Edit";
    // nextBtn.disabled = true;

}

// Double check and show information modal when deleting the task
function delModalEvent(obj) {
    const uuid  = obj.id;
    const name  = document.getElementById(`${uuid}_name`).textContent;
    const msg   =  `The application ( ${name} , ${uuid} ) will be delete`;
    
    document.getElementById("del_content").textContent = msg;
    document.getElementById("del_uuid").textContent = uuid;
}

// Setup Modal Button (data-dismiss, data-toggle, data-target, onclick and text).
function setModalButton(eleButton, targetEvent, clickEvent, buttonText, manualOpen=false) {

    
    if(targetEvent){
        eleButton.setAttribute("data-toggle"   , "modal");   
        eleButton.setAttribute("data-target"   , targetEvent);
    }
    if(manualOpen===false) eleButton.setAttribute("data-dismiss"  , "modal");

    eleButton.setAttribute("onclick" , clickEvent);

    if (buttonText) eleButton.textContent = buttonText;
}

// Dialog Modal - END

// About Application Modal Event - START

async function checkModalOption(){
    
    const curMode = window[MODE];
    let header = "";
    if(curMode==="Edit") header = "edit_"

    const modelTypeKey = `${header}model_source_type_menu`
    const srcTypeKey = `${header}source_type_menu`    // value

    let modelOptions = { 
        "From Exist Model": "model_menu",
        "Import ZIP File": "import-zip-model-uploader",
        "Enter The URL": "import_url_model_value"
    }

    if(curMode==="Edit") modelOptions["From Exist Model"] = "edit_model_menu";

    
    let srcOptions = {
        "USB CAM": "source_menu",
        "Video": "custom_file_label",
        "Image": "custom_file_label",
        "RTSP": "source"
    }

    if(curMode==="Edit"){
        srcOptions["USB CAM"]  = "edit_source_menu";
        srcOptions["Video"] = "edit_source_file_label";
        srcOptions["Image"] = "edit_source_file_label";
        srcOptions["RTSP"]  = "edit_source_text";
    }

    const modelType = document.getElementById( modelTypeKey ).value;    
    const srcType = document.getElementById( srcTypeKey ).value.trim();

    let msg = ""
    let status = true;

    try { 
        model = document.getElementById( modelOptions[modelType] ).value; 
        if(model==="") msg = msg + "Modal, ";
        else console.log(`Get Model: ${model}`);
    } catch(e) { 
        // console.log(e);
        msg = msg + "Modal, "; 
    }

    try { 
        src = document.getElementById( srcOptions[srcType] ).value; 
        if(src==="" || !src ) msg = msg + "Input Source, ";
        else console.log(`Get Source: ${src}`);
    } catch(e) { 
        // console.log(e);
        msg = msg + "Input Source, "; 
    }

    if ( msg !== "" ) status = false;

    return [status, msg]

}

function buttonKeyEvent(e){
    if(e.keyCode === 13) $('.btn-primary-custom').click()
    else if(e.keyCode === 27) $('.btn-secondary-custom').click()
}

function showModal(name){
    $(`#${name}`).modal('show')

    // Bind drawTips Event when edit mode
    if(name==='appModal' && window[MODE] === EDIT_MODE ){
        console.log("Show Application Modal");
        $(`#${name}`).on('shown.bs.modal', function(){ 
            if($('#area_div').is(':visible')) startDrawTips();
        })
    }
    
    updateAppItem(document.getElementById('model_app_menu').text)
    
}

function hideModal(name){
    $(`#${name}`).modal('hide');
}

async function addAppModalEvent(self) {


    // Get Button
    const trgButton     = document.getElementById("modal_app_submit");
    const backButton    = document.getElementById("modal_back_bt");
    const curMode       = window[MODE];

    // Setup Next Button
    setModalButton( 
        eleButton   = trgButton,
        targetEvent = undefined,
        clickEvent  = "addSubmit()",
        buttonText  = curMode,
        manualOpen = true 
    );

    // Setup Back Button
    setModalButton( 
        eleButton   = backButton,
        targetEvent = "#addModal", 
        clickEvent  = "addModalEvent(); return false" 
    );

    // Switch App Modal from Add Modal have to update model_app list
    updateModelAppOption(
        eleName     = "model", 
        modelName   = document.getElementById("model_menu").textContent, 
        defaultApp  = document.getElementById("model_app_menu").textContent 
    );

    hideModal("addModal");
    showModal("appModal");

    updateLabelDropdown()
}

function editAppModalEvent() {
    
    // Get Button
    const trgButton     = document.getElementById("modal_app_submit");
    const backButton    = document.getElementById("modal_back_bt");
    const curMode       = window[MODE];

    // Setup Next Button
    setModalButton( 
        eleButton   = trgButton,
        targetEvent = undefined,
        clickEvent  = "editSubmit(this)",
        buttonText  = curMode,
        manualOpen = true  );

    // Setup Back Button
    setModalButton( 
        eleButton   = backButton,
        targetEvent = "#editModal", 
        clickEvent  = "" );

    hideModal("editModal");
    
    showModal("appModal");

    // Update in editModalEvent
    // updateLabelDropdown()
    
}

function importAppModalEvent() {

    // Get Button
    const trgButton     = document.getElementById("modal_app_submit");
    const backButton    = document.getElementById("modal_back_bt");
    const curMode       = window[MODE];

    // Setup Next Button
    setModalButton( 
        eleButton   = trgButton,
        targetEvent = "#appModal",
        clickEvent  = "importSubmit()",
        buttonText  = curMode,
        manualOpen  = true );

    // Setup Back Button
    setModalButton( 
        eleButton   = backButton,
        targetEvent = "#addModal", 
        clickEvent  = "" );

    hideModal("addModal");
    showModal("appModal");
}


async function appModalEvent(){
    
    const curMode = window[MODE];
    
    const [ status, msg ] = await checkModalOption();

    document.onkeydown = filterFunction;

    if( status === true ){
    
        // Update Button and related function : Add , Edit, Import
        
        if ( curMode === ADD_MODE) addAppModalEvent();
        else if ( curMode === IMPORT_MODE) importAppModalEvent();
        else if ( curMode === EDIT_MODE) editAppModalEvent();
        
    } else alert(`Capture Empty Input ( ${msg} )`);
        
    
    await updateModalOpen()
    
}

async function updateModalOpen(){
    $('body').addClass("modal-open");
    setTimeout(function() {
        // needs to be in a timeout because we wait for BG to leave
        // keep class modal-open to body so users can scroll
        $('body').addClass('modal-open');
    }, 400);

}


// About Application Modal Event - END

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

        // Disable Option Button
        disableButton(document.getElementById(`${uuid}_more`));

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

// Setting up when start the web demo up
let isCheckedAll = true;
$(document).ready( async function () {

    // Capture the platform and setup sub-title
    const pla = await getPlatform();
    if (pla) document.getElementById("title_framework").textContent = `( ${pla} )`
    

    // Update Global Parameters
    updateMapModelUUID();
    updateMapModelApp();
    
    // Check the status of each task
    checkTaskStatus();

    // Define the launch Switch Button
    defineLaunchButton();

});
