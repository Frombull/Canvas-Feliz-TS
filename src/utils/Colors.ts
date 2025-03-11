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
  }

  static rgbToHex(color: any) {
    // Check if the color is already a hex string
    if (typeof color === 'string' && color.startsWith('#') && color.length === 7) {
      return color; // Return the hex color as is
    }

    let c = color.levels;
    return "#" + 
      c[0].toString(16).padStart(2, "0") + 
      c[1].toString(16).padStart(2, "0") + 
      c[2].toString(16).padStart(2, "0");
  }
}