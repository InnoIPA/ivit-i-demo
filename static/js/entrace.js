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

    const statsButton = document.getElementById( `${uuid}_status_btn`);
    const optionButton = document.getElementById(`${uuid}_more`);
    const launchButton = document.getElementById(`${uuid}_switch`);
    
    if (debug === true) console.log(`- ${name} (${uuid}) is ${stats}`);
    
    if(stats === RUN){
        
        statsButton.innerText = RUN;
        statsButton.setAttribute("class", "btn btn-green custom");
        addStreamHref(uuid);
        disableButton(optionButton);

    } else if ( stats === STOP ) {
        
        statsButton.innerText = STOP;
        statsButton.setAttribute("class", "btn btn-gray custom");
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

// Set Default Modal

async function setDefaultModal(){
    let head = ""
    if (window[MODE] == EDIT_MODE) head = "edit_";

    document.getElementById(`${head}name`).value = "";
    document.getElementById(`${head}name`).placeholder = "Ex. Defect detection";
    document.getElementById(`${head}thres`).value = 0.9;
    updateSourceOption(DEFAULT, `${head}source`);

    // Share items: Application Dialog 
    document.getElementById(`model_app_menu`).setAttribute("style", "display: none");
    document.getElementById(`model_app_menu_def`).setAttribute("style", "cursor: auto");    
    document.getElementById("custom_file_label").textContent = "Choose file";

    document.getElementById(`${head}model_source_type_menu`).textContent = "Please select one";
    document.getElementById(`${head}model_menu`).textContent = "Please select one";
    document.getElementById(`${head}source_type_menu`).textContent = "Please select one";
    document.getElementById(`${head}device_menu`).textContent = "Please select one";
    document.getElementById(`${head}source_menu`).textContent = "Please select one";
    
    document.getElementById("import_zip_model_label").textContent = "Choose file";

}

// Update & Control Dialog ( Modal )

function updateDropdownMenu(selectElement, selectContent){
    document.getElementById(`${selectElement}_menu`).textContent = `${selectContent}`;
    document.getElementById(`${selectElement}_menu`).value = `${selectContent}`;
}

// Update Application Items
function updateAppItem(srcType){
    if (srcType.includes('area')) enableAppArea();
    else disableAppArea();
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
        if (defaultApp.includes("area")) enableAppArea()
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
    const el_file_label_name = `${el_file_name}_label`;
    const el_drop_name = `${key}_dropdown`;
    
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
    
    let srcTypeList = ['V4L2', VIDEO, IMAGE, RTSP];
    let el_list = document.getElementById(`${key}_list`);
    let el_menu = document.getElementById(`${key}_menu`);
    
    
    console.log(`Add the source type (${srcTypeList})`);
    for(let step=0; step<srcTypeList.length; step++){
        el_list.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this);" id="${key}" name=${ srcTypeList[step] } >${ srcTypeList[step] }</a>`;
    }
    if (data!=="") {
        if (data.includes(VIDEO)){ 
            el_menu.textContent=VIDEO;
        } else if (data.includes('V4L2')) {
            el_menu.textContent='V4L2';
        } else if (data.includes(RTSP)) {
            el_menu.textContent=RTSP;
        } else if (data.includes(IMAGE)) {
            el_menu.textContent=IMAGE;
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

    // V4L2
    else sourceContent = document.getElementById(`${head}source_menu`)
                .innerText.replace(/(\r\n|\n|\r)/gm, "");

    return { sourceType, sourceContent }
}

async function parseInfoToForm(){

    let uploader    = "file-uploader";
    let head        = "";
    let data        = {};
    let formData    = new FormData();
    // let sourceContent, sourceType;

    if (window[MODE] === EDIT_MODE) {
        head        = "edit_";
        uploader    = "edit-source-file-uploader";
    }

    // Define Data Key
    dName       = "name";
    dThres      = "thres"
    dModel      = "model"
    dApp        = "application"
    dSrc        = "source"
    dSrcType    = "source_type"
    dDevice     = "device"

    appName     = "name";
    appDepend   = "depend_on";
    appArea     = "area_points";

    // Update application which on shared dialog
    let appData = {};
    appData[`${appName}`]   = document.getElementById("model_app_menu").innerText;
    appData[`${appDepend}`] = JSON.stringify(checkLabelFunction());
    appData[`${appArea}`]   = `[ ${document.getElementById("app_info").innerText} ]`;

    // // Check and append source data
    const { sourceType, sourceContent } = await getSourceContent();

    // Collection the related data from ADD modal
    data[dName]     = document.getElementById(`${head}name`).value;
    data[dThres]    = document.getElementById(`${head}thres`).value;
    data[dModel]    = document.getElementById(`${head}model_menu`).innerText;
    data[dApp]      = JSON.stringify( appData );
    data[dSrc]      = sourceContent;
    data[dSrcType]  = sourceType;
    data[dDevice]   = document.getElementById(`${head}device_menu`).innerText;

    // Create and append information
    for ( let key in data ) {
        console.log(key, data[key]);
        formData.append(key, data[key]);
    }

    return formData;
}

// Add Task
async function addSubmit() {
    console.log('ADD a task');

    // Get formData from each element
    const formData = await parseInfoToForm();

    // Add TASK
    const retData = await postAPI( `/add`, formData, FORM_FMT, ALERT )

    // If success
    if(retData) {
        if(!DEBUG_MODE) location.reload();
        console.log(retData);
        setDefaultModal();
    } else return(undefined);
}

// Edit Task
async function editSubmit(obj) {

    console.log(`EDIT a task`);

    // Get formData from each element
    const formData = await parseInfoToForm();
    
    // Edit TASK
    const retData = postAPI( `/edit/${obj.value}`, formData, FORM_FMT )

    // if success
    if(retData) {
        if(!DEBUG_MODE) location.reload();
        console.log(retData);
        setDefaultModal();
        
    } else return(undefined);

}

// import task
async function importSubmit() {

    console.log('Import a task');

    let fileName;

    // Get formData from each element
    const formData = await parseInfoToForm();
    
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
    // console.log("/import \n", "********");
    // for(var pair of formData.entries()) console.log(pair[0]+ ', '+ pair[1]);

    // Import Event
    const retData = await postAPI( `/import`, formData, FORM_FMT, ALERT )

    // if success
    if(retData) {
        console.log(retData);
        location.reload();
        setDefaultModal();
        
    } else return(undefined);
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

    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.value = ADD_MODE;
    })
    
}

