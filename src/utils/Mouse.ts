class Mouse {
  // Pan
  static panX: number;
  static panY: number;
  static isPanning: boolean = false;
  static lastMouseX: number;
  static lastMouseY: number;
  static mousePosInGrid: {x: any; y: any;};
  static mousePosInGridSnapped: {x: any; y: any;};
  static mousePosInCartesianPlane: {x: any; y: any;};

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
            //selectedPolygon.vertices = [...tempPolygon];
            Scale.currentScale = {x: 1, y: 1} // Create polygon with scale of 1
            
            selectedTool = Tool.NONE;   // TODO: VOLTAR A USAR A ULTIMA TOOL SELECIONADA
            SidePanel.updateButtonStyles(null);
  
            // Save last completed polygon for undo
            lastCompletePolygon = newPolygon.vertices.map(p => ({x: p.x, y: p.y}));


            // let newPolygon = new Polygon(tempPolygon);
            // polygonsList.push(newPolygon);
            polygonsList.push(newPolygon);

            selectedPolygon = newPolygon;
            
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
            translateInitialX = Mouse.mousePosInGridSnapped.x;
            Transform.isDraggingX = true;
            return;
          }
          else if (Transform.isClickingTransformHandleY()) {
            //console.log("Clicking Y handle");
            translateInitialY = Mouse.mousePosInGridSnapped.y;
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
  }
  
  static mouseWheel(event: any) {
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
  
    Mouse.panX = centerX - (centerX - Mouse.panX) * zoomFactor;
    Mouse.panY = centerY - (centerY - Mouse.panY) * zoomFactor;
  
    scaleFactor = newScale;
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
      (mouseX - Mouse.panX) / (Grid.gridSize * scaleFactor) * Grid.gridSize,
      (mouseY - Mouse.panY) / (Grid.gridSize * scaleFactor) * Grid.gridSize,
    );
  }
  
  private static getMousePosInGridSnapped() {
    return createVector(
      Math.round((mouseX - Mouse.panX) / (Grid.gridSize * scaleFactor)) * Grid.gridSize,
      Math.round((mouseY - Mouse.panY) / (Grid.gridSize * scaleFactor)) * Grid.gridSize
    );
  }
  
  private static getMousePosInCartesianPlane() {
    return createVector(
      Math.round(Mouse.mousePosInGridSnapped.x / Grid.gridSize),
      Math.round(-Mouse.mousePosInGridSnapped.y / Grid.gridSize) // Y grows down in p5js, but up in cartesian plane
    );
  }



}