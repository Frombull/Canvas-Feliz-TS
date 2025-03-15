class ToolButton {
  button: any;
  tool: Tool;
  

  constructor(label: string, tool: Tool, parent: any, onClick?: () => void) {
    this.tool = tool;
    this.button = createButton(label).class('button').parent(parent);
    
    this.button.mousePressed(() => {
      selectedTool = this.tool;
      SidePanel.updateActiveToolButton();
      if (onClick) onClick();
    });
    
    SidePanel.registerToolButton(this);
  }
  
  setActive(isActive: boolean) {
    if (isActive) {
      this.button.addClass('active');
    } 
    else {
      this.button.removeClass('active');
    }
  }
  
  getHTMLElement() {
    return this.button;
  }
}