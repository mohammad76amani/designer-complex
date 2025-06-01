import { Element } from '../types/template';

/**
 * Service for generating element styles and CSS properties
 */
export class ElementStyleService {
  
  /**
   * Generate box shadow CSS string based on element style and state
   */
  static generateBoxShadow(
    element: Element, 
    isSelected: boolean = false, 
    isHovered: boolean = false
  ): string {
    const { style, animation } = element;
    
    // Hover animation shadow takes priority
    if (isHovered && animation?.hover === 'shadow') {
      return '0 5px 15px rgba(0,0,0,0.2)';
    }
    
    // Custom box shadow from style
    if (style.boxShadowBlur || style.boxShadowSpread) {
      const blur = style.boxShadowBlur || 0;
      const spread = style.boxShadowSpread || 0;
      const color = style.boxShadowColor || 'rgba(0,0,0,0.2)';
      return `0 0 ${blur}px ${spread}px ${color}`;
    }
    
    // Selection shadow
    if (isSelected) {
      return '0 0 10px rgba(52, 152, 219, 0.5)';
    }
    
    return 'none';
  }


  

  /**
   * Generate filter CSS string based on element style
   */
  static generateFilter(element: Element): string {
    const { style } = element;
    const filters: string[] = [];
    
    if (style.blur) {
      filters.push(`blur(${style.blur}px)`);
    }
    
    if (style.brightness && style.brightness !== 100) {
      filters.push(`brightness(${style.brightness}%)`);
    }
    
    if (style.contrast && style.contrast !== 100) {
      filters.push(`contrast(${style.contrast}%)`);
    }
    
    return filters.length ? filters.join(' ') : 'none';
  }

  /**
   * Generate border CSS string based on element style and state
   */
  static generateBorder(
    element: Element, 
    isSelected: boolean = false, 
    isHovered: boolean = false
  ): string {
    const { style, animation } = element;
    
    // Hover animation border takes priority
    if (isHovered && animation?.hover === 'border') {
      const borderColor = animation.hoverBorderColor || '#3498db';
      return `2px solid ${borderColor}`;
    }
    
    // Custom border from style
    if (style.borderWidth && style.borderStyle !== 'none') {
      const width = style.borderWidth;
      const borderStyle = style.borderStyle;
      const color = style.borderColor || '#000000';
      return `${width}px ${borderStyle} ${color}`;
    }
    
    // Selection border
    if (isSelected) {
      return '2px solid #3498db';
    }
    
    return 'none';
  }

  /**
   * Get background color based on element style and state
   */
  static getBackgroundColor(
    element: Element, 
    isHovered: boolean = false, 
    isActive: boolean = false
  ): string | undefined {
    const { style, animation } = element;
    
    // Click animation background color takes priority
    if (isActive && animation?.click === 'bg-color') {
      return animation.clickBgColor || '#2980b9';
    }
    
    // Hover animation background color
    if (isHovered && animation?.hover === 'bg-color') {
      return animation.hoverBgColor || '#3498db';
    }
    
    // Default background color
    return style.backgroundColor;
  }

  /**
   * Get text color based on element style and state
   */
  static getTextColor(
    element: Element, 
    isHovered: boolean = false, 
    isActive: boolean = false
  ): string | undefined {
    const { style, animation } = element;
    
    // Click animation text color takes priority
    if (isActive && animation?.click === 'text-color') {
      return animation.clickTextColor || '#ffffff';
    }
    
    // Hover animation text color
    if (isHovered && animation?.hover === 'text-color') {
      return animation.hoverTextColor || '#ffffff';
    }
    
    // Default text color
    return style.color;
  }

