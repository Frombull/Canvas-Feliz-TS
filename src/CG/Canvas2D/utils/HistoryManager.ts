class HistoryManager {
  private static instance: HistoryManager;
  private undoStack: Action[] = [];
  private redoStack: Action[] = [];
  private maxHistorySize: number = 50;

  // Private constructor for singleton
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): HistoryManager {
    if (!HistoryManager.instance) {
      HistoryManager.instance = new HistoryManager();
    }
    return HistoryManager.instance;
  }

  // Add a new action to the history
  public addAction(action: Action): void {
    this.undoStack.push(action);
    // Clear redo stack when a new action is performed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift(); // Remove oldest action
    }
  }

  // Undo last action
  public undo(): void {
    if (this.undoStack.length === 0) return;
    
    const action = this.undoStack.pop()!;
    action.undo();
    this.redoStack.push(action);
  }

  // Redo last undone action
  public redo(): void {
    if (this.redoStack.length === 0) return;
    
    const action = this.redoStack.pop()!;
    action.redo();
    this.undoStack.push(action);
  }

  // Check if we can undo
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  // Check if we can redo
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}

interface Action {
  undo(): void;
  redo(): void;
}

// Action for polygon creation
class CreatePolygonAction implements Action {
  private polygon: Polygon;
  private index: number;

  constructor(polygon: Polygon) {
    this.polygon = polygon;
    this.index = polygonsList.indexOf(polygon);
  }

  undo(): void {
    // Remove polygon from list
    const index = polygonsList.indexOf(this.polygon);
    if (index !== -1) {
      polygonsList.splice(index, 1);
    }
    
    // Update selected polygon if needed
    if (selectedPolygon === this.polygon) {
      selectedPolygon = null;
      selectedVertex = null;
      selectedCentroid = null;
    }
  }

  redo(): void {
    // Add polygon back
    polygonsList.splice(this.index, 0, this.polygon);
    
    // Select polygon
    this.polygon.setAsSelectePolygon();
  }
}

// Action for polygon modification (transform, scale, rotate, etc.)
class ModifyPolygonAction implements Action {
  private polygon: Polygon;
  private oldVertices: Vertex[];
  private newVertices: Vertex[];

  constructor(polygon: Polygon, oldVertices: Vertex[]) {
    this.polygon = polygon;
    // Deep copy the vertices to preserve the state
    this.oldVertices = oldVertices.map(v => ({x: v.x, y: v.y}));
    this.newVertices = polygon.vertices.map(v => ({x: v.x, y: v.y}));
  }

  undo(): void {
    // Restore old vertices
    this.polygon.vertices = this.oldVertices.map(v => ({x: v.x, y: v.y}));
    
    // Update the UI if this polygon is selected
    if (selectedPolygon === this.polygon) {
      selectedVertex = null;
      selectedCentroid = null;
    }
  }

  redo(): void {
    // Apply new vertices
    this.polygon.vertices = this.newVertices.map(v => ({x: v.x, y: v.y}));
    
    // Update UI if this polygon is selected
    if (selectedPolygon === this.polygon) {
      selectedVertex = null;
      selectedCentroid = null;
    }
  }
}

// Action for vertex deletion
class DeleteVertexAction implements Action {
  private polygon: Polygon;
  private vertex: Vertex;
  private index: number;

  constructor(polygon: Polygon, vertex: Vertex) {
    this.polygon = polygon;
    this.vertex = {x: vertex.x, y: vertex.y}; // Copy vertex
    this.index = polygon.vertices.indexOf(vertex);
  }

  undo(): void {
    // Reinsert vertex at its original position
    this.polygon.vertices.splice(this.index, 0, this.vertex);
  }

  redo(): void {
    // Remove vertex again
    const vertices = this.polygon.vertices;
    const index = vertices.findIndex(v => v.x === this.vertex.x && v.y === this.vertex.y);
    if (index !== -1) {
      vertices.splice(index, 1);
    }
  }
}

// Action for polygon deletion
class DeletePolygonAction implements Action {
  private polygon: Polygon;
  private index: number;

  constructor(polygon: Polygon) {
    this.polygon = polygon;
    this.index = polygonsList.indexOf(polygon);
  }

  undo(): void {
    // Reinsert polygon
    polygonsList.splice(this.index, 0, this.polygon);
  }

  redo(): void {
    // Remove polygon again
    const index = polygonsList.indexOf(this.polygon);
    if (index !== -1) {
      polygonsList.splice(index, 1);
    }
    
    // Update selected polygon if needed
    if (selectedPolygon === this.polygon) {
      selectedPolygon = null;
      selectedVertex = null;
      selectedCentroid = null;
    }
  }
}
