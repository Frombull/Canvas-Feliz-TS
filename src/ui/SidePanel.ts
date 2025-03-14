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
  
    // Button Create Polygon 
    buttonCreate = createButton('Create Polygon').class('button').parent(createSection);
    buttonCreate.mousePressed(() => {
      selectedTool = Tool.CREATE_POLYGON;
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
      SidePanel.updateButtonStyles(buttonCreate);
    });
  
    // Button Translate 
    buttonTranslate = createButton('Translate').class('button').parent(createSection);
    buttonTranslate.mousePressed(() => {
      selectedTool = Tool.TRANSLATE;
      tempPolygon = [];
      SidePanel.updateButtonStyles(buttonTranslate);
    });
  
    // Button Scale
    buttonScale = createButton('Scale').class('button').parent(createSection);
    buttonScale.mousePressed(() => {
      selectedTool = Tool.SCALE;
      tempPolygon = [];
      SidePanel.updateButtonStyles(buttonScale);
    });

    buttonRotate = createButton('Rotate').class('button').parent(createSection);
    buttonRotate.mousePressed(() => {
      selectedTool = Tool.ROTATE;
      tempPolygon = [];
      SidePanel.updateButtonStyles(buttonRotate);
    });

    // ---------- Curves ----------
  
    // Container curve buttons
    let curveContainer = createDiv('').style('display', 'flex').style('gap', '5px').parent(createSection);
    
    // Button Bezier Curve
    buttonBezier = createButton('Bezier Curve').class('button').parent(curveContainer);
    buttonBezier.mousePressed(() => {
      selectedTool = Tool.BEZIER;
      Curves.reset();  // Reset any existing curves
      SidePanel.updateButtonStyles(buttonBezier);
    });
  
    // Button Hermite Curve
    buttonHermite = createButton('Hermite Curve').class('button').parent(curveContainer);
    buttonHermite.mousePressed(() => {
      selectedTool = Tool.HERMITE;
      Curves.reset();  // Reset any existing curves
      SidePanel.updateButtonStyles(buttonHermite);
    });
  
    createDiv('').class('section-title').html('Transformations').parent(createSection);
  
    // Container for Mirror buttons
    let mirrorContainer = createDiv('').style('display', 'flex').style('gap', '5px').parent(createSection);

    // Button Mirror X 
    buttonMirrorX = createButton('Mirror X').class('button').parent(mirrorContainer);
    buttonMirrorX.mousePressed(() => {
      Mirror.mirror('y');
    });

    // Button Mirror Y 
    buttonMirrorY = createButton('Mirror Y').class('button').parent(mirrorContainer);
    buttonMirrorY.mousePressed(() => {
      Mirror.mirror('x');
    });
    
    // Button Shear Uniform 
    buttonShearU = createButton('Uniform Shear').class('button').parent(createSection);
    buttonShearU.mousePressed(() => {
      Shear.ShearUniform();
    });
  
    // Button Shear Non-Uniform 
    buttonShearNU = createButton('Non-Uniform Shear').class('button').parent(createSection);
    buttonShearNU.mousePressed(() => {
      Shear.ShearNonUniform();
    });
  
    //createDiv('').class('section-title').html('Actions').parent(createSection);
  
    // TODO
    // // Button Reset Polygon 
    // buttonResetPolygon = createButton('Reset Polygon').class('button').parent(createSection);
    // buttonResetPolygon.mousePressed(() => {
    //   if(selectedPolygon){
    //     selectedPolygon.resetPolygon();
    //   }
    // });
  


    // ---------- COLOR PICKER ----------

    createDiv('').class('section-title').html('Color').parent(createSection);
    
    // Create the toggle button for the color picker
    let buttonColorPicker = createButton('Color Picker').class('button').parent(createSection);
    buttonColorPicker.mousePressed(() => {
      ColorPickerUI.toggle();
    });

    createDiv('').class('section-title').html('Display Options').parent(createSection);

    // Button Center Camera 
    buttonCenterCamera = createButton('Center Camera').class('button').parent(createSection);
    buttonCenterCamera.mousePressed(() => {
      Camera.centerCamera();
    });
  
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
    
    // Initialize the advanced color picker UI
    SidePanel.initColorPickerUI();
  }
  
  static initColorPickerUI() {
    // Create the color picker UI
    new ColorPickerUI();
    
    // Set up color change callback
    ColorPickerUI.onColorChange((colorObj) => {
      // Update the selected polygon color if any
      if (selectedPolygon) {
        // Create p5 color using window.color instead of directly referencing color
        // This avoids conflicts with parameter naming
        const r = colorObj.rgb.r;
        const g = colorObj.rgb.g;
        const b = colorObj.rgb.b;
        const a = colorObj.alpha * 255;
        
        // Use a different approach to create the color
        const newColor = window["color"](r, g, b, a);
        selectedPolygon.fillColor = newColor;
      }
    });
    
    // Initialize with default color
    ColorPickerUI.setColor(Colors.PolygonBlue);
  }

  static handleWindowResize() {
    let controlPanel = select('.control-panel');
    
    if (controlPanel) {
      controlPanel.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
    }
  }
  
  static updateButtonStyles(activeButton: any) {
    // Remove active class from all buttons           // TODO array of buttons?
    buttonCreate.removeClass('active');
    buttonTranslate.removeClass('active');
    buttonScale.removeClass('active');
    buttonRotate.removeClass('active');
    buttonBezier.removeClass('active');
    buttonHermite.removeClass('active');

    if (!activeButton) return;
    
    // Add active class to selected button
    activeButton.addClass('active');
  }
}