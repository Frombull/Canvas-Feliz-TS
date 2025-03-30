class Rotate {
  private static rotationHandleLength: number = 30;

  static isDragging: boolean = false;
  static rotationStartAngle: number = 0;
  static initialClickAngle: number = 0;
  static snapAngleDegrees: number = 15; // Snap angle for rotation tool


  static drawRotationGizmo() {
    if (!selectedPolygon) return;

    // Use selected vertex if available, otherwise use polygon center
    let center = selectedVertex || selectedCentroid;
    if (!center) return;
    
    // Draw rotation handle
    push();
    stroke(Colors.rotationHandleColor);
    strokeWeight(0.5);
    noFill();
    
    // Draw circle
    drawingContext.setLineDash([2, 2]);
    ellipse(center.x, center.y, Rotate.rotationHandleLength * 2);
    drawingContext.setLineDash([]);

    // Draw handle
    let handleX = center.x + cos(selectedPolygon.getRotationInRadians()) * Rotate.rotationHandleLength;
    let handleY = center.y + sin(selectedPolygon.getRotationInRadians()) * Rotate.rotationHandleLength;
    line(center.x, center.y, handleX, handleY);
    
    // Draw handle grip
    fill(Colors.rotationHandleColor);
    ellipse(handleX, handleY, 4);
    
    // Draw degree text
    fill(0);
    stroke(0);
    strokeWeight(0.1);
    textSize(2);
    textAlign(CENTER, CENTER);
    text(Math.round(selectedPolygon.getRotationInDegrees()) + "°", handleX, handleY);
    pop();
  }
  
  static isClickingRotationHandle(): boolean {
    if (!selectedPolygon) return false;
    
    let center = selectedVertex || selectedCentroid;
    if (!center)
      center = selectedPolygon.getCenter();
  
    let handleX = center.x + cos(selectedPolygon.getRotationInRadians()) * Rotate.rotationHandleLength;
    let handleY = center.y + sin(selectedPolygon.getRotationInRadians()) * Rotate.rotationHandleLength;
    
    let distanceToHandle = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, handleX, handleY);
    
    return distanceToHandle < 3;
  }

  static resetRotationGizmo() {
    Rotate.isDragging = false;
    Rotate.rotationStartAngle = 0;
    Rotate.initialClickAngle = 0;
  }

  static loadPolygonRotation() {
    if (!selectedPolygon) return;

    Rotate.rotationStartAngle = selectedPolygon.getRotationInRadians();
  }

  static startRotation() {
    if (!selectedPolygon) return;
    
    Rotate.isDragging = true;
    
    // Calculate initial angle between mouse and center
    let center = selectedVertex || selectedCentroid;
    if (!center) return;

    let dx = Mouse.mousePosInGrid.x - center.x;
    let dy = Mouse.mousePosInGrid.y - center.y;
    Rotate.initialClickAngle = atan2(dy, dx);
    
    // Store current rotation angle
    Rotate.rotationStartAngle = selectedPolygon.getRotationInRadians();

    // Not modifying rotationStartAngle here to prevent handle snapping
  }
}