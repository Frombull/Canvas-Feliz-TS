class Curves {
  // Control points for curves
  static bezierPoints: Vertex[] = [];
  static selectedControlPoint: Vertex | null = null;
  static isDraggingControlPoint: boolean = false;
  
  // Styling
  static controlPointRadius: number = 1.5;
  static curveResolution: number = 30;
  
  static reset() {
    Curves.bezierPoints = [];
    Curves.selectedControlPoint = null;
  }
  
  static createBezierCurve() {
    if (Curves.bezierPoints.length < 4) {
      // Add control point
      Curves.bezierPoints.push({
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      });
      
      if (Curves.bezierPoints.length == 4) {
        console.log("Curves.bezierPoints.length == 4");
        
        let curvePoints: Vertex[] = [];
        let p0 = Curves.bezierPoints[0];
        let p1 = Curves.bezierPoints[1];
        let p2 = Curves.bezierPoints[2];
        let p3 = Curves.bezierPoints[3];
        
        // Generate points along the curve
        for (let t = 0; t <= 1; t += 1 / Curves.curveResolution) {
          let x = Math.pow(1-t, 3) * p0.x + 
                  3 * Math.pow(1-t, 2) * t * p1.x + 
                  3 * (1-t) * Math.pow(t, 2) * p2.x + 
                  Math.pow(t, 3) * p3.x;
          
          let y = Math.pow(1-t, 3) * p0.y + 
                  3 * Math.pow(1-t, 2) * t * p1.y + 
                  3 * (1-t) * Math.pow(t, 2) * p2.y + 
                  Math.pow(t, 3) * p3.y;
          
          curvePoints.push({x, y});
        }
        
        // let newPolygon = new Polygon(curvePoints);
        // polygonsList.push(newPolygon);
        // newPolygon.setAsSelectePolygon();
      }
    }
  }

  static isNearControlPoint(x: number, y: number): Vertex | null {
    for (let point of Curves.bezierPoints) {
      if (dist(x, y, point.x, point.y) < 5) {
        return point;
      }
    }
    
    return null;
  }
}