  /**
   * Generate animation CSS classes based on element animation config
   */
  static getAnimationClasses(element: Element, isActive: boolean = false): string {
    const { animation } = element;
    
    if (!animation) return '';
    
    const classes: string[] = [];
    
    // Entrance animation
    if (animation.entrance && animation.entrance.type !== 'none') {
      classes.push(`entrance-${animation.entrance.type}`);
    }
    
    // Active state animations
    if (isActive) {
      if (animation.click === 'bounce') {
        classes.push('animate-bounce');
      }
      if (animation.click === 'pulse') {
        classes.push('animate-pulse');
      }
    }
    
    return classes.join(' ');
  }

  /**
   * Generate complete element style object
   */
/**
 * Generate complete element style object
 */
static generateElementStyle(
  element: Element,
  options: {
    isSelected?: boolean;
    isHovered?: boolean;
    isActive?: boolean;
    isDragging?: boolean;
    isResizing?: boolean;
    isInGroup?: boolean;
  } = {}
): React.CSSProperties {
  const {
    isSelected = false,
    isHovered = false,
    isActive = false,
    isDragging = false,
    isResizing = false,
    isInGroup = false
  } = options;

  const { style, type } = element;

  // Calculate transforms - ONLY apply base transforms from style
  const transforms: string[] = [];
  
  // Base scale from Effects tab
  const baseScale = style.scale || 1;
  if (baseScale !== 1) {
    transforms.push(`scale(${baseScale})`);
  }
  
  // Base rotation from Effects tab  
  const baseRotate = style.rotate || 0;
  if (baseRotate !== 0) {
    transforms.push(`rotate(${baseRotate}deg)`);
  }
  
  // ONLY apply hover/click transforms if they are explicitly configured
  // and NOT during drag/resize operations
  if (!isDragging && !isResizing) {
    // Hover effects - only if animation is configured
    if (isHovered && element.animation?.hover && element.animation.hover !== 'none') {
      switch (element.animation.hover) {
        case 'scale-up':
          // Replace the base scale with a slightly larger one
          const hoverScale = baseScale * 1.05;
          // Remove the base scale transform and add the hover scale
          const scaleIndex = transforms.findIndex(t => t.startsWith('scale'));
          if (scaleIndex >= 0) {
            transforms[scaleIndex] = `scale(${hoverScale})`;
          } else {
            transforms.unshift(`scale(${hoverScale})`);
          }
          break;
        case 'scale-down':
          const hoverScaleDown = baseScale * 0.95;
          const scaleDownIndex = transforms.findIndex(t => t.startsWith('scale'));
          if (scaleDownIndex >= 0) {
            transforms[scaleDownIndex] = `scale(${hoverScaleDown})`;
          } else {
            transforms.unshift(`scale(${hoverScaleDown})`);
          }
          break;
      }
    }
    
    // Click effects - only if animation is configured
    if (isActive && element.animation?.click && element.animation.click !== 'none') {
      switch (element.animation.click) {
        case 'scale-down':
          const clickScale = baseScale * 0.9;
          const clickScaleIndex = transforms.findIndex(t => t.startsWith('scale'));
          if (clickScaleIndex >= 0) {
            transforms[clickScaleIndex] = `scale(${clickScale})`;
          } else {
            transforms.unshift(`scale(${clickScale})`);
          }
          break;
      }
    }
  }

  const transformString = transforms.length ? transforms.join(' ') : 'none';

  return {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: typeof style.width === 'string' ? style.width : `${style.width}px`,
    height: typeof style.height === 'string' ? style.height : `${style.height}px`,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: this.getTextColor(element, isHovered, isActive),
    backgroundColor: type === 'shape' ? 'transparent' : this.getBackgroundColor(element, isHovered, isActive),
    borderRadius: `${style.borderRadius}px`,
    padding: `${style.padding}px`,
    textAlign: style.textAlign as 'left' | 'center' | 'right',
    zIndex: isDragging || isResizing ? 1000 : style.zIndex,
    boxSizing: 'border-box',
    cursor: isDragging ? 'grabbing' : (isInGroup ? 'pointer' : 'grab'),
    border: type === 'shape' ? 'none' : this.generateBorder(element, isSelected, isHovered),
    boxShadow: type === 'shape' ? 'none' : this.generateBoxShadow(element, isSelected, isHovered),
    userSelect: 'none',
    touchAction: 'none',
    opacity: style.opacity ?? 1,
    letterSpacing: style.letterSpacing !== undefined ? `${style.letterSpacing}px` : 'normal',
    lineHeight: style.lineHeight ?? 'normal',
    transform: transformString,
    transformOrigin: 'center center',
    filter: type === 'shape' ? 'none' : this.generateFilter(element),
    transition: (isDragging || isResizing) ? 'none' : 'all 0.2s ease',
    animationDuration: element.animation?.entrance?.duration ? `${element.animation.entrance.duration}ms` : '1000ms',
    animationDelay: element.animation?.entrance?.delay ? `${element.animation.entrance.delay}ms` : '0ms',
    animationFillMode: 'both'
  };
}


