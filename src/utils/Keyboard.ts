class Keyboard {
  static keyPressed() {
    if (keyCode === ESCAPE) {           // ESC de-selects tool
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
    }
    else if (keyCode = DELETE) {
      // Delete vertex
      if (selectedPolygon && selectedVertex) {
        selectedPolygon.deleteVertex(selectedVertex);
      }
      // Delete polygon
      else if (selectedPolygon && !selectedVertex && selectedCentroid) {
        selectedPolygon.deleteSelf();
      }
    }
  }
}