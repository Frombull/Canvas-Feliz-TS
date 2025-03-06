class DebugUI{
  static drawDebugWindow() {
    if (!SidePanel.shouldDrawDebugWindow) return;
    
    push(); 
    resetMatrix();
    
    // Draw background
    fill(0, 0, 0, 180);
    stroke(255);
    strokeWeight(1);
    rect(10, 10, 260, 200, 5);
    
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
    //debugText += `mousePosInCartesianPlane: ${mousePosInCartesianPlane.x}, ${mousePosInCartesianPlane.y}`;
    //debugText += "\n";
    // debugText += `PanXY: [${panX.toFixed(2)}, ${panY.toFixed(2)}]`;
    // debugText += "\n";
    debugText += `scaleFactor: [${scaleFactor.toFixed(2)}]`;
    debugText += "\n";
    // debugText += `Last mouse pos: ${lastMouseX}, ${lastMouseY}`;
    // debugText += "\n";
    // debugText += `isPanning: [${isPanning}]`;
    // debugText += "\n";
    debugText += `Tool: [${Object.keys(Tool)[selectedTool]}]`;
    debugText += "\n";
    // debugText += `isDraggingXY: [${isDraggingX}, ${isDraggingY}]`;
    // debugText += "\n";
    // debugText += `translateInitialXY: [${translateInitialX}, ${translateInitialY}]`;
    // debugText += "\n";
    // debugText += `dx, dy: [${dx}, ${dy}]`;
    // debugText += "\n";
    if (Scale.scaleStartPos.x && Scale.scaleStartPos.y) {
      debugText += `scaleStartPos: [${(Scale.scaleStartPos.x).toFixed(4)}, ${(Scale.scaleStartPos.x).toFixed(4)}]`;
      debugText += "\n";
    }
    if(Scale.currentScale.x && Scale.currentScale.y){
      debugText += `currentScale: [${Scale.currentScale.x.toFixed(4)}, ${Scale.currentScale.y.toFixed(4)}]`;
      debugText += "\n";
    }
  
    text(debugText, 20, 20);
    pop();
  }
}