// Add related information when open the EDIT modal
async function editModalEvent(obj) {
    
    console.log(`Open "EDIT" modal`);
    
    window[MODE] = EDIT_MODE;
    const task_uuid = obj.value;

    // updateModelOption("edit_model_list");

    const data = await getAPI(`/task/${task_uuid}/info`)
    
    if(!data) return(undefined);
    else {

        document.getElementById("edit_name").value = data["name"];
        
        // update source type and source
        updateSourceType("edit_source_type", data["source_type"]);
        updateSourceOption(data["source_type"], "edit_source", data["source"]);

        // fix model source
        document.getElementById("edit_model_source_type_menu").textContent = "From Exist Model";
        document.getElementById("edit_model_source_type_menu").disabled = true;

        // update model information and disable it
        document.getElementById("edit_model_menu").textContent = data["model"];
        document.getElementById("edit_model_menu").disabled = true;
        
        // update model_app and setup default value
        updateModelAppOption("model", data["model"], data["application"]["name"]);

        // update device information 
        document.getElementById("edit_device_menu").textContent = data['device'];
        document.getElementById("edit_device_menu").disabled = true;
        
        // update threshold
        document.getElementById("edit_thres").value = data['thres'];
        
        // set the value of the submit button to uuid
        // document.getElementById("modal_edit_submit").value = obj.id;
        document.getElementById("modal_app_submit").value = task_uuid;
        
    }

    document.getElementById("modal_back_bt").value = task_uuid;

    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.value = "Edit"
    })
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
function setModalButton(eleButton, targetEvent, clickEvent, buttonText) {

    eleButton.setAttribute("data-dismiss"  , "modal");
    eleButton.setAttribute("data-toggle"   , "modal");
    eleButton.setAttribute("data-target"   , targetEvent);
    eleButton.setAttribute("onclick"       , clickEvent);

    if (buttonText) eleButton.textContent = buttonText;
}

// Dialog Modal - END

