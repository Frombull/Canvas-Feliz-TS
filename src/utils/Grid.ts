class Grid {
  static gridLineWidth: number = 0.1;
  static gridSize: number = 5;

  static drawGrid() {
    if(!SidePanel.shouldDrawGrid) return;

    push();
    strokeWeight(this.gridLineWidth);
    stroke(Colors.gridLineColor);
  
    // How many grid lines needed based on current view
    let leftEdge = -Mouse.panX / Camera.scaleFactor;
    let rightEdge = (width - Mouse.panX) / Camera.scaleFactor;
    let topEdge = -Mouse.panY / Camera.scaleFactor;
    let bottomEdge = (height - Mouse.panY) / Camera.scaleFactor;
  
    // Round to nearest grid line
    let startX = Math.floor(leftEdge / this.gridSize) * this.gridSize;
    let endX = Math.ceil(rightEdge / this.gridSize) * this.gridSize;
    let startY = Math.floor(topEdge / this.gridSize) * this.gridSize;
    let endY = Math.ceil(bottomEdge / this.gridSize) * this.gridSize;
  
    // Vertical grid lines
    for (let x = startX; x <= endX; x += this.gridSize) {
      line(x, startY, x, endY);
    }
  
    // Horizontal grid lines
    for (let y = startY; y <= endY; y += this.gridSize) {
      line(startX, y, endX, y);
    }
    pop();
  }

  static drawCartesianPlaneAxis() {
    if (!SidePanel.shouldDrawAxis) return;

    push();
    strokeWeight(1);
    stroke(Colors.Red);
    line(-5000, 0, width + 5000, 0);
    stroke(Colors.Blue);
    line(0, -5000, 0, height + 5000);
    pop();
  }
}

