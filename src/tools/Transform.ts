class Transform {
  static isDraggingX: boolean = false;
  static isDraggingY: boolean = false;
  static dx: number = 0;
  static dy: number = 0;


  static gizmoArrowLength: number = 18;
  static gizmoArrowWidth: number = 2;
  static gizmoArrowHeadSize: number = 2;
  static gizmoLineOffset: number = 1.5;
  static gizmoHitboxWidth: number = 6;


  static drawGizmoArrows(centerX: number, centerY: number) {
    push();
  
    // Draw X arrow
    stroke(colors.Red);
    strokeWeight(1.6);
    strokeCap(ROUND);
    line(centerX + Transform.gizmoLineOffset, centerY, centerX + Transform.gizmoArrowLength, centerY);    // ----
    strokeWeight(2);
    line(centerX + Transform.gizmoArrowLength, centerY, centerX + Transform.gizmoArrowLength - Transform.gizmoArrowHeadSize, centerY + Transform.gizmoArrowHeadSize); // \
    line(centerX + Transform.gizmoArrowLength, centerY, centerX + Transform.gizmoArrowLength - Transform.gizmoArrowHeadSize, centerY - Transform.gizmoArrowHeadSize); // /
    
    // Draw Y arrow
    stroke(colors.Blue);
    strokeWeight(1.6);
    strokeCap(ROUND);
    line(centerX, centerY + Transform.gizmoLineOffset, centerX, centerY + Transform.gizmoArrowLength);    // ----
    strokeWeight(2);
    line(centerX, centerY + Transform.gizmoArrowLength, centerX + Transform.gizmoArrowHeadSize, centerY + Transform.gizmoArrowLength - Transform.gizmoArrowHeadSize); // \
    line(centerX, centerY + Transform.gizmoArrowLength, centerX - Transform.gizmoArrowHeadSize, centerY + Transform.gizmoArrowLength - Transform.gizmoArrowHeadSize); // /
  
    // Draw coords next to transform gizmo arrows
    fill(0);
    stroke(colors.BackgroundColor);
    strokeWeight(0.5);
    textAlign(LEFT, CENTER);
    textSize(12/scaleFactor);
  
    // TODO: Esse código ta um pouco repetido em -> drawCoordinatesOnMouse()
    // Draw diferent if its a center instead of a vertex
    if(centerX % 5 == 0 && centerX % 5 == 0)
      text(`(${(centerX/5).toFixed(0)}, ${(centerY/5 *-1).toFixed(0)})`, centerX + 2, centerY + 2);
    else 
      text(`(${(centerX/5).toFixed(2)}, ${(centerY/5*-1).toFixed(2)})`, centerX + 2, centerY + 2);
    
    pop();
  }

  static translatePolygon() {
    if (!selectedPolygon) return;

    if (selectedCentroid) { // Move the entire polygon
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
      Transform.calculateDxDy();
  
      if(Transform.isDraggingX){
        selectedVertex.x += Transform.dx;
      }
      else if(Transform.isDraggingY){
        selectedVertex.y += Transform.dy;
      }
    }
  
    // Update the initial translation coordinates
    translateInitialX = Mouse.mousePosInGridSnapped.x;
    translateInitialY = Mouse.mousePosInGridSnapped.y;
  }

  static drawTransformGizmo() {
    if (!selectedPolygon) return;

    if (selectedCentroid) {
      selectedCentroid = selectedPolygon.getCenter();
      Transform.drawGizmoArrows(selectedCentroid.x, selectedCentroid.y);
    }
  else if (selectedVertex){
      Transform.drawGizmoArrows(selectedVertex.x, selectedVertex.y);
    }
  }

  static isClickingTransformHandleX() {
    let center = selectedVertex ? selectedVertex : selectedCentroid;
    
    if (!center) return false;
    
    debugVertexCenter = center;
    
    // The X hitbox should extend from the starting point of the line to the end of the arrow
    let hitboxX = center.x + Transform.gizmoLineOffset;
    let hitboxY = center.y;
    let hitboxWidth = Transform.gizmoArrowLength - Transform.gizmoLineOffset;
    let hitboxHeight = Transform.gizmoHitboxWidth;
    
    return (Mouse.mousePosInGrid.x >= hitboxX && 
            Mouse.mousePosInGrid.x <= hitboxX + hitboxWidth &&
            Mouse.mousePosInGrid.y >= hitboxY - hitboxHeight/2 && 
            Mouse.mousePosInGrid.y <= hitboxY + hitboxHeight/2);
  }
  
  static isClickingTransformHandleY() {
    let center = selectedVertex ? selectedVertex : selectedCentroid;
    
    if (!center) return false;
    
    debugVertexCenter = center;
    
    let hitboxX = center.x;
    let hitboxY = center.y + Transform.gizmoLineOffset;
    let hitboxWidth = Transform.gizmoHitboxWidth;
    let hitboxHeight = Transform.gizmoArrowLength - Transform.gizmoLineOffset;
    
    return (Mouse.mousePosInGrid.x >= hitboxX - hitboxWidth/2 && 
            Mouse.mousePosInGrid.x <= hitboxX + hitboxWidth/2 &&
            Mouse.mousePosInGrid.y >= hitboxY && 
            Mouse.mousePosInGrid.y <= hitboxY + hitboxHeight);
  }

  static calculateDxDy() {
    Transform.dx = Mouse.mousePosInGridSnapped.x - translateInitialX;
    Transform.dy = Mouse.mousePosInGridSnapped.y - translateInitialY;
  }
  
}