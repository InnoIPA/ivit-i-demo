
const DISABLE_OPACITY       = 0.6;
const DISABLE_ELE_OPACITY   = 0.4;
const ENABLE_OPACITY        = 1;


async function parseError(xhr){
    let err = xhr.responseText;
    
    if(!err) return undefined;

    if( err.includes("[") && err.includes("]")){
        err = err.slice(err.search("\\["), -1)
    }
    err = JSON.parse(err)
        
    if (err["message"] === ""){
        err = err["data"]
    }else{
        err = err["message"]
    }
    return err
}

async function alertError (xhr, _textStatus, _errorThrown) {
    const errMsg = await parseError(xhr);
    
    alert( errMsg );
    return( errMsg );
}

async function logError (xhr, _textStatus, _errorThrown) {
    const errMsg = await parseError(xhr);
    console.error( errMsg );
    return( errMsg );
}

async function emptyError (xhr, _textStatus, _errorThrown) {
    const errMsg = await parseError(xhr);
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

async function getAPI(api, errType=LOG, log=false, author) {

    // Concate API
    // $.LoadingOverlay("show");
    let trg_api;
    if(api.includes("http")) trg_api = api;
    else trg_api = SCRIPT_ROOT + api;

    console.log(trg_api);
    if(log) console.log(`[GET] Called API: ${trg_api}`);

    // Setup error event
    let errEvent;
    if (errType === ALERT) errEvent = alertError;
    else if(errType === LOG ) errEvent = logError;
    else errEvent = emptyError;

    // Call API
    let data;
    try {
        data = await $.ajax({
            url: trg_api,
            type: "GET",
            error: errEvent,
            beforeSend: function(xhr) {
                if(author){
                    xhr.setRequestHeader("Authorization", "Basic " + btoa('demo' + ":" + 'demo'));
                }
            },
        });
    } catch (e) {
        // logError(e);
    }

    // console.log(data);    
    // $.LoadingOverlay("hide");
    // Return Data
    if (data) return data;
    else return(undefined);
}

async function postAPI(api, inData, inType=JSON_FMT, errType=LOG, log=false, author) {
    
    // Concate API
    // $.LoadingOverlay("show");
    let trg_api;
    if(api.includes("http")) trg_api = api;
    else trg_api = SCRIPT_ROOT + api;

    if(log) console.log(`[POST] Called API: ${trg_api}`);

    // Setup error event
    let retData;
    let errEvent;
    if (errType === ALERT) errEvent = alertError;
    else if(errType === LOG ) errEvent = logError;
    else errEvent = emptyError

    // Call API
    try {
        if(inType===FORM_FMT){
            retData = await $.ajax({
                url: trg_api,
                type: "POST",
                data: inData,
                processData: false,
                contentType: false,
                error: errEvent,
                beforeSend: function(xhr) {
                    if(author){
                        xhr.setRequestHeader("Authorization", "Basic " + btoa('demo' + ":" + 'demo'));
                    }
                }
            });    
        }

        if(inType===JSON_FMT){
            retData = await $.ajax({
                url: trg_api,
                type: "POST",
                data: JSON.stringify(inData),
                dataType: "json",
                contentType: "application/json;charset=utf-8",
                error: errEvent,
                beforeSend: function(xhr) {
                    if(author){
                        xhr.setRequestHeader("Authorization", "Basic " + btoa('demo' + ":" + 'demo'));
                    }
                }
            });    
        }
    } catch (e) {
        // logError(e);
    }

    // Return Data
    // $.LoadingOverlay("hide");
    if (retData) return retData;
    else return(undefined);
}

async function updateMapModelUUID(){
    
    const data = await getAPI("/model")
    if (data) window[MODEL_UUID] = data["data"];
    else return(undefined);
}

async function updateMapModelApp(){

    const data = await getAPI("/model_app");
    if (data) window[MODEL_APP] = data["data"];
    else return(undefined);
}

function scrollText(){

    let [i, eleTd] = [0, document.querySelectorAll(".scroll-text")];
    
    console.log(`Found ${eleTd.length} elements`);

    for(i; i<eleTd.length; i++){

        const targetEleWidth = eleTd[i].offsetWidth;
        const parentEleWidth = eleTd[i].parentElement.offsetWidth;

        if (parentEleWidth < targetEleWidth){
            console.log("found");
        }
        
    }   
}

function addMarquee(ele, distance, speed){
    
    const timeFunc  = 'linear';
    const padding   = 0;
    let _speed       = 5;
    let _distance    = 300;

    // Check Arguments, and calculate _speed
    if(speed) _speed = speed;
    if(distance) _distance = distance + padding;
    if (_distance < 300) _speed = _distance/300*_speed;
    
    // Setup transition animation
    ele.style.setProperty("-webkit-transition"  , `${_speed}s`);
    ele.style.setProperty("-moz-transition"     , `${_speed}s`);
    ele.style.setProperty("transition"          , `${_speed}s`);

    ele.style.setProperty("-webkit-transition-timing-function"  , timeFunc);
    ele.style.setProperty("-moz-transition-timing-function"     , timeFunc);
    ele.style.setProperty("transition-timing-function"          , timeFunc);

    // Giving the space to transition
    ele.style.setProperty( "margin-left", `-${_distance}px`, "");
}

function resetMarquee(ele){
    ele.style.setProperty( "margin-left", "0px");
}

function rmMarquee(ele){

    resetMarquee(ele);

    ele.style.removeProperty("-webkit-transition" );
    ele.style.removeProperty("-moz-transition"    );
    ele.style.removeProperty("transition"         );

    ele.style.removeProperty("-webkit-transition-timing-function" );
    ele.style.removeProperty("-moz-transition-timing-function"    );
    ele.style.removeProperty("transition-timing-function"         );    
}

$('.scroll-contain').hover(
    
    function(){
        const trg = this;
        const parent = trg.parentElement;
        const child = trg.getElementsByClassName('scroll-text')[0];
        if(!child) return undefined;

        let swapeWidth = child.offsetWidth - trg.offsetWidth;

        if (swapeWidth>0) addMarquee(child, swapeWidth);
        else rmMarquee(child);
    },
    // Leave hover
    function(){
        const trg = this;
        const child = trg.getElementsByTagName('p')[0];
        if(child) resetMarquee(child);
    }
)