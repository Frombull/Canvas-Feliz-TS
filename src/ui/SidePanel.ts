class SidePanel {
  // User settings
  static shouldDrawVertexBalls: boolean = true;
  static shouldDrawGrid: boolean = true;
  static shouldDrawAxis: boolean = true;
  static shouldDrawDebugWindow: boolean = true;
  static controlPanelSize = {x: 350, y: 10};
  
  // Tool management
  static toolButtons: Button[] = [];
  static createButton: Button;
  static translateButton: Button;
  static scaleButton: Button;
  static rotateButton: Button;
  static curvesButton: Button;
  
  
  static registerToolButton(toolButton: Button) {
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
  
    // Create Polygon Button
    SidePanel.createButton = new Button('Create Polygon', createSection, () => {
      tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
    }, {
      tool: Tool.CREATE_POLYGON, 
      iconPath: 'icons/create.svg'
    });
  
    // Translate Tool Button
    SidePanel.translateButton = new Button('Translate', createSection, () => { 
      tempPolygon = [];
    }, {
      tool: Tool.TRANSLATE,
      iconPath: 'icons/translate.svg'
    });
  
    // Scale Tool Button
    SidePanel.scaleButton = new Button('Scale', createSection, () => {
      tempPolygon = [];
    }, {
      tool: Tool.SCALE,
      iconPath: 'icons/scale.svg'
    });

    // Rotate Tool Button
    SidePanel.rotateButton = new Button('Rotate', createSection, () => {
      tempPolygon = [];
    }, {
      tool: Tool.ROTATE,
      iconPath: 'icons/rotate.svg'
    });

    // Curves Button (doesnt set a tool directly) 
    SidePanel.curvesButton = new Button('Curves', createSection, () => {
      CurvesUI.toggleCurvesPanel(true);
    });
  
    createDiv('').class('section-title').html('Transformations').parent(createSection);
  
    // Container for Mirror buttons
    let mirrorContainer = createDiv('').style('display', 'flex').style('gap', '5px').parent(createSection);

    // Button Mirror X 
    new Button('Mirror X', mirrorContainer, () => {
      Mirror.mirror('y');
    });

    // Button Mirror Y 
    new Button('Mirror Y', mirrorContainer, () => {
      Mirror.mirror('x');
    });
    
    // Button Shear Uniform 
    new Button('Uniform Shear', createSection, () => { 
      Shear.ShearUniform();
    });
  
    // Button Shear Non-Uniform 
    new Button('Non-Uniform Shear', createSection, () => {
      Shear.ShearNonUniform();
    });
  
    // Button Reset Polygon 
    new Button('Reset Polygon', createSection, () => {
      if(selectedPolygon) {
        selectedPolygon.resetPolygon();
      }
    });

    // ------------------------------ COLOR PICKER ------------------------------
    createDiv('').class('section-title').html('Color').parent(createSection);
    
    // Button color picker
    new Button('Color Picker', createSection, () => {
      ColorPickerUI.toggle();
    });

    createDiv('').class('section-title').html('Display').parent(createSection);

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