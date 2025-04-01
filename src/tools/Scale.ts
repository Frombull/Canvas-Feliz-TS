class Scale {
  static gizmoScaleHandleSize: number = 6;
  static gizmoScaleDistance: number = 30;
  static cornerHandleDistance: number = 42;
  static isScaling: boolean = false;
  static scaleAxis: "x" | "y" | "xy" | "" = "";
  static initialMousePos: Vertex | null = null;
  static initialCenter: Vertex | null = null;
  static initialVertices: Vertex[] = [];
  static snapScaleAmount: number = 10;
  static scalePivot: Vertex | null = null;
  static initialScale: { x: number, y: number };
  
  static drawScaleGizmo() {
    if (!selectedPolygon) return;
    
    const pivot = selectedVertex || selectedCentroid;
    if (!pivot) return;
    
    push();
    
    // Check for handle hover
    const hoveredHandle = Scale.checkHandleHover();
    
    const xHandlePos = {
      x: pivot.x + Scale.gizmoScaleDistance,
      y: pivot.y
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    line(pivot.x, pivot.y, xHandlePos.x, xHandlePos.y);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "x" || hoveredHandle === "x") {
      stroke(255);
      strokeWeight(0.8);
    } 
    else {
      noStroke();
    }
    ellipse(xHandlePos.x, xHandlePos.y, Scale.gizmoScaleHandleSize);
    
    const yHandlePos = {
      x: pivot.x,
      y: pivot.y - Scale.gizmoScaleDistance
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(1.2);
    line(pivot.x, pivot.y, yHandlePos.x, yHandlePos.y);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "y" || hoveredHandle === "y") {
      stroke(255);
      strokeWeight(0.8);
    } 
    else {
      noStroke();
    }
    ellipse(yHandlePos.x, yHandlePos.y, Scale.gizmoScaleHandleSize);
    
    const xyHandlePos = {
      x: pivot.x + Scale.cornerHandleDistance * 0.707,
      y: pivot.y - Scale.cornerHandleDistance * 0.707
    };
    
    stroke(Colors.GizmoScaleColor);
    strokeWeight(0.8);
    drawingContext.setLineDash([3, 2]);
    line(pivot.x, pivot.y, xyHandlePos.x, xyHandlePos.y);
    drawingContext.setLineDash([]);
    
    fill(Colors.GizmoScaleColor);
    if (Scale.scaleAxis === "xy" || hoveredHandle === "xy") {
      stroke(255);
      strokeWeight(0.8);
    } 
    else {
      noStroke();
    }
    rect(xyHandlePos.x - Scale.gizmoScaleHandleSize/2, 
         xyHandlePos.y - Scale.gizmoScaleHandleSize/2,
         Scale.gizmoScaleHandleSize,
         Scale.gizmoScaleHandleSize, 1);
    
    if (Scale.isScaling) {
      fill(0);
      stroke(255);
      strokeWeight(0.2);
      textAlign(CENTER, CENTER);
      textSize(3);
      
      const currentScale = selectedPolygon.getScale();
      
      if (Scale.scaleAxis === "x") {
        text(`X: ${currentScale.x.toFixed(2)}`, xHandlePos.x, xHandlePos.y - 8);
      } 
      else if (Scale.scaleAxis === "y") {
        text(`Y: ${currentScale.y.toFixed(2)}`, yHandlePos.x, yHandlePos.y - 8);
      } 
      else if (Scale.scaleAxis === "xy") {
        text(`${currentScale.x.toFixed(2)}`, xyHandlePos.x, xyHandlePos.y - 8);
      }
    }
    
    pop();
  }
  
  static getClickedHandle(): "x" | "y" | "xy" | "" {
    if (!selectedPolygon) return "";
    
    // Use selected vertex as pivot if available, otherwise use polygon center
    const pivot = selectedVertex || selectedCentroid;
    if (!pivot) return "";
    
    const mousePos = Mouse.mousePosInGrid;
    const detectRange = Scale.gizmoScaleHandleSize;
    
    const xHandle = {
      x: pivot.x + Scale.gizmoScaleDistance,
      y: pivot.y
    };
    if (dist(mousePos.x, mousePos.y, xHandle.x, xHandle.y) < detectRange) {
      return "x";
    }
    
    const yHandle = {
      x: pivot.x,
      y: pivot.y - Scale.gizmoScaleDistance
    };
    if (dist(mousePos.x, mousePos.y, yHandle.x, yHandle.y) < detectRange) {
      return "y";
    }
    
    const xyHandle = {
      x: pivot.x + Scale.cornerHandleDistance * 0.707,
      y: pivot.y - Scale.cornerHandleDistance * 0.707
    };
    if (dist(mousePos.x, mousePos.y, xyHandle.x, xyHandle.y) < detectRange) {
      return "xy";
    }
    
    return "";
  }
  
  static startScaling(axis: "x" | "y" | "xy") {
    if (!selectedPolygon) return;

    const pivot = selectedVertex || selectedCentroid;
    if (!pivot) return;
    
    Scale.isScaling = true;
    Scale.scaleAxis = axis;
    Scale.initialMousePos = { ...Mouse.mousePosInGrid };
    Scale.scalePivot = { x: pivot.x, y: pivot.y };
    Scale.initialVertices = selectedPolygon.vertices.map(v => ({ x: v.x, y: v.y }));
    
    Scale.initialScale = { ...selectedPolygon.getScale() };
    
    console.log(`Started scaling on ${axis} axis with pivot at (${Scale.scalePivot.x}, ${Scale.scalePivot.y})`);
    console.log(`Initial scale: X=${Scale.initialScale.x}, Y=${Scale.initialScale.y}`);
  }

  static processScaling() {
    if (!Scale.isScaling || !selectedPolygon || !Scale.initialMousePos || !Scale.scalePivot) return;
    
    const currentMousePos = Mouse.mousePosInGrid;
    
    let scaleFactorX = 1;
    let scaleFactorY = 1;
    
    try {
      // Calculate relative scale change based on mouse movement
      const scaleSensitivity = 0.04; // Adjust scaling sensitivity
      
      if (Scale.scaleAxis === "x" || Scale.scaleAxis === "xy") {
        const mouseDeltaX = currentMousePos.x - Scale.initialMousePos.x;
        scaleFactorX = 1 + (mouseDeltaX * scaleSensitivity);
      }
      
      if (Scale.scaleAxis === "y" || Scale.scaleAxis === "xy") {
        const mouseDeltaY = Scale.initialMousePos.y - currentMousePos.y;
        scaleFactorY = 1 + (mouseDeltaY * scaleSensitivity);
      }
      
      if (Scale.scaleAxis === "xy") {
        const dx = currentMousePos.x - Scale.initialMousePos.x;
        const dy = Scale.initialMousePos.y - currentMousePos.y; // inverted for Y
        const delta = (dx + dy) / 2;
        
        scaleFactorX = scaleFactorY = 1 + (delta * scaleSensitivity);
      }
      
      if (Scale.scaleAxis === "x") {
        scaleFactorY = 1;
      } 
      else if (Scale.scaleAxis === "y") {
        scaleFactorX = 1;
      }
      
      let newScaleX = Scale.initialScale.x * scaleFactorX;
      let newScaleY = Scale.initialScale.y * scaleFactorY;
      
      if (!Keyboard.isShiftPressed) {
        newScaleX = Math.round(newScaleX * Scale.snapScaleAmount) / Scale.snapScaleAmount;
        newScaleY = Math.round(newScaleY * Scale.snapScaleAmount) / Scale.snapScaleAmount;
      } else {
        newScaleX = Math.round(newScaleX);
        newScaleY = Math.round(newScaleY);
      }
      
      // Clamp scales to reasonable values
      newScaleX = Math.max(-10, Math.min(newScaleX, 10));
      newScaleY = Math.max(-10, Math.min(newScaleY, 10));
      
      // Update polygon scale property with new calculated values
      selectedPolygon.setScale({
        x: newScaleX,
        y: newScaleY
      });
      
      // Calculate effective scale factors based on snapped/clamped values
      const effectiveScaleFactorX = newScaleX / Scale.initialScale.x;
      const effectiveScaleFactorY = newScaleY / Scale.initialScale.y;
      
      // Apply the actual scale transformation to vertices using effective scale factors
      Scale.applyScaleToPolygon(effectiveScaleFactorX, effectiveScaleFactorY);
      
    } catch (err) {
      console.error("Error during scaling:", err);
      if (selectedPolygon) {
        selectedPolygon.vertices = Scale.initialVertices.map(v => ({x: v.x, y: v.y}));
        selectedPolygon.setScale(Scale.initialScale);
      }
    }
  }
  
  static applyScaleToPolygon(scaleFactorX: number, scaleFactorY: number) {
    if (!selectedPolygon || !Scale.scalePivot || Scale.initialVertices.length === 0) return;
    
    const oldVertices = selectedPolygon.saveStateBeforeChange();
    
    for (let i = 0; i < Scale.initialVertices.length; i++) {
      const origVertex = Scale.initialVertices[i];
      
      // Use scale pivot point (selected vertex or center) as reference point
      const dx = origVertex.x - Scale.scalePivot.x;
      const dy = origVertex.y - Scale.scalePivot.y;
      
      const scaledX = dx * scaleFactorX;
      const scaledY = dy * scaleFactorY;
      
      selectedPolygon.vertices[i].x = Scale.scalePivot.x + scaledX;
      selectedPolygon.vertices[i].y = Scale.scalePivot.y + scaledY;
    }
    
    selectedPolygon.recordAction(oldVertices);
  }
  
  static endScaling() {
    Scale.isScaling = false;
    Scale.scaleAxis = "";
    Scale.initialMousePos = null;
    Scale.scalePivot = null;
    Scale.initialScale = { x: 1, y: 1 };
  }

  static checkHandleHover(): "x" | "y" | "xy" | "" {
    if (!selectedPolygon) return "";
    
    const pivot = selectedVertex || selectedCentroid;
    if (!pivot) return "";
    
    const mousePos = Mouse.mousePosInGrid;
    const detectRange = Scale.gizmoScaleHandleSize / 2;

    const xHandle = {
      x: pivot.x + Scale.gizmoScaleDistance,
      y: pivot.y
    };
    if (dist(mousePos.x, mousePos.y, xHandle.x, xHandle.y) < detectRange) {
      cursor(HAND);
      return "x";
    }
    
    const yHandle = {
      x: pivot.x,
      y: pivot.y - Scale.gizmoScaleDistance
    };
    if (dist(mousePos.x, mousePos.y, yHandle.x, yHandle.y) < detectRange) {
      cursor(HAND);
      return "y";
    }
    
    const xyHandle = {
      x: pivot.x + Scale.cornerHandleDistance * 0.707,
      y: pivot.y - Scale.cornerHandleDistance * 0.707
    };
    if (dist(mousePos.x, mousePos.y, xyHandle.x, xyHandle.y) < detectRange) {
      cursor(HAND);
      return "xy";
    }
    
    return "";
  }
}