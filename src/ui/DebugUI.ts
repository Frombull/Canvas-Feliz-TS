class DebugUI {
  private static debugItems: {[key: string]: any} = {};
  private static position = {x: 10, y: 10};
  private static padding = 10;
  private static lineHeight = 20;
  private static spacerCount: number = 0;

  static updateItem(label: string, value: any): void {
    this.debugItems[label] = value;
  }

  static addSpacing(): void {
    // Unique ID for spacer
    const spacerId = `SPACER_${this.spacerCount++}`;
    this.updateItem(spacerId, "");
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
      
      if (label.startsWith("SPACER_")) {
        // Calculate how many "=" needed to fill width
        const equalsWidth = textWidth("=");
        const availableWidth = windowWidth - (this.padding * 2);
        const equalsCount = Math.floor(availableWidth / equalsWidth);
        const equalsSigns = "=".repeat(equalsCount);
        
        text(equalsSigns, this.position.x + this.padding, yPos);
      }
      else {
        text(`${label}: ${value}`, this.position.x + this.padding, yPos);
      }
    });
    
    pop();

    DebugUI.updateDebugInfo();
  }

  static updateDebugInfo(): void {
    // this.updateItem("Mouse Grid", `[${Mouse.mousePosInGrid.x.toFixed(2)}, ${Mouse.mousePosInGrid.y.toFixed(2)}]`);
    // this.updateItem("Camera Scale", Camera.currentScaleFactor.toFixed(2));
    this.updateItem("Current Tool", `${Tool[selectedTool]}`);
    this.addSpacing();
    this.updateItem("Selected vertex", `${selectedVertex ? "Yes" : "None"}`);
    this.updateItem("Selected centroid", `${selectedCentroid ? "Yes" : "None"}`);
    this.updateItem("Selected Polygon", selectedPolygon?.id || "None");
    this.addSpacing();
    this.updateItem("Polygons Count", polygonsList.length);
    this.updateItem("Snap to Grid", Keyboard.isShiftPressed ? "OFF" : "ON");
    
    if (selectedPolygon) {
      this.updateItem("Rotation Rad", selectedPolygon.getRotationInRadians().toFixed(2));
      this.updateItem("Rotation Deg", selectedPolygon.getRotationInDegrees().toFixed(1));
    } else {
      this.updateItem("Rotation Rad", "-");
      this.updateItem("Rotation Deg", "-");
    }
    
    // Animation info if Animation tool is selected
    if (selectedTool === Tool.ANIMATION) {
      this.addSpacing();
      this.updateItem("Animation Frame", PolygonAnimation.currentFrame);
      this.updateItem("Animation Status", PolygonAnimation.isPlaying ? "Playing" : "Paused");
      
      if (selectedPolygon) {
        const keyframeCount = PolygonAnimation.getPolygonKeyframes(selectedPolygon.id).length;
        this.updateItem("Polygon Keyframes", keyframeCount);
      }
    }

//     // Memory stuff (Chrome only)
//     if (window.performance && (performance as any).memory) {
//       const memoryInfo = (performance as any).memory;
//       const usedHeapSize = (memoryInfo.usedJSHeapSize / 1048576).toFixed(2);
//       const totalHeapSize = (memoryInfo.totalJSHeapSize / 1048576).toFixed(2);
//       this.updateItem("Used Heap", `${usedHeapSize}MB`);
//       this.updateItem("Total Heap", `${totalHeapSize}MB`);
//     }
// 
//     // FPS
//     this.updateItem("FPS", frameRate().toFixed(0));
    
    this.spacerCount = 0;
  }
}