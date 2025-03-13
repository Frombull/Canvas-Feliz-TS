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
    }
  
    if (mouseButton === LEFT) {
      if (selectedTool == Tool.CREATE_POLYGON) { 
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
          else { // Clicked out in the canvas, deselect current vertex
            selectedCentroid = null;
            selectedVertex = null;
            selectedPolygon = null;
            console.log("Deselected.");
            
          }
        }
  
        selectNearestVertex();
      }
      else if (selectedTool == Tool.SCALE) {
        if (!selectedPolygon) return;
        let selectedAxis = Scale.isClickingScaleHandle();
        if (selectedAxis) {
          Scale.isScaling = true;
          Scale.scaleStartPos = Mouse.mousePosInGrid;
          Scale.scalePolygonOriginalForm = selectedPolygon.vertices.map(p => ({x: p.x, y: p.y})); // Deep copy..?
          console.log("Saving current form for scale");
  
          if (selectedAxis == 1)
            Scale.isScalingX = true;
          else if (selectedAxis == 2)
            Scale.isScalingY = true;
  
        }
      }
      else if (selectedTool == Tool.ROTATE) {
        if (!selectedPolygon) return;
        if (Rotate.isClickingRotationHandle()) {
          Rotate.isDragging = true;
          
          let center = selectedVertex || selectedPolygon.getCenter();
          let dx = Mouse.mousePosInGrid.x - center.x;
          let dy = Mouse.mousePosInGrid.y - center.y;
          Rotate.rotationStartAngle = atan2(dy, dx);
          Rotate.rotationCenter = center;
        } else {
          if (Rotate.isClickingCenter()) {
            // Select the center as rotation point by clearing selectedVertex
            selectedVertex = null;
            Rotate.resetAngle();
            return;
          }

          let previousVertex = selectedVertex;

          selectNearestVertex();

          if (previousVertex !== selectedVertex) {
            Rotate.resetAngle();
          }
        }
      }
      else if (selectedTool == Tool.BEZIER || selectedTool == Tool.HERMITE) {
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
          } else {
            Curves.createHermiteCurve();
            console.log("createHermiteCurve()");
          }
        }
      }
      else {
        Camera.startPanning();
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
    return (
      (mouseY > height || mouseY < 0 || mouseX > width || mouseX < 0)
      ||
      (mouseX >= windowWidth - SidePanel.controlPanelSize.x) // Control panel
    )
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
}