class SidePanel {
  // User settings
  static shouldDrawVertexBalls: boolean = true;
  static shouldDrawGrid: boolean = true;
  static shouldDrawAxis: boolean = true;
  static shouldDrawDebugWindow: boolean = true;
  static colorPicker: any;
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
  
    createDiv('').class('section-title').html('Actions').parent(createSection);
  
    // Button Reset Polygon 
    buttonResetPolygon = createButton('Reset Polygon').class('button').parent(createSection);
    buttonResetPolygon.mousePressed(() => {
      if(selectedPolygon){
        selectedPolygon.resetPolygon();
      }
    });
  
    // Button Center Camera 
    buttonCenterCamera = createButton('Center Camera').class('button').parent(createSection);
    buttonCenterCamera.mousePressed(() => {
      Camera.centerCamera();
    });

    createDiv('').class('section-title').html('Color').parent(createSection);

    // ---------- COLOR PICKER ---------- 

    let colorPickerContainer = createDiv('').style('display', 'flex').style('align-items', 'center').style('gap', '5px').parent(createSection);

    let iroContainer = createDiv('').parent(colorPickerContainer);

    // @ts-expect-error
    SidePanel.colorPicker = new iro.ColorPicker(iroContainer.elt, {
      width: 100,
      color: `${Colors.PolygonBlue}`,
      borderWidth: 1,
      borderColor: "#fff",
      handleRadius: 7,
      padding: 1,
      margin: 8,
      layout: [
        { // @ts-expect-error
          component: iro.ui.Wheel }, 
          // @ts-expect-error
        { component: iro.ui.Slider, options: { sliderType: 'alpha' } } 
      ]
    });

    // Text box
    let formatedColor = `${Colors.PolygonBlue.levels[0]}, ${Colors.PolygonBlue.levels[1]}, ${Colors.PolygonBlue.levels[2]}, ${Colors.PolygonBlue.levels[3]}`;
    let colorPickerTextbox = createInput(`${formatedColor}`).style('width', '140px').parent(colorPickerContainer) as any;

    // Update polygon
    SidePanel.colorPicker.on('color:change', function(c: any) {
      colorPickerTextbox.value(`${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}, ${(c.alpha).toFixed(2)}`);
      
      if (selectedPolygon) {
        let p5Color = color(c.rgb.r, c.rgb.g, c.rgb.b, c.alpha * 255);

        selectedPolygon.fillColor = p5Color;
      }
    });

    // Textbox update
    colorPickerTextbox.input(() => {
      SidePanel.colorPicker.color.rgbaString = colorPickerTextbox.value();
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
    
    // Remove active class from all buttons           // TODO array of buttons?
    buttonCreate.removeClass('active');
    buttonTranslate.removeClass('active');
    buttonScale.removeClass('active');
    buttonRotate.removeClass('active');
    
    // Add active class to selected button
    activeButton.addClass('active');
  }
}