  /**
   * Generate CSS string for element animations (for injection into document)
   */
  static generateElementAnimationCSS(element: Element): string {
    const { animation } = element;
    
    if (!animation) return '';
    
    let css = '';
    
    // Hover animation CSS
    if (animation.hover && animation.hover !== 'none') {
      let hoverStyles = '';
      
      switch (animation.hover) {
        case 'bg-color':
          hoverStyles = `background-color: ${animation.hoverBgColor || '#3498db'};`;
          break;
        case 'text-color':
          hoverStyles = `color: ${animation.hoverTextColor || '#ffffff'};`;
          break;
        case 'scale-up':
          hoverStyles = 'transform: scale(1.05);';
          break;
        case 'scale-down':
          hoverStyles = 'transform: scale(0.95);';
          break;
        case 'shadow':
          hoverStyles = 'box-shadow: 0 5px 15px rgba(0,0,0,0.2);';
          break;
        case 'border':
          hoverStyles = `border: 2px solid ${animation.hoverBorderColor || '#3498db'};`;
          break;
      }
      
      if (hoverStyles) {
        css += `
          .element-wrapper[data-element-id="${element.id}"]:hover {
            ${hoverStyles}
            transition: all 0.3s ease;
          }
        `;
      }
    }
    
    // Click animation CSS
    if (animation.click) {    
      let clickStyles = '';
      let clickKeyframes = '';
      
      switch (animation.click) {
        case 'bg-color':
          clickStyles = `background-color: ${animation.clickBgColor || '#2980b9'};`;
          break;
        case 'text-color':
          clickStyles = `color: ${animation.clickTextColor || '#ffffff'};`;
          break;
        case 'scale-down':
          clickStyles = 'transform: scale(0.9);';
          break;
        case 'bounce':
          clickKeyframes = `
            @keyframes bounce-${element.id} {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `;
          clickStyles = `animation: bounce-${element.id} 0.5s ease;`;
          break;
        case 'pulse':
          clickKeyframes = `
            @keyframes pulse-${element.id} {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
          `;
          clickStyles = `animation: pulse-${element.id} 0.5s ease;`;
          break;
      }
      
      if (clickStyles) {
        css += `
          ${clickKeyframes}
          .element-wrapper[data-element-id="${element.id}"]:active {
            ${clickStyles}
          }
        `;
      }
    }
    
    return css;
  }

  /**
   * Check if element should have transparent background (for shapes)
   */
  static shouldUseTransparentBackground(element: Element): boolean {
    return element.type === 'shape';
  }

  /**
   * Check if element should have border styling
   */
  static shouldApplyBorder(element: Element): boolean {
    return element.type !== 'shape';
  }

  /**
   * Check if element should have box shadow
   */
  static shouldApplyBoxShadow(element: Element): boolean {
    return element.type !== 'shape';
  }

  /**
   * Check if element should have filter effects
   */
  static shouldApplyFilter(element: Element): boolean {
    return element.type !== 'shape';
  }
}

export default ElementStyleService;