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
  static initialScale: { x: number, y: number } = { x: 1, y: 1 };
  
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
    
    // Store the initial scale of the polygon
    Scale.initialScale = { ...selectedPolygon.getScale() };
    
    console.log(`Started scaling on ${axis} axis with pivot at (${Scale.scalePivot.x}, ${Scale.scalePivot.y})`);
    console.log(`Initial scale: X=${Scale.initialScale.x}, Y=${Scale.initialScale.y}`);
  }
  
  static snapScale(value: number): number {
    if (Keyboard.isShiftPressed)
      return (Math.round(value));
    else
      return (Math.round(value * Scale.snapScaleAmount) / Scale.snapScaleAmount);
  }

  static processScaling() {
    if (!Scale.isScaling || !selectedPolygon || !Scale.initialMousePos || !Scale.scalePivot) return;
    
    const currentMousePos = Mouse.mousePosInGrid;
    
    let scaleFactorX = 1;
    let scaleFactorY = 1;
    
    try {
      if (Scale.scaleAxis === "x" || Scale.scaleAxis === "xy") {
        const mouseDeltaX = currentMousePos.x - Scale.initialMousePos.x;
        scaleFactorX = 1 + mouseDeltaX / 25;
      }
      
      if (Scale.scaleAxis === "y" || Scale.scaleAxis === "xy") {
        const mouseDeltaY = Scale.initialMousePos.y - currentMousePos.y;
        scaleFactorY = 1 + mouseDeltaY / 25;
      }
      
      if (Scale.scaleAxis === "xy") {
        const dx = currentMousePos.x - Scale.initialMousePos.x;
        const dy = Scale.initialMousePos.y - currentMousePos.y;  // inverted for Y
        const delta = (dx + dy) / 2; 
        
        scaleFactorX = scaleFactorY = 1 + delta / 25;
      }
      
      scaleFactorX = Scale.snapScale(scaleFactorX);
      scaleFactorY = Scale.snapScale(scaleFactorY);
      
      // Clamp values
      scaleFactorX = Math.max(-10, Math.min(scaleFactorX, 10));
      scaleFactorY = Math.max(-10, Math.min(scaleFactorY, 10));
      
      if (Scale.scaleAxis === "x") {
        scaleFactorY = 1;
      } 
      else if (Scale.scaleAxis === "y") {
        scaleFactorX = 1;
      }
      
      // Calculate new scale based on initial scale and scaling factor
      const newScaleX = Scale.initialScale.x * scaleFactorX;
      const newScaleY = Scale.initialScale.y * scaleFactorY;
      
      // Update the polygon's scale property
      selectedPolygon.setScale({
        x: newScaleX,
        y: newScaleY
      });
      
      // Apply the scale transformation to the vertices
      Scale.applyScaleToPolygon(scaleFactorX, scaleFactorY);
      
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
      
      // Use the scale pivot point (selected vertex or center) as the reference point
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