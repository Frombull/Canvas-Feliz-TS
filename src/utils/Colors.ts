class Colors {
  // Can't set as p5.Color because fuck me
  static Red: any;
  static Green: any;
  static Blue: any;
  static Purple: any;
  static Gray: any;
  static Black: any;
  static BackgroundColor: any;
  static GizmoScaleColor: any;
  static PolygonBlue: any;
  static rotationHandleColor: any;
  static orange: any ;
  // Curves
  static bezierLineColor: any ;
  static bezierControlPointColor: any;
  static bezierConnectingLinesColor: any;

  static init() {
    Colors.Red = color(250, 30, 30);
    Colors.Green = color(30, 250, 30);
    Colors.Blue = color(30, 30, 250);
    Colors.Purple = color(150, 40, 210);
    Colors.Gray = color(150);
    Colors.Black = color(0);
    Colors.BackgroundColor = color(230);
    Colors.GizmoScaleColor = color(250, 100, 55);
    Colors.PolygonBlue = color(100, 100, 250, 100);
    Colors.rotationHandleColor = color(250, 165, 0);
    Colors.orange = color(250, 69, 0);
    // Curves
    //Colors.bezierLineColor = color(106, 90, 205);
    Colors.bezierLineColor = color(255, 50, 50);
    Colors.bezierControlPointColor = color(60, 60, 60, 150);
    Colors.bezierConnectingLinesColor = color(80, 80, 80, 100);
  }
}