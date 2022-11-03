let areaPoints = {};
let areaIndex = 0;

let vecPoints = {};
let vecIndex = 0;

let retAreaPoints = {};
let retVecPoints = {};

let areaAlpha = 0.2;
let areaPalette = [ 
    `rgba(255, 0 , 0, ${areaAlpha})`, 
    `rgba(0, 255 , 0, ${areaAlpha})`, 
    `rgba(0, 0 , 255, ${areaAlpha})`,
    `rgba(255, 0 , 255, ${areaAlpha})`,
    `rgba(0, 255 , 255, ${areaAlpha})`,
    `rgba(255, 255 , 0, ${areaAlpha})`
]
let vecAlpha = 0.4;
let vecPalette = [ 
    `rgba(255, 0 , 0, ${vecAlpha})`, 
    `rgba(0, 255 , 0, ${vecAlpha})`, 
    `rgba(0, 0 , 255, ${vecAlpha})`,
    `rgba(255, 0 , 255, ${vecAlpha})`,
    `rgba(0, 255 , 255, ${vecAlpha})`,
    `rgba(255, 255 , 0, ${vecAlpha})`
]

let pointsLimit = 10;
let appCanvas = document.getElementById("app_canvas");
let appCtx = appCanvas.getContext("2d");

let areaInfo = document.getElementById("area_info");
let vecInfo = document.getElementById("vector_info");

let appRatio;
let penMode = "poly";
let vectorModeFlag = false;

function updateApplication(data){

    let appData = data['application'];
    
    let trgModel = data["model"];
    let appName = appData["name"];
    let appDepend = appData["depend_on"];
    let appAreaPoints = appData["area_points"];
    let appAreaVector = appData["area_vector"];
    
    let scale = parseFloat(document.getElementById("app_scale").textContent);
    
    // name
    updateModelAppOption("model", trgModel, appName);
    
    // depend_on
    if(appDepend) updateLabelDropdown(appDepend);
    else updateLabelDropdown();

    // area_points
    if (appAreaPoints) {
        document.getElementById('area_info').textContent = JSON.stringify(appAreaPoints);
    }
    
    // area_vector
    if (appAreaVector) document.getElementById('vector_info').textContent = JSON.stringify(appAreaVector);
    
}

function enableVectorMode() { 
    vectorModeFlag = true; 
    console.log("Set Vector Mode Flag: ", vectorModeFlag);
}

function disableVectorMode() { 
    vectorModeFlag = false; 
    console.log("Set Vector Mode Flag: ", vectorModeFlag);
}

// Poly Mode Function

// Change to poly mode
function polyMode(confirm){
    /*
        將 Canvas 設定成多邊形模式
            1. 禁止 Area Icon 點選
            2. 開放 Vector Icon 點選
            3. 將 Canvas 事件設定成 areaEvent
     */
    if (confirm === true) confirmCanvas();

    penMode = "poly";
    disableAreaIcon();
    enableVectorIcon();

    appCanvas.removeEventListener("mousedown", vectorEvent);
    appCanvas.addEventListener("mousedown", areaEvent);
    
}

// The event of poly mode 
function areaEvent(event) {
    
    let org_x = event.offsetX, org_y = event.offsetY ;

    let scaledX = appCanvas.width/ appCanvas.offsetWidth;
    let scaledY = appCanvas.height/ appCanvas.offsetHeight;
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);

    areaPoints[areaIndex].push( [ trg_x, trg_y ] );
    
    areaInfo.innerHTML = JSON.stringify(areaPoints);

    drawPolyEvent(areaIndex);
}

function vectorMode(confirm){

    if (confirm === true) confirmCanvas();

    penMode = "vector";
    disableVectorIcon();
    enableAreaIcon();
    
    appCanvas.removeEventListener("mousedown", areaEvent);
    appCanvas.addEventListener("mousedown", vectorEvent);
}


