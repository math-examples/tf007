import  { drawSetListeners, setColor, setBgColor, clearCanvas } from './draw-module.js';

setColor('rgb(255,255,255)');
setBgColor('rgb(0, 0, 0)');
drawSetListeners();
window.clearCanvas = clearCanvas;
