/// <reference path="../node_modules/@types/p5/global.d.ts" />
/// <reference path="../node_modules/@irojs/iro-core/dist/index.d.ts" />

let buttonCreate: any, buttonTranslate: any, buttonScale: any, buttonMirrorX: any, buttonMirrorY: any,
 buttonResetPolygon: any, buttonCenterCamera: any, buttonShearU: any, buttonShearNU: any, buttonRotate: any,
 buttonBezier: any, buttonCurves: any, buttonAnimation: any;
let canvas: any;
let selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
let selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation
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
  BEZIER,
  ANIMATION
}
let selectedTool: Tool = Tool.NONE;

let selectedPolygon: Polygon | null;
let polygonsList: Polygon[] = [];


// TODOs:
// ---------------------------------
// - X/Y axis arrow                     - 
// - Create ToolsManager.ts?            - 
// - Annimation with button CLICK       - 
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

  // Debug
  DebugUI.drawDebugWindow();
}

function handleToolsLogic() {
  switch (selectedTool) {
    case Tool.CREATE_POLYGON:
      CreatePolygon.drawPolygonBeingCreated();
      ToolInfo.drawSnapToGridInfo();
      cursor(CROSS); 
      break;

    case Tool.TRANSLATE:
      if(!selectedPolygon) return;
      Transform.drawTransformGizmo();
      ToolInfo.drawSnapToGridInfo();

      break;

    case Tool.SCALE:
      if(!selectedPolygon) return;
      Scale.drawScaleGizmo();
      ToolInfo.drawSnapToGridInfo();
      break;

    case Tool.ROTATE:
      if(!selectedPolygon) return;
      Rotate.drawRotationGizmo();
      ToolInfo.drawSnapRotationInfo();
      break;

    case Tool.BEZIER:
      CurvesUI.drawBezierControls();
      Curves.updateAnimation();
      ToolInfo.drawSnapToGridInfo();
      break;
      
    case Tool.ANIMATION:
      // Update animation state if playing
      PolygonAnimation.updateAnimation();
      // Draw visualization of animation state
      PolygonAnimation.drawAnimationState();
      ToolInfo.drawSnapToGridInfo();
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

function selectNearestVertex(): boolean { // Selects vertex or center
  let selectDistance = 2;

  // Selecting center
  for (let p of polygonsList) {
    let center = p.getCenter();
    let distanceToCenter = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, center.x, center.y);

    if (distanceToCenter < selectDistance) {
      p.setAsSelectePolygon();
      selectedCentroid = center;
      selectedVertex = null;

      console.log(`Selected center of polygon ${p.id}!`);
      return true;
    }
  }

  // Selecting vertex
  for (let p of polygonsList) {
    for (let v of p.vertices) {
      let distanceToVertex = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, v.x, v.y);
  
      if (distanceToVertex < selectDistance) {
        p.setAsSelectePolygon();
        selectedVertex = v;
        selectedCentroid = null;
        
        // If selecting a different polygon
        if (p !== selectedPolygon) {
          Rotate.loadPolygonRotation();
        }

        console.log(`Selected vertex of polygon ${p.id}!`);
        return true;
      }
    }
  }
  return false;
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
