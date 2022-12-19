let areaPoints = {};
let areaIndex = 0;

let vecPoints = {};
let vecIndex = 0;


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
        areaInfo.textContent = JSON.stringify(appAreaPoints);
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
    let ret ;
    if (confirm === true) ret = confirmCanvas();
    if ( ret === false ) return undefined;

    penMode = "poly";
    disableAreaIcon();
    enableVectorIcon();

    appCanvas.removeEventListener("mousedown", vectorEvent);
    appCanvas.addEventListener("mousedown", areaEvent);
    
    console.log("Poly Mode");
}

// The event of poly mode 
let scale;
function areaEvent(event) {
    scale = parseFloat(document.getElementById("app_scale").textContent);
    
    let orgX = event.offsetX, orgY = event.offsetY ;
    let scaledX = appCanvas.width/ appCanvas.offsetWidth;
    let scaledY = appCanvas.height/ appCanvas.offsetHeight;
    let trgX = (orgX * scaledX).toFixed(2);
    let trgY = (orgY * scaledY).toFixed(2);

    areaPoints[areaIndex].push( [ trgX, trgY ] );
    
    let retX = Math.round(orgX/scale);
    let retY = Math.round(orgY/scale);

    getRescaleAreaPoint();

    drawPolyEvent(areaIndex);

    console.log("Poly Mode");
}

function vectorMode(confirm){
    
    let ret ;
    if (confirm === true) ret = confirmCanvas();
    if ( ret === false ) return undefined;


    penMode = "vector";
    disableVectorIcon();
    enableAreaIcon();
    
    appCanvas.removeEventListener("mousedown", areaEvent);
    appCanvas.addEventListener("mousedown", vectorEvent);

    console.log("Vector Mode");
}

function vectorEvent(event){
    // Got Mouse Down Position
    let org_x = event.offsetX, org_y = event.offsetY ;

    
    // Vector only need two point to draw, %2 -> 0, 1, 0, 1
    curIndex = vecPoints[vecIndex].length%2
    
    // Get canvas scale 
    let scaledX = appCanvas.width / appCanvas.offsetWidth
    let scaledY = appCanvas.height / appCanvas.offsetHeight;
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);
    
    vecPoints[vecIndex][curIndex] = [ trg_x, trg_y];

    // vecInfo.innerHTML = JSON.stringify(vecPoints);
    getRescaleVectorPoint();

    drawVecEvent()

}

// Draw Helper Function

// Draw a dot.
function drawDot(x, y){ appCtx.arc(x, y, 2, 0, 2*Math.PI); }

