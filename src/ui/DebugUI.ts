class DebugUI {
  // Lista de itens para mostrar no debug
  private static debugItems: Array<{label: string, value: any}> = [];
  private static position = { x: 10, y: 10 };
  private static padding = 10;
  private static lineHeight = 20;


  /**
   * Add/update an item in debug list
   * @param label Nome do item a mostrar
   * @param value Valor a mostrar
   */
  static addItem(label: string, value: any): void {
    const existingIndex = this.debugItems.findIndex(item => item.label === label);
    
    if (existingIndex >= 0) {
      this.debugItems[existingIndex].value = value;
    } else {
      this.debugItems.push({ label, value });
    }
  }
  
  static removeItem(label: string): void {
    const index = this.debugItems.findIndex(item => item.label === label);
    if (index >= 0) {
      this.debugItems.splice(index, 1);
    }
  }

  static clearItems(): void {
    this.debugItems = [];
  }

  static drawDebugWindow(): void {
    if (!SidePanel.shouldDrawDebugWindow) return;
    
    push(); 
    resetMatrix();
    
    textSize(14);
    textAlign(LEFT, TOP);
    
    let maxWidth = 0;
    for (const item of this.debugItems) {
      const textContent = `${item.label}: ${item.value}`;
      const width = textWidth(textContent);
      maxWidth = Math.max(maxWidth, width);
    }
    
    const windowWidth = maxWidth + this.padding * 2;
    const windowHeight = this.debugItems.length * this.lineHeight + this.padding * 2;
    
    // Background
    fill(0, 0, 0, 180);
    stroke(255);
    strokeWeight(1);
    rect(this.position.x, this.position.y, windowWidth, windowHeight, 5);
    
    // Items
    fill(255);
    noStroke();
    
    for (let i = 0; i < this.debugItems.length; i++) {
      const item = this.debugItems[i];
      const yPos = this.position.y + this.padding + i * this.lineHeight;
      text(`${item.label}: ${item.value}`, this.position.x + this.padding, yPos);
    }
    
    pop();
  }

  static updateCommonDebugInfo(): void {
    this.addItem("Mouse Grid", `[${Mouse.mousePosInGrid.x.toFixed(2)}, ${Mouse.mousePosInGrid.y.toFixed(2)}]`);
    this.addItem("Mouse Snapped", `[${Mouse.mousePosInGridSnapped.x}, ${Mouse.mousePosInGridSnapped.y}]`);
    this.addItem("Mouse in Cartesian", `[${Mouse.mousePosInCartesianPlane.x}, ${Mouse.mousePosInCartesianPlane.y}]`);
    this.addItem("Camera Scale", Camera.scaleFactor.toFixed(2));
    this.addItem("Panning", `${Camera.isPanning}`);
    this.addItem("Current Tool", `${Tool[selectedTool]}`);
    this.addItem("Polygons Count", polygonsList.length);
    this.addItem("Selected Polygon", selectedPolygon?.id || "None");
    
    // Scale stuff
    if (Scale.scaleStartPos.x && Scale.scaleStartPos.y) {
      this.addItem("Scale Start", `[${Scale.scaleStartPos.x.toFixed(2)}, ${Scale.scaleStartPos.y.toFixed(2)}]`);
    }
    if (Scale.currentScale.x && Scale.currentScale.y) {
      this.addItem("Current Scale", `[${Scale.currentScale.x.toFixed(2)}, ${Scale.currentScale.y.toFixed(2)}]`);
    }

    // Memory (Chrome only)
    if (window.performance && (performance as any).memory) {
      const memoryInfo = (performance as any).memory;
      const usedHeapSize = (memoryInfo.usedJSHeapSize / 1048576).toFixed(2);
      const totalHeapSize = (memoryInfo.totalJSHeapSize / 1048576).toFixed(2);
      this.addItem("Used Heap", `${usedHeapSize}MB`);
      this.addItem("Total Heap", `${totalHeapSize}MB`);
    }
    
    this.addItem("FPS", frameRate().toFixed(1));
  }
}
