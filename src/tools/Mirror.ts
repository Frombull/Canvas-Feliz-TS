class Mirror {
  static mirror(axis: 'x' | 'y') {
    for (let p of polygon) {
      p[axis] *= -1;
    }
  
    if (selectedCentroid)
      selectedCentroid = getPolygonCenter();
  }
}