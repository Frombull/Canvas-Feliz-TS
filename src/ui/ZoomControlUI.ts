class ZoomControlUI {
  static zoomButtonsContainer: any;
  static zoomInButton: any;
  static zoomOutButton: any;
  static homeButton: any;
  
  static createZoomControls() {
    // Create container for zoom buttons
    ZoomControlUI.zoomButtonsContainer = createDiv('').class('zoom-buttons-container');
    ZoomControlUI.zoomButtonsContainer.position(windowWidth - SidePanel.controlPanelSize.x - 30, 10);
    
    // Create zoom in button
    ZoomControlUI.zoomInButton = createButton('+').class('zoom-button zoom-in-button');
    ZoomControlUI.zoomInButton.parent(ZoomControlUI.zoomButtonsContainer);
    ZoomControlUI.zoomInButton.mousePressed(() => {
      ZoomControlUI.zoomIn();
    });
    
    // Create zoom out button
    ZoomControlUI.zoomOutButton = createButton('-').class('zoom-button zoom-out-button');
    ZoomControlUI.zoomOutButton.parent(ZoomControlUI.zoomButtonsContainer);
    ZoomControlUI.zoomOutButton.mousePressed(() => {
      ZoomControlUI.zoomOut();
    });
    
    // Create home button
    ZoomControlUI.homeButton = createButton('⌂').class('zoom-button home-button');
    ZoomControlUI.homeButton.parent(ZoomControlUI.zoomButtonsContainer);
    ZoomControlUI.homeButton.mousePressed(() => {
      Camera.centerCamera();
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
