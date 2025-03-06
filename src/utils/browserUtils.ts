class BrowserUtils {
  static disableBrowserRightClick() {
    for (let element of document.getElementsByClassName("p5Canvas")) {
      element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
  }
  
  static disablePageZoom() {
    // You can still zoom with (ctrl +-)
  
    // Prevent zooming with the mouse wheel
    window.addEventListener('wheel', function(event) {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    }, { passive: false });
  
    // Prevent zooming with touch gestures
    window.addEventListener('gesturestart', function(event) {
      event.preventDefault();
    });
  }
}