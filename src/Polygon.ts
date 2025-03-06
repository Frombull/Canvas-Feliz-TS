// class Polygon {
//   private vertices: Vertex[];
//   private history: Vertex[][];
//   private redoHistory: Vertex[][];
// 
//   constructor(initialVertices: Vertex[] = []) {
//     this.vertices = initialVertices;
//     this.history = [];
//     this.redoHistory = [];
//   }
// 
//   getCenter(): Vertex {
//     if (this.vertices.length === 0) {
//       return { x: 0, y: 0 };
//     }
// 
//     const sumX = this.vertices.reduce((sum, v) => sum + v.x, 0);
//     const sumY = this.vertices.reduce((sum, v) => sum + v.y, 0);
// 
//     return {
//       x: sumX / this.vertices.length,
//       y: sumY / this.vertices.length
//     };
//   }
// 
// }
// 
// interface Vertex {
//   x: number;
//   y: number;
// }