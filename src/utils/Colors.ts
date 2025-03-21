class Colors {
  // Can't set as p5.Color because f*ck me
  static Red: any;
  static Green: any;
  static Blue: any;
  static Purple: any;
  static Gray: any;
  static GrayWithAlpha: any;
  static Black: any;
  static BackgroundColor: any;
  static GizmoScaleColor: any;
  static PolygonBlue: any;
  static rotationHandleColor: any;
  static orange: any;
  static bezierLineColor: any ;
  static bezierControlPointColor: any;
  static bezierConnectingLinesColor: any;
  static vertexColor: any;
  static vertexHoverColor: any;
  static edgeColor: any;
  static gridLineColor: any;

  static init() {
    Colors.Red = color(250, 30, 30);
    Colors.Green = color(30, 250, 30);
    Colors.Blue = color(30, 30, 250);
    Colors.Purple = color(150, 40, 210);
    Colors.Gray = color(150);
    Colors.GrayWithAlpha = color(30, 30, 30, 120);
    Colors.Black = color(0);
    Colors.BackgroundColor = color(230);
    Colors.GizmoScaleColor = color(250, 100, 55);
    Colors.PolygonBlue = color(100, 100, 250, 100);
    Colors.rotationHandleColor = color(250, 165, 0);
    Colors.orange = color(250, 69, 0);
    Colors.bezierLineColor = color(255, 50, 50);
    Colors.bezierControlPointColor = color(60, 60, 60);
    Colors.bezierConnectingLinesColor = color(80, 80, 80, 100);
    Colors.vertexColor = color(10, 10, 10, 180);
    Colors.vertexHoverColor = color(10, 10, 10, 180);
    Colors.edgeColor = color(10, 10, 10, 200);
    Colors.gridLineColor = color(200);
  }
}