function vectorEvent(event){
    // Got Mouse Down Position
    let org_x = event.offsetX, org_y = event.offsetY ;

    // Vector only need two point to draw, %2 -> 0, 1, 0, 1
    curIndex = vecPoints[vecIndex].length%2
    if (curIndex==0){
        vecPoints[vecIndex] = [];
        retVecPoints[vecIndex] = [];
    }

    // Get canvas scale 
    let scaledX = appCanvas.width / appCanvas.offsetWidth
    let scaledY = appCanvas.height / appCanvas.offsetHeight;
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);
    
    vecPoints[vecIndex][curIndex] = [ trg_x, trg_y];

    vecInfo.innerHTML = JSON.stringify(vecPoints);

    drawVecEvent()

}

// Draw Helper Function

// Draw a dot.
function drawDot(x, y){ appCtx.arc(x, y, 2, 0, 2*Math.PI); }

function drawPreview(){
    appCtx.clearRect(0, 0, appCanvas.width, appCanvas.height);
    drawPrePoly(areaIndex);
    drawPreVec(vecIndex);
}

function drawArrow(fromx, fromy, tox, toy, arrowWidth){
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);
 
    // ctx.save();
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    appCtx.beginPath();
        
    appCtx.moveTo(fromx, fromy);
    appCtx.lineTo(tox, toy);
    appCtx.lineWidth = arrowWidth;
    appCtx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    appCtx.beginPath();
    appCtx.moveTo(tox, toy);
    
    // ###########################################
    const angleBais = Math.PI/7

    const topPoint = [ tox, toy ];

    const leftPoint = [ topPoint[0]-headlen*Math.cos(angle-angleBais), 
                        topPoint[1]-headlen*Math.sin(angle-angleBais) ]

    const rightPoint = [ topPoint[0]-headlen*Math.cos(angle+angleBais), 
                        topPoint[1]-headlen*Math.sin(angle+angleBais) ]

    appCtx.lineTo(leftPoint[0], leftPoint[1]);
    appCtx.lineTo(rightPoint[0], rightPoint[1]);
    appCtx.lineTo(topPoint[0], topPoint[1]);
    appCtx.lineTo(leftPoint[0], leftPoint[1]);

    //draws the paths created above
    appCtx.stroke();
    // ctx.restore();    
}

function drawCurVec(inVectorIndex){

    appCtx.fillStyle = vecPalette[inVectorIndex%vecPalette.length];
    appCtx.strokeStyle = vecPalette[inVectorIndex%vecPalette.length];

    // Check recent area is not null
    appCtx.beginPath()

    drawArrow(  
        vecPoints[inVectorIndex][0][0], 
        vecPoints[inVectorIndex][0][1],
        vecPoints[inVectorIndex][1][0],
        vecPoints[inVectorIndex][1][1],
        5)    
    
    appCtx.closePath()
}

function drawPreVec(inVectorIndex){
    
    for(let vecID=0; vecID<inVectorIndex; vecID++){

        if(vecPoints[vecID].length===0) return undefined;
        for(let idx=0; idx<vecPoints[vecID].length; idx++){
            drawCurVec(vecID)
        }
        
    }
}

function drawVecEvent(inVectorIndex) {

    if ( inVectorIndex === undefined ) inVectorIndex = vecIndex;

    // Draw Preview Vector
    drawPreview(inVectorIndex);
    
    if (vecPoints[inVectorIndex].length === 1){
        console.log("Get one vector");
        appCtx.beginPath()
        appCtx.fillStyle = vecPalette[inVectorIndex%vecPalette.length];
        appCtx.strokeStyle = vecPalette[inVectorIndex%vecPalette.length];
        drawDot(vecPoints[inVectorIndex][0][0], vecPoints[inVectorIndex][0][1]);
        appCtx.fill()
        appCtx.closePath()
    } else if (vecPoints[inVectorIndex].length === 2) {
        drawCurVec(inVectorIndex);
    }

}


