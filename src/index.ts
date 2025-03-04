/// <reference path="../node_modules/@types/p5/global.d.ts" />

//import { Grid } from '../dist/utils/Grid.js';

let buttonCreate: any, buttonTranslate: any, buttonScale: any, buttonMirrorX: any, buttonMirrorY: any, buttonResetPolygon: any, buttonCenterCamera: any, buttonShearU: any, buttonShearNU: any;
let canvas: any;
let controlPanelSize = {x: 350, y: 10};
let colors: Record<string, any> = {};                       // Should be color, from p5js
let polygon: { x: number; y: number }[] = [];
let tempPolygon: { x: number; y: number }[] = [];                   // For when ur drawing
let lastCompletePolygon: { x: number; y: number }[] = [];           // For ctrl+z
let vertexBallRadius: number = 3;
let scaleFactor: number = 5;
let selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
let selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation
let dx: number = 0, dy: number = 0;
let debugVertexCenter = {x: null, y: null};                 // TODO: remover
let isScaling: boolean = false;
let scaleStartPos: { x: number | null; y: number | null } = { x: null, y: null };
let scalePolygonOriginalForm: { x: number; y: number }[] = [];
let currentScale = {x: 1, y: 1}

// User settings
let shouldDrawVertexBalls: boolean = true;
let shouldDrawGrid: boolean = true;
let shouldDrawAxis: boolean = true;
let shouldDrawDebugWindow: boolean = true;

// Gizmo stuffs
let gizmoArrowLength: number = 18;
let gizmoArrowWidth: number = 2;
let gizmoArrowHeadSize: number = 2;
let gizmoLineOffset: number = 1.5;
let gizmoHitboxWidth: number = 6;

let gizmoScaleHandleSize: number = 6;
let gizmoScaleDistance: number = 25;

// Pan
let panX: number, panY: number;
let isPanning: boolean = false;
let lastMouseX: number, lastMouseY: number;
let mousePosInGrid: {x: any; y: any;};
let mousePosInGridSnapped: {x: any; y: any;};
let mousePosInCartesianPlane: {x: any; y: any;};

// Grid
let gridSize: number = 5;
let gridLineWidth: number = 0.1;
let gridLineColor: number = 200;

// Tools
let isDraggingX: boolean = false;
let isDraggingY: boolean = false;
let isScalingX: boolean = false;
let isScalingY: boolean = false;
let translateInitialX: number = 0;
let translateInitialY: number = 0;
let selectedTool: number = 0;
enum Tool {
  NONE,
  CREATE_POLYGON,
  TRANSLATE,
  SCALE,
  REFLECT,
  SHEAR_U,
  SHEAR_NU
}



// TODOs:
// ---------------------------------
// - Click vertex to show gizmo    - DONE
// - Shapes snap to grid           - DONE
// - Reset shape button            - DONE
// - Mirror from axis button       - DONE
// - Make so u cant select the text on the right panel - 
// - Scale tool                    - DONE
// - ShearU / ShearNU tool         -
// - Undo / Redo                   -
// - Save / Load                   -
// - Show/hide grid button         - DONE
// - Show/hide vertex balls button - DONE
// - Show/hide coordinates button  - DONE
// - Show/hide debug window button - DONE
// - Canvas size of screen         - DONE
// - Resize when console is open   - 
// -                               - 
// -                               - 
// - Start working on 3D version   - 
// ---------------------------------


function setup() {
  console.log("SETUP!!!!!!!!!!");
  
  canvas = createCanvas(windowWidth, windowHeight);
  //canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  createControlPanel();

  disableBrowserRightClick();
  disablePageZoom();
  createColors();
  centerCamera();
}

function draw() {
  background(colors.BackgroundColor); 
  
  translate(panX, panY);
  scale(scaleFactor);

  mousePosInGrid = getMousePosInGrid();
  mousePosInGridSnapped = getMousePosInGridSnapped();
  mousePosInCartesianPlane = getMousePosInCartesianPlane();
  
  drawCartesianPlane();
  drawPolygon();
  handleToolsLogic();

  // Debug
  drawDebugWindow();
  //debugDrawArrowHitboxes();
}

