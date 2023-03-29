
const DEFAULT_COLOR = "#c0c2ce";
const TARGET_COLOR  = "#858796";
const ZIP_OPT_DIV   = "import_zip_model";
const URL_OPT_DIV   = "import_url_model" ;

let eleOptZipDiv    = document.getElementById(ZIP_OPT_DIV);
let eleOptUrlDiv    = document.getElementById(URL_OPT_DIV);

// Import URL Parameters
const URL_OPT       = "import_url_model_value";
const ZIP_OPT       = "import_zip_model_label";

let eleOptUrl       = document.getElementById(URL_OPT);

// Import ZIP File Parameters
let timer;
let convertStatus = false;

const zipModelUploader = document.querySelector('[data-target="import-zip-model-uploader"]');
zipModelUploader.addEventListener("change", importZipFileUpload);

// --------------------------------------------------
// Import URL

async function importURL(){
    try{
        // Close Next Button
        const appNextBT = document.getElementById("bt_modal_app")
        appNextBT.disabled = true;
        appNextBT.textContent = "Donwloading ...";

        // Capture URL, Example: 172.16.92.124:6530/da138368/iteration1/share
        let url = eleOptUrl.value;
        let json_data = { "url": url }

        // Sending data via web api ( /import_url )
        let urlData = await postAPI(`/import_url`, json_data, JSON_FMT, ALERT);
        if(!urlData) { return undefined; }
        urlData = urlData["data"]

        // Reset Next Button
        console.warn(urlData);
        appNextBT.disabled = false;
        appNextBT.textContent = "Next";

        // Freeze Submit Button
        document.getElementById("modal_app_submit").disabled = true;

        // Update Application
        await updateTagApp("model", urlData["tag"]);
        
        // Get the ZIP file name and Update to `import_model_url_value` element
        const zipName = urlData["name"]
        eleOptUrl.value = zipName;
        
        // Keep Checking Status
        await getConvertStatus(zipName);
        if (convertStatus === false) {
            let intervalTime = 5000;
            timer = window.setInterval(function () { getConvertStatus(urlData["name"]) }, intervalTime);
        }
        
        // update application label in depend_on
        const labelPath = { "path": urlData["label_path"] };
        // Check File Status /read_file
        let data = await postAPI(`/read_file`, labelPath, JSON_FMT, ALERT);

        // If no data reset Next button
        if(!data){
            console.log("Error");
            window.clearInterval( timer );
            await resetNextButton();
            return undefined;
        } 
        data = data['data']
        console.warn(data);
        // Update depend_on
        
        const appOptList = document.getElementById("label_list");

        // Clear dropdown-div
        document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
            ele.remove();
        })
        
        // Add New Label
        for(let i=0; i<data.length; i++){
            appOptList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
                '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
                `<a class="app-opt-text">${data[i]}</a>` +
                '</div>'
            document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
        }

    } catch(e) {
        alert(e);
        await resetNextButton();
    }
}

// --------------------------------------------------
// Import ZIP File

// 
async function resetNextButton(){
    
    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.textContent = "Next";
        ele.disabled = false;
    });
    document.getElementById("import_zip_model_label").textContent = "Choose file";
}

// update application with AI tag 
async function updateTagApp(eleKey, tagKey) {
    console.log('Update tag application');

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
    let data = await getAPI(`/tag_app`)
    
    if(data){
        data = data["data"]
        console.log('Get application: ', data[tagKey]);
        data[tagKey].forEach(function (item, i) {
            appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
        });    
    } else{
        console.warn('Could not get application')
    }
    document.getElementById(appDefNmae).style.display = "none";
    document.getElementById(appMenuName).removeAttribute("style");
}

async function importZipFileUpload(e) {
    try{
        const file = e.target.files[0];
    
        // Double Check file
        if (!file) return undefined;
    
        // alert("File Uploaded Success");
        document.getElementById('import_zip_model_label').textContent = file['name'];
        document.getElementById('model_menu').textContent = file['name'].trim().split(".")[0];
        
        // showPreviewImage(file);
        console.warn('Extract a task');
        const ele = document.querySelector('[data-target="import-zip-model-uploader"]');
    
        // Create and append information
        let form_data = new FormData();
    
        // Check and append source data
        form_data.append("source", ele.files[0])
    
        // Close Next Button
        const appNextBT = document.getElementById("bt_modal_app")
        appNextBT.disabled = true;
        appNextBT.textContent = "Extracting ...";
        
        // Sending data via web api ( /import_zip )
        let zipData = await postAPI(`/import_zip`, form_data, FORM_FMT, ALERT);
        if(!zipData) { return undefined; }
        zipData = zipData["data"]
        
        // Reset Next Button
        console.warn(zipData);
        appNextBT.disabled = false;
        appNextBT.textContent = "Next";
        
        // Freeze Submit Button
        document.getElementById("modal_app_submit").disabled = true;

        // Update Application
        await updateTagApp("model", zipData["tag"]);
        
        // Keep Checking Status
        await getConvertStatus(zipData["name"]);
        if (convertStatus === false) {
            let intervalTime = 5000;
            timer = window.setInterval(function () { getConvertStatus(zipData["name"]) }, intervalTime);
        }
        
        // update application label in depend_on
        const labelPath = { "path": zipData["label_path"] };
        // Check File Status /read_file
        let data = await postAPI(`/read_file`, labelPath, JSON_FMT, ALERT);
    
        // If no data reset Next button
        if(!data){
            console.log("Error");
            window.clearInterval( timer );
            await resetNextButton();
            return undefined;
        } 
        data = data['data']
        console.warn(data)
        // Update depend_on
        
        const appOptList = document.getElementById("label_list");

        // Clear dropdown-div
        document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
            ele.remove();
        })
        
        // Add New Label
        for(let i=0; i<data.length; i++){
            appOptList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
                '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
                `<a class="app-opt-text">${data[i]}</a>` +
                '</div>'
            document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
        }
        
    } catch(e) {
        alert(e);
        await resetNextButton();
    }

}

async function getConvertStatus(task_name) {

    let data = await getAPI(`/import_proc/${task_name}/status`)
    data = data["message"]

    if (data === "done") {
        // alert("Convert finished !!!");
        console.log("Convert finished !!!")
        convertStatus = true;
        window.clearInterval(timer);
        // Open Button
        document.getElementById("modal_app_submit").textContent = `${window[MODE]}`;
        document.getElementById('modal_app_submit').disabled = false;
        
    } else {

        document.getElementById("modal_app_submit").textContent = data;
        document.getElementById("modal_app_submit").disabled = true;
        console.log("Converting model to tensorrt engine ... ");
    }
    
}

window.onload = function(){

    // eleOptUrl.addEventListener("click", function(event) {
    //     alert("[NOTE] After you enter the URL, press 'Enter' to extract URL file.");
    // });

    eleOptUrl.addEventListener("keypress", function(event) {
        if ( event.key === "Enter" ){
            console.log("Send URL Import Event");
            importURL();
        }
    });
}