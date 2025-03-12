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

  static init() {
    Colors.Red = color(255, 30, 30);
    Colors.Green = color(30, 255, 30);
    Colors.Blue = color(30, 30, 255);
    Colors.Purple = color(150, 40, 210);
    Colors.Gray = color(150);
    Colors.Black = color(0);
    Colors.BackgroundColor = color(230);
    Colors.GizmoScaleColor = color(255, 100, 55);
    Colors.PolygonBlue = color(100, 100, 250, 100);
    Colors.rotationHandleColor = color(255, 165, 0);
  }
}