function createColors() {
  colors.Red = color(255, 30, 30);
  colors.Green = color(30,255,30);
  colors.Blue = color(30,30,255);
  colors.Purple = color(150,40,210);
  colors.Gray = color(150);
  colors.BackgroundColor = color(230);
  colors.GizmoScaleColor = color(255, 100, 55);
}

function drawCartesianPlane() {
  if (shouldDrawGrid)
    drawGrid();
  if (shouldDrawAxis) 
    drawCartesianPlaneAxis();
    
}

function drawGrid() {
  strokeWeight(gridLineWidth);
  stroke(gridLineColor);

  // How many grid lines needed based on current view
  let leftEdge = -panX / scaleFactor;
  let rightEdge = (width - panX) / scaleFactor;
  let topEdge = -panY / scaleFactor;
  let bottomEdge = (height - panY) / scaleFactor;

  // Round to nearest grid line
  let startX = Math.floor(leftEdge / gridSize) * gridSize;
  let endX = Math.ceil(rightEdge / gridSize) * gridSize;
  let startY = Math.floor(topEdge / gridSize) * gridSize;
  let endY = Math.ceil(bottomEdge / gridSize) * gridSize;

  // Vertical grid lines
  for (let x = startX; x <= endX; x += gridSize) {
    line(x, startY, x, endY);
  }

  // Horizontal grid lines
  for (let y = startY; y <= endY; y += gridSize) {
    line(startX, y, endX, y);
  }
}

function drawCartesianPlaneAxis() {
  strokeWeight(1);
  stroke(colors.Red);
  line(-5000, 0, width+5000, 0);
  stroke(colors.Blue);
  line(0, -5000, 0, height+5000);
}

// Updated to handle button highlighting
function createControlPanel() {
  let controlPanel = createDiv('').class('control-panel');
  // @ts-ignore 
  controlPanel.position(windowWidth - controlPanelSize.x, controlPanelSize.y);

  let createSection = createDiv('').class('section').parent(controlPanel);
  createDiv('').class('section-title').html('Tools').parent(createSection);

  // Create Polygon Button
  buttonCreate = createButton('Create Polygon').class('button').parent(createSection);
  buttonCreate.mousePressed(() => {
    selectedTool = Tool.CREATE_POLYGON;
    tempPolygon = [];
    selectedVertex = null;
    selectedCentroid = null;
    updateButtonStyles(buttonCreate);
  });

  // Translate Button
  buttonTranslate = createButton('Translate').class('button').parent(createSection);
  buttonTranslate.mousePressed(() => {
    selectedTool = Tool.TRANSLATE;
    tempPolygon = [];
    updateButtonStyles(buttonTranslate);
  });

  // Scale button
  buttonScale = createButton('Scale').class('button').parent(createSection);
  buttonScale.mousePressed(() => {
    selectedTool = Tool.SCALE;
    tempPolygon = [];
    updateButtonStyles(buttonScale);
  });

  createDiv('').class('section-title').html('Transformations').parent(createSection);

  // Mirror X Button
  buttonMirrorX = createButton('Mirror X').class('button').parent(createSection);
  buttonMirrorX.mousePressed(() => {
    mirror('x');
  });

  // Mirror Y Button
  buttonMirrorY = createButton('Mirror Y').class('button').parent(createSection);
  buttonMirrorY.mousePressed(() => {
    mirror('y');
  });
  
  // Shear Uniform Button
  buttonShearU = createButton('Uniform Shear').class('button').parent(createSection);
  buttonShearU.mousePressed(() => {
    ShearUniform();
  });

  // Shear Non-Uniform Button
  buttonShearNU = createButton('Non-Uniform Shear').class('button').parent(createSection);
  buttonShearNU.mousePressed(() => {
    ShearNonUniform();
  });

  createDiv('').class('section-title').html('Actions').parent(createSection);

  // Reset Polygon Button
  buttonResetPolygon = createButton('Reset Polygon').class('button').parent(createSection);
  buttonResetPolygon.mousePressed(() => {
    resetPolygon();
  });

  // Center Camera Button
  buttonCenterCamera = createButton('Center Camera').class('button').parent(createSection);
  buttonCenterCamera.mousePressed(() => {
    centerCamera();
  });

  createDiv('').class('section-title').html('Display Options').parent(createSection);

  // Checkbox for vertex balls
  let checkboxDrawVertexBalls: any = createCheckbox('Draw Vertex Balls', shouldDrawVertexBalls).parent(createSection);
  checkboxDrawVertexBalls.changed(() => {
    shouldDrawVertexBalls = checkboxDrawVertexBalls.checked();
  });

  // Checkbox for grid
  let checkboxDrawGrid: any = createCheckbox('Draw Grid', shouldDrawGrid).parent(createSection);
  checkboxDrawGrid.changed(() => {
    shouldDrawGrid = checkboxDrawGrid.checked();
  });

  // Checkbox for axis
  let checkboxDrawAxis: any = createCheckbox('Draw Axis', shouldDrawAxis).parent(createSection);
  checkboxDrawAxis.changed(() => {
    shouldDrawAxis = checkboxDrawAxis.checked();
  });

  // Checkbox for debug window
  let checkboxDebugWindow: any = createCheckbox('Debug Window', shouldDrawDebugWindow).parent(createSection);
  checkboxDebugWindow.changed(() => {
    shouldDrawDebugWindow = checkboxDebugWindow.checked();
  });
}

