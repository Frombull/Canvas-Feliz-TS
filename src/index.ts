/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../node_modules/@irojs/iro-core/dist/index.d.ts" />

let buttonCreate: any, buttonTranslate: any, buttonScale: any, buttonMirrorX: any, buttonMirrorY: any,
 buttonResetPolygon: any, buttonCenterCamera: any, buttonShearU: any, buttonShearNU: any, buttonRotate: any,
 buttonBezier: any, buttonCurves: any;;
let canvas: any;
let tempPolygon: { x: number; y: number }[] = [];
let lastCompletePolygon: { x: number; y: number }[] = [];
let selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
let selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation
enum Tool {
  NONE,
  CREATE_POLYGON,
  TRANSLATE,
  SCALE,
  REFLECT,
  SHEAR_U,
  SHEAR_NU,
  ROTATE,
  BEZIER
}
let selectedTool: Tool = Tool.NONE;

let selectedPolygon: Polygon | null;
let polygonsList: Polygon[] = [];


// TODOs:
// ---------------------------------
// - Click vertex to show gizmo         - DONE
// - Shapes snap to grid                - DONE
// - Reset shape button                 - DONE
// - Mirror from axis button            - DONE
// - Disable select text on panel       - DONE
// - Scale tool                         - DONE
// - Separate shit into classes         - DONE
// - Add color and alpha                - DONE
// - Show/hide grid button              - DONE
// - Show/hide vertex balls button      - DONE
// - Show/hide coordinates button       - DONE
// - Show/hide debug window button      - DONE
// - Canvas size of screen              - DONE
// - Rotate tool                        - DONE
// - select polygon to rotate from      - DONE
// - Delete vertex or polygon           - DONE
// - Resize when console is open        - DONE
// - Bezier curve tool                  - ~
// - FPS RAM usage debug info           - 
// - New polygon random color id based  - 
// - Effect when hovering interactable  - 
// - X/Y axis arrow                     - 
// - Hermite curve tool                 - 
// - Scale tool sucks                   - 
// - Ruler tool                         - 
// - Create ToolsManager.ts?            - 
// - Annimation with button CLICK       - 
// - Better ShearU / ShearNU tool       - 
// - Undo / Redo                        - ~
// - Save / Load                        - 
// -                                    - 
// -                                    - 
// - Start working on 3D version        - 
// ---------------------------------


function setup() {
  console.log("Setup!");
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  Colors.init();
  SidePanel.createControlPanel();

  BrowserUtils.disableBrowserRightClick();
  BrowserUtils.disablePageZoom();
  Camera.centerCamera();
}

function draw() {
  background(Colors.BackgroundColor); 
  translate(Mouse.panX, Mouse.panY);
  scale(Camera.scaleFactor);

  Mouse.updateMousePosition();
  
  Grid.drawGrid();
  Grid.drawCartesianPlaneAxis();

  for (let p of polygonsList) {
    p.drawPolygon();
  }

  handleToolsLogic();

  // if (!selectedPolygon){
  //   SidePanel.colorPicker.value('#ffffff');
  // }

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
      Transform.drawTransformGizmo();
      break;

    case Tool.SCALE:
      if(!selectedPolygon) return;
      Scale.drawScaleGizmo();
      break;

    case Tool.ROTATE:
      if(!selectedPolygon) return;
      Rotate.drawRotationGizmo();
      break;

    case Tool.BEZIER:
      CurvesUI.drawBezierControls();
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
  textSize(12/Camera.scaleFactor);
  text(`(${Mouse.mousePosInCartesianPlane.x}, ${Mouse.mousePosInCartesianPlane.y})`, Mouse.mousePosInGridSnapped.x + 2, Mouse.mousePosInGridSnapped.y + 2);
  pop();
}

function drawCircleOnMouse(circleColor: any) {
  push();
  noFill();
  stroke(circleColor);
  strokeWeight(0.4);
  ellipse(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y, Polygon.vertexBallRadius);
  pop();
}

function selectNearestVertex(): boolean { // Selects vertex or center
  let selectDistance = 3;

  // Selecting center
  for (let p of polygonsList) {
    let center = p.getCenter();
    let distanceToCenter = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, center.x, center.y);

    if (distanceToCenter < selectDistance) {
      // If selecting a different polygon, reset rotation angle
      if (p !== selectedPolygon) {
        Rotate.resetAngle();
      }
      p.setAsSelectePolygon();
      selectedCentroid = center;
      selectedVertex = null;
      return true;
    }
  }

  // Selecting vertex
  for (let p of polygonsList) {
    for (let v of p.vertices) {
      let distanceToVertex = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, v.x, v.y);
  
      if (distanceToVertex < selectDistance) {
        // If selecting a different polygon
        if (p !== selectedPolygon) {
          Rotate.resetAngle();
        }
        p.setAsSelectePolygon();
        selectedVertex = v;
        selectedCentroid = null;
        console.log(`Selected vertex of polygon ${p.id}!`);
        return true;
      }
    }
  }
  return false;
}

function drawPolygonBeingCreated() {
  push();
  // Draw filled shape up to current points
  if (tempPolygon.length > 0) {
    stroke(0);
    strokeJoin(ROUND);
    strokeWeight(1);
    fill(100, 100, 250, 100);
    beginShape();
    for (let p of tempPolygon) {
      vertex(p.x, p.y);
    }
    vertex(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y);
    endShape();

    // Draw gradient line from last point to current mouse position
    let lastPoint: { x: number, y: number } = tempPolygon[tempPolygon.length - 1];

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
  pop();

  drawCircleOnMouse(Colors.Red);
  drawCoordinatesOnMouse();
}

function cancelPolygonCreation() {
  selectedTool = Tool.NONE;
  tempPolygon = [];
  SidePanel.updateButtonStyles(null);
}

function deselectPolygon() {
  selectedCentroid = null;
  selectedVertex = null;
  selectedPolygon = null;
  console.log("Polygon deselected.");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  SidePanel.handleWindowResize();
  redraw();
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
