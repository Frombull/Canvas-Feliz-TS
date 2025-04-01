class CreatePolygon {
  public static tempPolygon: { x: number; y: number }[] = [];


  public static drawPolygonBeingCreated() {
    push();
  
    const mousePos = Mouse.getMousePosForTransform();
  
    // Draw filled shape up to current points
    if (CreatePolygon.tempPolygon.length > 0) {
      stroke(Colors.edgeColor);
      strokeJoin(ROUND);
      strokeWeight(Polygon.edgeWidth);
      fill(Colors.PolygonBlue);
      
      // Dashed line start
      drawingContext.setLineDash([3, 1.5]);
      
      beginShape();
      for (let p of CreatePolygon.tempPolygon) {
        vertex(p.x, p.y);
      }
      vertex(mousePos.x, mousePos.y);
      endShape();
  
      // Dashed line end
      drawingContext.setLineDash([]);
  
      // Draw each vertex of tempPolygon
      if (SidePanel.shouldDrawVertices) {
        noStroke();
        fill(Colors.vertexColor);
        for(let v of CreatePolygon.tempPolygon) {
          ellipse(v.x, v.y, Polygon.normalVertexRadius);
        }
      }
  
      // Draw red circle around first vertex
      noFill();
      stroke(Colors.Red);
      strokeWeight(0.2);
      ellipse(CreatePolygon.tempPolygon[0].x, CreatePolygon.tempPolygon[0].y, Polygon.normalVertexRadius);
    }
  
    // Draw circle around first vertex when you're about to close the polygon
    if (CreatePolygon.tempPolygon.length > 2 && Mouse.isCloseToFirstVertex()) {
      noFill();
      stroke(Colors.Red);
      strokeWeight(0.4);
      ellipse(CreatePolygon.tempPolygon[0].x, CreatePolygon.tempPolygon[0].y, Polygon.normalVertexRadius * 2);
      
      const mousePos = {x: CreatePolygon.tempPolygon[0].x, y: CreatePolygon.tempPolygon[0].y};
      vertex(mousePos.x, mousePos.y);
    } 
    else {
      const mousePos = Mouse.getMousePosForTransform();
      vertex(mousePos.x, mousePos.y);
    }
  
    pop();
  
    CreatePolygon.drawCircleOnMouse(Colors.GrayWithAlpha, mousePos);
    drawCoordinatesOnMouse();
  }

  private static drawCircleOnMouse(circleColor: any, mousePos: Vertex) {
    push();
    fill(circleColor);
    noStroke();
    ellipse(mousePos.x, mousePos.y, Polygon.normalVertexRadius);
    pop();
  }

  public static cancelPolygonCreation() {
    CreatePolygon.tempPolygon = [];
  }
}