function drawCurPoly(inAreaIndex){

    appCtx.fillStyle = areaPalette[inAreaIndex%areaPalette.length];
    appCtx.strokeStyle = areaPalette[inAreaIndex%areaPalette.length];
    // new path to draw

    appCtx.beginPath()

    if ( inAreaIndex === undefined ) inAreaIndex = areaIndex;
    if(areaPoints[inAreaIndex].length===0) return undefined;

    // Draw current area
    for(let idx=0; idx<areaPoints[inAreaIndex].length; idx++){

        // Draw dots
        drawDot(areaPoints[inAreaIndex][idx][0], areaPoints[inAreaIndex][idx][1]);
        
        if(idx===0){
            // setup the start point: move the brush to first point.
            appCtx.moveTo(areaPoints[inAreaIndex][0][0], areaPoints[inAreaIndex][0][1]);
        }else {
            // start painting
            appCtx.lineTo(areaPoints[inAreaIndex][idx][0], areaPoints[inAreaIndex][idx][1]);
        }    
    }
    
	appCtx.fill()
    appCtx.closePath()
    
}

function drawPrePoly(inAreaIndex){

    for(let areaID=0; areaID<inAreaIndex; areaID++){
        // console.log(`Draw Poly ${areaID}`);
        if(areaPoints[areaID].length===0) return undefined;    
        drawCurPoly(areaID);
    }
}

function drawPolyEvent(inAreaIndex){
    // console.log("Draw Poly Event");
    if ( inAreaIndex === undefined ) inAreaIndex = areaIndex;

    // Draw Preview Polygons
    drawPreview(inAreaIndex)

    // appCtx.beginPath();
    // Draw current area
    drawCurPoly(inAreaIndex)

}

// Re-scale Value

async function getRescaleAreaPoint(){

    const scale = parseFloat(document.getElementById("app_scale").textContent);
    let retAreaPoints = {};
    
    for( let areaID=0; areaID<=areaIndex; areaID++){
        
        retAreaPoints[areaID] = [];
        for ( let ptID=0; ptID<areaPoints[areaID].length;ptID++){
            
            orgX = areaPoints[areaID][ptID][0];
            orgY = areaPoints[areaID][ptID][1];

            trgX = Math.round(orgX/scale);
            trgY = Math.round(orgY/scale);
            
            retAreaPoints[areaID].push( [ trgX, trgY ] );
        }
    }
    
    // areaInfo.innerHTML = JSON.stringify(retAreaPoints);
    return retAreaPoints
}

async function getRescaleVectorPoint(){

    const scale = parseFloat(document.getElementById("app_scale").textContent);
    let retVecPoints = {};
    
    for( let vecID=0; vecID<=vecIndex; vecID++){
        
        retVecPoints[vecID] = [];

        for ( let ptID=0; ptID<vecPoints[vecID].length;ptID++){
            
            orgX = vecPoints[vecID][ptID][0];
            orgY = vecPoints[vecID][ptID][1];

            trgX = Math.round(orgX/scale);
            trgY = Math.round(orgY/scale);
            
            retVecPoints[vecID].push( [ trgX, trgY ] );
        }
    }
        
    console.log(retVecPoints);
    // vecInfo.innerHTML = JSON.stringify(retVecPoints);
    return retVecPoints
}

// Canvas Helper Function


// Update Area & Vector Block Title
function updateHeader(){
    let header = `Define Area ( ${areaIndex} )`;
    if ( vectorModeFlag==true ){
        header = `${header} Vector ( ${vecIndex} )`;  
    } 
    document.getElementById("area-header").innerText = header;
}

// Clear Canvas: the entrance of recoveryVectorPoint and recoveryAreaPoint
function clearCanvas(){
    if ( penMode === "vector" ) recoveryVectorPoint();
    else recoveryAreaPoint();
}

