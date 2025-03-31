class Transform {
  static isDraggingX: boolean = false;
  static isDraggingY: boolean = false;
  static dx: number = 0;
  static dy: number = 0;
  static isHoveringX: boolean = false;
  static isHoveringY: boolean = false;

  // Gizmo dimensions
  static gizmoArrowLength: number = 18;
  static gizmoLineOffset: number = 1.5;
  static gizmoHitboxWidth: number = 4;

  // Gizmo appearance
  static normalOpacity: number = 0.85;
  static hoverOpacity: number = 1.0;
  static normalStrokeWeight: number = 1.5;
  static hoverStrokeWeight: number = 1.7;
  static arrowHeadNormalSize: number = 2.0;
  static arrowHeadHoverSize: number = 2.4;


  static translatePolygon() {
    if (!selectedPolygon) return;
  
    // Save state before transformation
    const oldVertices = selectedPolygon.saveStateBeforeChange();
  
    if (selectedCentroid) { // Move the entire polygon
      // Use the modified calculation that considers shift key
      Transform.calculateDxDy();
      
      if(Transform.isDraggingX){
        for (let p of selectedPolygon.vertices) {
          p.x += Transform.dx;
        }
      }
      else if(Transform.isDraggingY){
        for (let p of selectedPolygon.vertices) {
          p.y += Transform.dy;
        }
      }
      
      selectedCentroid = selectedPolygon.getCenter(); // Update the centroid position
    } 
    
    else if (selectedVertex) { // Move only the selected vertex
      // Use the modified calculation that considers shift key
      Transform.calculateDxDy();
  
      if(Transform.isDraggingX){
        selectedVertex.x += Transform.dx;
      }
      else if(Transform.isDraggingY){
        selectedVertex.y += Transform.dy;
      }
    }
  
    // Update the initial translation coordinates
    Mouse.translateInitialX = Mouse.getMousePosForTransform().x;
    Mouse.translateInitialY = Mouse.getMousePosForTransform().y;
  
    selectedPolygon.recordAction(oldVertices);
  }

  static drawTransformGizmo() {
    if (!selectedPolygon) return;

    if (selectedCentroid) {
      selectedCentroid = selectedPolygon.getCenter();
      Transform.updateHoverState();
      Transform.drawGizmoArrows(selectedCentroid.x, selectedCentroid.y);
    }
    else if (selectedVertex) {
      Transform.updateHoverState();
      Transform.drawGizmoArrows(selectedVertex.x, selectedVertex.y);
    }
  }

  static updateHoverState() {
    Transform.isHoveringX = Transform.isClickingTransformHandleX();
    Transform.isHoveringY = Transform.isClickingTransformHandleY();
    
    if (Transform.isHoveringX || Transform.isHoveringY) {
      cursor(HAND);
    }
  }

  static isClickingTransformHandleX(): boolean {
    let center = selectedVertex ? selectedVertex : selectedCentroid;
    if (!center) return false;
    
    // The X hitbox should extend from the starting point of the line to the end of the arrow
    let hitboxX = center.x + Transform.gizmoLineOffset;
    let hitboxY = center.y;
    let hitboxWidth = Transform.gizmoArrowLength - Transform.gizmoLineOffset;
    let hitboxHeight = Transform.gizmoHitboxWidth;

    // this.drawHitboxX(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
    
    return (Mouse.mousePosInGrid.x >= hitboxX && 
            Mouse.mousePosInGrid.x <= hitboxX + hitboxWidth &&
            Mouse.mousePosInGrid.y >= hitboxY - hitboxHeight/2 && 
            Mouse.mousePosInGrid.y <= hitboxY + hitboxHeight/2);
  }
  
  static isClickingTransformHandleY(): boolean {
    let center = selectedVertex ? selectedVertex : selectedCentroid;
    if (!center) return false;
    
    let hitboxX = center.x;
    let hitboxY = center.y + Transform.gizmoLineOffset;
    let hitboxWidth = Transform.gizmoHitboxWidth;
    let hitboxHeight = Transform.gizmoArrowLength - Transform.gizmoLineOffset;

    // this.drawHitboxY(hitboxX, hitboxY, hitboxWidth, hitboxHeight);
    
    return (Mouse.mousePosInGrid.x >= hitboxX - hitboxWidth/2 && 
            Mouse.mousePosInGrid.x <= hitboxX + hitboxWidth/2 &&
            Mouse.mousePosInGrid.y >= hitboxY && 
            Mouse.mousePosInGrid.y <= hitboxY + hitboxHeight);
  }

  private static drawGizmoArrows(centerX: number, centerY: number) {
    push();
    
    // Draw X arrow with hover effect
    const xStrokeWeight = Transform.isHoveringX || Transform.isDraggingX ? 
                         Transform.hoverStrokeWeight : Transform.normalStrokeWeight;
    const xArrowHeadSize = Transform.isHoveringX || Transform.isDraggingX ? 
                          Transform.arrowHeadHoverSize : Transform.arrowHeadNormalSize;
                          
    // X-axis arrow
    stroke(Colors.Red);
    strokeWeight(xStrokeWeight);
    strokeCap(ROUND);
    
    // Draw X arrow shaft
    line(centerX + Transform.gizmoLineOffset, centerY, centerX + Transform.gizmoArrowLength, centerY);
    
    // X arrow head
    strokeWeight(xStrokeWeight * 1.1);
    line(centerX + Transform.gizmoArrowLength, centerY, 
         centerX + Transform.gizmoArrowLength - xArrowHeadSize, centerY + xArrowHeadSize);
    line(centerX + Transform.gizmoArrowLength, centerY, 
         centerX + Transform.gizmoArrowLength - xArrowHeadSize, centerY - xArrowHeadSize);
    
    // Draw "X" label
    noStroke();
    fill(Colors.Red);
    textSize(3);
    textAlign(CENTER, CENTER);
    text("X", centerX + Transform.gizmoArrowLength + 4, centerY);
    
    // Draw Y arrow with hover effect
    const yStrokeWeight = Transform.isHoveringY || Transform.isDraggingY ? 
                         Transform.hoverStrokeWeight : Transform.normalStrokeWeight;
    const yArrowHeadSize = Transform.isHoveringY || Transform.isDraggingY ? 
                          Transform.arrowHeadHoverSize : Transform.arrowHeadNormalSize;
    
    // Y-axis arrow
    stroke(Colors.Blue);
    strokeWeight(yStrokeWeight);
    strokeCap(ROUND);
    
    // Draw Y arrow shaft
    line(centerX, centerY + Transform.gizmoLineOffset, centerX, centerY + Transform.gizmoArrowLength);
    
    // Y arrow head
    strokeWeight(yStrokeWeight * 1.1);
    line(centerX, centerY + Transform.gizmoArrowLength, 
         centerX + yArrowHeadSize, centerY + Transform.gizmoArrowLength - yArrowHeadSize);
    line(centerX, centerY + Transform.gizmoArrowLength, 
         centerX - yArrowHeadSize, centerY + Transform.gizmoArrowLength - yArrowHeadSize);
    
    // Draw "Y" label
    noStroke();
    fill(Colors.Blue);
    textSize(3);
    textAlign(CENTER, CENTER);
    text("Y", centerX, centerY + Transform.gizmoArrowLength + 4);
    
    // Draw coordinates next to transform gizmo
    fill(0);
    stroke(Colors.BackgroundColor);
    strokeWeight(0.5);
    textAlign(LEFT, CENTER);
    textSize(12/Camera.currentScaleFactor);
  
    // Format coordinates
    if(centerX % 5 == 0 && centerY % 5 == 0)
      text(`(${(centerX/5).toFixed(0)}, ${(centerY/5 *-1).toFixed(0)})`, centerX + 2, centerY + 2);
    else 
      text(`(${(centerX/5).toFixed(2)}, ${(centerY/5*-1).toFixed(2)})`, centerX + 2, centerY + 2);
    
    pop();
  }

  static isVertexInPolygon(vertex: Vertex | null, polygon: Polygon | null): boolean {
    if (!vertex || !polygon) return false;
    
    return polygon.vertices.some(v => v === vertex);
  }

  static calculateDxDy() {
    const currentMousePos = Mouse.getMousePosForTransform();
    Transform.dx = currentMousePos.x - Mouse.translateInitialX;
    Transform.dy = currentMousePos.y - Mouse.translateInitialY;
  }

  static drawHitboxX(hitboxX: number, hitboxY: number, hitboxWidth: number, hitboxHeight: number) {
    push();
    noFill();
    stroke(250, 250, 0);
    strokeWeight(0.2);
    rect(hitboxX, hitboxY - (hitboxHeight/2), hitboxWidth, hitboxHeight)
    pop();
  }
  
  static drawHitboxY(hitboxX: number, hitboxY: number, hitboxWidth: number, hitboxHeight: number) {
    push();
    noFill();
    stroke(250, 250, 0);
    strokeWeight(0.2);
    rect(hitboxX - (hitboxWidth/2), hitboxY, hitboxWidth, hitboxHeight)
    pop();
  }
}