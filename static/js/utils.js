const DISABLE_OPACITY   = 0.6;
const ENABLE_OPACITY    = 1;

function alertError (xhr, _textStatus, _errorThrown) {
    errMsg = xhr.responseText
    alert( errMsg );
    return( errMsg );
}

function logError (xhr, _textStatus, _errorThrown) {
    console.log( errMsg );
    return( errMsg );
}

async function getDocURL() {
    return await getPureURL( document.URL );
}

async function getPureURL(url) {
    url = url.replace('#', '');
    url.substring(0, url.lastIndexOf('/'));
    return url;
}

async function enableElement(ele){
    ele.style = `pointer-events: all; opacity: ${ENABLE_OPACITY};`;
}

async function disableElement(ele){
    ele.style = `pointer-events: none; opacity: ${DISABLE_OPACITY};`;
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

async function getAPI(api, errType='log') {

    let errEvent;
    if (errType === 'alert') errEvent = alertError;
    else errEvent = logError;

    const data = await $.ajax({
        url: SCRIPT_ROOT + api,
        type: "GET",
        dataType: "json",
        error: errEvent
    });

    if (data) return data;
    else return undefined;
}