function drawPreview(){
    appCtx.clearRect(0, 0, appCanvas.width, appCanvas.height);
    drawPrePoly();
    drawPreVec();
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

    if ( inVectorIndex === undefined ) inVectorIndex = vecIndex;
    if(vecPoints[inVectorIndex].length===0) return undefined;

    console.log('Draw Current Poly, ', inVectorIndex);
    
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

function drawPreVec(){

    const vecIndexList = Object.keys(vecPoints)
    const vecNum   = vecIndexList.length

    for(let i=0; i<vecNum; i++){
        vecKey = parseFloat(vecIndexList[i]);
        
        if(vecPoints[vecKey].length!==2) return undefined;    
        drawCurVec(vecKey);
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
        console.log("Draw arrow");
        drawCurVec(inVectorIndex);
    }

}


function drawCurPoly(inAreaIndex){
    
    if ( inAreaIndex === undefined ) inAreaIndex = areaIndex;
    if(areaPoints[inAreaIndex].length===0) return undefined;

    console.log('Draw Current Poly, ', inAreaIndex);

    appCtx.fillStyle = areaPalette[inAreaIndex%areaPalette.length];
    appCtx.strokeStyle = areaPalette[inAreaIndex%areaPalette.length];
    // new path to draw

    appCtx.beginPath()
    
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

function drawPrePoly(){

    const areaIndexList = Object.keys(areaPoints)
    const areaNum   = areaIndexList.length

    for(let i=0; i<areaNum; i++){
        areaKey = areaIndexList[i];
        
        if(areaPoints[areaKey].length===0) return undefined;    
        drawCurPoly(areaKey);
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
    let _retAreaPoints = {};
    
    for( const key in areaPoints){

        _retAreaPoints[key] = [];
        for( const pts in areaPoints[key] ){
            _retAreaPoints[key].push( 
                [ Math.round(areaPoints[key][pts][0]/scale), Math.round(areaPoints[key][pts][1]/scale) ]
            )
        }
    }
    
    areaInfo.innerHTML = JSON.stringify(_retAreaPoints);
    return _retAreaPoints
}

async function getRescaleVectorPoint(){

    const scale = parseFloat(document.getElementById("app_scale").textContent);
    let _retVecPoints = {};

    for( const key in vecPoints){

        _retVecPoints[key] = [];
        for( const pts in vecPoints[key] ){
            _retVecPoints[key].push( 
                [ Math.round(vecPoints[key][pts][0]/scale), Math.round(vecPoints[key][pts][1]/scale) ]
            )
        }
    }

    vecInfo.innerHTML = JSON.stringify(_retVecPoints);
    return _retVecPoints
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
        drawPrePoly();
        areaIndex = areaIndex - 1;
        updateHeader();
    }

    getRescaleAreaPoint();
    
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

    // vecInfo.innerHTML = JSON.stringify(vecPoints);
    getRescaleVectorPoint();
}

// Confirm Canvas: the entrance of confirmCanvas and confirmArea

function confirmCanvas() {
    
    let trgFunc = penMode === "vector" ? confirmVector : confirmArea;
    let ret = trgFunc();
    console.log(`Confirm Canvas: ${ret} (${penMode} )`);
    return ret
}

function confirmArea(){

    if(areaPoints[areaIndex].length < 3){
        alert("The area point is empty, please at least select three points...");
        return false;
    }

    areaIndex = areaIndex + 1;
    areaPoints[areaIndex] = [] ;
    getRescaleAreaPoint()
    updateHeader();
    return true;
}

function confirmVector(){
    
    if(vecPoints[vecIndex].length !== 2){
        alert("The vector point excepted length is 2, please check again ...");
        return false;
    }
    
    vecIndex = vecIndex + 1;
    vecPoints[vecIndex] = [] ;
    // vecInfo.innerHTML = JSON.stringify(vecPoints);
    getRescaleVectorPoint();
    updateHeader();
    return true;
}

async function _rescaleHelper(points, scale){
    if(!points || !scale) return undefined;
    let tempData = {};
    for ( const idx in points ){
        let intID = parseInt(idx)
        tempData[ intID ] = [];
        for ( const pts in points[intID] ){
            let pt = [ points[intID][pts][0]*scale, points[intID][pts][1]*scale ];
            tempData[ intID ].push(pt)
        }
    }
    console.log('Rescale points, Scale:', scale ,'\n', points, tempData);
    return tempData;
}


async function initCanvasParam(){
    /*
    初始畫 Canvas 的相關資料
        - 當 Edit Mode 不清空資料
    */
    console.log(`Init Canvas Parameter ( ${window[MODE]} )`);

    // Init point object
    areaPoints  = {};
    vecPoints   = {};

    // Add mode need to initial to zero
    if ( window[MODE]===ADD_MODE ){
        areaIndex = 0, vecIndex = 0;
        areaInfo.innerHTML = "", vecInfo.innerHTML = "";
    }
    else if ( window[MODE]===EDIT_MODE ) {

        const scale     = parseFloat(document.getElementById("app_scale").textContent);
        const hasArea   = Boolean(areaInfo.textContent);
        const hasVec    = Boolean(vecInfo.textContent);

        let areaMinIndex    = 0; 
        let vecMinIndex     = 0; 

        if(hasArea){
            
            let _areaPoints = JSON.parse(areaInfo.textContent);
            areaPoints      = await _rescaleHelper(_areaPoints, scale);
            areaKeys        = Object.keys(areaPoints).map(function(x){ return parseInt(x) });
            areaMinIndex    = areaKeys[0];
            areaIndex       = areaKeys[ areaKeys.length-1 ] + 1;
        }

        if (hasVec) {
            
            let _vecPoints = JSON.parse(vecInfo.textContent);
            vecPoints       = await _rescaleHelper(_vecPoints, scale);
            vecKeys         = Object.keys(vecPoints).map(function(x){ return parseInt(x) });
            vecMinIndex     = vecKeys[0];
            vecIndex        = vecKeys[ vecKeys.length-1 ] + 1;
        }

        if(!hasArea) areaIndex = vecMinIndex;            
        if(!hasVec) vecIndex = areaMinIndex;

    }
    
    // Init New Area or Vector Index
    areaPoints[areaIndex]   = [];
    vecPoints[vecIndex]     = [];
    
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
    let needCheck, selectedNum;
    const noDefaultValue = (dependOn===undefined);

    if (noDefaultValue){
        document.querySelector('.app-sel-all').checked = true;
        selectedNum = taskLabel.length;
    } else {
        document.querySelector('.app-sel-all').checked = false;
        selectedNum = dependOn.length;
    }
    
    // Update Title
    document.getElementById("label_list_menu").textContent = `Select ${selectedNum} Labels`;

    // Generate Option and Check
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
    const retData = await postAPI(`/add_src`, formData, FORM_FMT, ALERT)
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
    // console.log(`H:${imgHeight}, W:${imgWidth}, Ratio:${imgScale}`);

    // Init Canvas
    await initCanvasParam();
    // If area_info has content
    if(document.getElementById("area_info").textContent !== ""){
        drawPreview();
    }

    polyMode();
    disableAreaIcon();      
    startDrawTips();
}

// Application Custom Event

function enableLogic(){ document.getElementById("logic_card").style.display = ""; }

function disableLogic(){ document.getElementById("logic_card").style.display = "none"; }

function enableAlarm(){ document.getElementById("alarm_card").style.display = ""; }

function disableAlarm(){ document.getElementById("alarm_card").style.display = "none"; }

function enableSensitive(){ document.getElementById("sensitive_card").style.display = ""; }

function disableSensitive(){ document.getElementById("sensitive_card").style.display = "none"; }

function enableAreaIcon(){
    document.getElementById('draw-poly-icon').style.display = "";
    document.getElementById('draw-poly-icon').style.cursor = "pointer";
    document.getElementById('draw-poly-icon').setAttribute("onclick", "polyMode(true)")
    document.getElementById("draw-poly-icon").style.color = "gray";
}

function disableAreaIcon(){
    console.log("Disable Area Icon");
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
    console.log("Disable Vector Icon");
    document.getElementById('draw-vector-icon').style.cursor = "auto";
    document.getElementById('draw-vector-icon').removeAttribute("onclick");
    document.getElementById("draw-vector-icon").style.color = "red";
}

function enableVectorIcon(){ 
    document.getElementById('draw-vector-icon').style.cursor = "pointer";
    document.getElementById('draw-poly-icon').setAttribute("onclick", "polyMode(true)")
    document.getElementById('draw-vector-icon').setAttribute("onclick", "vectorMode(true)")
    document.getElementById("draw-vector-icon").style.color = "gray";
}

// ----------

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
    enableAppArea();
}

function appTrackingEvent(){
    enableAppArea();
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
    else if (srcType.includes('tracking')) appTrackingEvent();
    else { console.log("Unknown App Type: ", srcType); return undefined; }
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
            
            try { if(next!==undefined) $(next).popover('show'); } 
            catch(e) { console.log('popover error, might trying to open vector popover'); };

        });

        document.addEventListener('keydown', popoverKeyEvent);


    }).on('hide.bs.popover', function(e){
        $('#popover-bg').css('display', 'none');
        $('.draw-btn').css('z-index', '');

        document.removeEventListener('keydown', popoverKeyEvent);

    })

    return $pop;
}

async function createAppDrawTips(){
    
    try{

        let p1 = createNextPopover('#draw-poly-icon'     , 'Click on canvas to draw detect area ( polygon ).', '#draw-confirm-bt');
        let p2 = createNextPopover('#draw-confirm-bt'    , 'Click Button to draw another area or vector', '#draw-clear-bt');
        let p3 = createNextPopover('#draw-clear-bt'      , 'Recovery the last action', '#draw-vector-icon');
        let p4 = createNextPopover('#draw-vector-icon'   , 'Click two point to define the moving direction ( vector ) of the object.');

    } catch (e) { console.log(e);}
}

async function startDrawTips(){ $('#draw-poly-icon').popover('show'); }

function popoverKeyEvent(e){ if(e.keyCode === 13) $('.OK').click(); }

$(document).ready(function () {
    // initCanvasParam();
    createAppDrawTips();
});