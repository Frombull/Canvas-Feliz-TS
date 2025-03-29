class ZoomControlUI {
  static zoomButtonsContainer: any;
  static zoomInButton: Button;
  static zoomOutButton: Button;
  static homeButton: Button;
  
  static createZoomControls() {
    // Create container for zoom buttons
    ZoomControlUI.zoomButtonsContainer = createDiv('').class('zoom-buttons-container');
    ZoomControlUI.zoomButtonsContainer.position(windowWidth - SidePanel.controlPanelSize.x - 30, 10);
    
    // Create zoom in button
    ZoomControlUI.zoomInButton = new Button('+', ZoomControlUI.zoomButtonsContainer, () => {
      ZoomControlUI.zoomIn();
    }, {
      className: 'zoom-button zoom-in-button'
    });
    
    // Create zoom out button
    ZoomControlUI.zoomOutButton = new Button('-', ZoomControlUI.zoomButtonsContainer, () => {
      ZoomControlUI.zoomOut();
    }, {
      className: 'zoom-button zoom-out-button' 
    });
    
    // Create home button
    ZoomControlUI.homeButton = new Button('', ZoomControlUI.zoomButtonsContainer, () => {
      Camera.centerCamera();
    }, {
      className: 'zoom-button home-button', 
      iconPath: 'icons/home.svg',
      fixedWidth: false,
    });
  }
  
  static zoomIn() {
    let zoomFactor = 1.2;
    let newScale = Camera.currentScaleFactor * zoomFactor;
    
    // Zoom limit
    if (newScale > Camera.maxScaleFactor) {
      zoomFactor = (Camera.maxScaleFactor / Camera.currentScaleFactor);
    }
    
    newScale = Camera.currentScaleFactor * zoomFactor;
    
    let centerX = (width / 2);
    let centerY = (height / 2);
    
    Mouse.panX = (centerX - (centerX - Mouse.panX) * zoomFactor);
    Mouse.panY = (centerY - (centerY - Mouse.panY) * zoomFactor);
    
    Camera.currentScaleFactor = newScale;
  }
  
  static zoomOut() {
    let zoomFactor = 0.8;
    let newScale = Camera.currentScaleFactor * zoomFactor;
    
    // Zoom limit
    if (newScale < Camera.minScaleFactor) {
      zoomFactor = (Camera.minScaleFactor / Camera.currentScaleFactor);
    }
    
    newScale = Camera.currentScaleFactor * zoomFactor;
    
    let centerX = (width / 2);
    let centerY = (height / 2);
    
    Mouse.panX = (centerX - (centerX - Mouse.panX) * zoomFactor);
    Mouse.panY = (centerY - (centerY - Mouse.panY) * zoomFactor);
    
    Camera.currentScaleFactor = newScale;
  }
  
  static handleWindowResize() {
    if (ZoomControlUI.zoomButtonsContainer) {
      ZoomControlUI.zoomButtonsContainer.position(windowWidth - SidePanel.controlPanelSize.x - 30, 10);
    }
  }
}

const originalSetup = window.setup;
window.setup = function() {
  originalSetup();
  ZoomControlUI.createZoomControls();
};

// Handle canvas resize
const originalWindowResized = window.windowResized;
window.windowResized = function() {
  originalWindowResized();
  ZoomControlUI.handleWindowResize();
};
