class SidePanel {
  // User settings
  static shouldDrawVertexBalls: boolean = true;
  static shouldDrawGrid: boolean = true;
  static shouldDrawAxis: boolean = true;
  static shouldDrawDebugWindow: boolean = true;

  static controlPanelSize = {x: 350, y: 10};


  static createControlPanel() {
    let controlPanel = createDiv('').class('control-panel');
    controlPanel.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
  
    let createSection = createDiv('').class('section').parent(controlPanel);
    createDiv('').class('section-title').html('Tools').parent(createSection);
  
    // Create Polygon Button
    buttonCreate = createButton('Create Polygon').class('button').parent(createSection);
    buttonCreate.mousePressed(() => {
      selectedTool = Tool.CREATE_POLYGON;
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
      SidePanel.updateButtonStyles(buttonCreate);
    });
  
    // Translate Button
    buttonTranslate = createButton('Translate').class('button').parent(createSection);
    buttonTranslate.mousePressed(() => {
      selectedTool = Tool.TRANSLATE;
      tempPolygon = [];
      SidePanel.updateButtonStyles(buttonTranslate);
    });
  
    // Scale button
    buttonScale = createButton('Scale').class('button').parent(createSection);
    buttonScale.mousePressed(() => {
      selectedTool = Tool.SCALE;
      tempPolygon = [];
      SidePanel.updateButtonStyles(buttonScale);
    });
  
    createDiv('').class('section-title').html('Transformations').parent(createSection);
  
    // Mirror X Button
    buttonMirrorX = createButton('Mirror X').class('button').parent(createSection);
    buttonMirrorX.mousePressed(() => {
      Mirror.mirror('x');
    });
  
    // Mirror Y Button
    buttonMirrorY = createButton('Mirror Y').class('button').parent(createSection);
    buttonMirrorY.mousePressed(() => {
      Mirror.mirror('y');
    });
    
    // Shear Uniform Button
    buttonShearU = createButton('Uniform Shear').class('button').parent(createSection);
    buttonShearU.mousePressed(() => {
      Shear.ShearUniform();
    });
  
    // Shear Non-Uniform Button
    buttonShearNU = createButton('Non-Uniform Shear').class('button').parent(createSection);
    buttonShearNU.mousePressed(() => {
      Shear.ShearNonUniform();
    });
  
    createDiv('').class('section-title').html('Actions').parent(createSection);
  
    // Reset Polygon Button
    buttonResetPolygon = createButton('Reset Polygon').class('button').parent(createSection);
    buttonResetPolygon.mousePressed(() => {
      if(selectedPolygon){
        selectedPolygon.resetPolygon();
      }
    });
  
    // Center Camera Button
    buttonCenterCamera = createButton('Center Camera').class('button').parent(createSection);
    buttonCenterCamera.mousePressed(() => {
      Camera.centerCamera();
    });
  
    createDiv('').class('section-title').html('Display Options').parent(createSection);
  
    // Checkbox for vertex balls
    let checkboxDrawVertexBalls: any = createCheckbox('Draw Vertex Balls', SidePanel.shouldDrawVertexBalls).parent(createSection);
    checkboxDrawVertexBalls.changed(() => {
      SidePanel.shouldDrawVertexBalls = checkboxDrawVertexBalls.checked();
    });
  
    // Checkbox for grid
    let checkboxDrawGrid: any = createCheckbox('Draw Grid', SidePanel.shouldDrawGrid).parent(createSection);
    checkboxDrawGrid.changed(() => {
      SidePanel.shouldDrawGrid = checkboxDrawGrid.checked();
    });
  
    // Checkbox for axis
    let checkboxDrawAxis: any = createCheckbox('Draw Axis', SidePanel.shouldDrawAxis).parent(createSection);
    checkboxDrawAxis.changed(() => {
      SidePanel.shouldDrawAxis = checkboxDrawAxis.checked();
    });
  
    // Checkbox for debug window
    let checkboxDebugWindow: any = createCheckbox('Debug Window', SidePanel.shouldDrawDebugWindow).parent(createSection);
    checkboxDebugWindow.changed(() => {
      SidePanel.shouldDrawDebugWindow = checkboxDebugWindow.checked();
    });
  }
  
  static updateButtonStyles(activeButton: any) {
    if (!activeButton) return;
    
    // Remove active class from all buttons
    buttonCreate.removeClass('active');
    buttonTranslate.removeClass('active');
    buttonScale.removeClass('active');
    
    // Add active class to selected button
    activeButton.addClass('active');
  }
}