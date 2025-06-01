import { Element } from '../types/template';

interface StyleOptions {
  isDragging?: boolean;
  isSelected?: boolean;
  isInGroup?: boolean;
  isHovered?: boolean;
}

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
   * Generate transform CSS string based on element style and state
   */
  static generateTransform(
    element: Element, 
    isHovered: boolean = false, 
    isActive: boolean = false
  ): string {
    const { style, animation } = element;
    const transforms: string[] = [];
    
    // Base transforms from style
    if (style.rotate) {
      transforms.push(`rotate(${style.rotate}deg)`);
    }
    
    if (style.scale && style.scale !== 1) {
      transforms.push(`scale(${style.scale})`);
    }
    
    // Hover animations
    if (isHovered && animation?.hover) {
      switch (animation.hover) {
        case 'scale-up':
          transforms.push('scale(1.05)');
          break;
        case 'scale-down':
          transforms.push('scale(0.95)');
          break;
      }
    }
    
    // Click animations
    if (isActive && animation?.click === 'scale-down') {
      transforms.push('scale(0.9)');
    }
    
    return transforms.length ? transforms.join(' ') : 'none';
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
  
  return 'none'; // This is the problem!
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
   * Generate element style with proper font weight handling
   */
static generateElementStyle(element: Element, options: StyleOptions): React.CSSProperties {
  const { style } = element;
  
  // Convert font weight to proper format
  const getFontWeight = (weight: string | number): string => {
    // Handle legacy values
    if (weight === 'normal') return '400';
    if (weight === 'bold') return '700';
    
    // Ensure numeric weights are strings
    return String(weight);
  };

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: typeof style.width === 'string' ? style.width : `${style.width}px`,
    height: typeof style.height === 'string' ? style.height : `${style.height}px`,
    fontSize: `${style.fontSize}px`,
    fontWeight: getFontWeight(style.fontWeight), // Use the helper function
    color: style.color,
    backgroundColor: style.backgroundColor,
    borderRadius: `${style.borderRadius}px`,
    padding: `${style.padding}px`,
    zIndex: style.zIndex,
    boxSizing: 'border-box',
    cursor: options.isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    
    // Add font family to ensure font weights work
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    
    // Additional style properties
    opacity: style.opacity ?? 1,
    borderWidth: `${style.borderWidth ?? 0}px`,
    borderStyle: style.borderStyle ?? 'none',
    borderColor: style.borderColor ?? '#000000',
    letterSpacing: `${style.letterSpacing ?? 0}px`,
    lineHeight: style.lineHeight ?? 1.5,
    
    // Transform properties
    transform: `rotate(${style.rotate ?? 0}deg)`,
    
    // Filter properties
    filter: [
      style.blur ? `blur(${style.blur}px)` : '',
      style.brightness !== undefined ? `brightness(${style.brightness}%)` : '',
      style.contrast !== undefined ? `contrast(${style.contrast}%)` : ''
    ].filter(Boolean).join(' ') || 'none',
    
    // Box shadow
    boxShadow: style.boxShadowBlur || style.boxShadowSpread ? 
      `0 0 ${style.boxShadowBlur ?? 0}px ${style.boxShadowSpread ?? 0}px ${style.boxShadowColor ?? 'rgba(0,0,0,0.2)'}` : 
      'none'
  };

  // Add selection styles
  if (options.isSelected && !options.isInGroup) {
    baseStyle.outline = '2px solid #3498db';
    baseStyle.outlineOffset = '2px';
  }

  // Add hover/active states for animations
  if (options.isHovered && element.animation?.hover) {
    // Apply hover animations
    switch (element.animation.hover) {
      case 'scale-up':
        baseStyle.transform = `${baseStyle.transform} scale(1.05)`;
        break;
      case 'scale-down':
        baseStyle.transform = `${baseStyle.transform} scale(0.95)`;
        break;
      case 'bg-color':
        baseStyle.backgroundColor = element.animation.hoverBgColor || '#3498db';
        break;
      case 'text-color':
        baseStyle.color = element.animation.hoverTextColor || '#ffffff';
        break;
      case 'shadow':
        baseStyle.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        break;
      case 'border':
        baseStyle.borderWidth = '2px';
        baseStyle.borderStyle = 'solid';
        baseStyle.borderColor = element.animation.hoverBorderColor || '#3498db';
        break;
    }
  }

  return baseStyle;
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