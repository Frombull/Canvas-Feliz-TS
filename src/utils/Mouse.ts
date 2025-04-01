class Mouse {
  // Pan
  static panX: number;
  static panY: number;
  static lastMouseX: number;                              // Used for panning
  static lastMouseY: number;                              // Used for panning
  static mousePosInGrid: Vertex;
  static mousePosInGridSnapped: Vertex;
  static mousePosInCartesianPlane: Vertex;
  static translateInitialX: number = 0;
  static translateInitialY: number = 0;
  static isDraggingControlPoint: boolean = false;
  static selectedControlPoint: Vertex | null = null;


  // Called every frame by draw()
  public static updateMousePosition() {
    Mouse.mousePosInGrid = Mouse.getMousePosInGrid();
    Mouse.mousePosInGridSnapped = Mouse.getMousePosInGridSnapped();
    Mouse.mousePosInCartesianPlane = Mouse.getMousePosInCartesianPlane();
    
    Mouse.checkVertexHover()
    Mouse.checkCenterHover();
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
        if (CreatePolygon.tempPolygon.length > 2) {
          if (Mouse.isCloseToFirstVertex()) {   // Close polygon // TODO: Move this to the CreatePolygon.ts
            // Force snap to first vertex
            let newPolygon = new Polygon(CreatePolygon.tempPolygon.map(v => ({ x: v.x, y: v.y })));
            
            selectedTool = Tool.NONE;
            
            polygonsList.push(newPolygon);
            newPolygon.setAsSelectePolygon();
            
            // Add the creation action to history
            const action = new CreatePolygonAction(newPolygon);
            HistoryManager.getInstance().addAction(action);

            // Update UI button
            SidePanel.updateActiveButton();
            
            CreatePolygon.tempPolygon = [];
            return;
          }
        }
        CreatePolygon.tempPolygon.push(Mouse.getMousePosForTransform());
      }
      else if (selectedTool == Tool.TRANSLATE) {
        if (selectedCentroid || selectedVertex) {
          if (Transform.isClickingTransformHandleX()) {
            Mouse.translateInitialX = Mouse.getMousePosForTransform().x;
            Transform.isDraggingX = true;
            return;
          }
          else if (Transform.isClickingTransformHandleY()) {
            Mouse.translateInitialY = Mouse.getMousePosForTransform().y;
            Transform.isDraggingY = true;
            return;
          }
          else {
            Mouse.selectPolygonUnderMouse();
          }
        }
        if (!selectNearestVertex()) {
          Mouse.selectPolygonUnderMouse();
        }
  
      }
      else if (selectedTool == Tool.SCALE) {
        const handle = Scale.getClickedHandle();
  
        if (handle && (selectedVertex || selectedCentroid)) {
          Scale.startScaling(handle);
          return;
        }

        if (!selectNearestVertex()) {
          Mouse.selectPolygonUnderMouse();
        }
      }
      else if (selectedTool == Tool.ROTATE) {
        if (Rotate.isClickingRotationHandle()) {
          Rotate.startRotation();
          return;
        }

        if (selectNearestVertex()) {
          Rotate.loadPolygonRotation();
          return;
        }

        Mouse.selectPolygonUnderMouse();
      }
      else if (selectedTool == Tool.BEZIER) {
        let controlPoint = Curves.isNearControlPoint(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y);
        
        if (controlPoint) {
          // Start dragging this control point
          Mouse.selectedControlPoint = controlPoint;
          Mouse.isDraggingControlPoint = true;
          cursor(HAND);
        } 
        else {
          // Not clicking on a control point, create a new curve
          if (selectedTool == Tool.BEZIER) {
            Curves.createBezierCurve();
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

    Scale.endScaling();

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
      Scale.processScaling();
    }
    else if (Rotate.isDragging) { // TODO: Move this logic to Rotate.ts
      // Get current angle between mouse and center
      let center = selectedVertex || selectedCentroid;
      if (!center || !selectedPolygon) return;
      
      let dx = Mouse.mousePosInGrid.x - center.x;
      let dy = Mouse.mousePosInGrid.y - center.y;
      let currentAngle = atan2(dy, dx);
      
      // Calculate angle difference
      let angleDifference = currentAngle - Rotate.initialClickAngle;
      
      // Snapping


      if (Keyboard.isShiftPressed) {
        // Convert to degrees, round, convert back to radians
        let angleDegrees = degrees(angleDifference);
        angleDegrees = Math.round(angleDegrees);
        angleDifference = radians(angleDegrees);
      }
      else {
        // Convert to degrees, round to nearest multiple, convert back to radians
        let angleDegrees = degrees(angleDifference);
        angleDegrees = Math.round(angleDegrees / Rotate.snapAngleDegrees) * Rotate.snapAngleDegrees;
        angleDifference = radians(angleDegrees);
      }
      
      let newAngle = Rotate.rotationStartAngle + angleDifference;
      
      // Apply rotation
      selectedPolygon.setRotationInRadians(newAngle);
    }
    if (Mouse.isDraggingControlPoint && Mouse.selectedControlPoint) {
      // Update pos of dragged control point
      Mouse.selectedControlPoint.x = Mouse.getMousePosForTransform().x;
      Mouse.selectedControlPoint.y = Mouse.getMousePosForTransform().y;
    
      Curves.updateCurveForDraggedPoint();
    }
  }
  
  static mouseWheel(event: any) {
    let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
    let newScale = Camera.currentScaleFactor * zoomFactor;
  
    // Zoom limit
    if (newScale < Camera.minScaleFactor) {
      zoomFactor = (Camera.minScaleFactor / Camera.currentScaleFactor);
    } else if (newScale > Camera.maxScaleFactor) {
      zoomFactor = (Camera.maxScaleFactor / Camera.currentScaleFactor);
    }
  
    newScale = Camera.currentScaleFactor * zoomFactor;
  
    let centerX = (width / 2);
    let centerY = (height / 2);
  
    Mouse.panX = (centerX - (centerX - Mouse.panX) * zoomFactor);
    Mouse.panY = (centerY - (centerY - Mouse.panY) * zoomFactor);
  
    Camera.currentScaleFactor = newScale;
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
      (mouseX - Mouse.panX) / (Grid.gridSize * Camera.currentScaleFactor) * Grid.gridSize,
      (mouseY - Mouse.panY) / (Grid.gridSize * Camera.currentScaleFactor) * Grid.gridSize,
    );
  }
  
  private static getMousePosInGridSnapped() {
    return createVector(
      Math.round((mouseX - Mouse.panX) / (Grid.gridSize * Camera.currentScaleFactor)) * Grid.gridSize,
      Math.round((mouseY - Mouse.panY) / (Grid.gridSize * Camera.currentScaleFactor)) * Grid.gridSize
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

    // No polygon was clicked, deselect current vertex but keep selected polygon
    deselectVertex();
    return false;
  }

  static getMousePosForTransform(): Vertex {
    return Keyboard.isShiftPressed ? Mouse.mousePosInGrid : Mouse.mousePosInGridSnapped;
  }

  static isCloseToFirstVertex(): boolean {
    if (CreatePolygon.tempPolygon.length < 3) return false;
    
    const firstVertex = CreatePolygon.tempPolygon[0];
    const mousePos = Mouse.getMousePosForTransform();
    
    const distance = dist(mousePos.x, mousePos.y, firstVertex.x, firstVertex.y);
    
    return distance < 3;
  }

  static checkVertexHover() {
    const hoverDistance = Polygon.normalVertexRadius / 2;
    
    for (let p of polygonsList) {
      for (let v of p.vertices) {
        let distanceToVertex = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, v.x, v.y);
        
        if (distanceToVertex < hoverDistance) {
          // Mouse is over vertex
          p.hoveredVertex = v;
          cursor(HAND);
          return;
        }
      }
      // Mouse not over any vertex of this polygon
      p.hoveredVertex = null;
    }
  }

  static checkCenterHover() {
    const hoverDistance = Polygon.normalVertexRadius / 2;
    
    for (let p of polygonsList) {
      let center = p.getCenter();
      let distanceToCenter = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, center.x, center.y);
      
      if (distanceToCenter < hoverDistance) {
        // Mouse is over center
        p.hoveredCenter = true;
        cursor(HAND);
      }
      else {
        p.hoveredCenter = false;
      }
    }
  }
}