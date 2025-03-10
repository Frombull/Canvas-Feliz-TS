class Polygon {
  public vertices: Vertex[];
  private history: Vertex[][];
  private redoHistory: Vertex[][];

  // Polygon ID
  private static nextId: number = 1; // Começa com 1
  public id: number;

  static selectedVertex: {x: number, y: number} | null;          // Selected vertex for transformation
  static selectedCentroid: {x: any, y: any} | null;              // Selected centroid for transformation

  constructor(initialVertices: Vertex[] = []) {
    this.id = Polygon.nextId++;
    this.vertices = initialVertices;
    this.history = [];
    this.redoHistory = [];
  }

  drawPolygon() {
    if (this.vertices.length < 3) return;

    push();
    stroke(0);
    strokeWeight(1);
    strokeJoin(ROUND);
    fill(100, 100, 250, 100);

    beginShape();
    for (let p of this.vertices) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);

    if (SidePanel.shouldDrawVertexBalls) {
      this.drawVertexBalls();
    }

    if (selectedPolygon == this) {
      this.drawPolygonCenter();
    }
    pop();
  }

  getCenter(): Vertex {
    if (this.vertices.length === 0) {
      return { x: 0, y: 0 };
    }

    const sumX = this.vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = this.vertices.reduce((sum, v) => sum + v.y, 0);

    return {
      x: sumX / this.vertices.length,
      y: sumY / this.vertices.length
    };
  }

  drawPolygonCenter() {
    if (this.vertices.length < 3) return;

    let center = this.getCenter();
    strokeWeight(0.3);
    fill(colors.Blue);
    ellipse(center.x, center.y, 3, 3);
  }

  drawVertexBalls() {
    push();
    fill(0);
    noStroke();
    for (let p of this.vertices) {
      ellipse(p.x, p.y, vertexBallRadius, vertexBallRadius);
    }
    pop();
  }

  resetPolygon() { // TODO
    // if (lastCompletePolygon.length > 0) {
    //   polygon = lastCompletePolygon.map(p => ({x: p.x, y: p.y}));
    //   selectedVertex = null;
    //   selectedCentroid = null;
    // }
  }

}

interface Vertex {
  x: number;
  y: number;
}