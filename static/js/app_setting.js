
let clickPoints = [];
let pointsLimit = 10;
let appCanvas = document.getElementById("app_canvas");
let appFrame = document.getElementById("app_frame");
let appCtx = appCanvas.getContext("2d");
let appInfo = document.getElementById("app_info");
let appRatio;

$(document).ready(function () {
    console.log("Set up application dialog and cursor event")
    appInfo.innerHTML = "";
    appCanvas.addEventListener("mousedown", function(e){
        getCursorPosition(appCanvas, e);
    })
});

function getCursorPosition(canvas, event) {
    
    const rect = canvas.getBoundingClientRect();
    
    let org_x = event.offsetX, org_y = event.offsetY ;

    let scaledX = canvas.width/ canvas.offsetWidth, scaledY = canvas.height/ canvas.offsetHeight;
    
    let trg_x = (org_x * scaledX).toFixed(2);
    let trg_y = (org_y * scaledY).toFixed(2);

    clickPoints.push([trg_x, trg_y]);
    
    const scale = parseFloat(document.getElementById("app_scale").textContent);

    correct_x = Math.round(trg_x/scale);
    correct_y = Math.round(trg_y/scale);
    
    if ( appInfo.innerHTML!=="" ){
        appInfo.innerHTML += ", "    
    }
    appInfo.innerHTML += `[${correct_x}, ${correct_y}]`;

    drawPoly2();
    // if (clickPoints.length >= 4) drawPoly(clickPoints);
        
}

// draw polygon from a list of 4 points
const drawPoly = points => {
	appCtx.lineWidth = 1

	var split = points.splice(0, clickPoints.length)
	
    // new path to draw
	appCtx.beginPath()

    // setup the start point
	appCtx.moveTo(split[0][0], split[0][1])

    // draw line
	for(i of split.reverse()) appCtx.lineTo(i[0], i[1])

    // gradient color
    var gradient=appCtx.createLinearGradient(0,0,170,0);
    gradient.addColorStop("0","magenta");
    gradient.addColorStop("0.5","blue");
    gradient.addColorStop("1.0","red");
    // change the polygen color to gradient
    appCtx.strokeStyle=gradient;

    // draw border
	appCtx.stroke()

}

function drawPoly2(){

    // new path to draw
    appCtx.clearRect(0, 0, appCanvas.width, appCanvas.height)
    appCtx.beginPath()

    for(let i=0; i<clickPoints.length; i++){

        // Draw dots
        if(clickPoints.length<=2){
            drawDot2(clickPoints[i][0], clickPoints[i][1]);
        };
        // drawDot2(clickPoints[i][0], clickPoints[i][1]);
        
        if(i===0){
            // setup the start point: move the brush to first point.
            appCtx.moveTo(clickPoints[0][0], clickPoints[0][1]);
        }else {
            // start painting
            appCtx.lineTo(clickPoints[i][0], clickPoints[i][1]);
        }    
    }

    // draw border with gradient color
    // appCtx.lineWidth = 1
    // var gradient=appCtx.createLinearGradient(0,0,170,0);
    // gradient.addColorStop("0","magenta");
    // gradient.addColorStop("0.5","blue");
    // gradient.addColorStop("1.0","red");
    // appCtx.strokeStyle=gradient;
	// appCtx.stroke()

    // fill path
    appCtx.fillStyle = "rgba(255, 0 , 0, 0.5)";
	appCtx.fill()

    // close path
    appCtx.closePath()

}

// draw a dot.
const drawDot = (x, y) => {
	appCtx.beginPath()
	appCtx.arc(x, y, 2, 0, 1*Math.PI);
    appCtx.fillStyle = "red";
	appCtx.fill()
}

function drawDot2(x, y){
    console.log("Draw X, Y", x, y );
    appCtx.arc(x, y, 2, 0, 2*Math.PI);
    // appCtx.fillStyle = "rgba(255, 0, 0, 0.5)";
	// appCtx.fill()
}

function clearCanvas(){
    appCtx.clearRect(0, 0, appCanvas.width, appCanvas.height);
    appInfo.innerHTML = "";
    clickPoints = [] ;
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

// search function
function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();

    div = document.getElementById("label_list");

    a = div.getElementsByTagName("a");
    optDiv = div.getElementsByTagName("div");

    for (i = 0; i < a.length; i++) {
        txtValue = a[i].textContent || a[i].innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            optDiv[i].setAttribute('style', '');
        } else {
            optDiv[i].setAttribute('style', 'display:none !important');
        }
    }
}

