class ToolButton {
  button: any;
  tool: Tool;
  iconElement: any;

  constructor(label: string, tool: Tool, parent: any, onClick?: () => void, iconPath?: string) {
    this.tool = tool;
    this.button = createButton('').class('button').parent(parent);
    
    let contentDiv = createDiv('').class('button-content').parent(this.button);
    
    if (iconPath) {
      this.iconElement = createDiv('').class('tool-icon').parent(contentDiv);
      
      this.loadSVGWithFetch(iconPath);
    }
    
    createSpan(label).class('tool-label').parent(contentDiv);
    
    this.button.mousePressed(() => {
      selectedTool = this.tool;
      SidePanel.updateActiveToolButton();
      if (onClick) onClick();
    });
    
    SidePanel.registerToolButton(this);
  }
  
  private loadSVGWithFetch(iconPath: string): void {
    fetch(iconPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Não foi possível carregar o SVG: ${response.statusText}`);
        }
        return response.text();
      })
      .then(svgText => {
        if (this.iconElement && this.iconElement.elt) {
          this.iconElement.elt.innerHTML = svgText;
          
          // const svgElement = this.iconElement.elt.querySelector('svg');
          // if (svgElement) {
          //   svgElement.setAttribute('width', '18');
          //   svgElement.setAttribute('height', '18');
          //   svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          // }
        }
      })
      .catch(error => {
        console.error(`Erro ao carregar o SVG (${iconPath}):`, error);
        // Fallback para texto ou ícone padrão se o SVG não puder ser carregado
        if (this.iconElement) {
          this.iconElement.html('•'); // Usar um caractere simples como fallback
        }
      });
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