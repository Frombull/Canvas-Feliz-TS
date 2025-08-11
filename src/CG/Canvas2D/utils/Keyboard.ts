class Keyboard {
  static isShiftPressed: boolean = false;

  static keyPressed() {
    switch(key.toLowerCase()) {
      case Keybinds.CREATE_POLYGON:               // Create polygon
        selectedTool = Tool.CREATE_POLYGON;
        SidePanel.updateActiveButton();
        return;

      case Keybinds.TRANSLATE:                    // Transform
        selectedTool = Tool.TRANSLATE;
        SidePanel.updateActiveButton();
        return;

      case Keybinds.ROTATE:                       // Rotate
        selectedTool = Tool.ROTATE;
        SidePanel.updateActiveButton();
        return;

      case Keybinds.SCALE:                        // Scale
        selectedTool = Tool.SCALE;
        SidePanel.updateActiveButton();
        return;
        
      case Keybinds.OPEN_COLOR_PALETTE:           // Color palette
        ColorPickerUI.toggle();
        SidePanel.updateActiveButton();
        return;

      case Keybinds.ANIMATION:                   // Animation
        selectedTool = Tool.ANIMATION;
        AnimationUI.toggleAnimationPanel(true);
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
    // If no tool is selected, deselect polygon
    if (selectedTool == Tool.NONE) {
      selectedPolygon = null;
    }
    
    if (selectedTool == Tool.CREATE_POLYGON && CreatePolygon.tempPolygon) {
      CreatePolygon.cancelPolygonCreation();
      SidePanel.updateActiveButton();
      return;
    }

    selectedTool = Tool.NONE;
    selectedVertex = null;
    selectedCentroid = null;
    // TODO Hide collor picker
    
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