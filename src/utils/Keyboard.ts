class Keyboard {
  static keyPressed() {
    if (keyCode === ESCAPE) {           // ESC de-selects tool
      console.log("Pressed ESCAPE");
      if (selectedTool == Tool.NONE) {  // ESC de-selects polygon as well
        console.log("De-selecting polygon as well");
        selectedPolygon = null;
      }
      selectedTool = Tool.NONE;
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
      SidePanel.updateButtonStyles(null);
  
      // Remove active class from all buttons //TODO: array of buttons
      buttonCreate.removeClass('active');
      buttonTranslate.removeClass('active');
      buttonScale.removeClass('active');
      buttonRotate.removeClass('active');
      return;
    }
    if (keyCode === DELETE) {
      console.log("Pressed DELETE");
      if (selectedPolygon && selectedVertex) {
        const action = new DeleteVertexAction(selectedPolygon, selectedVertex);
        HistoryManager.getInstance().addAction(action);
        selectedPolygon.deleteVertex(selectedVertex);
      }
      else if (selectedPolygon && !selectedVertex && selectedCentroid) {
        const action = new DeletePolygonAction(selectedPolygon);
        HistoryManager.getInstance().addAction(action);
        selectedPolygon.deleteSelf();
      }
      return;
    }
    // Ctrl+Z
    if (keyIsDown(CONTROL) && key === 'z') {
      console.log("Pressed CTRL+Z");
      HistoryManager.getInstance().undo();
      return;
    }
    // Ctrl+Y
    if (keyIsDown(CONTROL) && key === 'y') {
      console.log("Pressed CTRL+Y");
      //HistoryManager.getInstance().redo();
      return;
    }
  }
}