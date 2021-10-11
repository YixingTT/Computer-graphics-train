/*jshint esversion: 6 */
// @ts-check

// these two things are the main UI code for the train
// students learned about them in last week's workbook

import { draggablePoints } from "../libs/CS559/dragPoints.js";
import { RunCanvas } from "../libs/CS559/runCanvas.js";

// this is a utility that adds a checkbox to the page 
// useful for turning features on and off
import { makeCheckbox } from "../libs/CS559/inputHelpers.js";

/**
 * Have the array of control points for the track be a
 * "global" (to the module) variable
 *
 * Note: the control points are stored as Arrays of 2 numbers, rather than
 * as "objects" with an x,y. Because we require a Cardinal Spline (interpolating)
 * the track is defined by a list of points.
 *
 * things are set up with an initial track
 */
/** @type Array<number[]> */
let thePoints = [
  [150, 150],
  [150, 450],
  [450, 450],
  [450, 150]
];

/**
 * Draw function - this is the meat of the operation
 *
 * It's the main thing that needs to be changed
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} param
 */
function draw(canvas, param) {
  let context = canvas.getContext("2d");
  // clear the screen
  context.clearRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < 6; i++){
    context.save();
    context.fillStyle = "green";
    context.beginPath();
    context.moveTo(100*i + 50, 500);
    context.lineTo(100*i + 30,530);
    context.lineTo(100*i + 70,530);
    context.closePath();
    context.fill();

    context.beginPath();
    context.moveTo(100*i + 50,520);
    context.lineTo(100*i + 25,550);
    context.lineTo(100*i + 75,550);
    context.closePath();
    context.fill();
    context.fillStyle = "brown";
    context.fillRect(100*i + 42, 550, 16, 50);
    context.restore();
  }


  // draw the control points
  thePoints.forEach(function(pt) {
    context.beginPath();
    context.arc(pt[0], pt[1], 5, 0, Math.PI * 2);
    context.closePath();
    context.fill();
  });

  // now, the student should add code to draw the track and train
  let simple = /** @type{HTMLInputElement} */ (document.getElementById("check-simple-track"));
  let arclength = /** @type{HTMLInputElement} */ (document.getElementById("check-arc-length"));
  let multipleCars = /** @type{HTMLInputElement} */ (document.getElementById("check-multiple-cars"));
  let smoke = /** @type{HTMLInputElement} */ (document.getElementById("check-smoke"));

  //number of points
  let length = thePoints.length;

  let tangent = [];
  for(let i = 0; i < length; i++){
    tangent[i] = [0.5*(thePoints[(i+1)%length][0]-thePoints[(i-1+length)%length][0]),0.5*(thePoints[(i+1)%length][1]-thePoints[(i-1+length)%length][1])];
  }

  function direction(u, i, j){
    let newPt = thePoints[i][j] + tangent[i][j] * u +
    (-3 * thePoints[i][j] - 2 * tangent[i][j] + 3 * thePoints[(i+1)%length][j] - tangent[(i+1)%length][j]) * Math.pow(u,2) +
    (2 * thePoints[i][j] + tangent[i][j] - 2 * thePoints[(i+1)%length][j] + tangent[(i+1)%length][j]) * Math.pow(u,3);;
    return newPt;
  }
  
  function velocity(u, i, j) {
    let newPt = tangent[i][j] + 
    2 * (-3 * thePoints[i][j] - 2 * tangent[i][j] + 3 * thePoints[(i+1)%length][j] - tangent[(i+1)%length][j]) * u + 
    3 * (2 * thePoints[i][j] + tangent[i][j] - 2 * thePoints[(i+1)%length][j] + tangent[(i+1)%length][j]) * Math.pow(u,2);
    return newPt;
  }

  function range(x,y){
    let range = Math.sqrt((y[0] - x[0]) * (y[0] - x[0]) + (y[1] - x[1]) * (y[1] - x[1]));
    return range;
  }

  let movingInt = 0;
  let ranges = [];
  for(let d = 0; d < 100*length; d++){
    if (d > 0)
      movingInt += range([direction(0.01*d-Math.floor(0.01 * d), Math.floor(0.01 * d), 0), direction(0.01*d-Math.floor(0.01 * d), Math.floor(0.01 * d), 1)], [direction(0.01*(d-1)-Math.floor(0.01 * d), Math.floor(0.01 * d), 0), direction(0.01*(d-1)-Math.floor(0.01 * d), Math.floor(0.01 * d), 1)]);
    else
      movingInt += 0;
      ranges[d] = [d*0.01, movingInt];
  }

  function arc(x){
    let step = 0;
    while (x > ranges[step][1] && step < 100*length) 
      step++;
    return ranges[step][0];
  }
  
  //control points
  let ctrlPts = [];
  for(let i = 0; i < length; i++){
    let p1x = thePoints[i][0]+1/3*tangent[i][0];
    let p1y = thePoints[i][1]+1/3*tangent[i][1];
    let p2x = thePoints[(i+1)%length][0]-1/3*tangent[(i+1)%length][0];
    let p2y = thePoints[(i+1)%length][1]-1/3*tangent[(i+1)%length][1];
    ctrlPts[i] = [p1x,p1y,p2x,p2y];
  }

  if(simple.checked){
    context.save();
    context.beginPath();
    context.moveTo(thePoints[0][0],thePoints[0][1]);
    for (let i = 0; i < length; i++) 
      context.bezierCurveTo(ctrlPts[i][0], ctrlPts[i][1], ctrlPts[i][2], ctrlPts[i][3], thePoints[(i+1)%length][0], thePoints[(i+1)%length][1]);
      context.stroke();
      context.closePath();
      context.restore();
  } 
  else { 
    // Rail ties
    let cinterval  = 0;
    while(cinterval < movingInt){
      let u = arc(cinterval);
      let i = Math.floor(u);
      context.save();
      context.lineWidth = 2;
      context.fillStyle = "peru";
      context.strokeStyle = "saddleBrown";
      context.translate(direction(u-i, i, 0), direction(u-i, i, 1));
      context.rotate(Math.atan2(velocity(u-i, i, 1), velocity(u-i, i, 0))-Math.PI/2);
      context.fillRect(-14, -3, 28, 8);
      context.strokeRect(-14, -3, 28, 8);
      context.restore();
      cinterval += movingInt/50;
    }

    // parallel rails
    for (let i = 1; i < 100*length; i++){
      context.save();
      context.beginPath();
      let [x1,y1] = [velocity(0.01*i - Math.floor(0.01*i), Math.floor(0.01*i), 0), velocity(0.01*i - Math.floor(0.01*i), Math.floor(0.01*i), 1)];
      let [x2,y2] = [velocity(0.01*(i-1) - Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 0), velocity(0.01*(i-1) - Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 1)];
      context.moveTo(direction(0.01*i-Math.floor(0.01*i), Math.floor(0.01*i), 0)+y1/Math.sqrt(x1*x1 + y1*y1)*5, direction(0.01*i-Math.floor(0.01*i), Math.floor(0.01*i), 1)-x1/Math.sqrt(x1*x1 + y1*y1)*5);
      context.lineTo(direction(0.01*(i-1)-Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 0)+y2/Math.sqrt(x2*x2 + y2*y2)*5, direction(0.01*(i-1)-Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 1)-x2/Math.sqrt(x2*x2 + y2*y2)*5);
      context.moveTo(direction(0.01*i-Math.floor(0.01*i), Math.floor(0.01*i), 0)-y1/Math.sqrt(x1*x1 + y1*y1)*5, direction(0.01*i-Math.floor(0.01*i), Math.floor(0.01*i), 1)+x1/Math.sqrt(x1*x1 + y1*y1)*5);
      context.lineTo(direction(0.01*(i-1)-Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 0)-y2/Math.sqrt(x2*x2 + y2*y2)*5, direction(0.01*(i-1)-Math.floor(0.01*(i-1)), Math.floor(0.01*(i-1)), 1)+x2/Math.sqrt(x2*x2 + y2*y2)*5);
      context.lineWidth = 5;
      context.strokeStyle = "slateGray";
      context.stroke();
      context.closePath();
      context.restore();
    }
  }

  //train
  if(!multipleCars.checked){
    let u;
    let cinterval = movingInt*param/length;
    if (arclength.checked) 
        u = arc((cinterval+movingInt) % movingInt);
    else 
        u = (param+length) % length;
    let i = Math.floor(u);

    context.save();
    context.fillStyle = "lightGray";
    context.translate(direction(u-i, i, 0), direction(u-i, i, 1));
    let angle = Math.atan2(velocity(u-i, i, 1), velocity(u-i, i, 0));
    context.rotate(angle);
    context.fillRect(-20, -10, 40, 20);
    context.strokeRect(-20, -10, 40, 20);

    context.beginPath();
    context.fillStyle = "lightGray";
    context.moveTo(20, 10);
    context.quadraticCurveTo(50, 0, 20, -10);
    context.fill();
    context.stroke();
    context.closePath();

    context.beginPath();
    context.fillStyle = "yellow";
    context.moveTo(35, 3);
    context.lineTo(60,8);
    context.lineTo(60,-8);
    context.lineTo(35,-3);
    context.fill();
    context.closePath();
    context.restore();
  }
  else{
    for (let c = 0; c < 3; c ++){ 
      let u;
      let cinterval = movingInt*param/length;
      if (arclength.checked) 
        u = arc((cinterval-c*51+movingInt) % movingInt);
      else 
        u = (param-c/5.4+length) % length;
      let i = Math.floor(u);
      // Front
      context.save();
      context.fillStyle = "lightGray";
      context.translate(direction(u-i, i, 0), direction(u-i, i, 1));
      let angle = Math.atan2(velocity(u-i, i, 1), velocity(u-i, i, 0));
      context.rotate(angle);
      context.fillRect(-20, -10, 40, 20);
      context.strokeRect(-20, -10, 40, 20);

      if (c == 0){
        context.beginPath();
        context.fillStyle = "lightGray";
        context.moveTo(20, 10);
        context.quadraticCurveTo(50, 0, 20, -10);
        context.fill();
        context.stroke();
        context.closePath();
        // light to mark the front
        context.beginPath();
        context.fillStyle = "yellow";
        context.moveTo(35, 3);
        context.lineTo(60,8);
        context.lineTo(60,-8);
        context.lineTo(35,-3);
        context.fill();
        context.closePath();

        context.fillStyle = "black";
        context.beginPath();
        context.fillRect(-30, -5, 10, 10);
        context.strokeRect(-30, -5, 10, 10);
        context.closePath();
        context.fill();
        context.stroke();
      }
      else if (c == 2){
        context.fillStyle = "black";
        context.beginPath();
        context.fillRect(20, -5, 10, 10);
        context.strokeRect(20, -5, 10, 10);
        context.fill();
        context.stroke();
        context.closePath();
      }
      else{
      context.fillStyle = "black";
      context.beginPath();
      context.fillRect(-30, -5, 10, 10);
      context.strokeRect(-30, -5, 10, 10);
      context.fill();
      context.stroke();
      context.closePath();
      context.beginPath();
      context.fillRect(20, -5, 10, 10);
      context.strokeRect(20, -5, 10, 10);
      context.closePath();
      context.fill();
      context.stroke();
      }
      context.restore();
   }
  } 

  //smoke
  if(smoke.checked){
    for(let j = 0; j < 8; j++){
      let u;
      let cinterval = movingInt*param/length;
      if (arclength.checked) 
        u = arc((cinterval-j*25+movingInt) % movingInt);
      else  
        u = (param-j/14+length) % length;
      let i = Math.floor(u);
      context.save();
      context.globalAlpha = 0.4;
      context.fillStyle = "dimGray";
      context.translate(direction(u-i, i, 0), direction(u-i, i, 1));
      let angle = Math.atan2(velocity(u-i, i, 1), velocity(u-i, i, 0));
      context.rotate(angle);

      context.beginPath();
      context.arc(20, 0, 5+3*j, 0, 2 * Math.PI);
      context.closePath();
      context.fill();
      context.restore();
    }
  }
}

