class Scale {
  static gizmoScaleHandleSize: number = 6;
  static gizmoScaleDistance: number = 30;
  static cornerHandleDistance: number = 42;
  static isScaling: boolean = false;
  static scaleAxis: "x" | "y" | "xy" | "" = "";
  static initialMousePos: Vertex | null = null;
  static initialCenter: Vertex | null = null;
  static initialVertices: Vertex[] = [];
  static currentScale = {x: 1, y: 1};
  static snapScaleAmmount: number = 10;
  static scalePivot: Vertex | null = null;
  
  
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
      
      if (Scale.scaleAxis === "x") {
        text(`X: ${Scale.currentScale.x.toFixed(2)}`, xHandlePos.x, xHandlePos.y - 8);
      } 
      else if (Scale.scaleAxis === "y") {
        text(`Y: ${Scale.currentScale.y.toFixed(2)}`, yHandlePos.x, yHandlePos.y - 8);
      } 
      else if (Scale.scaleAxis === "xy") {
        text(`${Scale.currentScale.x.toFixed(2)}`, xyHandlePos.x, xyHandlePos.y - 8);
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
    
    console.log(`Started scaling on ${axis} axis with pivot at (${Scale.scalePivot.x}, ${Scale.scalePivot.y})`);
  }
  
  static snapScale(value: number): number {
    if (Keyboard.isShiftPressed)
      return (Math.round(value));
    else
      return (Math.round(value * Scale.snapScaleAmmount) / Scale.snapScaleAmmount);
  }

  static processScaling() {
    if (!Scale.isScaling || !selectedPolygon || !Scale.initialMousePos || !Scale.scalePivot) return;
    
    const currentMousePos = Mouse.mousePosInGrid;
    
    let scaleX = 1;
    let scaleY = 1;
    
    try {
      if (Scale.scaleAxis === "x" || Scale.scaleAxis === "xy") {
        const mouseDeltaX = currentMousePos.x - Scale.initialMousePos.x;
        
        scaleX = 1 + mouseDeltaX / 25;
      }
      
      if (Scale.scaleAxis === "y" || Scale.scaleAxis === "xy") {
        const mouseDeltaY = Scale.initialMousePos.y - currentMousePos.y;
        
        scaleY = 1 + mouseDeltaY / 25;
      }
      
      if (Scale.scaleAxis === "xy") {
        const dx = currentMousePos.x - Scale.initialMousePos.x;
        const dy = Scale.initialMousePos.y - currentMousePos.y;  // invertido para Y
        const delta = (dx + dy) / 2; 
        
        scaleX = scaleY = 1 + delta / 25;
      }
      
      scaleX = Scale.snapScale(scaleX);
      scaleY = Scale.snapScale(scaleY);
      
      // Clamp values
      scaleX = Math.max(-10, Math.min(scaleX, 10));
      scaleY = Math.max(-10, Math.min(scaleY, 10));
      
      if (Scale.scaleAxis === "x") {
        scaleY = 1;
      } 
      else if (Scale.scaleAxis === "y") {
        scaleX = 1;
      }
      
      Scale.currentScale = { x: scaleX, y: scaleY };
      
      Scale.applyScaleToPolygon(scaleX, scaleY);
      
    } catch (err) {
      console.error("Error during scaling:", err);
      if (selectedPolygon) {
        selectedPolygon.vertices = Scale.initialVertices.map(v => ({ x: v.x, y: v.y }));
      }
    }
  }
  
  static applyScaleToPolygon(scaleX: number, scaleY: number) {
    if (!selectedPolygon || !Scale.scalePivot || Scale.initialVertices.length === 0) return;
    
    const oldVertices = selectedPolygon.saveStateBeforeChange();
    
    for (let i = 0; i < Scale.initialVertices.length; i++) {
      const origVertex = Scale.initialVertices[i];
      
      // Use the scale pivot point (selected vertex or center) as the reference point
      const dx = origVertex.x - Scale.scalePivot.x;
      const dy = origVertex.y - Scale.scalePivot.y;
      
      const scaledX = dx * scaleX;
      const scaledY = dy * scaleY;
      
      selectedPolygon.vertices[i].x = Scale.scalePivot.x + scaledX;
      selectedPolygon.vertices[i].y = Scale.scalePivot.y + scaledY;
    }
    
    selectedPolygon.recordAction(oldVertices);
  }
  
  static endScaling() {
    if (Scale.isScaling) {
      console.log(`Scaling ended. Final scale: X=${Scale.currentScale.x.toFixed(2)}, Y=${Scale.currentScale.y.toFixed(2)}`);
    }
    
    Scale.isScaling = false;
    Scale.scaleAxis = "";
    Scale.initialMousePos = null;
    Scale.scalePivot = null; // Reset scale pivot
  }
  
  static setScaleTo(newX: number, newY: number) {
    if (!selectedPolygon) return;
    
    // Use selected vertex or polygon center as pivot
    let pivot;
    if (selectedVertex) {
      pivot = { x: selectedVertex.x, y: selectedVertex.y };
    } else {
      const center = selectedPolygon.getCenter();
      pivot = { x: center.x, y: center.y };
    }
    
    Scale.scalePivot = pivot;
    
    if (Scale.initialVertices.length === 0) {
      Scale.initialVertices = selectedPolygon.vertices.map(v => ({ x: v.x, y: v.y }));
    }
    
    Scale.currentScale.x = newX;
    Scale.currentScale.y = newY;
    
    Scale.applyScaleToPolygon(newX, newY);
    
    console.log(`Scale set to: X=${newX.toFixed(2)}, Y=${newY.toFixed(2)}`);
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