// Recovery Area Point
function recoveryAreaPoint(){
    /*
        將 Area Point 復原
            1. 當該區域仍然有值 : pop out
            2. 當該區域沒有值   : delete it
    */
    console.log("Recovery Area Point");
    if(areaPoints===undefined || areaPoints==={} || Object.keys(areaPoints).length===0 ) return undefined;
    if(areaIndex===undefined) return undefined;

    if (areaPoints[areaIndex].length !== 0 ){
        areaPoints[areaIndex].pop();
        drawPolyEvent(areaIndex);
    }
    else if (areaIndex !== 0 && areaPoints[areaIndex].length === 0) {
        // console.log(`pop ${areaIndex}`);
        delete areaPoints[areaIndex];
        drawPrePoly(areaIndex);
        areaIndex = areaIndex - 1;
        updateHeader();
    }

    areaInfo.innerHTML = JSON.stringify(areaPoints);
}

// Recovery Vector Point
function recoveryVectorPoint(){
    /*
        將 Area Point 復原
            1. 當該區域仍然有值 : pop out
            2. 當該區域沒有值   : delete it
    */
    console.log("Recovery Vector Point");

    if(vecPoints===undefined || vecPoints==={} || Object.keys(vecPoints).length===0 ) return undefined;
    if(vecIndex===undefined) return undefined;

    if (vecPoints[vecIndex].length !== 0 ){
        vecPoints[vecIndex].pop();
        drawVecEvent(vecIndex);
    }
    else if (vecIndex !== 0 && vecPoints[vecIndex].length === 0) {
        // console.log(`pop ${vecIndex}`);
        delete vecPoints[vecIndex];
        // drawPrePoly(vecIndex);
        vecIndex = vecIndex - 1;
        updateHeader();
    }

    vecInfo.innerHTML = JSON.stringify(vecPoints);
}

// Confirm Canvas: the entrance of confirmCanvas and confirmArea
function confirmCanvas() {

    if ( penMode === "vector" ) confirmVector();
    else confirmArea();
}

function confirmArea(){
    if(areaPoints[areaIndex].length < 3){
        alert("The area point is empty, please at least select three points...");
        return undefined;
    }

    areaIndex = areaIndex + 1;
    areaPoints[areaIndex] = [] ;
    areaInfo.innerHTML = JSON.stringify(areaPoints);
    updateHeader();
}

function confirmVector(){
    if(vecPoints[vecIndex].length !== 2){
        alert("The vector point excepted length is 2, please check again ...");
        return undefined;
    }
    
    vecIndex = vecIndex + 1;
    vecPoints[vecIndex] = [] ;
    vecInfo.innerHTML = JSON.stringify(vecPoints);
    updateHeader();
}

function initCanvasParam(){
    /*
    初始畫 Canvas 的相關資料
        - 當 Edit Mode 不清空資料
    */
    console.log(`Init Canvas Parameter ( ${window[MODE]} )`);

    areaPoints = {};
    areaIndex = 0;
    
    vecPoints = {};
    vecIndex = 0;
    areaPoints[areaIndex] = [];
    vecPoints[vecIndex] = [];

    if ( window[MODE]===ADD_MODE ){
        areaInfo.innerHTML = "";
        vecInfo.innerHTML = "";
    }
    else if ( window[MODE]===EDIT_MODE ) {
        
        const scale = parseFloat(document.getElementById("app_scale").textContent);
        if(scale) console.log(`Get image scale ... (${scale})`);

        if(areaInfo.textContent){
            areaPoints = JSON.parse(areaInfo.textContent);

            // rescale
            for ( const key in areaPoints ) {
                for ( const pts in areaPoints[key] ){
                    areaPoints[key][pts][0] = areaPoints[key][pts][0]*scale
                    areaPoints[key][pts][1] = areaPoints[key][pts][1]*scale
                }
            }

            areaIndex = Object.keys(areaPoints).length-1;
            console.log("Get Area Info Data: ", areaPoints, areaIndex);
        }

        if (vecInfo.textContent) {
            vecPoints = JSON.parse(vecInfo.textContent);

            // rescale
            for ( const key in vecPoints ) {
                for ( const pts in vecPoints[key] ){
                    vecPoints[key][pts][0] = vecPoints[key][pts][0]*scale
                    vecPoints[key][pts][1] = vecPoints[key][pts][1]*scale
                }
            }

            vecIndex = Object.keys(vecPoints).length-1;
            console.log("Get Vector Info Data: ", vecPoints, vecIndex);
        }

    }

    document.getElementById('draw-confirm-bt').onclick = confirmCanvas;

    document.getElementById('draw-clear-bt').onclick = clearCanvas;

}