/**
 * Initialization code - sets up the UI and start the train
 */
{
  let canvas = /** @type {HTMLCanvasElement} */ (document.getElementById(
    "canvas1"
  ));
  let context = canvas.getContext("2d");
  

  // we need the slider for the draw function, but we need the draw function
  // to create the slider - so create a variable and we'll change it later
  let slider; // = undefined;

  // note: we wrap the draw call so we can pass the right arguments
  function wrapDraw() {
    // do modular arithmetic since the end of the track should be the beginning
    draw(canvas, Number(slider.value) % thePoints.length);
  }
  // create a UI
  let runcavas = new RunCanvas(canvas, wrapDraw);
  // now we can connect the draw function correctly
  slider = runcavas.range;

  // note: if you add these features, uncomment the lines for the checkboxes
  // in your code, you can test if the checkbox is checked by something like:
  // document.getElementById("check-simple-track").checked
  // in your drawing code
  // WARNING: makeCheckbox adds a "check-" to the id of the checkboxes
  //
  // lines to uncomment to make checkboxes
  makeCheckbox("simple-track");
  makeCheckbox("arc-length");
  makeCheckbox("multiple-cars");
  makeCheckbox("smoke");
  // makeCheckbox("bspline");

  // helper function - set the slider to have max = # of control points
  function setNumPoints() {
    runcavas.setupSlider(0, thePoints.length, 0.05);
  }

  setNumPoints();
  runcavas.setValue(0);

  // add the point dragging UI
  draggablePoints(canvas, thePoints, wrapDraw, 10, setNumPoints);
}
