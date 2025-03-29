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
let toolIcons: {[key: string]: any} = {};
enum BezierType {
  QUADRATIC,
  CUBIC
}
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
// - Bezier curve tool                  - ~~~
// - Scale tool                         - ~~
// - Dashed line option to polygon      - 
// - Set polygon pos menu (like blender)- 
// - Rotate tool                        - 
// - New polygon random color id based  - 
// - X/Y axis arrow                     - 
// - Hermite curve tool                 - 
// - Ruler tool                         - 
// - Create ToolsManager.ts?            - 
// - Annimation with button CLICK       - 
// - ShearU / ShearNU tool              - 
// - Undo / Redo                        - ~
// - Save / Load                        - 
// -                                    - 
// - Start working on 3D version        - 
// ---------------------------------


function setup() {
  console.log("Setup!");
  //frameRate(144);

  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
  
  textFont('monospace');

  Colors.init();
  SidePanel.createControlPanel();

  BrowserUtils.disableBrowserRightClick();
  BrowserUtils.disablePageZoom();
  Camera.centerCamera();
}

function draw() {
  background(Colors.BackgroundColor); 
  translate(Mouse.panX, Mouse.panY);
  scale(Camera.currentScaleFactor);
  cursor(ARROW);

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
      drawSnapToGridInfo();
      cursor(CROSS); 
      break;

    case Tool.TRANSLATE:
      if(!selectedPolygon) return;
      Transform.drawTransformGizmo();
      drawSnapToGridInfo();

      break;

    case Tool.SCALE:
      if(!selectedPolygon) return;
      Scale.drawScaleGizmo();
      drawSnapToGridInfo();
      break;

    case Tool.ROTATE:
      if(!selectedPolygon) return;
      Rotate.drawRotationGizmo();
      drawSnapToGridInfo();
      break;

    case Tool.BEZIER:
      CurvesUI.drawBezierControls();
      Curves.updateAnimation();
      drawSnapToGridInfo();
      break;

    default:
      return;
  }
}

function drawCoordinatesOnMouse() {
  const mousePos = Mouse.getMousePosForTransform();
  const cartesianX = Math.round(mousePos.x / Grid.gridSize);
  const cartesianY = Math.round(-mousePos.y / Grid.gridSize); // Y grows down in p5js, but up in cartesian plane
  
  push();

  fill(0);
  stroke(Colors.BackgroundColor);
  strokeWeight(0.5);
  textAlign(LEFT, CENTER);
  textSize(12/Camera.currentScaleFactor);
  text(`(${cartesianX}, ${cartesianY})`, mousePos.x + 2, mousePos.y + 2);

  pop();
}

function drawCircleOnMouse(circleColor: any, mousePos: Vertex) {
  push();
  fill(circleColor);
  noStroke();
  //strokeWeight(0.4);
  ellipse(mousePos.x, mousePos.y, Polygon.normalVertexRadius);
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

  const mousePos = Mouse.getMousePosForTransform();

  // Draw filled shape up to current points
  if (tempPolygon.length > 0) {
    stroke(Colors.edgeColor);
    strokeJoin(ROUND);
    strokeWeight(Polygon.edgeWidth);
    fill(Colors.PolygonBlue);
    
    // Dashed line start
    drawingContext.setLineDash([3, 1.5]);
    
    beginShape();
    for (let p of tempPolygon) {
      vertex(p.x, p.y);
    }
    vertex(mousePos.x, mousePos.y);
    endShape();

    // Dashed line end
    drawingContext.setLineDash([]);

    // Draw each vertex of tempPolygon
    if (SidePanel.shouldDrawVertexBalls) {
      noStroke();
      fill(Colors.vertexColor);
      for(let v of tempPolygon) {
        ellipse(v.x, v.y, Polygon.normalVertexRadius);
      }
    }

    // Draw red circle around first vertex
    noFill();
    stroke(Colors.Red);
    strokeWeight(0.2);
    ellipse(tempPolygon[0].x, tempPolygon[0].y, Polygon.normalVertexRadius);
  }

  // Draw circle around first vertex when you're about to close the polygon
  if (tempPolygon.length > 2 && Mouse.isCloseToFirstVertex()) {
    noFill();
    stroke(Colors.Red);
    strokeWeight(0.4);
    ellipse(tempPolygon[0].x, tempPolygon[0].y, Polygon.normalVertexRadius * 2);
    
    const mousePos = {x: tempPolygon[0].x, y: tempPolygon[0].y};
    vertex(mousePos.x, mousePos.y);
  } 
  else {
    const mousePos = Mouse.getMousePosForTransform();
    vertex(mousePos.x, mousePos.y);
  }

  pop();

  drawCircleOnMouse(Colors.GrayWithAlpha, mousePos);
  drawCoordinatesOnMouse();
}

function cancelPolygonCreation() {
  selectedTool = Tool.NONE;
  tempPolygon = [];
  buttonCreate.setActive(false);
  //SidePanel.updateButtonStyles(null);
}

function deselectPolygon() {
  selectedCentroid = null;
  selectedVertex = null;
  selectedPolygon = null;
  console.log("Polygon deselected.");
}

function deselectVertex() {
  selectedCentroid = null;
  selectedVertex = null;
  console.log("Vertex deselected.");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  SidePanel.handleWindowResize();
  redraw();
}

function drawSnapToGridInfo() {
  push();
  resetMatrix();
  
  fill(0, 0, 0, 220);
  noStroke();
  textSize(16);
  textAlign(LEFT, BOTTOM);
  if (Keyboard.isShiftPressed) {
    text("SNAP-TO-GRID: OFF ", 10, height - 10);
  }
  else {
    text("SNAP-TO-GRID: ON", 10, height - 10);
  }

  pop();
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

function keyReleased() {
  Keyboard.keyReleased();
}
