/// <reference path="../node_modules/@types/p5/global.d.ts" />

let buttonCreate: any, buttonTranslate: any, buttonScale: any, buttonMirrorX: any, buttonMirrorY: any, buttonResetPolygon: any, buttonCenterCamera: any, buttonShearU: any, buttonShearNU: any;
let canvas: any;
let tempPolygon: { x: number; y: number }[] = [];                   // For when ur drawing
let lastCompletePolygon: { x: number; y: number }[] = [];           // For ctrl+z
let scaleFactor: number = 5; // Camera scale factor (zoom)
let selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
let selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation
let debugVertexCenter = {x: null, y: null};                 // TODO: remover

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

// --------NEW SHIT-------
let selectedPolygon: Polygon | null;
let polygonsList: Polygon[] = [];


// TODOs:
// ---------------------------------
// - Click vertex to show gizmo    - DONE
// - Shapes snap to grid           - DONE
// - Reset shape button            - DONE
// - Mirror from axis button       - DONE
// - Disable select text on panel  - DONE
// - Scale tool                    - DONE
// - Separate shit into classes    - DONE-ish
// - Create ToolsManager.ts?       - 
// - Ruler                         - 
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
  
  Colors.init();
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  SidePanel.createControlPanel();

  BrowserUtils.disableBrowserRightClick();
  BrowserUtils.disablePageZoom();
  Camera.centerCamera();
}

function draw() {
  background(Colors.BackgroundColor); 
  translate(Mouse.panX, Mouse.panY);
  scale(scaleFactor);

  Mouse.updateMousePosition();
  
  Grid.drawGrid();
  Grid.drawCartesianPlaneAxis();

  for (let p of polygonsList) {
    p.drawPolygon();
  }

  handleToolsLogic();

  // Debug
  DebugUI.drawDebugWindow();
  //debugDrawArrowHitboxes();
}



function handleToolsLogic() {
  switch (selectedTool) {
    case Tool.CREATE_POLYGON:
      drawPolygonBeingCreated();
      break;

    case Tool.TRANSLATE:
      if(!selectedPolygon) return;
      selectedPolygon.drawPolygonCenter();
      Transform.drawTransformGizmo();
      break;

    case Tool.SCALE:
      if(!selectedPolygon) return;
      selectedPolygon.drawPolygonCenter();
      Scale.drawScaleGizmo();
      break;

    default:
      return;
  }
}

function drawCoordinatesOnMouse() {
  push();
  fill(0);
  stroke(Colors.BackgroundColor);
  strokeWeight(0.5);
  textAlign(LEFT, CENTER);
  textSize(12/scaleFactor);
  text(`(${Mouse.mousePosInCartesianPlane.x}, ${Mouse.mousePosInCartesianPlane.y})`, Mouse.mousePosInGridSnapped.x + 2, Mouse.mousePosInGridSnapped.y + 2);
  pop();
}

function selectNearestVertex() { // Selects vertex or center
  let selectDistance = 3;

  // Selecting center
  for (let p of polygonsList) {
    let center = p.getCenter();
    let distanceToCenter = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, center.x, center.y);

    if (distanceToCenter < selectDistance) {
      selectedPolygon = p;
      selectedCentroid = center;
      console.log(`Selected polygon ${selectedPolygon.id}!`);
      return;
    }
  }

  // Selecting vertex
  for (let p of polygonsList) {
    for (let v of p.vertices) {
      let distanceToVertex = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, v.x, v.y);
  
      if (distanceToVertex < selectDistance) {
        selectedVertex = v;
        selectedPolygon = p;
        console.log("Selected vertex!");
        return;
      }
    }
  }
}




function drawPolygonBeingCreated() {
  // Draw filled shape up to current points
  if (tempPolygon.length > 0) {
    stroke(0);
    strokeJoin(ROUND);
    fill(100, 100, 250, 100);
    beginShape();
    for (let p of tempPolygon) {
      vertex(p.x, p.y);
    }
    vertex(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y);
    endShape();

    // Draw gradient line from last point to current mouse position
    let lastPoint: { x: number, y: number } = tempPolygon[tempPolygon.length - 1];

    // Save current drawing context state
    drawingContext.save();

    // Create gradient
    let gradient = drawingContext.createLinearGradient(
      lastPoint.x, lastPoint.y,
      Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y
    );
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, Colors.Red);

    // Apply gradient
    drawingContext.strokeStyle = gradient;
    drawingContext.beginPath();
    drawingContext.moveTo(lastPoint.x, lastPoint.y);
    drawingContext.lineTo(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y);
    drawingContext.stroke();

    // Restore previous drawing context state
    drawingContext.restore();

    // Draw each vertex of tempPolygon
    if (SidePanel.shouldDrawVertexBalls) {
      noStroke();
      fill(Colors.Black);
      for(let v of tempPolygon) {
        ellipse(v.x, v.y, Polygon.vertexBallRadius);
      }
    }

    // Draw red circle around first vertex
    noFill();
    stroke(Colors.Red);
    strokeWeight(0.2);
    ellipse(tempPolygon[0].x, tempPolygon[0].y, Polygon.vertexBallRadius);
  }

  // Draw red dot
  fill(Colors.Red);
  noStroke();
  ellipse(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y, Polygon.vertexBallRadius);

  // Draw coordinates text
  drawCoordinatesOnMouse();
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