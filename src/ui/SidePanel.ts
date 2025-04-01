class SidePanel {
  // User settings
  static shouldDrawVertices: boolean = true;
  static shouldDrawGrid: boolean = true;
  static shouldDrawAxis: boolean = true;
  static shouldDrawDebugWindow: boolean = true;
  static controlPanelSize = {x: 350, y: 10};
  
  // Tool management
  static Buttons: Button[] = [];
  
  
  static registerButton(button: Button) {
    SidePanel.Buttons.push(button);
  }
  
  static updateActiveButton() {
    SidePanel.Buttons.forEach(tb => {
      tb.setActive(selectedTool === tb.tool);
    });
  }
  
  static createControlPanel() {
    let controlPanel = createDiv('').class('control-panel');
    controlPanel.position(windowWidth - SidePanel.controlPanelSize.x, SidePanel.controlPanelSize.y);
  
    let createSection = createDiv('').class('section').parent(controlPanel);
    createDiv('').class('section-title').html('Tools').parent(createSection);
  
    // Create Polygon Button
    new Button('Create Polygon', createSection, () => {
      CreatePolygon.tempPolygon = [];
      selectedVertex = null;
      selectedCentroid = null;
    }, {
      tool: Tool.CREATE_POLYGON, 
      iconPath: 'icons/create.svg'
    });
  
    // Translate Tool Button
    new Button('Translate', createSection, () => { 
      CreatePolygon.cancelPolygonCreation();
    }, {
      tool: Tool.TRANSLATE,
      iconPath: 'icons/translate.svg'
    });
  
    // Rotate Tool Button
    new Button('Rotate', createSection, () => {
      CreatePolygon.cancelPolygonCreation();
    }, {
      tool: Tool.ROTATE,
      iconPath: 'icons/rotate.svg'
    });

    // Scale Tool Button
    new Button('Scale', createSection, () => {
      CreatePolygon.cancelPolygonCreation();
    }, {
      tool: Tool.SCALE,
      iconPath: 'icons/scale.svg'
    });

    // Curves Button
    new Button('Curves', createSection, () => {
      CurvesUI.toggleCurvesPanel(true);
    }, {
      iconPath: 'icons/curve.svg'
    });
  
    createDiv('').class('section-title').html('Transformations').parent(createSection);
  
    // Container for Mirror buttons
    let mirrorContainer = createDiv('').style('display', 'flex').style('gap', '5px').parent(createSection);

    // Button Mirror X 
    new Button('Mirror X', mirrorContainer, () => {
      Mirror.mirror('y');
    }, {
      iconPath: 'icons/mirror-x.svg'
    });

    // Button Mirror Y 
    new Button('Mirror Y', mirrorContainer, () => {
      Mirror.mirror('x');
    }, {
      iconPath: 'icons/mirror-y.svg'
    });
    
    // Button Shear Uniform 
    new Button('Uniform Shear', createSection, () => { 
      Shear.ShearUniform();
    }, {
      iconPath: 'icons/skew.svg'
    });
  
    // Button Shear Non-Uniform 
    new Button('Non-Uniform Shear', createSection, () => {
      Shear.ShearNonUniform();
    }, {
      iconPath: 'icons/skew.svg'
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
    ColorPickerUI.colorPickerButton = new Button('Color Picker', createSection, () => {
      ColorPickerUI.toggle();
    }, {
      iconPath: 'icons/color-palette-v2.svg'
    });

    // ------------------------------  ------------------------------
    createDiv('').class('section-title').html('Display').parent(createSection);

    // Draw vertices button
    new Button('', createSection, () => {
      SidePanel.shouldDrawVertices = !SidePanel.shouldDrawVertices;
    }, {
      iconPath: 'icons/draw-vertices-on.svg',
      fixedWidth: false,
    });

    // Draw grid button
    new Button('', createSection, () => {
      SidePanel.shouldDrawGrid = !SidePanel.shouldDrawGrid;
    }, {
      iconPath: 'icons/grid.svg',
      fixedWidth: false,
    });
  
    // Draw axis button
    new Button('', createSection, () => {
      SidePanel.shouldDrawAxis = !SidePanel.shouldDrawAxis;
    }, {
      iconPath: 'icons/axis.svg',
      fixedWidth: false,
    });
  
    // Draw debug window button
    new Button('', createSection, () => {
      SidePanel.shouldDrawDebugWindow = !SidePanel.shouldDrawDebugWindow;
    }, {
      iconPath: 'icons/debug.svg',
      fixedWidth: false,
    });
    
    SidePanel.initColorPickerUI();
    CurvesUI.setupCurvesUI();

    // Set the initial active tool
    SidePanel.updateActiveButton();
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