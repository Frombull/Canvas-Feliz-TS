class Camera {
  static centerCamera() {
    panX = width / 2;
    panY = height / 2;
  }
  
  static startPanning() {
    isPanning = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
  
  static stopPanning() {
    isPanning = false;
  }
  
  static panScreen() {
    if (isPanning) {
      panX += mouseX - lastMouseX;
      panY += mouseY - lastMouseY;
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    }
  }
}