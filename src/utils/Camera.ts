class Camera {
  public static currentScaleFactor: number = 8;     // Camera scale factor (zoom)
  public static minScaleFactor: number = 1;
  public static maxScaleFactor: number = 10;
  public static isPanning: boolean = false;

  static centerCamera() {
    Mouse.panX = width / 2;
    Mouse.panY = height / 2;
  }
  
  static startPanning() {
    Camera.isPanning = true;
    Mouse.lastMouseX = mouseX;
    Mouse.lastMouseY = mouseY;
  }
  
  static stopPanning() {
    Camera.isPanning = false;
  }
  
  static panScreen() {
    if (Camera.isPanning) {
      Mouse.panX += mouseX - Mouse.lastMouseX;
      Mouse.panY += mouseY - Mouse.lastMouseY;
      Mouse.lastMouseX = mouseX;
      Mouse.lastMouseY = mouseY;
    }
  }
}