// Search Engine

// Check does anything checked
async function atLeastOneRadio() {
    var radios = document.querySelectorAll('.app-opt:checked');
    var value = radios.length>0 ? radios.length: 0;
    document.getElementById("label_list_menu").textContent = `Select ${value} Labels`
}

// Select all label
function toggle(source) {
    var checkboxes = document.querySelectorAll('.app-opt');
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i] != source)
            checkboxes[i].checked = source.checked;
    }
    atLeastOneRadio();
}

// Application Helper Function

// Update Model Label Dropdown
async function updateLabelDropdown(dependOn) {
    /*
        更新模型可用的標籤
            1. 從上一個頁面的元素中找到參數
            2. 清除 dropdown-div
            3. 取得模型的 UUID
            4. 根據該模型 UUID 取得對應的 LABEL
     */
    console.log('Update Label Dropdown');
    
    // Get target model name
    let head = "";
    if ( window[MODE] === EDIT_MODE) head = "edit_";
    const modelName = document.getElementById(`${head}model_menu`).textContent;

    // Clear dropdown-div
    document.querySelectorAll("#dropdown-div")
        .forEach( function(ele, idx){ ele.remove(); });

    // Get the model UUID
    const modelWithUUID = await getAPI( "/model" );
    if (! modelWithUUID) return undefined;

    // Get model label
    const taskUUID    = modelWithUUID[modelName][0];
    const taskLabel   = await getAPI( `/task/${taskUUID}/label` )
    if (! taskLabel) return undefined;
    
    // Update label on background
    updateLabelBackground(taskLabel, dependOn);
}

function updateLabelBackground(taskLabel, dependOn){
    const labelList = document.getElementById("label_list");
    let needCheck;

    if (dependOn!==undefined) document.querySelector('.app-sel-all').checked = false
    else document.querySelector('.app-sel-all').checked = true

    document.getElementById("label_list_menu").textContent = `Select ${dependOn.length} Labels`;

    for(let i=0; i<taskLabel.length; i++){

        let newDiv = document.createElement("div"); 
        let newInput = document.createElement("input");
        let newText = document.createElement("a");
    
        newText.setAttribute("class", "app-opt-text");
        newText.innerHTML = `${taskLabel[i]}`;
    
        newInput.setAttribute("class", "app-opt");
        newInput.setAttribute("type", "checkbox");
        newInput.setAttribute("onchange", "atLeastOneRadio(this)");
        
        // Check it
        needCheck = true;
        if (dependOn!==undefined){
            if ( ! dependOn.includes(taskLabel[i])) needCheck = false; 
        } 
        newInput.checked = needCheck;
    
        newDiv.setAttribute("id", "dropdown-div");
        newDiv.setAttribute("class", "dropdown-item d-flex flex-row align-items-center");
        
        newDiv.appendChild(newInput);
        newDiv.appendChild(newText);

        labelList.appendChild(newDiv);
    }

}

// Loading Frame Event

function showLoading(){ document.getElementById("loading").style.display = "block"; }
function hideLoading(){ document.getElementById("loading").style.display = "none"; }



function disableAppArea(){
    document.getElementById("area_div").style = "display: none";
    document.getElementById("app_scale").textContent = "";
    // document.getElementById("area_info").textContent = "";
    
    hideLoading();
}

function clearAppArea(){
    document.getElementById("area_div").style = "display: none";
    document.getElementById("app_scale").textContent = "";
    document.getElementById("area_info").textContent = "";
    hideLoading();
    clearCanvas();
}

