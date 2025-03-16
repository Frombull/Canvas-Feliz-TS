class CurvesUI {
  static panelVisible: boolean = false;
  static curvesPanelDiv: any = null;
  static resolutionValueBox: any = null;
  static quadraticBezierButton: ToolButton;
  static cubicBezierButton: ToolButton;
  static animationSpeedSlider: any = null;
  static animationSpeedValueBox: any = null;
  static loopAnimationCheckbox: any = null;

  static shouldDrawFirstLevelLines: boolean = true;
  static shouldDrawSecondLevelLines: boolean = true;
  static shouldDrawBezierLine: boolean = true;

  // Colors
  private static blue = [30, 30, 250, 180];
  private static green = [50, 200, 100, 255];
  
  static createCurvesPanel() {
    if (CurvesUI.curvesPanelDiv) {
      CurvesUI.curvesPanelDiv.remove();
    }
  
    CurvesUI.curvesPanelDiv = createDiv('').class('control-panel curves-panel');
    CurvesUI.curvesPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
  
    let curvesSection = createDiv('').class('section').parent(CurvesUI.curvesPanelDiv);

    // Back button to return to main panel
    let backButton = createButton('« Back to Main Panel').class('button').parent(curvesSection);
    backButton.mouseReleased(() => {
      CurvesUI.toggleCurvesPanel(false);
      select('.control-panel')?.style('display', 'block');
    });
  
    createDiv('').class('section-title').html('Bezier Curves').parent(curvesSection);

    CurvesUI.quadraticBezierButton = new ToolButton('Quadratic Bezier [3]', Tool.BEZIER, curvesSection, () => {
      Curves.reset();
      Curves.bezierType = BezierType.QUADRATIC;
      CurvesUI.updateActiveButton();
    });
    
    CurvesUI.cubicBezierButton = new ToolButton('Cubic Bezier [4]', Tool.BEZIER, curvesSection, () => {
      Curves.reset();
      Curves.bezierType = BezierType.CUBIC;
      CurvesUI.updateActiveButton();
    });

    // // Curve resolution slider
    // let resolutionContainer = createDiv('').class('resolution-container').parent(curvesSection);
    // createDiv('Resolution:').parent(resolutionContainer);
    // 
    // let sliderValueContainer = createDiv('').class('slider-container').parent(resolutionContainer);
    // 
    // let resolutionSlider: any = createSlider(2, 42, Curves.curveResolution, 1).class('slider').parent(sliderValueContainer);
    // 
    // CurvesUI.resolutionValueBox = createDiv(Curves.curveResolution.toString()).class('colorpicker-value-box').parent(sliderValueContainer);
    // 
    // resolutionSlider.input(() => {
    //   Curves.curveResolution = Number(resolutionSlider.value());
    //   CurvesUI.resolutionValueBox.html(Curves.curveResolution.toString());
    // });
  
    // Animation speed
    let animationSpeedContainer = createDiv('').class('animation-speed-container').parent(curvesSection);
    createDiv('Animation Speed:').parent(animationSpeedContainer);
    
    let animationSliderContainer: any = createDiv('').class('slider-container').parent(animationSpeedContainer);
    
    let animationSpeedSlider: any = createSlider(0, 1, Curves.animationSpeed * 100, 0.1).class('slider').parent(animationSliderContainer);
    
    CurvesUI.animationSpeedValueBox = createDiv(`${Curves.animationSpeed*100}`).class('colorpicker-value-box').parent(animationSliderContainer);
    
    animationSpeedSlider.input(() => {
      Curves.animationSpeed = Number(animationSpeedSlider.value()) / 100;
      CurvesUI.animationSpeedValueBox.html(animationSpeedSlider.value().toString());
    });
    
    // Loop animation checkbox
    let loopContainer = createDiv('').class('loop-container').parent(curvesSection);
    CurvesUI.loopAnimationCheckbox = createCheckbox('Loop Animation', Curves.loopAnimation).parent(loopContainer);
    CurvesUI.loopAnimationCheckbox.changed(() => {
      Curves.loopAnimation = CurvesUI.loopAnimationCheckbox.checked();

      // Restart if animation already finished
      if (Curves.loopAnimation && !Curves.isAnimating && Curves.animationProgress >= 1) {
        Curves.startAnimation();
      }
    });
  
    // Restart animation button
    let resetAnimationButton = createButton('Restart Animation').class('button').parent(curvesSection);
    resetAnimationButton.mouseReleased(() => {
      const requiredPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
      if (Curves.bezierPoints.length === requiredPoints) {
        Curves.startAnimation();
      }
    });
  
    CurvesUI.curvesPanelDiv.style('display', 'none');
    CurvesUI.panelVisible = false;
  }

  static toggleCurvesPanel(show?: boolean) {
    if (show === undefined) {
      show = !CurvesUI.panelVisible;
    }

    if (show) {
      select('.control-panel:not(.curves-panel)')?.style('display', 'none');
      CurvesUI.curvesPanelDiv?.style('display', 'block');
      CurvesUI.panelVisible = true;
    } 
    else {
      CurvesUI.curvesPanelDiv?.style('display', 'none');
      CurvesUI.panelVisible = false;
    }
  }

  static updateActiveButton() {
    // Update button state based on the current bezier type
    if (Curves.bezierType === BezierType.QUADRATIC) {
      CurvesUI.quadraticBezierButton.setActive(true);
      CurvesUI.cubicBezierButton.setActive(false);
    } else {
      CurvesUI.quadraticBezierButton.setActive(false);
      CurvesUI.cubicBezierButton.setActive(true);
    }
  }

  static drawBezierControls() {
    push();

    // Connection lines
    if (Curves.bezierPoints.length > 1) {
      CurvesUI.drawConnectionLines();
    }
    
    const maxPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
    
    if (Curves.bezierPoints.length === maxPoints) {
      // Interpolation animation for cubic bezier
      if (Curves.bezierType === BezierType.CUBIC && Curves.bezierPoints.length === 4) {
        CurvesUI.drawCubicBezierAnimation();
      } 
      // Interpolation animation for quadratic bezier
      else if (Curves.bezierType === BezierType.QUADRATIC && Curves.bezierPoints.length === 3) {
        CurvesUI.drawQuadraticBezierAnimation();
      }
    }else {
      cursor(CROSS);
    }

    // Control points
    if(SidePanel.shouldDrawVertexBalls){
      CurvesUI.drawControlPoints();
    }
  
    // Draw circle at mouse position
    const maxPointsForCurrentType = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
    if(Curves.bezierPoints.length < maxPointsForCurrentType){
      drawCircleOnMouse(Colors.bezierControlPointColor);
      drawCoordinatesOnMouse();
    }
  
    pop();
  }
  
  static drawCubicBezierAnimation() {
    if (Curves.isAnimating || Curves.animationProgress > 0) {
      // Pontos de interpolação do progresso atual
      let t = Curves.animationProgress;
      let interpPoints = Curves.calculateInterpolationPoints(t);
      
      if (interpPoints.length >= 6) {
        let [p01, p12, p23, p012, p123, finalPoint] = interpPoints;
        
        // First level interpolation points
        fill(Colors.bezierControlPointColor);
        noStroke();
        ellipse(p01.x, p01.y, 2.5);
        CurvesUI.drawTextAtVertex(p01, "L0", -3, 0);
        
        fill(Colors.bezierControlPointColor);
        ellipse(p12.x, p12.y, 2.5);
        CurvesUI.drawTextAtVertex(p12, "L1", -3, 0);
        
        fill(Colors.bezierControlPointColor);
        ellipse(p23.x, p23.y, 2.5);
        CurvesUI.drawTextAtVertex(p23, "L2", -3, 0);

        
        // Second level lines
        stroke(CurvesUI.green);
        strokeWeight(0.5);
        line(p01.x, p01.y, p012.x, p012.y);
        line(p012.x, p012.y, p12.x, p12.y);
        
        stroke(CurvesUI.green);
        line(p12.x, p12.y, p123.x, p123.y);
        line(p123.x, p123.y, p23.x, p23.y);
        
        // Second level interpolation points
        fill(CurvesUI.blue);
        noStroke();
        ellipse(p012.x, p012.y, 2.5);
        
        fill(CurvesUI.blue);
        ellipse(p123.x, p123.y, 2.5);
        

        // Third level lines
        stroke(CurvesUI.blue);
        strokeWeight(0.5);
        line(p012.x, p012.y, finalPoint.x, finalPoint.y);
        line(finalPoint.x, finalPoint.y, p123.x, p123.y);
        
        // Add point to curve while animating
        if (Curves.interpolationPoints.length === 0 || 
            dist(finalPoint.x, finalPoint.y, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].x, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].y) > 0.1) {
          Curves.interpolationPoints.push(finalPoint);
        }
        
        // draw curve being drawn
        if (Curves.interpolationPoints.length > 1) {
          strokeWeight(1.5);
          stroke(Colors.bezierLineColor);
          noFill();
          beginShape();
          for (let p of Curves.interpolationPoints) {
            vertex(p.x, p.y);
          }
          endShape();
        }

        // Finish point
        fill(Colors.bezierLineColor);
        noStroke();
        strokeWeight(0.2);
        ellipse(finalPoint.x, finalPoint.y, 4);
        this.drawTextAtVertex(finalPoint, "F", 0, 0, 20);
      }
    } 
    else {
      Curves.drawCubicBezier();
    }
  }
  
  static drawQuadraticBezierAnimation() {
    if (Curves.isAnimating || Curves.animationProgress > 0) {
      // Pontos de interpolação do progresso atual
      let t = Curves.animationProgress;
      let interpPoints = Curves.calculateInterpolationPoints(t);
      
      if (interpPoints.length >= 3) {
        let [p01, p12, finalPoint] = interpPoints;
        
        // First level interpolation points
        fill(Colors.bezierControlPointColor);
        noStroke();
        ellipse(p01.x, p01.y, 2.5);
        CurvesUI.drawTextAtVertex(p01, "L0", -3, 0);
        
        fill(Colors.bezierControlPointColor);
        ellipse(p12.x, p12.y, 2.5);
        CurvesUI.drawTextAtVertex(p12, "L1", -3, 0);
        
        // Second level lines
        stroke(CurvesUI.green);
        strokeWeight(0.8);
        line(p01.x, p01.y, finalPoint.x, finalPoint.y);
        line(finalPoint.x, finalPoint.y, p12.x, p12.y);
        
        // Add point to curve while animating
        if (Curves.interpolationPoints.length === 0 || 
            dist(finalPoint.x, finalPoint.y, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].x, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].y) > 0.1) {
          Curves.interpolationPoints.push(finalPoint);
        }
        
        // draw curve being drawn
        if (Curves.interpolationPoints.length > 1) {
          strokeWeight(1.5);
          stroke(Colors.bezierLineColor);
          noFill();
          beginShape();
          for (let p of Curves.interpolationPoints) {
            vertex(p.x, p.y);
          }
          endShape();
        }

        // Finish point
        fill(Colors.bezierLineColor);
        noStroke();
        strokeWeight(0.2);
        ellipse(finalPoint.x, finalPoint.y, 4);
        this.drawTextAtVertex(finalPoint, "F", 0, 0, 20);
      }
    } 
    else {
      Curves.drawQuadraticBezier();
    }
  }

  static handleWindowResize() {
    if (CurvesUI.curvesPanelDiv) {
      CurvesUI.curvesPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
    }
  }

  static setupCurvesUI() {
    CurvesUI.createCurvesPanel();
  }

  static drawTextAtVertex(myVertex: Vertex, myText: String, offsetX: number = 0, offsetY: number = 0, myTextSize: number = 16) {
    push();
    fill(0);
    stroke(Colors.BackgroundColor);
    strokeWeight(0.2);
    textAlign(CENTER, CENTER);
    textSize(myTextSize/Camera.scaleFactor);
    text(myText, myVertex.x + offsetX, myVertex.y + offsetY);
    pop();
  }

  static drawControlPoints() {
    push();
    for (let i = 0; i < Curves.bezierPoints.length; i++) {
      let p = Curves.bezierPoints[i];
      
      fill(Colors.bezierControlPointColor);
      noStroke();
      ellipse(p.x, p.y, Curves.controlPointRadius * 2);

      CurvesUI.drawTextAtVertex(p, `P${i}`, 3, 0);
    }
    pop();
  }

  static drawConnectionLines() {
    push();
    strokeCap(ROUND);
    strokeWeight(0.5);
    stroke(Colors.bezierControlPointColor);
    noFill();
    beginShape();
    for (let p of Curves.bezierPoints) {
      vertex(p.x, p.y);
    }
    endShape();
    pop();
  }
}