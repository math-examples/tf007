const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
let isDrawing = false;
let x = 0;
let y = 0;
var offsetX;
var offsetY;

let gcolor;
let gcolorbg;

function setListeners() {
  canvas.addEventListener('touchstart', handleStart);
  canvas.addEventListener('touchend', handleEnd);
  canvas.addEventListener('touchcancel', handleCancel);
  canvas.addEventListener('touchmove', handleMove);
  canvas.addEventListener('mousedown', (e) => {
    x = e.offsetX;
    y = e.offsetY;
    isDrawing = true;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = e.offsetX;
      y = e.offsetY;
    }
  });

  canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
      drawLine(context, x, y, e.offsetX, e.offsetY);
      x = 0;
      y = 0;
      isDrawing = false;
    }
  });
  clearCanvas();
}

function drawSetListeners(){
    document.addEventListener("DOMContentLoaded", setListeners);
}

const ongoingTouches = [];

function handleStart(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  offsetX = canvas.getBoundingClientRect().left;
  offsetY = canvas.getBoundingClientRect().top;
  for (let i = 0; i < touches.length; i++) {
    ongoingTouches.push(copyTouch(touches[i]));
  }
}

function getColor(){
    if(gcolor)return gcolor;
    const selColor = document.getElementById('selColor');
    return selColor?selColor.value:'green';
}

function getLineWidth(){
    const selWidth = document.getElementById('selWidth');
    return selWidth?selWidth.value:10;
}

function handleMove(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < touches.length; i++) {
    const color = getColor();
    const idx = ongoingTouchIndexById(touches[i].identifier);
    if (idx >= 0) {
      context.beginPath();
      context.moveTo(ongoingTouches[idx].clientX - offsetX, ongoingTouches[idx].clientY - offsetY);
      context.lineTo(touches[i].clientX - offsetX, touches[i].clientY - offsetY);
      context.lineWidth = getLineWidth();
      context.strokeStyle = color;
      context.lineJoin = "round";
      context.closePath();
      context.stroke();
      ongoingTouches.splice(idx, 1, copyTouch(touches[i]));  // swap in the new touch record
    }
  }
}

function handleEnd(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < touches.length; i++) {
    const color = getColor();
    let idx = ongoingTouchIndexById(touches[i].identifier);
    if (idx >= 0) {
      context.lineWidth = getLineWidth();
      context.fillStyle = color;
      ongoingTouches.splice(idx, 1);  // remove it; we're done
    }
  }
}

function handleCancel(evt) {
  evt.preventDefault();
  const touches = evt.changedTouches;
  for (let i = 0; i < touches.length; i++) {
    let idx = ongoingTouchIndexById(touches[i].identifier);
    ongoingTouches.splice(idx, 1);  // remove it; we're done
  }
}

function copyTouch({ identifier, clientX, clientY }) {
  return { identifier, clientX, clientY };
}

function ongoingTouchIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    const id = ongoingTouches[i].identifier;
    if (id === idToFind) {
      return i;
    }
  }
  return -1;    // not found
}

function drawLine(context, x1, y1, x2, y2) {
  context.beginPath();
  context.strokeStyle = getColor();
  context.lineWidth = getLineWidth();
  context.lineJoin = "round";
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.closePath();
  context.stroke();
}

function clearCanvas() {
    context.setTransform(1, 0, 0, 1, 0, 0);
    if(!gcolorbg)context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    else{
        context.fillStyle = gcolorbg;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
}

function setColor(c){
    gcolor = c;
}

function setBgColor(c){
    gcolorbg = c;
}

export { drawSetListeners, setColor, setBgColor, clearCanvas };