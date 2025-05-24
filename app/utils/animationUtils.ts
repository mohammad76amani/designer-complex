import { Element } from '../types/template';

// Simple animation options for hover and click
export const hoverAnimationOptions = [
  { value: 'none', label: 'None' },
  { value: 'bg-color', label: 'Background Color' },
  { value: 'text-color', label: 'Text Color' },
  { value: 'scale-up', label: 'Scale Up' },
  { value: 'scale-down', label: 'Scale Down' },
  { value: 'shadow', label: 'Add Shadow' },
  { value: 'border', label: 'Add Border' }
];

export const clickAnimationOptions = [
  { value: 'none', label: 'None' },
  { value: 'bg-color', label: 'Background Color' },
  { value: 'text-color', label: 'Text Color' },
  { value: 'scale-down', label: 'Scale Down' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'pulse', label: 'Pulse' }
];

// Get animation classes for an element
export const getAnimationClasses = (element: Element): string => {
  if (!element.animation) return '';
  
  const classes = [];
  
  // Add animation classes based on the element's animation properties
  if (element.animation.hover && element.animation.hover !== 'none') {
    classes.push(`hover-${element.animation.hover}`);
  }
  
  if (element.animation.click) {
    classes.push(`click-${element.animation.click}`);
  }
  
  return classes.join(' ');
};

// Generate default animation config
export const getDefaultAnimationConfig = () => {
  return {
    hover: 'none',
    click: 'none'
  };
};

// Generate CSS for element animations
export const generateElementAnimationCSS = (element: Element): string => {
  if (!element.animation) return '';
  
  let css = '';
  
  // Hover animation
  if (element.animation.hover && element.animation.hover !== 'none') {
    let hoverStyles = '';
    
    switch (element.animation.hover) {
      case 'bg-color':
        hoverStyles = `background-color: ${element.animation.hoverBgColor || '#3498db'};`;
        break;
      case 'text-color':
        hoverStyles = `color: ${element.animation.hoverTextColor || '#ffffff'};`;
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
        hoverStyles = `border: 2px solid ${element.animation.hoverBorderColor || '#3498db'};`;
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
  
  // Click animation
  if (element.animation.click && element.animation.click !== 'none') {
    let clickStyles = '';
    let clickKeyframes = '';
    
    switch (element.animation.click) {
      case 'bg-color':
        clickStyles = `background-color: ${element.animation.clickBgColor || '#2980b9'};`;
        break;
      case 'text-color':
        clickStyles = `color: ${element.animation.clickTextColor || '#ffffff'};`;
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
};
