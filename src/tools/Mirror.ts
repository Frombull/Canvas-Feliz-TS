class Mirror {
  static mirror(axis: 'x' | 'y') {
    if(!selectedPolygon) return;
    for (let p of selectedPolygon.vertices) {
      p[axis] *= -1;
    }
  }
}