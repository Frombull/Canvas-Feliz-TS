class Keyboard {
  static isShiftPressed: boolean = false;

  static keyPressed() {
    // ESC
    if (keyCode === ESCAPE) {
      Keyboard.handleEscapeKey();
      return;
    }

    // DELETE
    if (keyCode === DELETE) {
      Keyboard.handleDeleteKey();
      return;
    }

    // CTRL+Z
    if (keyIsDown(CONTROL) && key === 'z') {
      Keyboard.handleUndo();
      return;
    }

    // SHIFT
    if (keyCode === SHIFT) {
      Keyboard.isShiftPressed = true;
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