class Curves {
  // Control points for the curves
  static bezierPoints: Vertex[] = [];
  static hermitePoints: Vertex[] = [];
  static hermiteTangent1: Vertex | null = null;
  static hermiteTangent2: Vertex | null = null;
  static selectedControlPoint: Vertex | null = null;
  static isDraggingControlPoint: boolean = false;
  
  // Styling
  static controlPointRadius: number = 2;
  static curveResolution: number = 42;                // Curve segments
  
  static reset() {
    Curves.bezierPoints = [];
    Curves.hermitePoints = [];
    Curves.hermiteTangent1 = null;
    Curves.hermiteTangent2 = null;
    Curves.selectedControlPoint = null;
  }
  
  static createBezierCurve() {
    if (Curves.bezierPoints.length < 4) {
      // Add new control point when clicked
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
        
        //// Create new polygon from curve points
        // let newPolygon = new Polygon(curvePoints);
        // polygonsList.push(newPolygon);
        // newPolygon.setAsSelectePolygon();
      }
    }
  }
  
  static createHermiteCurve() {
    // Add endpoints first
    if (Curves.hermitePoints.length < 2) {
      Curves.hermitePoints.push({
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      });
      return;
    }
    
    // Then add tangent points
    if (!Curves.hermiteTangent1) {
      Curves.hermiteTangent1 = {
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      };
      return;
    }
    
    if (!Curves.hermiteTangent2) {
      Curves.hermiteTangent2 = {
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      };
      
      // We now have all points needed, create the curve
      let curvePoints: Vertex[] = [];
      let p0 = Curves.hermitePoints[0];
      let p1 = Curves.hermitePoints[1];
      let m0 = { 
        x: Curves.hermiteTangent1!.x - p0.x, 
        y: Curves.hermiteTangent1!.y - p0.y 
      };
      let m1 = { 
        x: Curves.hermiteTangent2!.x - p1.x, 
        y: Curves.hermiteTangent2!.y - p1.y 
      };
      
      // Generate points along the curve
      for (let t = 0; t <= 1; t += 1/Curves.curveResolution) {
        let h00 = 2*Math.pow(t, 3) - 3*Math.pow(t, 2) + 1;
        let h10 = Math.pow(t, 3) - 2*Math.pow(t, 2) + t;
        let h01 = -2*Math.pow(t, 3) + 3*Math.pow(t, 2);
        let h11 = Math.pow(t, 3) - Math.pow(t, 2);
        
        let x = h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x;
        let y = h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y;
        
        curvePoints.push({x, y});
      }
      
      // Create new polygon from curve points
      let newPolygon = new Polygon(curvePoints);
      polygonsList.push(newPolygon);
      newPolygon.setAsSelectePolygon();
      
      // Reset hermite points for next curve
      Curves.hermitePoints = [];
      Curves.hermiteTangent1 = null;
      Curves.hermiteTangent2 = null;
    }
  }
  
  static drawBezierControls() {
    push();
    // Draw control points
    for (let i = 0; i < Curves.bezierPoints.length; i++) {
      let p = Curves.bezierPoints[i];
      
      // Draw control point
      fill(Colors.controlPointColor);
      noStroke();
      ellipse(p.x, p.y, Curves.controlPointRadius * 2);
      
      // Draw text label
      fill(0);
      stroke(Colors.BackgroundColor);
      strokeWeight(0.5);
      textAlign(LEFT, CENTER);
      textSize(12/Camera.scaleFactor);
      text(`P${i}`, p.x + 5, p.y);
    }
    
    // Draw connecting lines between control points
    if (Curves.bezierPoints.length > 1) {
      strokeCap(ROUND);
      strokeWeight(0.5);
      stroke(Colors.Gray);
      noFill();
      beginShape();
      for (let p of Curves.bezierPoints) {
        vertex(p.x, p.y);
      }
      endShape();
    }
    
    // Draw preview of Bezier curve
    if (Curves.bezierPoints.length === 4) {
      let p0 = Curves.bezierPoints[0];
      let p1 = Curves.bezierPoints[1];
      let p2 = Curves.bezierPoints[2];
      let p3 = Curves.bezierPoints[3];
      
      strokeWeight(1.5);
      stroke(Colors.bezierColor);
      noFill();
      beginShape();
      
      for (let t = 0; t <= 1; t += 1/Curves.curveResolution) {
        let x = Math.pow(1-t, 3) * p0.x + 
                3 * Math.pow(1-t, 2) * t * p1.x + 
                3 * (1-t) * Math.pow(t, 2) * p2.x + 
                Math.pow(t, 3) * p3.x;
        
        let y = Math.pow(1-t, 3) * p0.y + 
                3 * Math.pow(1-t, 2) * t * p1.y + 
                3 * (1-t) * Math.pow(t, 2) * p2.y + 
                Math.pow(t, 3) * p3.y;
        
        vertex(x, y);
      }
      
      endShape();
    }
    
    // Draw coordinates text
    drawCoordinatesOnMouse();
    pop();
  }
  
  static drawHermiteControls() {
    push();
    // Draw endpoint control points
    for (let i = 0; i < Curves.hermitePoints.length; i++) {
      let p = Curves.hermitePoints[i];
      
      // Draw control point
      fill(Colors.controlPointColor);
      noStroke();
      ellipse(p.x, p.y, Curves.controlPointRadius * 2);
      
      // Draw text label
      fill(0);
      stroke(Colors.BackgroundColor);
      strokeWeight(0.5);
      textAlign(LEFT, CENTER);
      textSize(12/Camera.scaleFactor);
      text(`P${i}`, p.x + 5, p.y);
    }
    
    // Draw tangent points and lines
    if (Curves.hermitePoints.length > 0 && Curves.hermiteTangent1) {
      stroke(Colors.tangentColor);
      strokeWeight(0.5);
      line(Curves.hermitePoints[0].x, Curves.hermitePoints[0].y, 
           Curves.hermiteTangent1.x, Curves.hermiteTangent1.y);
      
      // Draw tangent control point
      fill(Colors.tangentColor);
      noStroke();
      ellipse(Curves.hermiteTangent1.x, Curves.hermiteTangent1.y, Curves.controlPointRadius * 1.5);
      
      // Draw text label
      fill(0);
      stroke(Colors.BackgroundColor);
      strokeWeight(0.5);
      textAlign(LEFT, CENTER);
      textSize(12/Camera.scaleFactor);
      text(`T0`, Curves.hermiteTangent1.x + 5, Curves.hermiteTangent1.y);
    }
    
    if (Curves.hermitePoints.length > 1 && Curves.hermiteTangent2) {
      stroke(Colors.tangentColor);
      strokeWeight(0.5);
      line(Curves.hermitePoints[1].x, Curves.hermitePoints[1].y, 
           Curves.hermiteTangent2.x, Curves.hermiteTangent2.y);
      
      // Draw tangent control point
      fill(Colors.tangentColor);
      noStroke();
      ellipse(Curves.hermiteTangent2.x, Curves.hermiteTangent2.y, Curves.controlPointRadius * 1.5);
      
      // Draw text label
      fill(0);
      stroke(Colors.BackgroundColor);
      strokeWeight(0.5);
      textAlign(LEFT, CENTER);
      textSize(12/Camera.scaleFactor);
      text(`T1`, Curves.hermiteTangent2.x + 5, Curves.hermiteTangent2.y);
    }
    
    // Draw connecting line between endpoints
    if (Curves.hermitePoints.length > 1) {
      strokeWeight(0.5);
      stroke(150);
      line(Curves.hermitePoints[0].x, Curves.hermitePoints[0].y,
           Curves.hermitePoints[1].x, Curves.hermitePoints[1].y);
    }
    
    // Draw preview of Hermite curve if all points are set
    if (Curves.hermitePoints.length === 2 && Curves.hermiteTangent1 && Curves.hermiteTangent2) {
      let p0 = Curves.hermitePoints[0];
      let p1 = Curves.hermitePoints[1];
      let m0 = { 
        x: Curves.hermiteTangent1.x - p0.x, 
        y: Curves.hermiteTangent1.y - p0.y 
      };
      let m1 = { 
        x: Curves.hermiteTangent2.x - p1.x, 
        y: Curves.hermiteTangent2.y - p1.y 
      };
      
      strokeWeight(1.5);
      stroke(Colors.hermiteColor);
      noFill();
      beginShape();
      
      for (let t = 0; t <= 1; t += 1/Curves.curveResolution) {
        let h00 = 2*Math.pow(t, 3) - 3*Math.pow(t, 2) + 1;
        let h10 = Math.pow(t, 3) - 2*Math.pow(t, 2) + t;
        let h01 = -2*Math.pow(t, 3) + 3*Math.pow(t, 2);
        let h11 = Math.pow(t, 3) - Math.pow(t, 2);
        
        let x = h00 * p0.x + h10 * m0.x + h01 * p1.x + h11 * m1.x;
        let y = h00 * p0.y + h10 * m0.y + h01 * p1.y + h11 * m1.y;
        
        vertex(x, y);
      }
      
      endShape();
    }
    
    // Draw coordinates text
    drawCoordinatesOnMouse();
    pop();
  }

  static isNearControlPoint(x: number, y: number): Vertex | null {
    // Check Bezier control points
    for (let point of Curves.bezierPoints) {
      if (dist(x, y, point.x, point.y) < 5) {
        return point;
      }
    }
    
    // Check Hermite points
    for (let point of Curves.hermitePoints) {
      if (dist(x, y, point.x, point.y) < 5) {
        return point;
      }
    }
    
    // Check Hermite tangent points
    if (Curves.hermiteTangent1 && dist(x, y, Curves.hermiteTangent1.x, Curves.hermiteTangent1.y) < 5) {
      return Curves.hermiteTangent1;
    }
    
    if (Curves.hermiteTangent2 && dist(x, y, Curves.hermiteTangent2.x, Curves.hermiteTangent2.y) < 5) {
      return Curves.hermiteTangent2;
    }
    
    return null;
  }
}