async function enableAppArea(trg_mode=""){
    console.log("Enable App Area ...");

    // trg_mode = "";
    if (window["MODE"]===EDIT_MODE) trg_mode = "edit_";
    console.log(`Update Area Setting, Mode: ${trg_mode}`);

    // Element Behaviour
    showLoading()
    document.getElementById("modal_app_submit").disabled = true;
    document.getElementById("modal_back_bt").disabled = true;
    
    let appCanvas   = document.getElementById("app_canvas");
    let appFrame    = document.getElementById("app_frame");
    let appCtx      = appCanvas.getContext("2d");
    let appScale    = document.getElementById("app_scale");
    let img         = new Image();
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
        formData.append(key, data[key]); }
    
    // Double Check Form Data
    // for (var pair of formData.entries()) console.log(pair[0]+ ', ' + pair[1]); 

    // Update Source
    const retData = await postAPI(`/update_src`, formData, FORM_FMT, ALERT)
    if(!retData) return undefined;

    imgHeight   = retData["height"];
    imgWidth    = retData["width"];

    // setup canvas width and height
    imgRate             = imgHeight/imgWidth;
    appCanvas.height    = appCanvas.width*imgRate;
    imgScale            = appCanvas.width/imgWidth

    // load image
    document.getElementById("area_div").style.display = "block";
    img.src = "data:image/jpeg;base64," + retData["image"];
    appCanvas.style.backgroundImage = `url(${img.src})`;
    document.getElementById("modal_app_submit").disabled = false;
    document.getElementById("modal_back_bt").disabled = false;
    hideLoading();
    
    // calculate scale
    appScale.textContent = imgScale;
    console.log(`H:${imgHeight}, W:${imgWidth}, Ratio:${imgScale}`);

    // If area_info has content
    initCanvasParam();
    if(document.getElementById("area_info").textContent !== ""){   
          
        drawPolyEvent();
    }

    // Disable Area Icon
    startDrawTips();

    polyMode();
    disableAreaIcon();
    
}

function enableLogic(){
    document.getElementById("logic_card").style.display = "";
}

function disableLogic(){
    document.getElementById("logic_card").style.display = "none";
}

function enableAlarm(){
    document.getElementById("alarm_card").style.display = "";
}

function disableAlarm(){
    document.getElementById("alarm_card").style.display = "none";
}

function enableSensitive(){
    document.getElementById("sensitive_card").style.display = "";
}

function disableSensitive(){
    document.getElementById("sensitive_card").style.display = "none";
}

function enableAreaIcon(){
    document.getElementById('draw-poly-icon').style.display = "";
    document.getElementById('draw-poly-icon').style.cursor = "pointer";
    document.getElementById('draw-poly-icon').setAttribute("onclick", "polyMode(true)")
    document.getElementById("draw-poly-icon").style.color = "gray";
}

function disableAreaIcon(){
    document.getElementById('draw-poly-icon').style.cursor = "auto";
    document.getElementById('draw-poly-icon').removeAttribute("onclick")
    document.getElementById("draw-poly-icon").style.color = "red";
}

function displayVector(){
    document.getElementById('draw-vector-icon').style.display = ""
    document.getElementById("vector_table").style.display = "";
}

function blockVector(){
    document.getElementById('draw-vector-icon').style.display = "none"
    document.getElementById("vector_table").style.display = "none";
}

function disableVectorIcon(){ 
    document.getElementById('draw-vector-icon').style.cursor = "auto";
    document.getElementById('draw-vector-icon').removeAttribute("onclick");
    document.getElementById("draw-poly-icon").style.color = "red";
}

function enableVectorIcon(){ 
    document.getElementById('draw-vector-icon').style.cursor = "pointer";
    document.getElementById('draw-poly-icon').setAttribute("onclick", "polyMode(true)")
    document.getElementById('draw-vector-icon').setAttribute("onclick", "vectorMode(true)")
    document.getElementById("draw-poly-icon").style.color = "gray";
}


function appAreaEvent(){
    
    enableAlarm();
    // initCanvasParam();
    document.getElementById('area-header').textContent = "Detected Area ( 0 ) ";
    enableAppArea();
    enableSensitive();
    disableVectorMode();

}

