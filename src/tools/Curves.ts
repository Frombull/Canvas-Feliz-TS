class Curves {
  // Control points for curves
  static bezierPoints: Vertex[] = [];
  static selectedControlPoint: Vertex | null = null;
  static isDraggingControlPoint: boolean = false;
  static animationProgress: number = 0;
  static isAnimating: boolean = false;
  static animationSpeed: number = 0.01; 
  static interpolationPoints: Vertex[] = [];
  
  // Styling
  static controlPointRadius: number = 1.5;
  static curveResolution: number = 24;
  
  static reset() {
    Curves.bezierPoints = [];
    Curves.selectedControlPoint = null;
  }
  
  static createBezierCurve() {
    if (Curves.bezierPoints.length < 4) {
      Curves.bezierPoints.push({
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      });
      
      if (Curves.bezierPoints.length == 4) {
        console.log("Curves.bezierPoints.length == 4");
        Curves.startAnimation(); // Inicia a animação quando o quarto ponto é adicionado
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

  static startAnimation() {
    Curves.animationProgress = 0;
    Curves.isAnimating = true;
    Curves.interpolationPoints = [];
  }

  static updateAnimation() {
    if (!Curves.isAnimating) return;
    
    Curves.animationProgress += Curves.animationSpeed;
    
    if (Curves.animationProgress >= 1) {
      Curves.animationProgress = 1;
      Curves.isAnimating = false;
    }
  }

  static calculateInterpolationPoints(t: number) {
    if (Curves.bezierPoints.length !== 4) return [];
    
    let p0 = Curves.bezierPoints[0];
    let p1 = Curves.bezierPoints[1];
    let p2 = Curves.bezierPoints[2];
    let p3 = Curves.bezierPoints[3];
    
    // Pontos de interpolação linear (primeiro nível)
    let p01 = {
      x: (1-t) * p0.x + t * p1.x,
      y: (1-t) * p0.y + t * p1.y
    };
    
    let p12 = {
      x: (1-t) * p1.x + t * p2.x,
      y: (1-t) * p1.y + t * p2.y
    };
    
    let p23 = {
      x: (1-t) * p2.x + t * p3.x,
      y: (1-t) * p2.y + t * p3.y
    };
    
    // Pontos de interpolação quadrática (segundo nível)
    let p012 = {
      x: (1-t) * p01.x + t * p12.x,
      y: (1-t) * p01.y + t * p12.y
    };
    
    let p123 = {
      x: (1-t) * p12.x + t * p23.x,
      y: (1-t) * p12.y + t * p23.y
    };
    
    // Ponto final da curva (terceiro nível)
    let p0123 = {
      x: (1-t) * p012.x + t * p123.x,
      y: (1-t) * p012.y + t * p123.y
    };
    
    return [p01, p12, p23, p012, p123, p0123];
  }
}