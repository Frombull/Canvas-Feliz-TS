class CurvesUI {
  static panelVisible: boolean = false;
  static curvesPanelDiv: any = null;
  static resolutionValueBox: any = null;
  static quadraticBezierButton: ToolButton;
  static cubicBezierButton: ToolButton;
  static animationSpeedSlider: any = null;
  static animationSpeedValueBox: any = null;
  static animationTimeValueBox: any = null;
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


    // ------------------------------ Animation time slider (t) ------------------------------
    let animationTimeContainer = createDiv('').class('animation-time-container').parent(curvesSection);
    createDiv('Time [t]:').parent(animationTimeContainer);
    
    let animationTimeSliderContainer: any = createDiv('').class('slider-container').parent(animationTimeContainer);
    
    let animationTimeSlider: any = createSlider(0.001, 1.001, Curves.animationProgress, 0.01).class('slider').parent(animationTimeSliderContainer); // Same story as 0.30000000004 ¬¬
    
    CurvesUI.animationTimeValueBox = createDiv(`${Curves.animationProgress.toFixed(2)}`).class('colorpicker-value-box').parent(animationTimeSliderContainer);
    
    animationTimeSlider.input(() => {
      // Pause animation if running when user adjusts the slider
      if (Curves.isAnimating) {
        Curves.setAnimating(false);
      }
      
      // Update progress based on slider value
      Curves.animationProgress = Number(animationTimeSlider.value());
      
      // Update the display value with 2 decimal precision
      CurvesUI.animationTimeValueBox.html(Curves.animationProgress.toFixed(2));
      
      // If we have complete bezier points, update the curve visualization
      const requiredPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
      if (Curves.bezierPoints.length === requiredPoints) {
        // Clear existing interpolation points so we only see the current t
        Curves.interpolationPoints = [];
        
        // Calculate new points up to the current t for visualization
        const step = 0.01;
        for (let t = 0; t <= Curves.animationProgress; t += step) {
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
    });


    // ------------------------------ Animation speed slider ------------------------------
    let animationSpeedContainer = createDiv('').class('animation-speed-container').parent(curvesSection);
    createDiv('Animation Speed:').parent(animationSpeedContainer);
    
    let animationSliderContainer: any = createDiv('').class('slider-container').parent(animationSpeedContainer);
    
    let animationSpeedSlider: any = createSlider(0.1, 1, Curves.animationSpeed * 100, 0.1).class('slider').parent(animationSliderContainer);
    
    CurvesUI.animationSpeedValueBox = createDiv(`${Curves.animationSpeed*100}`).class('colorpicker-value-box').parent(animationSliderContainer);
    
    animationSpeedSlider.input(() => {
      Curves.animationSpeed = Number(animationSpeedSlider.value()) / 100;
      CurvesUI.animationSpeedValueBox.html(animationSpeedSlider.value().toString());
    });


    // ------------------------------ Play/Pause button ------------------------------
    let playbackControlsContainer = createDiv('').class('playback-controls-container').parent(curvesSection);

    let buttonContainer = createDiv('').class('playback-buttons-container').parent(playbackControlsContainer);

    let playPauseButton = createButton('▶ Play').class('button play-button').parent(buttonContainer);
    playPauseButton.style('flex', '1');
    playPauseButton.mouseReleased(() => {
      const requiredPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
      if (Curves.bezierPoints.length === requiredPoints) {
        if (Curves.isAnimating) {
          // Pause the animation
          Curves.setAnimating(false);
        } else {
          // If we're at the end, restart from beginning
          if (Curves.animationProgress >= 0.99) {
            Curves.animationProgress = 0;
            Curves.interpolationPoints = [];
          }
          // Start the animation
          Curves.setAnimating(true);
        }
      }
    });

    // Reset animation button
    let resetButton = createButton('⏮ Reset').class('button reset-button').parent(buttonContainer);
    resetButton.style('flex', '1');
    resetButton.mouseReleased(() => {
      const requiredPoints = Curves.bezierType === BezierType.CUBIC ? 4 : 3;
      if (Curves.bezierPoints.length === requiredPoints) {
        Curves.animationProgress = 0.001;
        Curves.interpolationPoints = [];
        CurvesUI.updateAnimationTimeSlider();
        // Curves.setAnimating(true);
      }
    });


    // ------------------------------ Checkbox loop animation  ------------------------------
    let loopContainer = createDiv('').class('loop-container').parent(curvesSection);
    CurvesUI.loopAnimationCheckbox = createCheckbox('Loop Animation', Curves.loopAnimation).parent(loopContainer);
    CurvesUI.loopAnimationCheckbox.changed(() => {
      Curves.loopAnimation = CurvesUI.loopAnimationCheckbox.checked();

      // Restart if animation already finished
      if (Curves.loopAnimation && !Curves.isAnimating && Curves.animationProgress >= 1) {
        Curves.startAnimation();
      }
    });

    createDiv('').class('section-title').html('Display Options').parent(curvesSection);
    
    // Checkbox for first level lines
    let checkboxFirstLevelLines: any = createCheckbox('Show First Level Lines', CurvesUI.shouldDrawFirstLevelLines).parent(curvesSection);
    checkboxFirstLevelLines.changed(() => {
      CurvesUI.shouldDrawFirstLevelLines = checkboxFirstLevelLines.checked();
    });
    
    // Checkbox for second level lines
    let checkboxSecondLevelLines: any = createCheckbox('Show Second Level Lines', CurvesUI.shouldDrawSecondLevelLines).parent(curvesSection);
    checkboxSecondLevelLines.changed(() => {
      CurvesUI.shouldDrawSecondLevelLines = checkboxSecondLevelLines.checked();
    });
    
    // Checkbox for bezier line
    let checkboxBezierLine: any = createCheckbox('Show Bezier Line', CurvesUI.shouldDrawBezierLine).parent(curvesSection);
    checkboxBezierLine.changed(() => {
      CurvesUI.shouldDrawBezierLine = checkboxBezierLine.checked();
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
    } else {
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
        
        if (Curves.animationProgress < 1) {
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

          // First level lines
          if (CurvesUI.shouldDrawFirstLevelLines) {
              stroke(CurvesUI.green);
              strokeWeight(0.5);
              line(p01.x, p01.y, p012.x, p012.y);
              line(p012.x, p012.y, p12.x, p12.y);
              
              stroke(CurvesUI.green);
              line(p12.x, p12.y, p123.x, p123.y);
              line(p123.x, p123.y, p23.x, p23.y);
          }

          // Second level lines
          if (CurvesUI.shouldDrawSecondLevelLines) {
            stroke(CurvesUI.blue);
            strokeWeight(0.5);
            line(p012.x, p012.y, finalPoint.x, finalPoint.y);
            line(finalPoint.x, finalPoint.y, p123.x, p123.y);
            
            // Second level interpolation points
            fill(CurvesUI.blue);
            noStroke();
            ellipse(p012.x, p012.y, 2.5);
            
            fill(CurvesUI.blue);
            ellipse(p123.x, p123.y, 2.5);
          }
        }

        // Add point to curve while animating
        if (Curves.interpolationPoints.length === 0 || 
            dist(finalPoint.x, finalPoint.y, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].x, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].y) > 0.1) {
          Curves.interpolationPoints.push(finalPoint);
        }
        
        // Draw bezier curve
        if (CurvesUI.shouldDrawBezierLine && Curves.interpolationPoints.length > 1) {
          strokeWeight(1.5);
          stroke(Colors.bezierLineColor);
          noFill();
          beginShape();
          for (let p of Curves.interpolationPoints) {
            vertex(p.x, p.y);
          }
          endShape();

          CurvesUI.drawBezierFinishPoint(finalPoint);
        }
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
        if (Curves.animationProgress < 1) {
          fill(Colors.bezierControlPointColor);
          noStroke();
          ellipse(p01.x, p01.y, 2.5);
          CurvesUI.drawTextAtVertex(p01, "L0", -3, 0);
          
          fill(Colors.bezierControlPointColor);
          ellipse(p12.x, p12.y, 2.5);
          CurvesUI.drawTextAtVertex(p12, "L1", -3, 0);

          // First level lines
          if (CurvesUI.shouldDrawFirstLevelLines) {
            stroke(CurvesUI.green);
            strokeWeight(0.8);
            line(p01.x, p01.y, finalPoint.x, finalPoint.y);
            line(finalPoint.x, finalPoint.y, p12.x, p12.y);
          }

          // Second level interpolation points
          if (CurvesUI.shouldDrawSecondLevelLines) {
            fill(CurvesUI.blue);
            noStroke();
            ellipse(finalPoint.x, finalPoint.y, 2.5);
          }
        }
        
        // Add point to curve while animating
        if (Curves.interpolationPoints.length === 0 || 
            dist(finalPoint.x, finalPoint.y, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].x, 
                 Curves.interpolationPoints[Curves.interpolationPoints.length-1].y) > 0.1) {
          Curves.interpolationPoints.push(finalPoint);
        }
        
        // Draw bezier curve
        if (CurvesUI.shouldDrawBezierLine && Curves.interpolationPoints.length > 1) {
          strokeWeight(1.5);
          stroke(Colors.bezierLineColor);
          noFill();
          beginShape();
          for (let p of Curves.interpolationPoints) {
            vertex(p.x, p.y);
          }
          endShape();

          CurvesUI.drawBezierFinishPoint(finalPoint);
        }
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

  static drawTextAtVertex(myVertex: Vertex, myText: String, offsetX: number = 0, offsetY: number = 0, myTextSize: number = 16, myStrokeWeight: number = 0.2) {
    push();

    fill(0);
    stroke(Colors.BackgroundColor);
    strokeWeight(myStrokeWeight);
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

  static drawBezierFinishPoint(point: Vertex) {
    fill(Colors.bezierLineColor);
    noStroke();
    ellipse(point.x, point.y, 3.5);
    CurvesUI.drawTextAtVertex(point, "F", 0, 0, 20, 0);
  }

  static updateAnimationTimeSlider() {
    if (CurvesUI.animationTimeValueBox) {
      CurvesUI.animationTimeValueBox.html(Curves.animationProgress.toFixed(2));
      
      // Update slider value
      const slider = select('.animation-time-container .slider');
      if (slider) {
        slider.value(Curves.animationProgress);
      }
      
      // Update play/pause button based on animation state
      const playPauseButton = select('.play-button');
      if (playPauseButton) {
        if (Curves.isAnimating) {
          playPauseButton.html('⏸ Pause');
        } else {
          playPauseButton.html('▶ Play');
        }
      }
    }
  }
}