function appCountingEvent(){
    enableAlarm();
    enableLogic();
}

function appDirectionEvent(){
    enableAlarm();
    // initCanvasParam();
    enableAppArea();
    enableSensitive();
    displayVector();
    enableVectorIcon();
    enableVectorMode();
    enableAreaIcon();
    
}

function initAppItem(){
    disableAlarm();
    disableLogic();
    disableAppArea();
    disableSensitive();
    blockVector();
}

// Update Application Items
function updateAppItem(srcType){
    console.log('Update Application Item', srcType);
    initAppItem();

    if (srcType.includes('area')) appAreaEvent();
    else if (srcType.includes('counting')) appCountingEvent();
    else if (srcType.includes('direction')) appDirectionEvent();
    else { console.log("Unknown App Type"); return undefined; }
}

var createPopover = function (item, title) {
                        
    var $pop = $(item);
    
    $pop.popover({
        placement: 'bottom',
        trigger: 'click',
        html: true,
        tabindex: -1,
        container: 'body',
        content: function () {
            $('#popup-content').text(`${title}`);
            
            return $('#custom-popup').html();
        }
    }).on('shown.bs.popover', function(e) {
        //console.log('shown triggered');
        // 'aria-describedby' is the id of the current popover
        var current_popover = '#' + $(e.target).attr('aria-describedby');
        var $cur_pop = $(current_popover);
    
        $cur_pop.find('.close').click(function(){
            //console.log('close triggered');
            $pop.popover('hide');
        });
    
        $cur_pop.find('.OK').click(function(){
            //console.log('OK triggered');
            $pop.popover('hide');
        });

        

    });

    return $pop;
};


var createNextPopover = function (item, content, next) {
    let $pop = $(item);
    let borderColor = 'gray';
    $pop.popover({
        placement: 'bottom',
        trigger: 'focus',
        html: true,
        content: function () {
            $('#popup-content').text(content);
            $pop.css('border-color', borderColor);
            
            return $('#custom-popup').html();
        }
    }).on('show.bs.popover', function(e){
        $('.draw-btn').css('z-index', '1050');
        $('#popover-bg').css('display', 'block');  

    }).on('shown.bs.popover', function(e) {
        // 'aria-describedby' is the id of the current popover
        var current_popover = '#' + $(e.target).attr('aria-describedby');
        var $cur_pop = $(current_popover);
        $cur_pop.find('.OK').click(function(){
            //console.log('OK triggered');
            $pop.css('border-color', '');
            
            $('#popover-bg').css('display', 'block');
            $pop.popover('hide');
            
            if(next!==undefined) $(next).popover('show');
        });

        document.addEventListener('keydown', popoverKeyEvent);


    }).on('hide.bs.popover', function(e){
        $('#popover-bg').css('display', 'none');
        $('.draw-btn').css('z-index', '');

        document.removeEventListener('keydown', popoverKeyEvent);

    })

    return $pop;
}

function appDrawTips(){
    
    
    try{
        createNextPopover('#draw-poly-icon'     , 'Click on canvas to draw detect area ( polygon ).', '#draw-confirm-bt');
        createNextPopover('#draw-confirm-bt'    , 'Click Button to draw another area or vector', '#draw-clear-bt');
        
        if (vectorModeFlag) createNextPopover('#draw-clear-bt'      , 'Recovery the last action', '#draw-vector-icon');
        else createNextPopover('#draw-clear-bt'      , 'Recovery the last action');

        createNextPopover('#draw-vector-icon'   , 'Click two point to define the moving direction ( vector ) of the object.');
    } catch (e) {
        console.log(e);
    }
    // $('#draw-poly-icon').popover('show');
}

function startDrawTips(){
    console.log('Show Tips');
    appDrawTips();
    $('#draw-poly-icon').popover('show');
}

function popoverKeyEvent(e){
    if(e.keyCode === 13) $('.OK').click();
}


$(document).ready(function () {
    // appDrawTips();
    // initCanvasParam();
    // createPopover('#showPopover', 'Demo popover!');
    
});