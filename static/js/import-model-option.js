
const ZIP_OPT_KEY = "zip"
const URL_OPT_KEY = "url"
const ZIP_OPT_TITLE = "import_model_zip"
const URL_OPT_TITLE = "import_model_url"
const DIV_OPT_TITLE = "import_model_div"
const DEFAULT_COLOR = "#c0c2ce";
const TARGET_COLOR  = "#858796";
const ZIP_OPT_DIV   = "import_zip_model";
const URL_OPT_DIV   = "import_url_model" ;

let eleOptZipTitle  = document.getElementById(ZIP_OPT_TITLE);
let eleOptUrlTitle  = document.getElementById(URL_OPT_TITLE);
let eleOptDiv       = document.getElementById(DIV_OPT_TITLE);
let eleOptZipDiv    = document.getElementById(ZIP_OPT_DIV);
let eleOptUrlDiv    = document.getElementById(URL_OPT_DIV);

// Import URL Parameters
const URL_OPT       = "import_web_url_value";

let eleOptUrl       = document.getElementById(URL_OPT);

// Import ZIP File Parameters
let timer;
let convertStatus = false;
// const importZipUploader = document.querySelector('[data-target="import-zip-file-uploader"]');
// importZipUploader.addEventListener("change", importZipFileUpload);

const zipModelUploader = document.querySelector('[data-target="import-zip-model-uploader"]');
zipModelUploader.addEventListener("change", importZipFileUpload);

// --------------------------------------------------
// Import Option

function chageOptionColor(key){
    if ( key === ZIP_OPT_KEY ){
        eleOptZipTitle.style.color = TARGET_COLOR;    
        eleOptUrlTitle.style.color = DEFAULT_COLOR;
    } else {
        eleOptZipTitle.style.color = DEFAULT_COLOR;    
        eleOptUrlTitle.style.color = TARGET_COLOR;
    }
}

function changeOptionVision(key){
    console.log("Vision: ", key);
    if ( key === ZIP_OPT_KEY ){
        
        eleOptZipDiv.style.display = "block";
        eleOptUrlDiv.style.display = "none";
    } else {
        eleOptZipDiv.style.display = "none";
        eleOptUrlDiv.style.display = "block";
    }
}

function changeOption(obj){

    let tempKey;
    if (obj.id.search(URL_OPT_KEY)!==(-1)){
        tempKey = URL_OPT_KEY;
        console.log("Found URL");
        

    } else if (obj.id.search(ZIP_OPT_KEY)!==(-1)){
        console.log("Found ZIP");
        tempKey = ZIP_OPT_KEY;

    } else {
        console.log(obj.id);
        tempKey = ZIP_OPT_KEY;
    }

    chageOptionColor(tempKey);
    changeOptionVision(tempKey);
}

// --------------------------------------------------
// Import URL

function importURL(){
    
    // Close Next button
    document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
        ele.textContent = "Converting ...";
        ele.disabled = true;
    })

    
    // Capture URL
    //      - 172.16.92.124:6530/da138368/iteration1/share
    let url = eleOptUrl.value;
    let data = {
        "url": url
    }

    // Send to Server
    $.ajax({
        url: SCRIPT_ROOT + "/import_url/",
        data: JSON.stringify( data ),
        type: 'POST',
        dataType: 'json',
        contentType: "application/json;charset=utf-8",
        success: function (data, textStatus, xhr){

            console.log(data);
            
            updateTagApp("model", data["tag"]);

            eleOptUrlDiv.value = `${data["name"]}`;

            getConvertStatus(data["name"]);
            if (convertStatus === false) {
                let intervalTime = 5000;
                timer = window.setInterval(function () { getConvertStatus(data["name"]) }, intervalTime);
            }

            // update application label in depend_on
            let labelPath = { "path": data["label_path"] };
                
            $.ajax({
                url: SCRIPT_ROOT + "/read_file/",
                data: JSON.stringify(labelPath),
                type: "POST",
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                success: function (data, textStatus, xhr) {
                    
                    console.log("updated label", data);
                    

                    // Update depend_on
                    const appOptList = document.getElementById("label_list");
                    
                    // Clear dropdown-div
                    document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
                        ele.remove();
                    })
                    for(let i=0; i<data.length; i++){
                        appOptList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
                            '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
                            `<a class="app-opt-text">${data[i]}</a>` +
                            '</div>'
                        document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
                    }
                },
                error: function (xhr, textStatus, errorThrown) {
                    alert(`Read file error ( ${xhr.responseText} )`);
                }
            });

        },
        error: function (xhr, textStatus, errorThrown) {
            document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
                ele.textContent = "Next";
                ele.disabled = false;
            })
            alert(`Extract URL error, make sure you have correct URL ...`);
        }
    });
            
}

