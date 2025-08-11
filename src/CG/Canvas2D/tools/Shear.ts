class Shear {
  static ShearUniform() {
    if (!selectedPolygon) return;
    console.log("Shear Uniform");
    
    let S = 0.3;
    for (let p of selectedPolygon.vertices) {
      let originalX = p.x;
      let originalY = p.y;
      p.x += S * originalY;
      p.y += S * originalX;
    }
  
    Transform.drawTransformGizmo();
  }
  
  static ShearNonUniform() {
    if(!selectedPolygon) return;
    console.log("Shear Non Uniform");
    
    let R = 0.1;
    let S = 0.3;
    for (let p of selectedPolygon.vertices) {
      let originalX = p.x;
      let originalY = p.y;
      p.x += R * originalY;
      p.y += S * originalX;
    }
  }
}