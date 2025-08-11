class ColorPickerUI {
  // Color pika
  static container: any;
  static colorPicker: any;
  static visible: boolean = false;
  static sliders: {[key: string]: any} = {};
  static valueBoxes: {[key: string]: any} = {};
  static currentColor: any;
  static onColorChangeCallback: ((colorObj: any) => void) | null = null;
  static colorPickerButton: Button | null = null;

  constructor() {
    ColorPickerUI.createContainer();
    ColorPickerUI.createColorPicker();
    ColorPickerUI.createSliders();
    ColorPickerUI.setupEvents();
    ColorPickerUI.hide();
  }

  private static createContainer() {
    ColorPickerUI.container = createDiv('').class('colorpicker-container');
    ColorPickerUI.container.position(10, 380); // TODO: Crime absoluto, fica fora da tela só de respirar perto disso
  }

  private static createColorPicker() {
    let pickerContainer = createDiv('').class('colorpicker-wheel-container').parent(ColorPickerUI.container);
    
    // @ts-expect-error
    ColorPickerUI.colorPicker = new iro.ColorPicker(pickerContainer.elt, {
      width: 250,
      color: `${Colors.PolygonBlue}`,
      borderWidth: 4,
      borderColor: "#fff",
      handleRadius: 8,
      padding: 2,
      layout: [
        { // @ts-expect-error
          component: iro.ui.Wheel
        }
      ]
    });

    ColorPickerUI.currentColor = ColorPickerUI.colorPicker.color;
  }

  private static createSliders() {
    let slidersContainer = createDiv('').class('colorpicker-sliders-container').parent(ColorPickerUI.container);
    
    // Create each slider with its label and value box
    const sliderTypes = [
      { name: 'H', label: 'H', min: 0, max: 360, suffix: '°' },
      { name: 'S', label: 'S', min: 0, max: 100, suffix: '%' },
      { name: 'V', label: 'V', min: 0, max: 100, suffix: '%' },
      { name: 'R', label: 'Red', min: 0, max: 255, suffix: '' },
      { name: 'G', label: 'Green', min: 0, max: 255, suffix: '' },
      { name: 'B', label: 'Blue', min: 0, max: 255, suffix: '' }
    ];
    
    sliderTypes.forEach(slider => {
      const row = createDiv('').class('colorpicker-slider-row').parent(slidersContainer);
      
      // Label
      createDiv(slider.label).class('colorpicker-slider-label').parent(row);
      
      // Slider container (for slider and value)
      const sliderValueContainer = createDiv('').class('colorpicker-slider-value-container').parent(row);
      
      // Create the slider
      ColorPickerUI.sliders[slider.name] = createSlider(slider.min, slider.max, 
        slider.name === 'H' ? ColorPickerUI.currentColor.hsv.h : 
        slider.name === 'S' ? ColorPickerUI.currentColor.hsv.s : 
        slider.name === 'V' ? ColorPickerUI.currentColor.hsv.v : 
        slider.name === 'R' ? ColorPickerUI.currentColor.rgb.r : 
        slider.name === 'G' ? ColorPickerUI.currentColor.rgb.g : 
        slider.name === 'B' ? ColorPickerUI.currentColor.rgb.b : 0
      ).class('colorpicker-slider').parent(sliderValueContainer);
      
      // Create the value box directly to the right of the slider
      ColorPickerUI.valueBoxes[slider.name] = createDiv('0').class('colorpicker-value-box').parent(sliderValueContainer);
      
      // Initial value
      ColorPickerUI.updateSliderValue(slider.name);
    });
    
    const separator = createDiv('').parent(slidersContainer);
    separator.style('height', '1px');
    separator.style('background-color', '#cccccc');
    separator.style('margin', '8px 0');
    separator.style('width', '100%');
    
    const alphaRow = createDiv('').class('colorpicker-slider-row').parent(slidersContainer);
    
    createDiv('Alpha').class('colorpicker-slider-label').parent(alphaRow);
    
    const alphaSliderValueContainer = createDiv('').class('colorpicker-slider-value-container').parent(alphaRow);
    
    ColorPickerUI.sliders['A'] = createSlider(0, 100, ColorPickerUI.currentColor.alpha * 100)
      .class('colorpicker-slider')
      .parent(alphaSliderValueContainer);
    
    ColorPickerUI.valueBoxes['A'] = createDiv('100%').class('colorpicker-value-box').parent(alphaSliderValueContainer);
    
    ColorPickerUI.updateSliderValue('A');
  }

  private static setupEvents() {
    // Update sliders when color wheel changes
    ColorPickerUI.colorPicker.on('color:change', (colorObj: any) => {
      ColorPickerUI.currentColor = colorObj;
      ColorPickerUI.updateAllSliders();
      
      if (ColorPickerUI.onColorChangeCallback) {
        ColorPickerUI.onColorChangeCallback(colorObj);
      }
    });
    
    // Update color when sliders change
    Object.keys(ColorPickerUI.sliders).forEach(key => {
      ColorPickerUI.sliders[key].input(() => {
        const value = ColorPickerUI.sliders[key].value();
        
        if (['H', 'S', 'V'].includes(key)) {
          // Preservar o valor de alpha atual
          const currentAlpha = ColorPickerUI.colorPicker.color.alpha;
          
          // Atualizar valores HSV
          const hsv = {...ColorPickerUI.colorPicker.color.hsv};
          if (key === 'H') hsv.h = value;
          if (key === 'S') hsv.s = value;
          if (key === 'V') hsv.v = value;
          ColorPickerUI.colorPicker.color.hsv = hsv;
          
          // Restaurar o valor de alpha após atualizar HSV
          ColorPickerUI.colorPicker.color.alpha = currentAlpha;
        } else if (key === 'A') {
          // Atualizar alpha
          ColorPickerUI.colorPicker.color.alpha = value / 100;
        } else {
          // Preservar o valor de alpha atual
          const currentAlpha = ColorPickerUI.colorPicker.color.alpha;
          
          // Atualizar valores RGB
          const rgb = {...ColorPickerUI.colorPicker.color.rgb};
          if (key === 'R') rgb.r = value;
          if (key === 'G') rgb.g = value;
          if (key === 'B') rgb.b = value;
          ColorPickerUI.colorPicker.color.rgb = rgb;
          
          // Restaurar o valor de alpha após atualizar RGB
          ColorPickerUI.colorPicker.color.alpha = currentAlpha;
        }
        
        ColorPickerUI.updateSliderValue(key);
      });
    });
  }
  
  private static updateSliderValue(key: string) {
    const value = ColorPickerUI.sliders[key].value();
    let displayValue = value;
    
    if (key === 'H') {
      displayValue = `${value}°`;
    } else if (key === 'S' || key === 'V' || key === 'A') {
      displayValue = `${value}%`;
    }
    
    ColorPickerUI.valueBoxes[key].html(displayValue);
  }
  
  private static updateAllSliders() {
    // Update HSV sliders
    ColorPickerUI.sliders['H'].value(ColorPickerUI.currentColor.hsv.h);
    ColorPickerUI.sliders['S'].value(ColorPickerUI.currentColor.hsv.s);
    ColorPickerUI.sliders['V'].value(ColorPickerUI.currentColor.hsv.v);
    
    // Update RGB sliders
    ColorPickerUI.sliders['R'].value(ColorPickerUI.currentColor.rgb.r);
    ColorPickerUI.sliders['G'].value(ColorPickerUI.currentColor.rgb.g);
    ColorPickerUI.sliders['B'].value(ColorPickerUI.currentColor.rgb.b);
    
    // Update Alpha slider
    const alpha = ColorPickerUI.currentColor.alpha !== undefined ? 
      ColorPickerUI.currentColor.alpha * 100 : 100;
    ColorPickerUI.sliders['A'].value(alpha);
    
    // Update all value boxes
    Object.keys(ColorPickerUI.sliders).forEach(key => {
      ColorPickerUI.updateSliderValue(key);
    });
  }

  public static show() {
    ColorPickerUI.container.style('display', 'block');
    ColorPickerUI.visible = true;

    if (ColorPickerUI.colorPickerButton) {
      ColorPickerUI.colorPickerButton.setActive(true);
    }
  }

  public static hide() {
    ColorPickerUI.container.style('display', 'none');
    ColorPickerUI.visible = false;

    if (ColorPickerUI.colorPickerButton) {
      ColorPickerUI.colorPickerButton.setActive(false);
    }
  }

  public static toggle() {
    if (ColorPickerUI.visible) {
      ColorPickerUI.hide();
    } else {
      ColorPickerUI.show();
    }
  }

  public static isVisible(): boolean {
    return ColorPickerUI.visible;
  }

  public static setColor(color: any) {
    if (!ColorPickerUI.colorPicker) return;
    
    const currentAlpha = ColorPickerUI.colorPicker.color.alpha;
    
    if (color.levels) {
      // Its a p5.js color object
      const newAlpha = color.levels[3] !== undefined ? color.levels[3] / 255 : currentAlpha;
      
      ColorPickerUI.colorPicker.color.rgb = { 
        r: color.levels[0], 
        g: color.levels[1], 
        b: color.levels[2] 
      };
      
      ColorPickerUI.colorPicker.color.alpha = newAlpha;
    } else if (typeof color === 'string') {
      // Its a string (hex, rgb, etc.)
      const oldAlpha = currentAlpha;
      
      ColorPickerUI.colorPicker.color.rgbString = color;
      
      if (!color.includes('rgba') && !color.includes('hsla')) {
        ColorPickerUI.colorPicker.color.alpha = oldAlpha;
      }
    } else {
      // Its an object with rgb values
      const hasAlpha = color.a !== undefined;
      
      if (!hasAlpha) {
        ColorPickerUI.colorPicker.color.rgb = {
          r: color.r || 0,
          g: color.g || 0,
          b: color.b || 0
        };
        ColorPickerUI.colorPicker.color.alpha = currentAlpha;
      } else {
        ColorPickerUI.colorPicker.color.rgb = color;
      }
    }
    
    ColorPickerUI.updateAllSliders();
  }

  public static getColor(): any {
    return ColorPickerUI.currentColor;
  }

  public static onColorChange(callback: (colorObj: any) => void) {
    ColorPickerUI.onColorChangeCallback = callback;
  }

  public static syncButtonState() {
    if (ColorPickerUI.colorPickerButton) {
      ColorPickerUI.colorPickerButton.setActive(ColorPickerUI.visible);
    }
  }
}