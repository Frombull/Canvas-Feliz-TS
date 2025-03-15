class CurvesUI {
  static panelVisible: boolean = false;
  static curvesPanelDiv: any = null;

  static createCurvesPanel() {
    if (CurvesUI.curvesPanelDiv) {
      CurvesUI.curvesPanelDiv.remove();
    }

    CurvesUI.curvesPanelDiv = createDiv('').class('control-panel curves-panel');
    CurvesUI.curvesPanelDiv.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);

    let curvesSection = createDiv('').class('section').parent(CurvesUI.curvesPanelDiv);

    // Back button to return to main panel
    let backButton = createButton('« Back to Main Panel').class('button').parent(curvesSection);
    backButton.mousePressed(() => {
      CurvesUI.toggleCurvesPanel(false);
      select('.control-panel')?.style('display', 'block');
    });

    createDiv('').class('section-title').html('Bezier Curve').parent(curvesSection);

    // Button Bezier Curve
    let bezierButton = createButton('Bezier Curve').class('button').parent(curvesSection);
    bezierButton.mousePressed(() => {
      selectedTool = Tool.BEZIER;
      Curves.reset();
      SidePanel.updateButtonStyles(bezierButton);
    });

    // Curve resolution slider
    createDiv('Resolution:').parent(curvesSection);
    let resolutionSlider: any = createSlider(2, 42, Curves.curveResolution, 1).parent(curvesSection);
    resolutionSlider.style('width', '90%');
    resolutionSlider.input(() => {
      Curves.curveResolution = Number(resolutionSlider.value());
    });

    // Hide the panel initially
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
    // Draw control points
    for (let i = 0; i < Curves.bezierPoints.length; i++) {
      let p = Curves.bezierPoints[i];
      
      // Draw control point
      fill(Colors.bezierControlPointColor);
      noStroke();
      ellipse(p.x, p.y, Curves.controlPointRadius * 2);
      
      // Draw text label
      fill(0);
      stroke(Colors.BackgroundColor);
      strokeWeight(0.5);
      textAlign(LEFT, CENTER);
      textSize(12/Camera.scaleFactor);
      text(`${i}`, p.x + 2, p.y + 0.5);
    }
    
    // Draw connecting lines between control points
    if (Curves.bezierPoints.length > 1) {
      strokeCap(ROUND);
      strokeWeight(0.5);
      stroke(Colors.bezierConnectingLinesColor);
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

    if(Curves.bezierPoints.length < 4){
      CurvesUI.drawBallAtCurser();
    }

    pop();
  }

  static drawBallAtCurser() {
    // Ellipse at cursor
    push();
    noFill();
    stroke(Colors.bezierControlPointColor);
    strokeWeight(0.5);
    ellipse(Mouse.mousePosInGridSnapped.x, Mouse.mousePosInGridSnapped.y, Polygon.vertexBallRadius);
    pop();

    drawCoordinatesOnMouse();
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