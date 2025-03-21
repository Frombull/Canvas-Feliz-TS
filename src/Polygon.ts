interface Vertex {
  x: number;
  y: number;
}

class Polygon {
  // Static properties
  private static nextId: number = 1;
  public static normalVertexRadius: number = 3;
  public static hoveredVertexRadius: number = 3.5;
  public static edgeWidth: number = 0.8;
  
  // Instance properties
  public readonly id: number;
  
  // Vertex data
  public vertices: Vertex[];
  public initialShape: Vertex[];
  public hoveredVertex: Vertex | null = null;
  public hoveredCenter: boolean = false;
  
  // History management
  private history: Vertex[][];
  private redoHistory: Vertex[][];

  public rotationAngle: number = 0;
  public vertexColor: any;
  public edgeColor: any;
  public fillColor: any;


  constructor(initialVertices: Vertex[] = []) {
    this.id = Polygon.nextId++;
    
    this.vertexColor = Colors.vertexColor;
    this.edgeColor = Colors.edgeColor;
    this.fillColor = Colors.PolygonBlue;
    
    // Deep copy vertices
    this.vertices = this.copyVertices(initialVertices);
    this.initialShape = this.copyVertices(initialVertices);
    
    this.history = [];
    this.redoHistory = [];
  }

  private copyVertices(vertices: Vertex[]): Vertex[] {
    return vertices.map(p => ({x: p.x, y: p.y}));
  }

  public drawPolygon(): void {
    push();
    stroke(this.edgeColor);
    strokeWeight(Polygon.edgeWidth);
    strokeJoin(ROUND);
    fill(this.fillColor);
    
    beginShape();
    for (const p of this.vertices) {
      vertex(p.x, p.y);
    }
    endShape(CLOSE);
    
    if (SidePanel.shouldDrawVertexBalls) {
      this.drawVertices();
    }
    
    if (selectedPolygon === this) {
      this.drawPolygonCenter();
    }
    pop();
  }

  public getCenter(): Vertex {
    if (this.vertices.length === 0) {
      return { x: 0, y: 0 };
    }    
    const sumX = this.vertices.reduce((sum, v) => sum + v.x, 0);
    const sumY = this.vertices.reduce((sum, v) => sum + v.y, 0);
    const count = this.vertices.length;

    return {
      x: sumX / count,
      y: sumY / count
    };
  }

  public drawPolygonCenter(): void {
    const center = this.getCenter();
    const radius = this.hoveredCenter ? Polygon.hoveredVertexRadius : Polygon.normalVertexRadius;

    push();
    strokeWeight(0.3);
    stroke(0);
    noFill();
    ellipse(center.x, center.y, radius);
    pop();
  }

  public drawVertices(): void {
    if (selectedPolygon !== this) return;

    push();
    noStroke();
    for (const p of this.vertices) {
      const isHovered = this.hoveredVertex === p;
      const radius = isHovered ? Polygon.hoveredVertexRadius : Polygon.normalVertexRadius;
      
      fill(isHovered ? Colors.vertexHoverColor : this.vertexColor);
      ellipse(p.x, p.y, radius, radius);
    }
    pop();
  }

  public resetPolygon(): void {
    this.vertices = this.copyVertices(this.initialShape);
    selectedVertex = null;
    selectedCentroid = null;
    this.rotationAngle = 0;
    this.fillColor = Colors.PolygonBlue;
  }

  public setAsSelectePolygon(): void {
    // Clear if theres a selected vertex that isnt from this polygon
    if (selectedVertex && !Transform.isVertexInPolygon(selectedVertex, this)) {
      selectedVertex = null;
    }

    Rotate.resetAngle();
    
    selectedPolygon = this;
    console.log(`Selected polygon ${this.id}`);
    ColorPickerUI.setColor(this.fillColor);

    // Load rotation angle when selecting
    Rotate.loadPolygonRotation();
  }

  public deleteVertex(targetVertex: Vertex): void {
    if (this.vertices.length <= 3) {
      return; // Maintain minimum triangle
    }
    
    const index = this.vertices.indexOf(targetVertex);
    
    if (index !== -1) {
      this.vertices.splice(index, 1);
      selectedVertex = null;
    }
  }

  public deleteSelf(): void {
    if (selectedPolygon !== this) {
      return;
    }
    
    const action = new DeletePolygonAction(this);
    HistoryManager.getInstance().addAction(action);
    
    selectedPolygon = null;
    selectedVertex = null;
  
    const index = polygonsList.indexOf(this);
    if (index !== -1) {
      polygonsList.splice(index, 1);
    }
  }

  public saveState(): void {
    // Create a deep copy of current vertices
    const oldVertices = this.copyVertices(this.vertices);
    this.history.push(oldVertices);
    
    // Clear redo history when a new state is saved
    this.redoHistory = [];
    
    // Limit history size
    const MAX_HISTORY = 50;
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
  }

  public recordAction(oldVertices: Vertex[]): void {
    const action = new ModifyPolygonAction(this, oldVertices);
    HistoryManager.getInstance().addAction(action);
  }

  public saveStateBeforeChange(): Vertex[] {
    return this.copyVertices(this.vertices);
  }

  public updateRotationAngle(degrees: number): void {
    this.rotationAngle = degrees;
    console.log(`Updated polygon ${this.id} rotation to ${this.rotationAngle}°`);
  }
}