// Update button styles based on selected tool
function updateButtonStyles(activeButton: any) {
  if (!activeButton) return;
  
  // Remove active class from all buttons
  buttonCreate.removeClass('active');
  buttonTranslate.removeClass('active');
  buttonScale.removeClass('active');
  
  // Add active class to selected button
  activeButton.addClass('active');
}

function ShearUniform() {
  console.log("ShearUniform");
  
  let S = 0.3;
  for (let p of polygon) {
    let originalX = p.x;
    let originalY = p.y;
    p.x += S * originalY;
    p.y += S * originalX;
  }

  drawTransformGizmo();
}

function ShearNonUniform() {
  console.log("ShearNonUniform");
  
  let R = 0.1;
  let S = 0.3;
  for (let p of polygon) {
    let originalX = p.x;
    let originalY = p.y;
    p.x += R * originalY;
    p.y += S * originalX;
  }
}

function centerCamera() {
  panX = width / 2;
  panY = height / 2;
}

function startPanning() {
  isPanning = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}

function stopPanning() {
  isPanning = false;
}

function panScreen() {
  if (isPanning) {
    panX += mouseX - lastMouseX;
    panY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function resetPolygon() {
  if (lastCompletePolygon.length > 0) {
    polygon = lastCompletePolygon.map(p => ({x: p.x, y: p.y}));
    selectedVertex = null;
    selectedCentroid = null;
  }
}

function handleToolsLogic() {
  switch (selectedTool) {
    
    case Tool.CREATE_POLYGON:
      drawPolygonBeingCreated();
      break;

    case Tool.TRANSLATE:
      drawPolygonCenter();
      drawTransformGizmo();
      break;

    case Tool.SCALE:
      drawPolygonCenter();
      drawScaleGizmo();
      break;

    default:
      return;
  }
}

function drawPolygonBeingCreated() {
  if (selectedTool != Tool.CREATE_POLYGON) return;
  
  // Draw filled shape up to current points
  if (tempPolygon.length > 0) {
    stroke(0);
    strokeJoin(ROUND);
    fill(100, 100, 250, 100);
    beginShape();
    for (let p of tempPolygon) {
      vertex(p.x , p.y);
    }
    vertex(mousePosInGridSnapped.x, mousePosInGridSnapped.y);
    endShape();

    // Draw gradient line from last point to current mouse position
    let lastPoint: {x:number, y: number} = tempPolygon[tempPolygon.length - 1];
    
    // Save current drawing context state
    drawingContext.save();
    
    // Create gradient
    let gradient = drawingContext.createLinearGradient(
      lastPoint.x, lastPoint.y, 
      mousePosInGridSnapped.x , mousePosInGridSnapped.y
    );
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, colors.Red);
    
    // Apply gradient
    drawingContext.strokeStyle = gradient;
    drawingContext.beginPath();
    drawingContext.moveTo(lastPoint.x , lastPoint.y);
    drawingContext.lineTo(mousePosInGridSnapped.x , mousePosInGridSnapped.y);
    drawingContext.stroke();
    
    // Restore previous drawing context state
    drawingContext.restore();
    
    if (shouldDrawVertexBalls)
      drawVertexBalls(tempPolygon);
    
    
    // Draw red circle around first vertex
    noFill();
    stroke(colors.Red);
    strokeWeight(0.2);
    ellipse(tempPolygon[0].x, tempPolygon[0].y, vertexBallRadius, vertexBallRadius);
  }
  
  // Draw red dot
  fill(colors.Red);
  noStroke();
  ellipse(mousePosInGridSnapped.x, mousePosInGridSnapped.y, vertexBallRadius, vertexBallRadius);
  
  // Draw coordinates text
  drawCoordinatesOnMouse();
}

function drawPolygon() {
  if (polygon.length < 2) return;

  stroke(0);
  strokeWeight(1);
  strokeJoin(ROUND);
  fill(100, 100, 250, 100);

  beginShape();
  for (let p of polygon) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  if (shouldDrawVertexBalls){
    drawVertexBalls(polygon);
  }
}

function drawVertexBalls(polygon: any) {
  push();
  fill(0);
  noStroke();
  for (let p of polygon) {
    ellipse(p.x, p.y, vertexBallRadius, vertexBallRadius);
  }
  pop();
}

function drawTransformGizmo() {
    if (selectedCentroid) {
    selectedCentroid = getPolygonCenter();
    drawGizmoArrows(selectedCentroid.x, selectedCentroid.y);
  }
  else if (selectedVertex){
    drawGizmoArrows(selectedVertex.x, selectedVertex.y);
  }
}

function drawScaleGizmo() {
  let centerX = getPolygonCenter().x;
  let centerY = getPolygonCenter().y;

  if (centerX == null || centerY == null || polygon.length < 3) return;

  push();
  
  // Draw handle X
  let handleXRight = centerX + gizmoScaleDistance;
  let handleYRight = centerY;
    
  // Draw X-axis line
  stroke(colors.GizmoScaleColor);
  strokeWeight(1.2);
  strokeCap(ROUND);
  line(centerX + 3, centerY, handleXRight, handleYRight);
    
  // Draw X-axis handle
  fill(colors.GizmoScaleColor);
  noStroke();
  ellipse(handleXRight, handleYRight, gizmoScaleHandleSize, gizmoScaleHandleSize);
    
  // Draw handle Y
  let handleXUp = centerX;
  let handleYUp = centerY - gizmoScaleDistance; // -Y up
    
  // Draw Y-axis line
  stroke(colors.GizmoScaleColor);
  strokeWeight(1.2);
  line(centerX, centerY - 3, handleXUp, handleYUp);
    
  // Draw Y-axis handle
  fill(colors.GizmoScaleColor);
  noStroke();
  ellipse(handleXUp, handleYUp, gizmoScaleHandleSize, gizmoScaleHandleSize);
    
  pop();
}

function isClickingScaleHandle() {
  let center = getPolygonCenter();

  if (!center) return;

  // Handle going right (X-axis)
  let handle1X = center.x + gizmoScaleDistance;
  let handle1Y = center.y;
  
  // Handle going up (Y-axis)
  let handle2X = center.x;
  let handle2Y = center.y - gizmoScaleDistance; // Subtract because Y is inverted in p5.js
  
  // Check if mouse is near either handle
  let d1 = dist(mousePosInGridSnapped.x, mousePosInGridSnapped.y, handle1X, handle1Y);
  let d2 = dist(mousePosInGridSnapped.x, mousePosInGridSnapped.y, handle2X, handle2Y);
  
  if (d1 < gizmoScaleHandleSize) {
    console.log("Click X-axis handle");
    return 1; // X-axis handle
  }
  if (d2 < gizmoScaleHandleSize) {
    console.log("Click Y-axis handle");
    return 2; // Y-axis handle
  }
  
  return 0; // Not clicking any handle
}

function scalePolygon() {
  if (!scalePolygonOriginalForm) return;

  if(isScalingX) {
    for (let i = 0; i < polygon.length; i++) {
      polygon[i].x = scalePolygonOriginalForm[i].x * currentScale.x;
    }
  } 
  else if (isScalingY) {
    for (let i = 0; i < polygon.length; i++) {
      polygon[i].y = scalePolygonOriginalForm[i].y * currentScale.y;
    }
  }
}

function setScaleTo(newX: number, newY: number) {
  if(!newX || !newY) return;

  for (let i = 0; i < polygon.length; i++) {
    polygon[i].x = scalePolygonOriginalForm[i].x * newX;
    polygon[i].y = scalePolygonOriginalForm[i].y * newY;
  }
  currentScale = {x: newX, y: newY}
}


function drawGizmoArrows(centerX: number, centerY: number) {
  push();

  // Draw X arrow
  stroke(colors.Red);
  strokeWeight(1.6);
  strokeCap(ROUND);
  line(centerX + gizmoLineOffset, centerY, centerX + gizmoArrowLength, centerY);    // ----
  strokeWeight(2);
  line(centerX + gizmoArrowLength, centerY, centerX + gizmoArrowLength - gizmoArrowHeadSize, centerY + gizmoArrowHeadSize); // \
  line(centerX + gizmoArrowLength, centerY, centerX + gizmoArrowLength - gizmoArrowHeadSize, centerY - gizmoArrowHeadSize); // /
  
  // Draw Y arrow
  stroke(colors.Blue);
  strokeWeight(1.6);
  strokeCap(ROUND);
  line(centerX, centerY + gizmoLineOffset, centerX, centerY + gizmoArrowLength);    // ----
  strokeWeight(2);
  line(centerX, centerY + gizmoArrowLength, centerX + gizmoArrowHeadSize, centerY + gizmoArrowLength - gizmoArrowHeadSize); // \
  line(centerX, centerY + gizmoArrowLength, centerX - gizmoArrowHeadSize, centerY + gizmoArrowLength - gizmoArrowHeadSize); // /

  // Draw coords next to transform gizmo arrows
  fill(0);
  stroke(colors.BackgroundColor);
  strokeWeight(0.5);
  textAlign(LEFT, CENTER);
  textSize(12/scaleFactor);

  // TODO: Esse código ta um pouco repetido em -> drawCoordinatesOnMouse()
  // Draw diferent if its a center instead of a vertex
  if(centerX % 5 == 0 && centerX % 5 == 0)
    text(`(${(centerX/5).toFixed(0)}, ${(centerY/5 *-1).toFixed(0)})`, centerX + 2, centerY + 2);
  else 
    text(`(${(centerX/5).toFixed(2)}, ${(centerY/5*-1).toFixed(2)})`, centerX + 2, centerY + 2);
  
  pop();
}

function drawCoordinatesOnMouse() {
  fill(0);
  stroke(colors.BackgroundColor);
  strokeWeight(0.5);
  textAlign(LEFT, CENTER);
  textSize(12/scaleFactor);
  text(`(${mousePosInCartesianPlane.x}, ${mousePosInCartesianPlane.y})`, mousePosInGridSnapped.x + 2, mousePosInGridSnapped.y + 2);
}

function drawPolygonCenter() {
if (polygon.length < 2) return;

  let center = getPolygonCenter();
  strokeWeight(0.3);
  fill(colors.Blue);
  ellipse(center.x, center.y, 3, 3);
}

function selectNearestVertex() { // Selects vertex or centroid
  let centroid = getPolygonCenter(); 

  if (centroid == null || polygon.length < 3) return;

  let d;
  for (let p of polygon) {
    d = dist(mousePosInGrid.x, mousePosInGrid.y, p.x, p.y); 
    if (d < 3) {
      selectedVertex = p;
      selectedCentroid = null;
      console.log("Selected vertex!");
      return;
    }
  }

  d = dist(mousePosInGrid.x, mousePosInGrid.y, centroid.x, centroid.y);
  
  if(d < 3) {
    selectedCentroid = getPolygonCenter();
    selectedVertex = null;
    console.log("Selected centroid!");
    return
  }
}

function translatePolygon() {
  if (selectedCentroid) { // Move the entire polygon
    calculateDxDy();
    
    if(isDraggingX){
      for (let p of polygon) {
        p.x += dx;
      }
    }
    else if(isDraggingY){
      for (let p of polygon) {
        p.y += dy;
      }
    }
    
    selectedCentroid = getPolygonCenter(); // Update the centroid position
  } 
  
  else if (selectedVertex) { // Move only the selected vertex
    calculateDxDy();

    if(isDraggingX){
      selectedVertex.x += dx;
    }
    else if(isDraggingY){
      selectedVertex.y += dy;
    }
  }

  // Update the initial translation coordinates
  translateInitialX = mousePosInGridSnapped.x;
  translateInitialY = mousePosInGridSnapped.y;
}

function calculateDxDy() {
  dx = mousePosInGridSnapped.x - translateInitialX;
  dy = mousePosInGridSnapped.y - translateInitialY;
}

function mirror(axis: 'x' | 'y') {
  if (axis !== 'x' && axis !== 'y') 
    throw new Error("Invalid axis on mirror function. ");

  for (let p of polygon) {
    p[axis] *= -1;
  }

  if (selectedCentroid)
    selectedCentroid = getPolygonCenter();
}


// --------- MOUSE & KEYBOARD ---------

function mousePressed() {
  if (isMouseOutOfBounds()) return;


  if (mouseButton === RIGHT) {
    startPanning();
  }

  if (mouseButton === LEFT) {
    if (selectedTool == Tool.CREATE_POLYGON) { 
      if (tempPolygon.length > 2) {
        if (tempPolygon[0].x == mousePosInGridSnapped.x && tempPolygon[0].y == mousePosInGridSnapped.y) { // Close polygon
          polygon = [...tempPolygon];
          currentScale = {x: 1, y: 1} // Create polygon with scale of 1
          tempPolygon = [];
          selectedTool = Tool.NONE;   // TODO: VOLTAR A USAR A ULTIMA TOOL SELECIONADA
          updateButtonStyles(null);

          // Save last completed polygon for undo
          lastCompletePolygon = polygon.map(p => ({x: p.x, y: p.y}));

          return;
        }
      }
      tempPolygon.push(mousePosInGridSnapped);
    }
    else if (selectedTool == Tool.TRANSLATE) {
      if (selectedCentroid || selectedVertex) {
        if (isClickingTransformHandleX()) {
          console.log("Clicking X handle");
          translateInitialX = mousePosInGridSnapped.x;
          isDraggingX = true;
          return;
        }
        else if (isClickingTransformHandleY()) {
          console.log("Clicking Y handle");
          translateInitialY = mousePosInGridSnapped.y;
          isDraggingY = true;
          return;
        }
        else { // Clicked out in the canvas, deselect current vertex
          selectedCentroid = null;
          selectedVertex = null;
        }
      }

      selectNearestVertex();
    }
    else if (selectedTool == Tool.SCALE) {
      let selectedAxis = isClickingScaleHandle();
      if (selectedAxis) {
        isScaling = true;
        scaleStartPos = mousePosInGrid;
        scalePolygonOriginalForm = polygon.map(p => ({x: p.x, y: p.y})); // Deep copy..?
        console.log("Saving current form for scale");

        if (selectedAxis == 1)
          isScalingX = true;
        else if (selectedAxis == 2)
          isScalingY = true;

      }
    }

    else {
      startPanning();
    }

    // else if (transformType === 'scale') { // If clicking near scale handles
    //   let bounds = getPolygonBounds();
    //   let mousePos = getMousePos();
    //   let d1 = dist(mouseX, mouseY, bounds.maxX, bounds.maxY);
    //   let d2 = dist(mouseX, mouseY, bounds.minX, bounds.minY);
    //   if (d1 < 5 || d2 < 5) {
    //     transformControls.scale.isDragging = true;
    //     transformControls.scale.startDistance = getPolygonDiagonalLength();
    //     transformControls.scale.startMousePos = mousePos;
    //   }
    // }
  }
}

function mouseReleased() {
  stopPanning();
  isDraggingX = false;
  isDraggingY = false;
  isScalingX = false;
  isScalingY = false;
  isScaling = false;

}

function mouseDragged() {
  panScreen();

  if (isDraggingX || isDraggingY) {
    translatePolygon();
  } 
  else if (isScaling) {
    if (!scaleStartPos.x || !scaleStartPos.y) return;
    let distanciaX = mousePosInGrid.x - scaleStartPos.x;
    let distanciaY = (mousePosInGrid.y - scaleStartPos.y)*-1;
    
    currentScale.x = map(distanciaX, 0, 55, 1, 2);
    currentScale.y = map(distanciaY, 0, 55, 1, 2);
    
    scalePolygon();
  }
}

function mouseWheel(event: number) {
  // @ts-ignore 
  let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
  let newScale = scaleFactor * zoomFactor;

  // Zoom limit
  if (newScale < 1) {
    zoomFactor = 1 / scaleFactor;
  } else if (newScale > 10.0) {
    zoomFactor = 10.0 / scaleFactor;
  }

  newScale = scaleFactor * zoomFactor;

  let centerX = width / 2;
  let centerY = height / 2;

  panX = centerX - (centerX - panX) * zoomFactor;
  panY = centerY - (centerY - panY) * zoomFactor;

  scaleFactor = newScale;
}

function keyPressed() {
  if (keyCode === ESCAPE) {
    selectedTool = Tool.NONE;
    tempPolygon = [];
    selectedVertex = null;
    selectedCentroid = null;
    updateButtonStyles(null);

    // Remove active class from all buttons
    buttonCreate.removeClass('active');
    buttonTranslate.removeClass('active');
    buttonScale.removeClass('active');
  }
  else if (key == "t") {
    console.log("t");
    console.log(polygon);

  }
}

function cancelPolygonCreation() {
  selectedTool = Tool.NONE;
  tempPolygon = [];
  updateButtonStyles(null);
}


// --------- HELPER FUNCTIONS ----------

function disableBrowserRightClick() {
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

function disablePageZoom() {
  // You can still zoom with (ctrl +-)

  // Prevent zooming with the mouse wheel
  window.addEventListener('wheel', function(event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
  }, { passive: false });

  // Prevent zooming with touch gestures
  window.addEventListener('gesturestart', function(event) {
    event.preventDefault();
  });
}

function isMouseOutOfBounds() {
  return (
    (mouseY > height || mouseY < 0 || mouseX > width || mouseX < 0)
    ||
    (mouseX >= windowWidth-controlPanelSize.x) // Control panel
  )
}

function getMousePosInGrid() {
  return createVector(
    (mouseX - panX) / (gridSize * scaleFactor) * gridSize,
    (mouseY - panY) / (gridSize * scaleFactor) * gridSize,
  );
}

function getMousePosInGridSnapped() {
  return createVector(
    Math.round((mouseX - panX) / (gridSize * scaleFactor)) * gridSize,
    Math.round((mouseY - panY) / (gridSize * scaleFactor)) * gridSize
  );
}

function getMousePosInCartesianPlane() {
  return createVector(
    Math.round(mousePosInGridSnapped.x / gridSize),
    Math.round(-mousePosInGridSnapped.y / gridSize) // Y grows down in p5js, but up in cartesian plane
  );
}

function getPolygonCenter() {
  let sumX = 0, sumY = 0;
  
  for (let p of polygon) {
    sumX += p.x;
    sumY += p.y;
  }
  
  return createVector((sumX / polygon.length), (sumY / polygon.length));
}

// function getPolygonCentroid() {
//   let sumX = 0, sumY = 0;
//   let sumArea = 0;
//   
//   for (let i = 0; i < polygon.length; i++) {
//     let p1 = polygon[i];
//     let p2 = polygon[(i + 1) % polygon.length];
//     
//     let area = p1.x * p2.y - p2.x * p1.y;
//     sumArea += area;
//     
//     sumX += (p1.x + p2.x) * area;
//     sumY += (p1.y + p2.y) * area;
//   }
//   
//   let x = sumX / (3 * sumArea);
//   let y = sumY / (3 * sumArea);
//   
//   return createVector(x, y);
// }

function drawDebugWindow() {
  if (!shouldDrawDebugWindow) return;
  
  push(); 
  resetMatrix();
  
  // Draw background
  fill(0, 0, 0, 180);
  stroke(255);
  strokeWeight(1);
  rect(10, 10, 260, 200, 5);
  
  fill(255);
  noStroke();
  textSize(14);
  textAlign(LEFT, TOP);
  
  let debugText = "";
  // debugText += `mouseXY: [${mouseX.toFixed(2)}, ${mouseY.toFixed(2)}]`;
  // debugText += "\n";
  debugText += `mousePosInGrid: [${mousePosInGrid.x.toFixed(2)}, ${mousePosInGrid.y.toFixed(2)}]`;
  debugText += "\n";
  debugText += `mousePosInGridSnapped: [${mousePosInGridSnapped.x}, ${mousePosInGridSnapped.y}]`;
  debugText += "\n";
  //debugText += `mousePosInCartesianPlane: ${mousePosInCartesianPlane.x}, ${mousePosInCartesianPlane.y}`;
  //debugText += "\n";
  // debugText += `PanXY: [${panX.toFixed(2)}, ${panY.toFixed(2)}]`;
  // debugText += "\n";
  debugText += `scaleFactor: [${scaleFactor.toFixed(2)}]`;
  debugText += "\n";
  // debugText += `Last mouse pos: ${lastMouseX}, ${lastMouseY}`;
  // debugText += "\n";
  // debugText += `isPanning: [${isPanning}]`;
  // debugText += "\n";
  debugText += `Tool: [${Object.keys(Tool)[selectedTool]}]`;
  debugText += "\n";
  // debugText += `isDraggingXY: [${isDraggingX}, ${isDraggingY}]`;
  // debugText += "\n";
  // debugText += `translateInitialXY: [${translateInitialX}, ${translateInitialY}]`;
  // debugText += "\n";
  // debugText += `dx, dy: [${dx}, ${dy}]`;
  // debugText += "\n";
  if (scaleStartPos.x && scaleStartPos.y) {
    debugText += `scaleStartPos: [${(scaleStartPos.x).toFixed(4)}, ${(scaleStartPos.x).toFixed(4)}]`;
    debugText += "\n";
  }
  if(currentScale.x && currentScale.y){
    debugText += `currentScale: [${currentScale.x.toFixed(4)}, ${currentScale.y.toFixed(4)}]`;
    debugText += "\n";
  }



  text(debugText, 20, 20);
  pop();
}

function isClickingTransformHandleX() {
  let center = selectedVertex ? selectedVertex : selectedCentroid;
  
  if (!center) return false;
  
  debugVertexCenter = center;
  
  // The X hitbox should extend from the starting point of the line to the end of the arrow
  let hitboxX = center.x + gizmoLineOffset;
  let hitboxY = center.y;
  let hitboxWidth = gizmoArrowLength - gizmoLineOffset;
  let hitboxHeight = gizmoHitboxWidth;
  
  return (mousePosInGrid.x >= hitboxX && 
          mousePosInGrid.x <= hitboxX + hitboxWidth &&
          mousePosInGrid.y >= hitboxY - hitboxHeight/2 && 
          mousePosInGrid.y <= hitboxY + hitboxHeight/2);
}

function isClickingTransformHandleY() {
  let center = selectedVertex ? selectedVertex : selectedCentroid;
  
  if (!center) return false;
  
  debugVertexCenter = center;
  
  let hitboxX = center.x;
  let hitboxY = center.y + gizmoLineOffset;
  let hitboxWidth = gizmoHitboxWidth;
  let hitboxHeight = gizmoArrowLength - gizmoLineOffset;
  
  return (mousePosInGrid.x >= hitboxX - hitboxWidth/2 && 
          mousePosInGrid.x <= hitboxX + hitboxWidth/2 &&
          mousePosInGrid.y >= hitboxY && 
          mousePosInGrid.y <= hitboxY + hitboxHeight);
}

function debugDrawArrowHitboxes() {
  if (!debugVertexCenter) return;

  let center = debugVertexCenter;
  if (!center.x || !center.y) return;
  
  push();
  noFill();
  strokeWeight(0.5);

  // X
  stroke(255, 0, 0);
  rect(
    center.x + gizmoLineOffset,
    center.y - gizmoHitboxWidth/2,
    gizmoArrowLength - gizmoLineOffset,
    gizmoHitboxWidth
  );
  
  // Y 
  stroke(0, 255, 0);
  rect(center.x - gizmoHitboxWidth/2,
       center.y + gizmoLineOffset,
       gizmoHitboxWidth,
       gizmoArrowLength - gizmoLineOffset);
  
  pop();
}