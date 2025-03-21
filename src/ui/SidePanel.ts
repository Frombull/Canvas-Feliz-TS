class SidePanel {
  // User settings
  static shouldDrawVertexBalls: boolean = true;
  static shouldDrawGrid: boolean = true;
  static shouldDrawAxis: boolean = true;
  static shouldDrawDebugWindow: boolean = true;
  static controlPanelSize = {x: 350, y: 10};
  
  // Tool management
  static toolButtons: ToolButton[] = [];
  static createButton: ToolButton;
  static translateButton: ToolButton;
  static scaleButton: ToolButton;
  static rotateButton: ToolButton;
  static curvesButton: ToolButton;
  
  
  static registerToolButton(toolButton: ToolButton) {
    SidePanel.toolButtons.push(toolButton);
  }
  
  static updateActiveToolButton() {
    SidePanel.toolButtons.forEach(tb => {
      tb.setActive(selectedTool === tb.tool);
    });
  }
  
  static createControlPanel() {
    let controlPanel = createDiv('').class('control-panel');
    controlPanel.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
  
    let createSection = createDiv('').class('section').parent(controlPanel);
    createDiv('').class('section-title').html('Tools').parent(createSection);
  
    // Create Polygon Tool Button
    SidePanel.createButton = new ToolButton('Create Polygon', Tool.CREATE_POLYGON, createSection, () => {
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
    });
  
    // Translate Tool Button
    SidePanel.translateButton = new ToolButton('Translate', Tool.TRANSLATE, createSection, () => {
      tempPolygon = [];
    });
  
    // Scale Tool Button
    SidePanel.scaleButton = new ToolButton('Scale', Tool.SCALE, createSection, () => {
      tempPolygon = [];
    });

    // Rotate Tool Button
    SidePanel.rotateButton = new ToolButton('Rotate', Tool.ROTATE, createSection, () => {
      tempPolygon = [];
    });

    // Curves Button (doesnt set a tool directly) 
    let curvesButtonElement = createButton('Curves').class('button').parent(createSection);
    curvesButtonElement.mouseReleased(() => {
      CurvesUI.toggleCurvesPanel(true);
    });
  
    createDiv('').class('section-title').html('Transformations').parent(createSection);
  
    // Container for Mirror buttons
    let mirrorContainer = createDiv('').style('display', 'flex').style('gap', '5px').parent(createSection);

    // Button Mirror X 
    let buttonMirrorX = createButton('Mirror X').class('button').parent(mirrorContainer);
    buttonMirrorX.mouseReleased(() => {
      Mirror.mirror('y');
    });

    // Button Mirror Y 
    let buttonMirrorY = createButton('Mirror Y').class('button').parent(mirrorContainer);
    buttonMirrorY.mouseReleased(() => {
      Mirror.mirror('x');
    });
    
    // Button Shear Uniform 
    let buttonShearU = createButton('Uniform Shear').class('button').parent(createSection);
    buttonShearU.mouseReleased(() => {
      Shear.ShearUniform();
    });
  
    // Button Shear Non-Uniform 
    let buttonShearNU = createButton('Non-Uniform Shear').class('button').parent(createSection);
    buttonShearNU.mouseReleased(() => {
      Shear.ShearNonUniform();
    });
  
    // Button Reset Polygon 
    let buttonResetPolygon = createButton('Reset Polygon').class('button').parent(createSection);
    buttonResetPolygon.mouseReleased(() => {
      if(selectedPolygon) {
        selectedPolygon.resetPolygon();
      }
    });

    // ------------------------------ COLOR PICKER ------------------------------
    createDiv('').class('section-title').html('Color').parent(createSection);
    
    // Button color picker
    let buttonColorPicker = createButton('Color Picker').class('button').parent(createSection);
    buttonColorPicker.mouseReleased(() => {
      ColorPickerUI.toggle();
    });

    createDiv('').class('section-title').html('Display').parent(createSection);

    // Button Center Camera 
    let buttonCenterCamera = createButton('Center Camera').class('button').parent(createSection);
    buttonCenterCamera.mouseReleased(() => {
      Camera.centerCamera();
    });
  
    // Checkbox for draw vertices
    let checkboxDrawVertexBalls: any = createCheckbox('Draw Vertices', SidePanel.shouldDrawVertexBalls).parent(createSection);
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
    
    SidePanel.initColorPickerUI();
    CurvesUI.setupCurvesUI();
    
    // Set the initial active tool
    SidePanel.updateActiveToolButton();
  }
  
  static initColorPickerUI() {
    new ColorPickerUI();
    
    // Color change callback
    ColorPickerUI.onColorChange((colorObj) => {
      if (selectedPolygon) {
        // Create p5 color using window.color instead of directly referencing color
        // This avoids conflicts with parameter naming
        const r = colorObj.rgb.r;
        const g = colorObj.rgb.g;
        const b = colorObj.rgb.b;
        const a = colorObj.alpha * 255;
        
        const newColor = window["color"](r, g, b, a);
        selectedPolygon.fillColor = newColor;
      }
    });
    
    // Initialize with default color
    ColorPickerUI.setColor(Colors.PolygonBlue);
  }

  static handleWindowResize() {
    let controlPanel = select('.control-panel:not(.curves-panel)');
    
    if (controlPanel) {
      controlPanel.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
    }
    
    CurvesUI.handleWindowResize();
  }
}