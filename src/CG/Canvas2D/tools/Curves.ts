class Curves {
  static bezierPoints: Vertex[] = [];
  static selectedControlPoint: Vertex | null = null;
  static isDraggingControlPoint: boolean = false;
  static animationProgress: number = 0; // t
  static isAnimating: boolean = false;
  static animationSpeed: number = 0.003; 
  static interpolationPoints: Vertex[] = [];
  static bezierType: BezierType = BezierType.CUBIC;
  static loopAnimation: boolean = true;
  
  // Styling
  static controlPointRadius: number = 1.5;
  static curveResolution: number = 24;
  
  static reset() {
    Curves.bezierPoints = [];
    Curves.selectedControlPoint = null;
    Curves.interpolationPoints = [];
    Curves.animationProgress = 0;
    Curves.isAnimating = false;
  }
  
  static createBezierCurve() {
    const maxPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
    
    if (Curves.bezierPoints.length < maxPoints) {
      Curves.bezierPoints.push({
        x: Mouse.mousePosInGridSnapped.x,
        y: Mouse.mousePosInGridSnapped.y
      });
      
      if (Curves.bezierPoints.length === maxPoints) {
        console.log(`Bezier points complete: ${Curves.bezierPoints.length} points`);
        Curves.startAnimation();
      }
    }
  }

  static isNearControlPoint(x: number, y: number): Vertex | null {
    const maxPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
    
    if (Curves.bezierPoints.length < maxPoints) {
      return null;
    }

    for (let point of Curves.bezierPoints) {
      if (dist(x, y, point.x, point.y) < 5) {
        cursor(HAND);
        return point;
      }
    }
    
    return null;
  }

  static setAnimating(isAnimating: boolean) {
    Curves.isAnimating = isAnimating;
    
    // Update UI based on animation state 
    const curvesPanel = select('.curves-panel');
    if (curvesPanel) {
      if (isAnimating) {
        curvesPanel.addClass('animating');
      } else {
        curvesPanel.removeClass('animating');
      }
    }
    
    // Update button text
    const playPauseButton = select('.play-button');
    if (playPauseButton) {
      if (isAnimating) {
        playPauseButton.html('⏸ Pause');
      } else {
        playPauseButton.html('▶ Play');
      }
    }
  }

  static startAnimation() {
    Curves.animationProgress = 0;
    Curves.setAnimating(true);
    Curves.interpolationPoints = [];
  }

  static updateAnimation() {
    if (!Curves.isAnimating) return;
    
    Curves.animationProgress += Curves.animationSpeed;
  
    // Update time slider UI
    CurvesUI.updateAnimationTimeSlider();
    
    // If finished animating
    if (Curves.animationProgress >= 1) {
      if (Curves.loopAnimation) {
        Curves.animationProgress = 0;
        Curves.interpolationPoints = [];
      } 
      else {
        Curves.animationProgress = 1;
        Curves.setAnimating(false);
      }
    }
  }

  static calculateInterpolationPoints(t: number) {
    const pointsCount = Curves.bezierPoints.length;
    
    if (Curves.bezierType === BezierType.QUADRATIC && pointsCount === 3) {
      return Curves.calculateQuadraticInterpolationPoints(t);
    } else if (Curves.bezierType === BezierType.CUBIC && pointsCount === 4) {
      return Curves.calculateCubicInterpolationPoints(t);
    }
    
    return [];
  }
  
  static calculateQuadraticInterpolationPoints(t: number) {
    if (Curves.bezierPoints.length !== 3) return [];
    
    let p0 = Curves.bezierPoints[0];
    let p1 = Curves.bezierPoints[1];
    let p2 = Curves.bezierPoints[2];
    
    // Pontos de interpolação linear (primeiro nível)
    let p01 = {
      x: (1-t) * p0.x + t * p1.x,
      y: (1-t) * p0.y + t * p1.y
    };
    
    let p12 = {
      x: (1-t) * p1.x + t * p2.x,
      y: (1-t) * p1.y + t * p2.y
    };
    
    // Ponto final da curva (segundo nível)
    let p012 = {
      x: (1-t) * p01.x + t * p12.x,
      y: (1-t) * p01.y + t * p12.y
    };
    
    return [p01, p12, p012];
  }
  
  static calculateCubicInterpolationPoints(t: number) {
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
  
  static drawBezierCurve() {
    if (Curves.bezierType === BezierType.QUADRATIC && Curves.bezierPoints.length === 3) {
      Curves.drawQuadraticBezier();
    } 
    else if (Curves.bezierType === BezierType.CUBIC && Curves.bezierPoints.length === 4) {
      Curves.drawCubicBezier();
    }
  }
  
  static drawQuadraticBezier() {
    let p0 = Curves.bezierPoints[0];
    let p1 = Curves.bezierPoints[1];
    let p2 = Curves.bezierPoints[2];
    
    strokeWeight(1.5);
    stroke(Colors.bezierLineColor);
    noFill();
    beginShape();
    
    for (let t = 0; t <= 1; t += 1/Curves.curveResolution) {
      let x = Math.pow(1-t, 2) * p0.x + 
              2 * (1-t) * t * p1.x + 
              Math.pow(t, 2) * p2.x;
      
      let y = Math.pow(1-t, 2) * p0.y + 
              2 * (1-t) * t * p1.y + 
              Math.pow(t, 2) * p2.y;
      
      vertex(x, y);
    }
    
    endShape();
  }
  
  static drawCubicBezier() {
    let p0 = Curves.bezierPoints[0];
    let p1 = Curves.bezierPoints[1];
    let p2 = Curves.bezierPoints[2];
    let p3 = Curves.bezierPoints[3];
    
    strokeWeight(1.5);
    stroke(Colors.bezierLineColor);
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

  static updateCurveForDraggedPoint() {
    if (!Mouse.isDraggingControlPoint || !Mouse.selectedControlPoint) return;
    
    // If animating
    if (Curves.interpolationPoints.length > 0) {
      // Save current progress
      const currentProgress = Curves.animationProgress;
      
      Curves.interpolationPoints = [];
      
      if (currentProgress > 0) {
        const step = 0.01;
        for (let t = 0; t <= currentProgress; t += step) {
          const interpPoints = Curves.calculateInterpolationPoints(t);
          if (interpPoints.length === 0) continue;
          
          const finalPoint = interpPoints[interpPoints.length - 1];
          
          if (Curves.interpolationPoints.length === 0 || 
              dist(finalPoint.x, finalPoint.y, 
                  Curves.interpolationPoints[Curves.interpolationPoints.length-1].x, 
                  Curves.interpolationPoints[Curves.interpolationPoints.length-1].y) > 0.1) {
            Curves.interpolationPoints.push(finalPoint);
          }
        }
      }
    }
  }
}
