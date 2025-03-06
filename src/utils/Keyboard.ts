class Keyboard {
  static keyPressed() {
    if (keyCode === ESCAPE) {
      selectedTool = Tool.NONE;
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
      SidePanel.updateButtonStyles(null);
  
      // Remove active class from all buttons
      buttonCreate.removeClass('active');
      buttonTranslate.removeClass('active');
      buttonScale.removeClass('active');
    }
    else if (key == "t") {
      console.log("Pressed t");
    }
  }
}