// --------------------------------------------------
// Import ZIP File

// update application with AI tag 
function updateTagApp(eleKey, tagKey) {
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
    $.ajax({
        url: SCRIPT_ROOT + `/tag_app`,
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, xhr) {
            data[tagKey].forEach(function (item, i) {
                appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
            });
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in tag_app");
        },
    });

    // Display
    document.getElementById(appDefNmae).style.display = "none";
    document.getElementById(appMenuName).removeAttribute("style");
}

async function importZipFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        // const beforeUploadCheck = await beforeUpload(file);
        // if (!beforeUploadCheck.isValid) throw beforeUploadCheck.errorMessages;

        // const arrayBuffer = await getArrayBuffer(file);
        // const response = await uploadFileAJAX(arrayBuffer);

        // alert("File Uploaded Success");
        document.getElementById('import_zip_model_label').textContent = file['name'];

        // showPreviewImage(file);
        console.log('Extract a task');
        const ele = document.querySelector('[data-target="import-zip-model-uploader"]');

        // Create and append information
        let form_data = new FormData();

        // Check and append source data
        form_data.append("source", ele.files[0])

        // Close Next button
        document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
            ele.textContent = "Converting ...";
            ele.disabled = true;
        })

        // Sending data via web api ( /add )
        $.ajax({
            url: SCRIPT_ROOT + '/import_zip',
            data: form_data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data, textStatus, xhr) {

                console.log(data);

                updateTagApp("model", data["tag"]);

                getConvertStatus(data["name"]);
                if (convertStatus === false) {
                    let intervalTime = 5000;
                    timer = window.setInterval(function () { getConvertStatus(data["name"]) }, intervalTime);
                }

                // update application label in depend_on
                let labelPath = { "path": data["label_path"] };
                
                $.ajax({
                    url: SCRIPT_ROOT + "/read_file/",
                    data: JSON.stringify(labelPath),
                    type: "POST",
                    dataType: "json",
                    contentType: "application/json;charset=utf-8",
                    success: function (data, textStatus, xhr) {
                        
                        console.log("updated label", data);

                        // Update depend_on
                        const appOptList = document.getElementById("label_list");
                        
                        // Clear dropdown-div
                        document.querySelectorAll("#dropdown-div").forEach( function(ele, idx){
                            ele.remove();
                        })
                        for(let i=0; i<data.length; i++){
                            appOptList.innerHTML += '<div id="dropdown-div" class="dropdown-item d-flex flex-row align-items-center">'+
                                '<input class="app-opt" type="checkbox" onchange="atLeastOneRadio(this)" checked>' +
                                `<a class="app-opt-text">${data[i]}</a>` +
                                '</div>'
                            document.getElementById("label_list_menu").textContent = `Select ${i+1} Labels`;
                        }
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        console.log("read file error");
                    }
                });
            },
            error: function (xhr, textStatus, errorThrown) {
                document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
                    ele.textContent = "Next";
                    ele.disabled = false;
                })
                alert(`Extract error ( ${xhr.responseText} )`);
            },
        });

    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}


function getConvertStatus(task_name) {
    $.ajax({
        type: 'GET',
        url: SCRIPT_ROOT + `/import_proc/${task_name}/status`,
        dataType: "json",
        success: function (data) {
            if (data === "done") {
                // alert("Convert finished !!!");
                console.log("Convert finished !!!")
                convertStatus = true;
                window.clearInterval(timer);
                // Open Button
                document.getElementsByName("bt_modal_app").forEach(function(ele, idx){
                    ele.textContent = "Next";
                    ele.disabled = false;
                })
            } else {
                console.log("Converting model to tensorrt engine ... ");
            }
        }
    })
}

// --------------------------------------------------
// Start
window.onload = function () {
    
    // Set default Value and Color
    eleOptDiv.style.color = DEFAULT_COLOR;
    chageOptionColor(ZIP_OPT_KEY);

    // 
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