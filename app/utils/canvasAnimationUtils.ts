import { Element } from '../types/template';
import { generateElementAnimationCSS } from './animationUtils';

/**
 * Generate CSS for all animations in the canvas
 */
export const generateCanvasAnimationCSS = (elements: Element[]): string => {
  return elements
    .filter(element => element.animation) // Only process elements with animations
    .map(element => generateElementAnimationCSS(element))
    .join('\n');
};

/**
 * Inject animation CSS into the document
 */
export const injectAnimationStyles = (elements: Element[]): void => {
  // Remove any existing animation styles
  const existingStyle = document.getElementById('canvas-animations');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Generate new animation CSS
  const css = generateCanvasAnimationCSS(elements);
  
  // Skip if there's no CSS to inject
  if (!css.trim()) return;
  
  // Create and inject the style element
  const style = document.createElement('style');
  style.id = 'canvas-animations';
  style.textContent = css;
  document.head.appendChild(style);
};
