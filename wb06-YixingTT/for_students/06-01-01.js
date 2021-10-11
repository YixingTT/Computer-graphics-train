// @ts-check
/* jshint -W069, esversion:6 */

/**
 * drawing function for box 1
 *
 * draw something.
 **/

// note that checking that canvas is the right type of element tells typescript
// that this is the right type - it's a form of a safe cast 
let canvas = document.getElementById("canvas1");
if (!(canvas instanceof HTMLCanvasElement))
    throw new Error("Canvas is not HTML Element");

let context = canvas.getContext("2d");

context.beginPath();

// change these so that rather than connecting with straight lines,
// they use cardinal interpolation
// your points should cycle - to make a loop

context.moveTo(50,150);     // you don't need to change this line

context.bezierCurveTo((50+1/6*300), (150+1/6*100), (350-1/6*300), (150+1/6*100), 350, 150);
//context.lineTo(350,150);    // this line gets replaced by a bezierCurveTo
context.bezierCurveTo((350+1/6*300), (150-1/6*100), (350+1/6*150), (50+1/6*50), 350, 50);
//context.lineTo(350,50);     // this line gets replaced by a bezierCurveTo
context.bezierCurveTo((350-1/6*150), (50-1/6*50), (200+1/6*300), 100, 200, 100);
//context.lineTo(200,100);    // this line gets replaced by a bezierCurveTo
context.bezierCurveTo((200-1/6*300), 100, (50+1/6*150), (50-1/6*50), 50, 50);
//context.lineTo(50,50);      // this line gets replaced by a bezierCurveTo
context.bezierCurveTo((50-1/6*150), (50+1/6*50), (50-1/6*300), (150-1/6*100), 50, 150);
//context.lineTo(50,150);     // this line gets replaced by a bezierCurveTo

context.closePath();
context.lineWidth = 3;
context.stroke();
