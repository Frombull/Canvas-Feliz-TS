class Button {
  button: any;
  iconElement: any;
  isActive: boolean = false;
  tool: Tool | null = null;   // Optional Tool association

  constructor(
    label: string, 
    parent: any, 
    onClick?: () => void, 
    options: {
      iconPath?: string,
      tool?: Tool,
      className?: string,
      initialActive?: boolean,
      fixedWidth?: boolean,
    } = {}
  ) {
    this.tool = options.tool || null;
    this.isActive = options.initialActive || false;
    
    // Create button element
    this.button = createButton('').class('button').parent(parent);
    if (options.className) {
      this.button.class(options.className);
    }
    
    // Apply fixed width (default) or auto width
    if (options.fixedWidth === false) {
      this.button.addClass('auto-width');
    }
    
    // Set initial active state
    if (this.isActive) {
      this.button.addClass('active');
    }
    
    // Create content container
    let contentDiv = createDiv('').class('button-content').parent(this.button);
    
    // Add icon if provided
    if (options.iconPath) {
      this.iconElement = createDiv('').class('tool-icon').parent(contentDiv);
      this.loadSVGWithFetch(options.iconPath);
      
      // If no label, add a class for icon-only styling
      if (!label || label.trim() === '') {
        this.button.addClass('icon-only');
      }
    }
    
    // Add label only if non-empty
    if (label && label.trim() !== '') {
      createSpan(label).class('tool-label').parent(contentDiv);
    }
    
    // Set click handler
    this.button.mousePressed(() => {
      // If its a tool button, set the selected tool
      if (this.tool !== null) {
        selectedTool = this.tool;
        SidePanel.updateActiveButton();
      }
      
      // Execute custom click handler if provided
      if (onClick) onClick();
    });
    
    // Register with SidePanel if its a tool button
    if (this.tool !== null) {
      SidePanel.registerButton(this);
    }
  }
  
  private loadSVGWithFetch(iconPath: string): void {
    fetch(iconPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load SVG: ${response.statusText}`);
        }
        return response.text();
      })
      .then(svgText => {
        if (this.iconElement && this.iconElement.elt) {
          this.iconElement.elt.innerHTML = svgText;
        }
      })
      .catch(error => {
        console.error(`Error loading SVG (${iconPath}):`, error);
        // Fallback if SVG cant be loaded
        if (this.iconElement) {
          this.iconElement.html('•');
        }
      });
  }
  
  setActive(isActive: boolean) {
    this.isActive = isActive;
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