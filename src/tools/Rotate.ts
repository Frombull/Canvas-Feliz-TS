class Rotate {
  static isDragging: boolean = false;
  static rotationStartAngle: number = 0;
  static rotationCenter: Vertex | null = null;
  static rotationHandleLength: number = 30;
  static currentRotationDegrees: number = 0;
  
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
    ellipse(center.x, center.y, Rotate.rotationHandleLength * 2);
    
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
    text(Math.round(Rotate.currentRotationDegrees) + "°", handleX, handleY);
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
  
  static rotatePolygon(angle: number) {
    if (!selectedPolygon) return;
    
    // Use selected vertex if available, otherwise use polygon center
    let center = selectedVertex || selectedPolygon.getCenter();
    
    // Skip rotating pivot if its a vertex
    for (let vertex of selectedPolygon.vertices) {
      // Skip vertex if its the selected vertex (pivot)
      if (selectedVertex && vertex === selectedVertex) continue;
      
      // Translate point to origin
      let x = vertex.x - center.x;
      let y = vertex.y - center.y;
      
      // Rotate point
      let newX = x * cos(angle) - y * sin(angle);
      let newY = x * sin(angle) + y * cos(angle);
      
      // Translate point back
      vertex.x = newX + center.x;
      vertex.y = newY + center.y;
    }

    // Update current rotation degrees (convert radians to degrees)
    Rotate.currentRotationDegrees = (Rotate.currentRotationDegrees + angle * 180 / Math.PI) % 360;
  }
  
  static calculateRotationAngle(): number {
    if (!selectedPolygon) return 0;
    
    let center = selectedVertex || selectedPolygon.getCenter();
    
    // Calculate angle between center and mouse position
    let dx = Mouse.mousePosInGrid.x - center.x;
    let dy = Mouse.mousePosInGrid.y - center.y;
    let currentAngle = atan2(dy, dx);
    
    // Return difference from the starting angle
    return currentAngle - Rotate.rotationStartAngle;
  }

  static isClickingCenter(): boolean {
    if (!selectedPolygon) return false;

    let center = selectedPolygon.getCenter();
    let distanceToCenter = dist(Mouse.mousePosInGrid.x, Mouse.mousePosInGrid.y, center.x, center.y);
    
    return distanceToCenter < 3;
  }

  static resetAngle() {
    Rotate.rotationStartAngle = 0;
    Rotate.currentRotationDegrees = 0;
  }
}