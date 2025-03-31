class Keyboard {
  static isShiftPressed: boolean = false;

  static keyPressed() {
    switch(key.toLowerCase()) {
      case 'n':                               // Create polygon
        selectedTool = Tool.CREATE_POLYGON;
        SidePanel.updateActiveButton();
        return;
      case 't':                               // Transform
        selectedTool = Tool.TRANSLATE;
        SidePanel.updateActiveButton();
        return;
      case 'r':                               // Rotate
        selectedTool = Tool.ROTATE;
        SidePanel.updateActiveButton();
        return;
      case 's':                               // Scale
        selectedTool = Tool.SCALE;
        SidePanel.updateActiveButton();
        return;
      case 'c':                               // Color palette
        ColorPickerUI.toggle();
        SidePanel.updateActiveButton();
        return;
    }

    switch (keyCode) {
      case ESCAPE:
        Keyboard.handleEscapeKey();
        break;
      
      case DELETE:
        Keyboard.handleDeleteKey();
        break;
      
      case SHIFT:
        Keyboard.isShiftPressed = true;
        break;
    }

    // CTRL+Z
    if (keyIsDown(CONTROL) && key === 'z') {
      Keyboard.handleUndo();
      return;
    }
  }

  static handleEscapeKey() {
    // If no tool is selected, also deselect polygon
    if (selectedTool == Tool.NONE) {
      selectedPolygon = null;
    }
    
    // Reset selection states
    selectedTool = Tool.NONE;
    tempPolygon = [];
    selectedVertex = null;
    selectedCentroid = null;
    
    // Update button visuals
    SidePanel.updateActiveButton();
  }

  static handleDeleteKey() {
    // Delete vertex if a vertex is selected
    if (selectedPolygon && selectedVertex) {
      const action = new DeleteVertexAction(selectedPolygon, selectedVertex);
      HistoryManager.getInstance().addAction(action);
      selectedPolygon.deleteVertex(selectedVertex);
    }
    // Delete polygon if centroid is selected but no vertex
    else if (selectedPolygon && !selectedVertex && selectedCentroid) {
      const action = new DeletePolygonAction(selectedPolygon);
      HistoryManager.getInstance().addAction(action);
      selectedPolygon.deleteSelf();
    }
  }

  static handleUndo() {
    HistoryManager.getInstance().undo();
  }

  static keyReleased() {
    // SHIFT KEY released
    if (keyCode === SHIFT) {
      Keyboard.isShiftPressed = false;
    }
  }
}