// About Application Modal Event - START

function addAppModalEvent() {

    // Get Button
    const trgButton     = document.getElementById("modal_app_submit");
    const backButton    = document.getElementById("modal_back_bt");
    const curMode       = window[MODE];

    // Setup Next Button
    setModalButton( 
        eleButton   = trgButton,
        targetEvent = "#appModal",
        clickEvent  = "addSubmit()",
        buttonText  = curMode 
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
}

function editAppModalEvent() {
    
    // Get Button
    const trgButton     = document.getElementById("modal_app_submit");
    const backButton    = document.getElementById("modal_back_bt");
    const curMode       = window[MODE];

    // Setup Next Button
    setModalButton( 
        eleButton   = trgButton,
        targetEvent = "#appModal",
        clickEvent  = "editSubmit(this)",
        buttonText  = curMode );

    // Setup Back Button
    setModalButton( 
        eleButton   = backButton,
        targetEvent = "#editModal", 
        clickEvent  = "editModalEvent(this); return false" );
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
        buttonText  = curMode );

    // Setup Back Button
    setModalButton( 
        eleButton   = backButton,
        targetEvent = "#addModal", 
        clickEvent  = "addModalEvent(); return false" );
}

async function updateLabelDropdown() {

    // Get target model name
    let head = "";
    if ( window[MODE] === EDIT_MODE) head = "edit_";

    const modelName = document.getElementById(`${head}model_menu`).textContent;

    // Update depend_on
    const labelList = document.getElementById("label_list");
    
    // Clear dropdown-div
    document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
        ele.remove();
    })

    // Get the task uuid randomly which use the same model
    const modelWithUUID = await getAPI( "/model" );
    if (! modelWithUUID) return undefined;

    // Get task label according the task
    const taskUUID    = modelWithUUID[modelName][0];
    const taskLabel   = await getAPI( `/task/${taskUUID}/label` )
    if (! taskLabel) return undefined;

    // Put all label on it
    for(let i=0; i<taskLabel.length; i++){
        labelList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
            '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
            `<a class="app-opt-text">${taskLabel[i]}</a>` +
            '</div>'
        document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
    }
}

function appModalEvent(){
    
    const curMode = window[MODE];

    // Update Button and related function : Add , Edit, Import
    if ( curMode === ADD_MODE) addAppModalEvent();
    else if ( curMode === IMPORT_MODE) importAppModalEvent();
    else if ( curMode === EDIT_MODE) editAppModalEvent();
    
    // Update label
    if (curMode !== IMPORT_MODE) updateLabelDropdown();

}

function disableAppArea(){
    document.getElementById("area_div").style = "display: none";
}

async function enableAppArea(trg_mode=""){
    
    trg_mode = "";
    if (window["MODE"]===EDIT_MODE) trg_mode = "edit_";

    console.log(`Update Area Setting, Mode: ${trg_mode}`);

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

    // Define parameters
    let data        = {};
    let formData    = new FormData();
    dSrc            = "source";
    dSrcType        = "source_type";
    
    const { sourceType, sourceContent } = await getSourceContent();
    data[dSrcType] = sourceType;
    data[dSrc]     = sourceContent;

    // Define Form Data
    for ( let key in data ){
        console.log(key, data[key]);
        formData.append(key, data[key]);
    }

    // Display the key/value pairs
    for (var pair of formData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]); 
    }

    // Update Source
    const retData = await postAPI(`/update_src`, formData, FORM_FMT, ALERT)
    if(retData){

        imgHeight   = retData["height"];
        imgWidth    = retData["width"];

        // setup canvas width and height
        imgRate             = imgHeight/imgWidth;
        appCanvas.height    = appCanvas.width*imgRate;

        // load image
        img.src = "data:image/jpeg;base64," + retData["image"];
        appCanvas.style.backgroundImage = `url(${img.src})`;

        // calculate scale
        console.log(`Canvas width: ${appCanvas.style.width}`);
        appScale.textContent = appCanvas.width/imgWidth;

        console.log(`H:${imgHeight}, W:${imgWidth}, Ratio:${imgRate}`);   
        
    } else {
        return undefined;
    }

    // If app_info has content
    if(document.getElementById("app_info").textContent !== ""){
        drawPoly2();
    }

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
