class DebugUI {
  static drawDebugWindow() {
    if (!SidePanel.shouldDrawDebugWindow) return;
    
    push(); 
    resetMatrix();
    
    // Draw background
    fill(0, 0, 0, 180);
    stroke(255);
    strokeWeight(1);
    rect(10, 10, 260, 160, 5);
    
    fill(255);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    
    let debugText = "";
    // debugText += `mouseXY: [${mouseX.toFixed(2)}, ${mouseY.toFixed(2)}]`;
    // debugText += "\n";
    debugText += `mousePosInGrid: [${Mouse.mousePosInGrid.x.toFixed(2)}, ${Mouse.mousePosInGrid.y.toFixed(2)}]`;
    debugText += "\n";
    debugText += `mousePosInGridSnapped: [${Mouse.mousePosInGridSnapped.x}, ${Mouse.mousePosInGridSnapped.y}]`;
    debugText += "\n";
    // debugText += `mousePosInCartesianPlane: ${Mouse.mousePosInCartesianPlane.x}, ${Mouse.mousePosInCartesianPlane.y}`;
    // debugText += "\n";
    // debugText += `PanXY: [${panX.toFixed(2)}, ${panY.toFixed(2)}]`;
    // debugText += "\n";
    debugText += `Screen scaleFactor: [${Camera.scaleFactor.toFixed(2)}]`;
    debugText += "\n";
    // debugText += `Last mouse pos: ${Mouse.lastMouseX}, ${Mouse.lastMouseY}`;
    // debugText += "\n";
    debugText += `isPanning: [${Camera.isPanning}]`;
    debugText += "\n";
    debugText += `Tool: [${Tool[selectedTool]}]`;
    debugText += "\n";
    // debugText += `isDraggingXY: [${isDraggingX}, ${isDraggingY}]`;
    // debugText += "\n";
    // debugText += `translateInitialXY: [${translateInitialX}, ${translateInitialY}]`;
    // debugText += "\n";
    // debugText += `dx, dy: [${Transform.dx}, ${Transform.dy}]`;
    // debugText += "\n";
    if (Scale.scaleStartPos.x && Scale.scaleStartPos.y) {
      debugText += `scaleStartPos: [${(Scale.scaleStartPos.x).toFixed(4)}, ${(Scale.scaleStartPos.x).toFixed(4)}]`;
      debugText += "\n";
    }
    if (Scale.currentScale.x && Scale.currentScale.y) {
      debugText += `currentScale: [${Scale.currentScale.x.toFixed(2)}, ${Scale.currentScale.y.toFixed(2)}]`;
      debugText += "\n";
    }
    debugText += `PolygonListLength: [${polygonsList.length}]`;
    debugText += "\n";
    debugText += `SelectedPolygon: [${selectedPolygon?.id}]`;
    debugText += "\n";

  
    text(debugText, 20, 20);
    pop();
  }
}