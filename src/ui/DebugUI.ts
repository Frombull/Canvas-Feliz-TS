class DebugUI {
  private static debugItems: {[key: string]: any} = {};
  private static position = {x: 10, y: 10};
  private static padding = 10;
  private static lineHeight = 20;


  static updateItem(label: string, value: any): void {
    this.debugItems[label] = value;
  }

  static addSpacing() { // TODO: Add a "=========="

  }
  
  static drawDebugWindow(): void {
    if (!SidePanel.shouldDrawDebugWindow) return;
    
    push(); 
    resetMatrix();
    
    textSize(14);
    textAlign(LEFT, TOP);
    
    let maxWidth = 0;
    
    const items = Object.entries(this.debugItems);
    
    for (const [label, value] of items) {
      const textContent = `${label}: ${value}`;
      const width = textWidth(textContent);
      maxWidth = Math.max(maxWidth, width);
    }
    
    const windowWidth = maxWidth + this.padding * 2;
    const windowHeight = items.length * this.lineHeight + this.padding * 2;
    
    // Background
    fill(0, 0, 0, 180);
    stroke(255);
    strokeWeight(1);
    rect(this.position.x, this.position.y, windowWidth, windowHeight, 5);
    
    // Items
    fill(255);
    noStroke();
    
    items.forEach(([label, value], i) => {
      const yPos = this.position.y + this.padding + i * this.lineHeight;
      text(`${label}: ${value}`, this.position.x + this.padding, yPos);
    });
    
    pop();

    DebugUI.updateDebugInfo();
  }

  static updateDebugInfo(): void {
    // this.updateItem("Mouse Grid", `[${Mouse.mousePosInGrid.x.toFixed(2)}, ${Mouse.mousePosInGrid.y.toFixed(2)}]`);
    // this.updateItem("Mouse Snapped", `[${Mouse.mousePosInGridSnapped.x}, ${Mouse.mousePosInGridSnapped.y}]`);
    // this.updateItem("Mouse in Cartesian", `[${Mouse.mousePosInCartesianPlane.x}, ${Mouse.mousePosInCartesianPlane.y}]`);
    // this.updateItem("Panning", `${Camera.isPanning}`);
    //this.updateItem("Camera Scale", Camera.currentScaleFactor.toFixed(2));
    this.updateItem("Current Tool", `${Tool[selectedTool]}`);
    this.updateItem("--------------------", "");
    this.updateItem("Selected vertex", `${selectedVertex ? "Yes" : "None"}`);
    this.updateItem("Selected centroid", `${selectedCentroid ? "Yes" : "None"}`);
    this.updateItem("Selected Polygon", selectedPolygon?.id || "None");
    this.updateItem("====================", "");
    this.updateItem("Polygons Count", polygonsList.length);
    this.updateItem("Snap to Grid", Keyboard.isShiftPressed ? "OFF" : "ON");
    this.updateItem("Rotation Rad", selectedPolygon?.getRotationInRadians())
    this.updateItem("Rotation Deg", selectedPolygon?.getRotationInDegrees())

    // // Scale stuff
    // if (Scale.scaleStartPos.x && Scale.scaleStartPos.y)
    //   this.updateItem("Scale Start", `[${Scale.scaleStartPos.x.toFixed(2)}, ${Scale.scaleStartPos.y.toFixed(2)}]`);
    // if (Scale.currentScale.x && Scale.currentScale.y)
    //   this.updateItem("Current Scale", `[${Scale.currentScale.x.toFixed(2)}, ${Scale.currentScale.y.toFixed(2)}]`);

    // Memory stuff (Chrome only)
    if (window.performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      const usedHeapSize = (memoryInfo.usedJSHeapSize / 1048576).toFixed(2);
      const totalHeapSize = (memoryInfo.totalJSHeapSize / 1048576).toFixed(2);
      this.updateItem("Used Heap", `${usedHeapSize}MB`);
      this.updateItem("Total Heap", `${totalHeapSize}MB`);
    }

    // // FPS
    // this.updateItem("FPS", frameRate().toFixed(0));
  }
}