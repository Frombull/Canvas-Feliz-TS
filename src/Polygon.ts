class Polygon {
  public vertices: Vertex[];
  private history: Vertex[][];
  private redoHistory: Vertex[][];
  static vertexBallRadius: number = 3;
  static selectedVertex: Vertex | null;          // Selected vertex for transformation
  static selectedCentroid: Vertex | null;        // Selected centroid for transformation
  // ID
  private static nextId: number = 1; // ID start in 1
  public id: number;
  // Color
  public vertexColor: any;
  public edgesColor: any;
  public fillColor: any;


  constructor(initialVertices: Vertex[] = []) {
    this.id = Polygon.nextId++;

    this.vertexColor = Colors.Black;
    this.edgesColor = Colors.Black;
    this.fillColor = Colors.PolygonBlue;

    this.vertices = initialVertices;
    this.history = [];
    this.redoHistory = [];
  }

  drawPolygon() {
    push();
    stroke(0);
    strokeWeight(1);
    strokeJoin(ROUND);
    fill(this.fillColor);

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
    const sumX = this.vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = this.vertices.reduce((sum, v) => sum + v.y, 0);

    return {
      x: sumX / this.vertices.length,
      y: sumY / this.vertices.length
    };
  }

  drawPolygonCenter() {
    let center = this.getCenter();
    push();
    strokeWeight(0.2);
    stroke(0);
    fill(Colors.Blue);
    ellipse(center.x, center.y, 3, 3);
    pop();
  }

  drawVertexBalls() {
    push();
    fill(this.vertexColor);
    noStroke();
    for (let p of this.vertices) {
      ellipse(p.x, p.y, Polygon.vertexBallRadius, Polygon.vertexBallRadius);
    }
    pop();
  }

  resetPolygon() { // TODO
    console.log("resetPolygon");
    // if (lastCompletePolygon.length > 0) {
    //   polygon = lastCompletePolygon.map(p => ({x: p.x, y: p.y}));
    //   selectedVertex = null;
    //   selectedCentroid = null;
    // }
  }

  setAsSelectePolygon() {
    selectedPolygon = this;
    console.log(`Selected polygon ${this.id}`);
    SidePanel.colorPicker.color.rgbaString = this.fillColor;
  }
}

interface Vertex {
  x: number;
  y: number;
}