class Rotate {
  private static rotationHandleLength: number = 30;

  static isDragging: boolean = false;
  static rotationStartAngle: number = 0;
  static rotationCenter: Vertex | null = null;
  static initialClickAngle: number = 0;


  static drawRotationGizmo() {
    if (!selectedPolygon) return;

    // Use selected vertex if available, otherwise use polygon center
    let center = selectedVertex || selectedPolygon.getCenter();
    
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
    let handleX = center.x + cos(Rotate.rotationStartAngle) * Rotate.rotationHandleLength;
    let handleY = center.y + sin(Rotate.rotationStartAngle) * Rotate.rotationHandleLength;
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
    
    let center = selectedVertex || selectedPolygon.getCenter();
    let handleX = center.x + cos(Rotate.rotationStartAngle) * Rotate.rotationHandleLength;
    let handleY = center.y + sin(Rotate.rotationStartAngle) * Rotate.rotationHandleLength;
    
    let distanceToHandle = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, handleX, handleY);
    
    return distanceToHandle < 4;
  }
  
  static calculateRotationAngleInRadians(): number {
    if (!selectedPolygon) return 0;
    
    let center = selectedVertex || selectedPolygon.getCenter();
    
    // Angle between center and mouse pos
    let dx = Mouse.mousePosInGrid.x - center.x;
    let dy = Mouse.mousePosInGrid.y - center.y;
    let currentAngle = atan2(dy, dx);
    
    return (currentAngle - Rotate.initialClickAngle); // Radians
  }

  static resetRotationGizmo() {
    Rotate.isDragging = false;
    Rotate.rotationStartAngle = 0;
    Rotate.initialClickAngle = 0;
  }

  static loadPolygonRotation() {
    if (!selectedPolygon) return;

    Rotate.rotationStartAngle = selectedPolygon.getRotationInRadians();
    console.log(`Loaded rotation angle: ${Rotate.rotationStartAngle} rad`);
  }

  static startRotation() {
    if (!selectedPolygon) return;
    
    Rotate.isDragging = true;
    
    let center = selectedVertex || selectedPolygon.getCenter();
    let dx = Mouse.mousePosInGrid.x - center.x;
    let dy = Mouse.mousePosInGrid.y - center.y;
    Rotate.initialClickAngle = atan2(dy, dx);
    Rotate.rotationCenter = center;
    
    // Not modifying rotationStartAngle here to prevent handle snapping
  }
}