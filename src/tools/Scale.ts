class Scale {
  static isScalingX: boolean = false;
  static isScalingY: boolean = false;

  static gizmoScaleHandleSize: number = 6;
  static gizmoScaleDistance: number = 25;

  static isScaling: boolean = false;
  static scaleStartPos: { x: number | null; y: number | null } = { x: null, y: null };
  static scalePolygonOriginalForm: { x: number; y: number }[] = [];
  static currentScale = {x: 1, y: 1}


  static scalePolygon() {
    if (!Scale.scalePolygonOriginalForm) return;
    if (!selectedPolygon) return;
  
    if(Scale.isScalingX) {
      for (let i = 0; i < selectedPolygon.vertices.length; i++) {
        selectedPolygon.vertices[i].x = Scale.scalePolygonOriginalForm[i].x * Scale.currentScale.x;
      }
    } 
    else if (Scale.isScalingY) {
      for (let i = 0; i < selectedPolygon.vertices.length; i++) {
        selectedPolygon.vertices[i].y = Scale.scalePolygonOriginalForm[i].y * Scale.currentScale.y;
      }
    }
  }

  static setScaleTo(newX: number, newY: number) {
    if(!newX || !newY) return;
    if (!selectedPolygon) return;
  
    for (let i = 0; i < selectedPolygon.vertices.length; i++) {
      selectedPolygon.vertices[i].x = Scale.scalePolygonOriginalForm[i].x * newX;
      selectedPolygon.vertices[i].y = Scale.scalePolygonOriginalForm[i].y * newY;
    }
    Scale.currentScale = {x: newX, y: newY}
  }

  static drawScaleGizmo() {
    if(!selectedPolygon) return;

    let centerX = selectedPolygon.getCenter().x;
    let centerY = selectedPolygon.getCenter().y;
  
    if (centerX == null || centerY == null || selectedPolygon.vertices.length < 3) return;
  
    push();
    
    // Draw handle X
    let handleXRight = centerX + Scale.gizmoScaleDistance;
    let handleYRight = centerY;
      
    // Draw X-axis line
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    strokeCap(ROUND);
    line(centerX + 3, centerY, handleXRight, handleYRight);
      
    // Draw X-axis handle
    fill(Colors.GizmoScaleColor);
    noStroke();
    ellipse(handleXRight, handleYRight, Scale.gizmoScaleHandleSize, Scale.gizmoScaleHandleSize);
      
    // Draw handle Y
    let handleXUp = centerX;
    let handleYUp = centerY - Scale.gizmoScaleDistance; // -Y up
      
    // Draw Y-axis line
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    line(centerX, centerY - 3, handleXUp, handleYUp);
      
    // Draw Y-axis handle
    fill(Colors.GizmoScaleColor);
    noStroke();
    ellipse(handleXUp, handleYUp, Scale.gizmoScaleHandleSize, Scale.gizmoScaleHandleSize);
      
    pop();
  }
  
  static isClickingScaleHandle() {
    if(!selectedPolygon) return;
    let center = selectedPolygon.getCenter();
  
    if (!center) return;
  
    // Handle going right (X-axis)
    let handle1X = center.x + Scale.gizmoScaleDistance;
    let handle1Y = center.y;
    
    // Handle going up (Y-axis)
    let handle2X = center.x;
    let handle2Y = center.y - Scale.gizmoScaleDistance; // Subtract because Y is inverted in p5.js
    
    // Check if mouse is near either handle
    let d1 = dist(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y, handle1X, handle1Y);
    let d2 = dist(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y, handle2X, handle2Y);
    
    if (d1 < Scale.gizmoScaleHandleSize) {
      console.log("Click X-axis handle");
      return 1; // X-axis handle
    }
    if (d2 < Scale.gizmoScaleHandleSize) {
      console.log("Click Y-axis handle");
      return 2; // Y-axis handle
    }
    
    return 0; // Not clicking any handle
  }
}