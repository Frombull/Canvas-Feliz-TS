class Mouse {
  // Pan
  static panX: number;
  static panY: number;
  static lastMouseX: number;                              // Used for panning
  static lastMouseY: number;                              // Used for panning
  static mousePosInGrid: {x: any; y: any;};
  static mousePosInGridSnapped: {x: any; y: any;};
  static mousePosInCartesianPlane: {x: any; y: any;};
  static translateInitialX: number = 0;
  static translateInitialY: number = 0;
  static isDraggingControlPoint: boolean = false;
  static selectedControlPoint: Vertex | null = null;

  // Called every frame by draw()
  public static updateMousePosition() {
    Mouse.mousePosInGrid = Mouse.getMousePosInGrid();
    Mouse.mousePosInGridSnapped = Mouse.getMousePosInGridSnapped();
    Mouse.mousePosInCartesianPlane = Mouse.getMousePosInCartesianPlane();
  }
  
  static mousePressed() {
    if (Mouse.isMouseOutOfBounds()) return;

    if (mouseButton === RIGHT) {
      Camera.startPanning();
      return;
    }
  
    if (mouseButton === LEFT) {
      if (selectedTool == Tool.NONE) {
        Mouse.selectPolygonUnderMouse();
      }
      else if (selectedTool == Tool.CREATE_POLYGON) { 
        if (tempPolygon.length > 2) {
          if (tempPolygon[0].x == Mouse.mousePosInGridSnapped.x && tempPolygon[0].y == Mouse.mousePosInGridSnapped.y) { // Close polygon
            let newPolygon = new Polygon(tempPolygon.map(v => ({ x: v.x, y: v.y })));
            Scale.currentScale = {x: 1, y: 1}
            
            selectedTool = Tool.NONE;   // TODO: VOLTAR A USAR A ULTIMA TOOL SELECIONADA
            SidePanel.updateButtonStyles(null);
            
            lastCompletePolygon = newPolygon.vertices.map(p => ({x: p.x, y: p.y}));
            
            polygonsList.push(newPolygon);
            newPolygon.setAsSelectePolygon();
            
            // Add the creation action to history
            const action = new CreatePolygonAction(newPolygon);
            HistoryManager.getInstance().addAction(action);
            
            tempPolygon = [];
            return;
          }
        }
        tempPolygon.push(Mouse.mousePosInGridSnapped);
      }
      else if (selectedTool == Tool.TRANSLATE) {
        if (selectedCentroid || selectedVertex) {
          if (Transform.isClickingTransformHandleX()) {
            //console.log("Clicking X handle");
            Mouse.translateInitialX = Mouse.mousePosInGridSnapped.x;
            Transform.isDraggingX = true;
            return;
          }
          else if (Transform.isClickingTransformHandleY()) {
            //console.log("Clicking Y handle");
            Mouse.translateInitialY = Mouse.mousePosInGridSnapped.y;
            Transform.isDraggingY = true;
            return;
          }
          else {
            Mouse.selectPolygonUnderMouse();
          }
        }
        if (!selectNearestVertex()){
          Mouse.selectPolygonUnderMouse();
        }
  
      }
      else if (selectedTool == Tool.SCALE) {
        let selectedAxis = Scale.isClickingScaleHandle();

        if (selectedAxis && selectedPolygon) {
          Scale.isScaling = true;
          Scale.scaleStartPos = Mouse.mousePosInGrid;
          Scale.scalePolygonOriginalForm = selectedPolygon.vertices.map(p => ({x: p.x, y: p.y})); // Deep copy..?
          console.log("Saving current form for scale");
  
          if (selectedAxis == 1)
            Scale.isScalingX = true;
          else if (selectedAxis == 2)
            Scale.isScalingY = true;
        }
        else {
          Mouse.selectPolygonUnderMouse();
        }
      }
      else if (selectedTool == Tool.ROTATE) {
        if (!selectedPolygon) {
          Mouse.selectPolygonUnderMouse();
          return;
        }

        if (Rotate.isClickingRotationHandle()) {
          Rotate.isDragging = true;
          
          let center = selectedVertex || selectedPolygon.getCenter();
          let dx = Mouse.mousePosInGrid.x - center.x;
          let dy = Mouse.mousePosInGrid.y - center.y;
          Rotate.rotationStartAngle = atan2(dy, dx);
          Rotate.rotationCenter = center;
        }
        else {
          if (Rotate.isClickingCenter()) {
            // Select the center as rotation point by clearing selectedVertex
            selectedVertex = null;
            Rotate.resetAngle();
            return;
          }

          let previousVertex = selectedVertex;

          selectNearestVertex();

          if (!selectNearestVertex()) {
            // If no vertex selected, try selecting a polygon
            Mouse.selectPolygonUnderMouse();
          } 
          else if (previousVertex !== selectedVertex) {
            Rotate.resetAngle();
          }
        }
      }
      else if (selectedTool == Tool.BEZIER) {
        // if clicking on a control point
        let controlPoint = Curves.isNearControlPoint(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y);
        
        if (controlPoint) {
          // Start dragging this control point
          Mouse.selectedControlPoint = controlPoint;
          Mouse.isDraggingControlPoint = true;
        } else {
          // Not clicking on a control point, so create a new curve
          if (selectedTool == Tool.BEZIER) {
            Curves.createBezierCurve();
            console.log("createBezierCurve()");
          }
        }
      }
      else {
        Camera.startPanning();
      }
    }
  }
  
  static mouseReleased() {
    Camera.stopPanning();

    Transform.isDraggingX = false;
    Transform.isDraggingY = false;

    Scale.isScalingX = false;
    Scale.isScalingY = false;
    Scale.isScaling = false;

    Rotate.isDragging = false;

    Mouse.isDraggingControlPoint = false;
    Mouse.selectedControlPoint = null;
  }
  
  static mouseDragged() {
    Camera.panScreen();
  
    if (Transform.isDraggingX || Transform.isDraggingY) {
      Transform.translatePolygon();
    } 
    else if (Scale.isScaling) {
      if (!Scale.scaleStartPos.x || !Scale.scaleStartPos.y) return;
      let distanciaX = Mouse.mousePosInGrid.x - Scale.scaleStartPos.x;
      let distanciaY = (Mouse.mousePosInGrid.y - Scale.scaleStartPos.y)*-1;
      
      Scale.currentScale.x = map(distanciaX, 0, 55, 1, 2);
      Scale.currentScale.y = map(distanciaY, 0, 55, 1, 2);
      
      Scale.scalePolygon();
    }
    else if (Rotate.isDragging) {
      let angle = Rotate.calculateRotationAngle();
      Rotate.rotatePolygon(angle);
      // Update the start angle for smooth rotation
      if (Rotate.rotationCenter) {
        let dx = Mouse.mousePosInGrid.x - Rotate.rotationCenter.x;
        let dy = Mouse.mousePosInGrid.y - Rotate.rotationCenter.y;
        Rotate.rotationStartAngle = atan2(dy, dx);
      }
    }
    else if (Mouse.isDraggingControlPoint && Mouse.selectedControlPoint) {
      // Update pos of dragged control point
      Mouse.selectedControlPoint.x = Mouse.mousePosInGridSnapped.x;
      Mouse.selectedControlPoint.y = Mouse.mousePosInGridSnapped.y;
    }
  }
  
  static mouseWheel(event: any) {
    let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
    let newScale = Camera.scaleFactor * zoomFactor;
  
    // Zoom limit
    if (newScale < 1) {
      zoomFactor = (1 / Camera.scaleFactor);
    } else if (newScale > 10.0) {
      zoomFactor = (10.0 / Camera.scaleFactor);
    }
  
    newScale = Camera.scaleFactor * zoomFactor;
  
    let centerX = (width / 2);
    let centerY = (height / 2);
  
    Mouse.panX = (centerX - (centerX - Mouse.panX) * zoomFactor);
    Mouse.panY = (centerY - (centerY - Mouse.panY) * zoomFactor);
  
    Camera.scaleFactor = newScale;
  }

static isMouseOutOfBounds() {
  if (mouseY > height || mouseY < 0 || mouseX > width || mouseX < 0) {
    return true;
  }
  
  // Over UI element
  const elements = document.querySelectorAll('.control-panel, .control-panel *');
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i] as HTMLElement;
    const rect = element.getBoundingClientRect();
    
    if (
      mouseX >= rect.left && 
      mouseX <= rect.right && 
      mouseY >= rect.top && 
      mouseY <= rect.bottom
    ) {
      return true;
    }
  }
  
  // Any element that isnt canvas over mouse
  const elemUnderMouse = document.elementFromPoint(mouseX, mouseY);
  if (elemUnderMouse && elemUnderMouse.tagName !== 'CANVAS') {
    return true;
  }
  
  return false;
}
  
  private static getMousePosInGrid() {
    return createVector(
      (mouseX - Mouse.panX) / (Grid.gridSize * Camera.scaleFactor) * Grid.gridSize,
      (mouseY - Mouse.panY) / (Grid.gridSize * Camera.scaleFactor) * Grid.gridSize,
    );
  }
  
  private static getMousePosInGridSnapped() {
    return createVector(
      Math.round((mouseX - Mouse.panX) / (Grid.gridSize * Camera.scaleFactor)) * Grid.gridSize,
      Math.round((mouseY - Mouse.panY) / (Grid.gridSize * Camera.scaleFactor)) * Grid.gridSize
    );
  }
  
  private static getMousePosInCartesianPlane() {
    return createVector(
      Math.round(Mouse.mousePosInGridSnapped.x / Grid.gridSize),
      Math.round(-Mouse.mousePosInGridSnapped.y / Grid.gridSize) // Y grows down in p5js, but up in cartesian plane
    );
  }

  static isMouseInsidePolygon(polygon: Polygon): boolean {
    let inside = false;
    
    for (let i = 0, j = polygon.vertices.length - 1; i < polygon.vertices.length; j = i++) {
      const xi = polygon.vertices[i].x;
      const yi = polygon.vertices[i].y;
      const xj = polygon.vertices[j].x;
      const yj = polygon.vertices[j].y;
      
      // Ray casting algorithm logic - if a ray from the point to the right crosses an odd number of edges, the point is inside
      const intersect = ((yi > Mouse.mousePosInGrid.y) !== (yj > Mouse.mousePosInGrid.y)) &&
          (Mouse.mousePosInGrid.x < (xj - xi) * (Mouse.mousePosInGrid.y - yi) / (yj - yi) + xi);
      
      if (intersect) {
        inside = !inside;
      }
    }
    
    return inside;
  }

  static selectPolygonUnderMouse(): boolean {
    for (let p of polygonsList) {
      if (Mouse.isMouseInsidePolygon(p)) {
        p.setAsSelectePolygon();
        return true;
      }
    }
    // No polygon was clicked, deselect current polygon
    deselectPolygon();
    return false;
  }
}