class Polygon {
  public vertices: Vertex[];
  private history: Vertex[][];
  private redoHistory: Vertex[][];
  static vertexBallRadius: number = 3;
  static selectedVertex: Vertex | null;           // Selected vertex for transformation
  static selectedCentroid: Vertex | null;         // Selected centroid for transformation
  // ID
  private static nextId: number = 1;              // ID start in 1
  public id: number;
  // Color
  public vertexColor: any;
  public edgesColor: any;
  public fillColor: any;
  // Rotation
  public rotationAngle: number = 0; // Store rotation for the Rotate tool


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
    strokeWeight(0.3);
    stroke(0);
    noFill();
    fill(Colors.PolygonBlue);
    ellipse(center.x, center.y, 3);
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
    console.log("resetPolygon # T O D O");
    // if (lastCompletePolygon.length > 0) {
    //   polygon = lastCompletePolygon.map(p => ({x: p.x, y: p.y}));
    //   selectedVertex = null;
    //   selectedCentroid = null;
    // }
  }

  setAsSelectePolygon() {
    // Clar if has a selected vertex that isnt from this polygon
    if (selectedVertex && !Transform.isVertexInPolygon(selectedVertex, this)) {
      selectedVertex = null;
    }

    Rotate.resetAngle();
    
    selectedPolygon = this;
    console.log(`Selected polygon ${this.id}`);
    SidePanel.colorPicker.color.rgbaString = this.fillColor;

    // Load rotation angle when selecting
    Rotate.loadPolygonRotation();
  }

  deleteVertex(targetVertex: Vertex) {
    if (this.vertices.length <= 3) return;
    
    let index = this.vertices.indexOf(targetVertex);
    
    if (index != -1) {
      this.vertices.splice(index, 1);
      selectedVertex = null;
    }
  }

  deleteSelf() {
    if (selectedPolygon != this) return;
    
    const action = new DeletePolygonAction(this);
    HistoryManager.getInstance().addAction(action);
    
    selectedPolygon = null;
    selectedVertex = null;
  
    let index = polygonsList.indexOf(this);
    if (index != -1) {
      polygonsList.splice(index, 1);
    }
  }

  public saveState(): void {
    // Create a deep copy of current vertices
    const oldVertices = this.vertices.map(v => ({x: v.x, y: v.y}));
    this.history.push(oldVertices);
    
    // Clear redo history when a new state is saved
    this.redoHistory = [];
    
    // Limit history size
    if (this.history.length > 50) {
      this.history.shift();
    }
  }

  public recordAction(oldVertices: Vertex[]): void {
    const action = new ModifyPolygonAction(this, oldVertices);
    HistoryManager.getInstance().addAction(action);
  }

  public saveStateBeforeChange(): Vertex[] {
    return this.vertices.map(v => ({x: v.x, y: v.y}));
  }

  public updateRotationAngle(degrees: number) {
    this.rotationAngle = degrees;
    console.log(`Updated polygon ${this.id} rotation to ${this.rotationAngle}°`);
  }
}

interface Vertex {
  x: number;
  y: number;
}