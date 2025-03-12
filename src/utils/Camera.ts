class Camera {
  static scaleFactor: number = 5;     // Camera scale factor (zoom)

  static centerCamera() {
    Mouse.panX = width / 2;
    Mouse.panY = height / 2;
  }
  
  static startPanning() {
    Mouse.isPanning = true;
    Mouse.lastMouseX = mouseX;
    Mouse.lastMouseY = mouseY;
  }
  
  static stopPanning() {
    Mouse.isPanning = false;
  }
  
  static panScreen() {
    if (Mouse.isPanning) {
      Mouse.panX += mouseX - Mouse.lastMouseX;
      Mouse.panY += mouseY - Mouse.lastMouseY;
      Mouse.lastMouseX = mouseX;
      Mouse.lastMouseY = mouseY;
    }
  }
}