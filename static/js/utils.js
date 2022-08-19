
const DISABLE_OPACITY       = 0.6;
const DISABLE_ELE_OPACITY   = 0.4;
const ENABLE_OPACITY        = 1;


function alertError (xhr, _textStatus, _errorThrown) {
    errMsg = xhr.responseText
    alert( errMsg );
    return( errMsg );
}

function logError (xhr, _textStatus, _errorThrown) {
    errMsg = xhr.responseText
    console.log( errMsg );
    return( errMsg );
}

async function getDocURL() {
    return await getPureURL( document.URL );
}

async function getPureURL(url) {
    url = url.replace('#', '');
    url.substring(0, url.lastIndexOf('/'));
    console.log(url);
    return url;
}

async function enableElement(ele){
    ele.style = `pointer-events: all; opacity: ${ENABLE_OPACITY};`;
}

async function disableElement(ele){
    ele.style = `pointer-events: none; opacity: ${DISABLE_ELE_OPACITY};`;
}

async function disableButton(ele){
    if (!ele) return undefined
    ele.disabled = true;
    disableElement(ele);
}

async function enableButton(ele){
    if (!ele) return undefined
    ele.disabled = false;
    enableElement(ele);
}

async function disableButtonParent(ele){
    if (!ele) return undefined
    const eleParent = ele.parentElement;
    disableElement(eleParent);
}

async function enableButtonParent(ele){
    if (!ele) return undefined
    const eleParent = ele.parentElement;
    enableElement(eleParent);
}

async function getAPI(api, errType=LOG, log=false) {

    if(log) console.log(`[GET] Called API: ${api}`);

    // Setup error event
    let errEvent;
    if (errType === ALERT) errEvent = alertError;
    else errEvent = logError;

    // Call API
    const data = await $.ajax({
        url: SCRIPT_ROOT + api,
        type: "GET",
        dataType: "json",
        error: errEvent
    });
    // Return Data
    if (data) return data;
    else return undefined;
}

async function postAPI(api, inData, inType=JSON_FMT, errType=LOG) {
    
    // Setup error event
    let errEvent
    let retData;
    if (errType === ALERT) errEvent = alertError;
    else errEvent = logError;

    // Call API
    if(inType===FORM_FMT){
        retData = await $.ajax({
            url: SCRIPT_ROOT + api,
            type: "POST",
            data: inData,
            processData: false,
            contentType: false,
            error: errEvent
        });    
    }

    if(inType===JSON_FMT){
        retData = await $.ajax({
            url: SCRIPT_ROOT + api,
            type: "POST",
            data: JSON.stringify(inData),
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            error: errEvent
        });    
    }

    // Return Data
    if (retData) return retData;
    else return undefined;
}

async function updateMapModelUUID(){
    
    const data = await getAPI("/model")
    if (data) window[MODEL_UUID] = data;
    else return(undefined);
}

async function updateMapModelApp(){

    const data = await getAPI("/model_app");
    if (data) window[MODEL_APP] = data;
    else return(undefined);
}