class CurvesUI {
  static panelVisible: boolean = false;
  static curvesPanelDiv: any = null;
  static resolutionValueBox: any = null;
  static bezierButton: ToolButton;
  static animationSpeedSlider: any = null;
  static animationSpeedValueBox: any = null;

  
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
  
    createDiv('').class('section-title').html('Bezier Curve').parent(curvesSection);

    // Button Bezier Curve
    CurvesUI.bezierButton = new ToolButton('Bezier Curve', Tool.BEZIER, curvesSection, () => {
      Curves.reset();
    });

    // Curve resolution slider
    let resolutionContainer = createDiv('').parent(curvesSection);
    createDiv('Resolution:').parent(resolutionContainer);
    
    let sliderValueContainer = createDiv('').style('display', 'flex').style('align-items', 'center').style('gap', '10px').parent(resolutionContainer);
    
    let resolutionSlider: any = createSlider(2, 42, Curves.curveResolution, 1).parent(sliderValueContainer);
    resolutionSlider.style('width', '80%');
    resolutionSlider.style('flex', '1');
    
    CurvesUI.resolutionValueBox = createDiv(Curves.curveResolution.toString()).class('colorpicker-value-box').parent(sliderValueContainer);
    
    resolutionSlider.input(() => {
      Curves.curveResolution = Number(resolutionSlider.value());
      CurvesUI.resolutionValueBox.html(Curves.curveResolution.toString());
    });
  
    // Animation speed
    let animationSpeedContainer = createDiv('').parent(curvesSection);
    createDiv('Animation Speed:').parent(animationSpeedContainer);
    
    let animationSliderContainer = createDiv('').style('display', 'flex').style('align-items', 'center').style('gap', '10px').parent(animationSpeedContainer);
    
    let animationSpeedSlider: any = createSlider(0, 5, 2, 0.5).parent(animationSliderContainer);
    animationSpeedSlider.style('width', '80%');
    animationSpeedSlider.style('flex', '1');
    
    CurvesUI.animationSpeedValueBox = createDiv('2').class('colorpicker-value-box').parent(animationSliderContainer);
    
    animationSpeedSlider.input(() => {
      Curves.animationSpeed = Number(animationSpeedSlider.value()) / 1000;
      CurvesUI.animationSpeedValueBox.html(animationSpeedSlider.value().toString());
    });
  
    // Restart animation button
    let resetAnimationButton = createButton('Restart Animation').class('button').parent(curvesSection);
    resetAnimationButton.mouseReleased(() => {
      if (Curves.bezierPoints.length === 4) {
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

  static drawBezierControls() {
    push();
    // Control points
    if(SidePanel.shouldDrawVertexBalls){
      for (let i = 0; i < Curves.bezierPoints.length; i++) {
        let p = Curves.bezierPoints[i];
        
        // Vertex ellipse
        fill(Colors.bezierControlPointColor);
        noStroke();
        ellipse(p.x, p.y, Curves.controlPointRadius * 2);
        
        // Text
        fill(0);
        stroke(Colors.BackgroundColor);
        strokeWeight(0.5);
        textAlign(LEFT, CENTER);
        textSize(12/Camera.scaleFactor);
        text(`P${i}`, p.x + 2, p.y + 0.5);
      }
    }
  
    // linhas de conexão entre ponto de controle
    if (Curves.bezierPoints.length > 1) {
      strokeCap(ROUND);
      strokeWeight(1);
      stroke(Colors.bezierConnectingLinesColor);
      noFill();
      beginShape();
      for (let p of Curves.bezierPoints) {
        vertex(p.x, p.y);
      }
      endShape();
    }
    
    if (Curves.bezierPoints.length === 4) {
      let p0 = Curves.bezierPoints[0];
      let p1 = Curves.bezierPoints[1];
      let p2 = Curves.bezierPoints[2];
      let p3 = Curves.bezierPoints[3];
      
      // Interpolation animation 
      if (Curves.isAnimating || Curves.animationProgress > 0) {
        // Pontos de interpolação do progresso atual
        let t = Curves.animationProgress;
        let interpPoints = Curves.calculateInterpolationPoints(t);
        
        if (interpPoints.length >= 6) {
          let [p01, p12, p23, p012, p123, finalPoint] = interpPoints;
          
          // First level lines
          // stroke(255, 100, 150, 180);
          // strokeWeight(0.7);
          // line(p0.x, p0.y, p01.x, p01.y);
          // line(p01.x, p01.y, p1.x, p1.y);
          // 
          // stroke(150, 100, 255, 180);
          // line(p1.x, p1.y, p12.x, p12.y);
          // line(p12.x, p12.y, p2.x, p2.y);
          // 
          // stroke(100, 200, 255, 180);
          // line(p2.x, p2.y, p23.x, p23.y);
          // line(p23.x, p23.y, p3.x, p3.y);
          
          // First level interpolation points
          fill(Colors.bezierControlPointColor);
          noStroke();
          ellipse(p01.x, p01.y, 2.5);
          
          fill(Colors.bezierControlPointColor);
          ellipse(p12.x, p12.y, 2.5);
          
          fill(Colors.bezierControlPointColor);
          ellipse(p23.x, p23.y, 2.5);
          
          // Secold level lines
          stroke(50, 200, 100, 200);
          strokeWeight(1);
          line(p01.x, p01.y, p012.x, p012.y);
          line(p012.x, p012.y, p12.x, p12.y);
          
          stroke(50, 200, 100, 200);
          line(p12.x, p12.y, p123.x, p123.y);
          line(p123.x, p123.y, p23.x, p23.y);
          
          // Second level interpolation points
          fill(50, 200, 100, 200);
          noStroke();
          ellipse(p012.x, p012.y, 4);
          
          fill(50, 200, 100, 200);
          ellipse(p123.x, p123.y, 4);
          
          // Third level line
          stroke(106, 90, 205); // Purple
          strokeWeight(1.2);
          line(p012.x, p012.y, finalPoint.x, finalPoint.y);
          line(finalPoint.x, finalPoint.y, p123.x, p123.y);
          
          // Draw finish point
          fill(Colors.bezierLineColor);
          stroke(106, 90, 205);
          strokeWeight(0.2);
          ellipse(finalPoint.x, finalPoint.y, 4);

          
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
        }
      } else {
        // Draw finished curve when animation ends
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
    }
  
    // Draw circle at mouse position
    if(Curves.bezierPoints.length < 4){
      drawCircleOnMouse(Colors.bezierControlPointColor);
      drawCoordinatesOnMouse();
    }
  
    pop();
  }
  
  static handleWindowResize() {
    if (CurvesUI.curvesPanelDiv) {
      CurvesUI.curvesPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
    }
  }

  static setupCurvesUI() {
    CurvesUI.createCurvesPanel();
  }
}