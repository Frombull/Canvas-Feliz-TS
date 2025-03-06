/// <reference path="../node_modules/@types/p5/global.d.ts" />

let buttonCreate: any, buttonTranslate: any, buttonScale: any, buttonMirrorX: any, buttonMirrorY: any, buttonResetPolygon: any, buttonCenterCamera: any, buttonShearU: any, buttonShearNU: any;
let canvas: any;
let colors: Record<string, any> = {};                       // Should be color, from p5js
let polygon: { x: number; y: number }[] = [];
let tempPolygon: { x: number; y: number }[] = [];                   // For when ur drawing
let lastCompletePolygon: { x: number; y: number }[] = [];           // For ctrl+z
let vertexBallRadius: number = 3;
let scaleFactor: number = 5; // Camera zoom scale
let selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
let selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation
let dx: number = 0, dy: number = 0;
let debugVertexCenter = {x: null, y: null};                 // TODO: remover



// Pan
let panX: number, panY: number;
let isPanning: boolean = false;
let lastMouseX: number, lastMouseY: number;
let mousePosInGrid: {x: any; y: any;};
let mousePosInGridSnapped: {x: any; y: any;};
let mousePosInCartesianPlane: {x: any; y: any;};

// Tools

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
// - Disable select text on panel  - DONE
// - Scale tool                    - DONE
// - Separate shit into classes    - DONE-ish
// - Better ShearU / ShearNU tool  -
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
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  SidePanel.createControlPanel();

  disableBrowserRightClick();
  disablePageZoom();
  createColors();
  Camera.centerCamera();
}

function draw() {
  background(colors.BackgroundColor); 
  
  translate(panX, panY);
  scale(scaleFactor);

  mousePosInGrid = Mouse.getMousePosInGrid();
  mousePosInGridSnapped = Mouse.getMousePosInGridSnapped();
  mousePosInCartesianPlane = Mouse.getMousePosInCartesianPlane();
  
  Grid.drawGrid();
  Grid.drawCartesianPlaneAxis();
  drawPolygon();
  handleToolsLogic();

  // Debug
  DebugUI.drawDebugWindow();
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
      Transform.drawTransformGizmo();
      break;

    case Tool.SCALE:
      drawPolygonCenter();
      Scale.drawScaleGizmo();
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
    
    if (SidePanel.shouldDrawVertexBalls)
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

  if (SidePanel.shouldDrawVertexBalls){
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

function cancelPolygonCreation() {
  selectedTool = Tool.NONE;
  tempPolygon = [];
  SidePanel.updateButtonStyles(null);
}


// --------- MOUSE & KEYBOARD ---------

function mousePressed() {
  Mouse.mousePressed();
}

function mouseDragged() {
  Mouse.mouseDragged();
}

function mouseReleased() {
  Mouse.mouseReleased();
}

function mouseWheel(event?: any) {
  Mouse.mouseWheel(event);
}

function keyPressed() {
  Keyboard.keyPressed();
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

// function debugDrawArrowHitboxes() {
//   if (!debugVertexCenter) return;
// 
//   let center = debugVertexCenter;
//   if (!center.x || !center.y) return;
//   
//   push();
//   noFill();
//   strokeWeight(0.5);
// 
//   // X
//   stroke(255, 0, 0);
//   rect(
//     center.x + gizmoLineOffset,
//     center.y - gizmoHitboxWidth/2,
//     gizmoArrowLength - gizmoLineOffset,
//     gizmoHitboxWidth
//   );
//   
//   // Y 
//   stroke(0, 255, 0);
//   rect(center.x - gizmoHitboxWidth/2,
//        center.y + gizmoLineOffset,
//        gizmoHitboxWidth,
//        gizmoArrowLength - gizmoLineOffset);
//   
//   pop();
// }