
// ---------------------------------------------------------------------------------------------------
// const modelFileUploader = document.querySelector('[data-target="model-file-uploader"]');
// modelFileUploader.addEventListener("change", modelFileUpload);
// // ---------------------------------------------------------------------------------------------------
// const labelFileUploader = document.querySelector('[data-target="label-file-uploader"]');
// labelFileUploader.addEventListener("change", labelFileUpload);
// // ---------------------------------------------------------------------------------------------------
// const configFileUploader = document.querySelector('[data-target="config-file-uploader"]');
// configFileUploader.addEventListener("change", configFileUpload);
// ---------------------------------------------------------------------------------------------------
const sourceUploader = document.querySelector('[data-target="file-uploader"]');
sourceUploader.addEventListener("change", sourceFileUpload);
// ---------------------------------------------------------------------------------------------------
const editSourceUploader = document.querySelector('[data-target="edit-source-file-uploader"]');
editSourceUploader.addEventListener("change", editSourceFileUpload);

// ---------------------------------------------------------------------------------------------------
const importSourceUploader = document.querySelector('[data-target="import-source-file-uploader"]');
importSourceUploader.addEventListener("change", importSourceFileUpload);

// ---------------------------------------------------------------------------------------------------
const importZipUploader = document.querySelector('[data-target="import-zip-file-uploader"]');
importZipUploader.addEventListener("change", importZipFileUpload);


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
            console.log(data);
            if (data[tagKey].length === 0) {
                appMenu.textContent = "No applications"
            } else {
                data[tagKey].forEach(function (item, i) {
                    console.log(`Found application ${item}`);
                    appList.innerHTML += `<a class="dropdown-item custom" href="#" onclick="dropdownSelectEvent(this); return false;" id="${appName}" name="${item}">${item}</a>`;
                });
            }

        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Error in tag_app");
        },
    });

    // Display
    document.getElementById(appDefNmae).style.display = "none";
    document.getElementById(appMenuName).removeAttribute("style");
}

let timer;
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
        document.getElementById('import_zip_file_label').textContent = file['name'];

        // showPreviewImage(file);
        console.log('Extract a task');
        const ele = document.querySelector('[data-target="import-zip-file-uploader"]');

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
            url: SCRIPT_ROOT + '/import_1',
            data: form_data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data, textStatus, xhr) {

                console.log(data);

                updateTagApp("import_model", data["tag"]);

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
                console.log("Extract error ( IMPORT )");
                console.log(xhr);
                console.log(xhr.responseJSON);
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

let convertStatus = false;
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

async function importSourceFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        // const beforeUploadCheck = await beforeUpload(file);
        // if (!beforeUploadCheck.isValid) throw beforeUploadCheck.errorMessages;

        // const arrayBuffer = await getArrayBuffer(file);
        // const response = await uploadFileAJAX(arrayBuffer);

        // alert("File Uploaded Success");
        console.log(file);
        document.getElementById('import_source_file_label').textContent = file['name'];
        // showPreviewImage(file);
    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}

async function editSourceFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        // const beforeUploadCheck = await beforeUpload(file);
        // if (!beforeUploadCheck.isValid) throw beforeUploadCheck.errorMessages;

        // const arrayBuffer = await getArrayBuffer(file);
        // const response = await uploadFileAJAX(arrayBuffer);

        // alert("File Uploaded Success");
        console.log(file);
        document.getElementById('edit_source_file_label').textContent = file['name'];
        // showPreviewImage(file);
    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}


async function sourceFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        // const beforeUploadCheck = await beforeUpload(file);
        // if (!beforeUploadCheck.isValid) throw beforeUploadCheck.errorMessages;

        // const arrayBuffer = await getArrayBuffer(file);
        // const response = await uploadFileAJAX(arrayBuffer);

        // alert("File Uploaded Success");
        
        document.getElementById('custom_file_label').textContent = file['name'];

    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}

async function modelFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        // const beforeUploadCheck = await beforeUpload(file);
        // if (!beforeUploadCheck.isValid) throw beforeUploadCheck.errorMessages;

        // const arrayBuffer = await getArrayBuffer(file);
        // const response = await uploadFileAJAX(arrayBuffer);

        // alert("File Uploaded Success");
        console.log(file);
        document.getElementById('import_model_file_label').textContent = file['name'];
        // showPreviewImage(file);
    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}
// ---------------------------------------------------------------------------------------------------
async function labelFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        console.log(file);
        document.getElementById('import_label_file_label').textContent = file['name'];
        // showPreviewImage(file);
    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}
// ---------------------------------------------------------------------------------------------------
async function configFileUpload(e) {
    try {
        const file = e.target.files[0];
        // setUploading(true);
        if (!file) return;

        console.log(file);
        document.getElementById('import_config_file_label').textContent = file['name'];
        // showPreviewImage(file);
    } catch (error) {
        alert(error);
        console.log("Catch Error: ", error);
    } finally {
        // e.target.value = '';  // reset input file
        // setUploading(false);
    }
}
// ---------------------------------------------------------------------------------------------------
// change file object into ArrayBuffer
function getArrayBuffer(fileObj) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        // Get ArrayBuffer when FileReader on load
        reader.addEventListener("load", () => {
            resolve(reader.result);
        });

        // Get Error when FileReader on error
        reader.addEventListener("error", () => {
            reject("error occurred in getArrayBuffer");
        });

        // read the blob object as ArrayBuffer
        // if you nedd Base64, use reader.readAsDataURL
        reader.readAsArrayBuffer(fileObj);
    });
}
// ---------------------------------------------------------------------------------------------------
// upload file throguth AJAX
// - use "new Uint8Array()"" to change ArrayBuffer into TypedArray
// - TypedArray is not a truely Array,
//   use "Array.from()" to change it into Array
function uploadFileAJAX(arrayBuffer) {
    // correct it to your own API endpoint
    return fetch("https://jsonplaceholder.typicode.com/posts/", {
        headers: {
            version: 1,
            "content-type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
            imageId: 1,
            icon: Array.from(new Uint8Array(arrayBuffer))
        })
    })
        .then(res => {
            if (!res.ok) {
                throw res.statusText;
            }
            return res.json();
        })
        .then(data => data)
        .catch(err => console.log("err", err));
}
// ---------------------------------------------------------------------------------------------------
// Create before upload checker if needed
function beforeUpload(fileObject) {
    return new Promise(resolve => {
        const validFileTypes = ["image/jpeg", "image/png"];
        const isValidFileType = validFileTypes.includes(fileObject.type);
        let errorMessages = [];

        if (!isValidFileType) {
            errorMessages.push("You can only upload JPG or PNG file!");
        }

        const isValidFileSize = fileObject.size / 1024 / 1024 < 2;
        if (!isValidFileSize) {
            errorMessages.push("Image must smaller than 2MB!");
        }

        resolve({
            isValid: isValidFileType && isValidFileSize,
            errorMessages: errorMessages.join("\n")
        });
    });
}
// ---------------------------------------------------------------------------------------------------
function setUploading(isUploading) {
    if (isUploading === true) {
        spinner.classList.add("opacity-1");
    } else {
        spinner.classList.remove("opacity-1");
    }
}
