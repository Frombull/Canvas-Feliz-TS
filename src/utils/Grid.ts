export class Grid {
  static gridLineWidth: number = 0.1;
  static gridLineColor: number = 200;
  static gridSize: number = 5;

  static drawGrid(panX: number, panY: number, scaleFactor: number) {
    console.log("DRAW GRID!!");
    
    strokeWeight(this.gridLineWidth);
    stroke(this.gridLineColor);
  
    // How many grid lines needed based on current view
    let leftEdge = -panX / scaleFactor;
    let rightEdge = (width - panX) / scaleFactor;
    let topEdge = -panY / scaleFactor;
    let bottomEdge = (height - panY) / scaleFactor;
  
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
  }
}

