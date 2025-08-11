// Bottom left text with infos from current tool.

class ToolInfo {
  static drawSnapToGridInfo() {
    push();
    resetMatrix();
    
    fill(0, 0, 0, 220);
    noStroke();
    textSize(16);
    textAlign(LEFT, BOTTOM);
    if (Keyboard.isShiftPressed) {
      text("SNAP-TO-GRID: OFF ", 10, height - 10);
    }
    else {
      text("SNAP-TO-GRID: ON", 10, height - 10);
    }
  
    pop();
  }

  static drawSnapRotationInfo() {
    push();
    resetMatrix();
    
    fill(0, 0, 0, 220);
    noStroke();
    textSize(16);
    textAlign(LEFT, BOTTOM);
    if (Keyboard.isShiftPressed) {
      text("ROTATION-ANGLE: 1° ", 10, height - 10);
    }
    else {
      text("ROTATION-ANGLE: 15°", 10, height - 10);
    }
  
    pop();
  }
}