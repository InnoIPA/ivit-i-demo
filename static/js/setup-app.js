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


$(document).ready(function () {

    initCanvasParam();

});

function enableVectorMode() { 
    vectorModeFlag = true; 
    console.log("Set Vector Mode Flag: ", vectorModeFlag);
}
function disableVectorMode() { 
    vectorModeFlag = false; 
    console.log("Set Vector Mode Flag: ", vectorModeFlag);
}

function polyMode(confirm){
    
    if (confirm === true) confirmCanvas();

    penMode = "poly";
    disableAreaIcon();
    enableVector();

    document.getElementById("draw-poly-icon").style.color = "red";
    document.getElementById("draw-vector-icon").style.color = "gray";
    
    appCanvas.removeEventListener("mousedown", vectorEvent);
    appCanvas.addEventListener("mousedown", areaEvent);
    
}

function vectorMode(confirm){

    if (confirm === true) confirmCanvas();

    penMode = "vector";
    disableVector();
    enableAreaIcon();
    

    document.getElementById("draw-poly-icon").style.color = "gray";
    document.getElementById("draw-vector-icon").style.color = "red";
    
    appCanvas.removeEventListener("mousedown", areaEvent);
    appCanvas.addEventListener("mousedown", vectorEvent);
}

function vectorEvent(event){
    // Got Mouse Down Position
    let org_x = event.offsetX
    let org_y = event.offsetY ;
    
    // Get canvas scale 
    let scaledX = appCanvas.width / appCanvas.offsetWidth
    let scaledY = appCanvas.height / appCanvas.offsetHeight;
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);

    // Vector only need two point to draw
    curIndex = vecPoints[vecIndex].length%2
    if (curIndex==0){
        vecPoints[vecIndex] = [];
        retVecPoints[vecIndex] = [];
    }

    vecPoints[vecIndex][curIndex] = [ trg_x, trg_y];
        
    // For backend ( real image )
    const scale = parseFloat(document.getElementById("app_scale").textContent);

    correct_x = Math.round(trg_x/scale);
    correct_y = Math.round(trg_y/scale);

    retVecPoints[vecIndex][curIndex] = [ correct_x, correct_y ];
    
    vecInfo.innerHTML = JSON.stringify(vecPoints);

    drawVecEvent()

}

function areaEvent(event) {
    
    let org_x = event.offsetX, org_y = event.offsetY ;

    let scaledX = appCanvas.width/ appCanvas.offsetWidth, scaledY = appCanvas.height/ appCanvas.offsetHeight;
    
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);
   
    areaPoints[areaIndex].push( [ trg_x, trg_y ] );
    
    areaInfo.innerHTML = JSON.stringify(areaPoints);

    drawPolyEvent(areaIndex);
}

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

    appCtx.fillStyle = vecPalette[inVectorIndex];
    appCtx.strokeStyle = vecPalette[inVectorIndex];

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
        appCtx.fillStyle = vecPalette[inVectorIndex];
        appCtx.strokeStyle = vecPalette[inVectorIndex];
        drawDot(vecPoints[inVectorIndex][0][0], vecPoints[inVectorIndex][0][1]);
        appCtx.fill()
        appCtx.closePath()
    } else if (vecPoints[inVectorIndex].length === 2) {
        drawCurVec(inVectorIndex);
    }

}


function drawCurPoly(inAreaIndex){

    appCtx.fillStyle = areaPalette[inAreaIndex];
    appCtx.strokeStyle = areaPalette[inAreaIndex];
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
        console.log(`Draw Poly ${areaID}`);
        if(areaPoints[areaID].length===0) return undefined;    
        drawCurPoly(areaID);
    }
}

function drawPolyEvent(inAreaIndex){
    if ( inAreaIndex === undefined ) inAreaIndex = areaIndex;

    // Draw Preview Polygons
    drawPreview(inAreaIndex)

    // appCtx.beginPath();
    // Draw current area
    drawCurPoly(inAreaIndex)

    // draw border with gradient color
    // appCtx.lineWidth = 1
    // var gradient=appCtx.createLinearGradient(0,0,170,0);
    // gradient.addColorStop("0","magenta");
    // gradient.addColorStop("0.5","blue");
    // gradient.addColorStop("1.0","red");
    // appCtx.strokeStyle=gradient;
	// appCtx.stroke()

    // fill path
    // appCtx.fillStyle = "rgba(255, 0 , 0, 0.5)";
	// appCtx.fill()

    // // close path
    // appCtx.closePath()
}

// draw a dot.
function drawDot(x, y){
    appCtx.arc(x, y, 2, 0, 2*Math.PI);
}

function clearCanvas(){
    
    if ( penMode === "vector" ) recoveryVectorPoint();
    else recoveryAreaPoint();
}

function recoveryAreaPoint(){
    console.log("Recovery Area Point");

    if (areaPoints[areaIndex].length !== 0 ){
        areaPoints[areaIndex].pop();
        drawPolyEvent(areaIndex);
    }
    else if (areaIndex !== 0 && areaPoints[areaIndex].length === 0) {
        
        console.log(`pop ${areaIndex}`);
        delete areaPoints[areaIndex];
        drawPrePoly(areaIndex);
        areaIndex = areaIndex - 1;
        updateHeader();
    }

    areaInfo.innerHTML = JSON.stringify(areaPoints);
}

function recoveryVectorPoint(){
    console.log("Recovery Vector Point");

    if (vecPoints[vecIndex].length !== 0 ){
        vecPoints[vecIndex].pop();
        drawVecEvent(vecIndex);
    }
    else if (vecIndex !== 0 && vecPoints[vecIndex].length === 0) {
        
        console.log(`pop ${vecIndex}`);
        delete vecPoints[vecIndex];
        // drawPrePoly(vecIndex);
        vecIndex = vecIndex - 1;
        updateHeader();
    }
    vecInfo.innerHTML = JSON.stringify(vecPoints);
}

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


function updateHeader(){
    let header = `Define Area ( ${areaIndex} )`;
    if ( vectorModeFlag==true ){
        header = `${header} Vector ( ${vecIndex} )`;  
    } 
    document.getElementById("area-header").innerText = header;

}

function initCanvasParam(){
    areaPoints = {};
    areaIndex = 0;
    
    vecPoints = {};
    vecIndex = 0;

    areaPoints[areaIndex] = [];
    vecPoints[vecIndex] = [];

    areaInfo.innerHTML = "";
    vecInfo.innerHTML = "";

    document.getElementById('draw-confirm-bt').onclick = confirmCanvas;
    document.getElementById('draw-clear-bt').onclick = clearCanvas;
}

// select all label
function toggle(source) {
    var checkboxes = document.querySelectorAll('.app-opt');
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i] != source)
            checkboxes[i].checked = source.checked;
    }
    atLeastOneRadio();
}


