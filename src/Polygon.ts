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

  // Private properties
  private history: Vertex[][];
  private redoHistory: Vertex[][];
  private rotationInRadians: number;   // Polygon rotation in radians
  private scale: {x: number, y: number};   // Polygon scale
  
  // Instance properties
  public readonly id: number;
  
  // Vertex data
  public vertices: Vertex[];
  public initialShape: Vertex[];
  public hoveredVertex: Vertex | null = null;
  public hoveredCenter: boolean = false;

  // Color properties
  public vertexColor: any;
  public edgeColor: any;
  public fillColor: any;


  constructor(initialVertices: Vertex[] = []) {
    this.id = Polygon.nextId++;
    
    // Set color stuff
    this.vertexColor = Colors.vertexColor;
    this.edgeColor = Colors.edgeColor;
    this.fillColor = Colors.PolygonBlue;
    
    // Deep copy vertices
    this.vertices = this.copyVertices(initialVertices);
    this.initialShape = this.copyVertices(initialVertices);
    
    // Set history stuff
    this.history = [];
    this.redoHistory = [];

    // Set transform stuff
    this.rotationInRadians = 0;
    this.scale = {x: 1, y: 1};
  }

  public copyVertices(vertices: Vertex[]): Vertex[] {
    return vertices.map(p => ({x: p.x, y: p.y}));
  }

  public drawPolygon() {
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
    
    if (SidePanel.shouldDrawVertices) {
      this.drawVertices();
    }
    
    if (selectedPolygon === this) {
      this.drawPolygonCenter();
    }
    pop();
  }

  public getCenter(): Vertex { //TODO: Make prive so I start using the fucking selectedCentroid instead
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

  public drawPolygonCenter() {
    const center = this.getCenter();
    const radius = this.hoveredCenter ? Polygon.hoveredVertexRadius : Polygon.normalVertexRadius;

    push();
    strokeWeight(0.3);
    stroke(0);
    noFill();
    ellipse(center.x, center.y, radius);
    pop();
  }

  public drawVertices() {
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

  public resetPolygon() {
    this.vertices = this.copyVertices(this.initialShape);
    selectedVertex = null;
    selectedCentroid = null;
    Rotate.resetRotationGizmo();
    this.rotationInRadians = 0;
    this.scale = {x: 1, y: 1};
  }

  public setAsSelectePolygon() {
    // Clear if theres a selected vertex that isnt from this polygon
    if (selectedVertex && !Transform.isVertexInPolygon(selectedVertex, this)) {
      selectedVertex = null;
    }

    // If had a selected centroid, keep the selected centroid of new polygon
    if (selectedCentroid) {
      selectedCentroid = this.getCenter();
    }
    
    selectedPolygon = this;
    console.log(`Selected polygon ${this.id}`);
    ColorPickerUI.setColor(this.fillColor);

    // Load rotation angle when selecting
    Rotate.loadPolygonRotation();
  }

  public deleteVertex(targetVertex: Vertex) {
    if (this.vertices.length <= 3) {
      return; // Maintain minimum triangle
    }
    
    const index = this.vertices.indexOf(targetVertex);
    
    if (index !== -1) {
      this.vertices.splice(index, 1);
      selectedVertex = null;
    }
  }

  public deleteSelf() {
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

  public saveState() {
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

  public recordAction(oldVertices: Vertex[]) {
    const action = new ModifyPolygonAction(this, oldVertices);
    HistoryManager.getInstance().addAction(action);
  }

  public saveStateBeforeChange(): Vertex[] {
    return this.copyVertices(this.vertices);
  }

  public getRotationInDegrees(): number {
    return degrees(this.rotationInRadians);
  }

  public getRotationInRadians(): number {
    return this.rotationInRadians;
  }

  public setRotationInRadians(newAngleInRadians: number) {
    // Skip if angle is the same
    if (this.rotationInRadians === newAngleInRadians) return;
  
    // // Apply snapping if shift NOT pressed
    // if (!Keyboard.isShiftPressed) {
    //   // Convert to degrees, round, convert back
    //   let angleDegrees = degrees(newAngleInRadians);
    //   angleDegrees = Math.round(angleDegrees);
    //   newAngleInRadians = radians(angleDegrees);
    // }
  
    // Get rotation center
    const center = selectedVertex || selectedCentroid;
    if (!center) return;
    
    // Apply rotation
    let deltaAngle = newAngleInRadians - this.rotationInRadians;
    
    for (let vertex of this.vertices) {
      // Skip if its the selected vertex (pivot)
      if (selectedVertex && vertex === selectedVertex) continue;
      
      // Translate point to origin
      let x = vertex.x - center.x;
      let y = vertex.y - center.y;
      
      // Rotate point
      let newX = x * cos(deltaAngle) - y * sin(deltaAngle);
      let newY = x * sin(deltaAngle) + y * cos(deltaAngle);
      
      // Translate point back
      vertex.x = newX + center.x;
      vertex.y = newY + center.y;
    }
    
    // Update stored angle
    this.rotationInRadians = newAngleInRadians;
  }

  public getScale(): { x: number; y: number; } {
    return this.scale;
  }
  
  public setScale(newScale: { x: number; y: number; }) {
    this.scale = newScale;
  }
}
