import { tree } from 'next/dist/build/templates/app-page';
import { Element } from '../types/template';

export class ElementFactoryService {
  /**
   * Create a new element with default properties
   */
  static createElement(
    elementType: string,
    position: { x: number; y: number },
    existingElementsCount: number = 0,
    shapeType?: string // Optional parameter for shape type
  ): Element {
  console.log('ElementFactoryService: Creating element', { elementType, position, existingElementsCount, shapeType });
    
    // In the createElement method, remove scale from baseElement.style:
const baseElement = {
  style: {
    x: position.x,
    y: position.y,
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    textAlign: 'left' as const,
    zIndex: existingElementsCount + 1
  }
};


    switch (elementType) {
      case 'heading':
        return {
          id: `heading-${Date.now()}`,
          type: 'heading',
          content: 'New Heading',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 200,
            height: 50,
            fontSize: 24,
            fontWeight: 'bold'
          }
        };

      case 'paragraph':
        return {
          id: `paragraph-${Date.now()}`,
          type: 'paragraph',
          content: 'New paragraph text. Double-click to edit.',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 300,
            height: 100
          }
        };

      case 'button':
        return {
          id: `button-${Date.now()}`,
          type: 'button',
          content: 'Click Me',
          href: '',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 120,
            height: 40,
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#3498db',
            borderRadius: 4,
            textAlign: 'center'
          }
        };

      case 'image':
        return {
          id: `image-${Date.now()}`,
          type: 'image',
          content: '',
          src: 'https://www.stratstone.com/-/media/stratstone/blog/2024/top-10-best-supercars-of-2024/mclaren-750s-driving-dynamic-hero-1920x774px.ashx',
          alt: 'Placeholder image',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 300,
            height: 200
          }
        };

      case 'video':
        return {
          id: `video-${Date.now()}`,
          type: 'video',
          content: '',
          src: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          autoplay: true,
          loop: true,
          muted: true,
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 400,
            height: 225
          }
        };

     case 'shape':
  return {
    id: `shape-${Date.now()}`,
    type: 'shape',
    content: '',
    shapeType: shapeType || 'rectangle', // This line is already correct
    ...baseElement,
    style: {
      ...baseElement.style,
      width: 100,
      height: 100,
      backgroundColor: 'transparent' // Keep container transparent
    },
    svgStyle: {
      fill: '#3498db',
      stroke: 'transparent',
      strokeWidth: 0,
      opacity: 1
    }
  };


      default:
        throw new Error(`Unknown element type: ${elementType}`);
    }
  }

  /**
   * Create element with smart positioning to avoid overlaps
   */
  static createElementWithSmartPositioning(
    elementType: string,
    preferredPosition: { x: number; y: number },
    existingElements: Element[],
    zIndex: number,
    maxAttempts: number = 10,
    shapeType?: string // Add this parameter
  ): Element {
    const element = this.createElement(elementType, preferredPosition, existingElements.length, shapeType); // Pass shapeType
    
    // Try to find a non-overlapping position
    let attempts = 0;
    let currentPosition = { ...preferredPosition };
    
    while (attempts < maxAttempts) {
      const tempElement = {
        ...element,
        style: { ...element.style, x: currentPosition.x, y: currentPosition.y, zIndex }
      };
      
      const hasOverlap = existingElements.some(existing => 
        this.elementsOverlap(tempElement, existing)
      );
      
      if (!hasOverlap) {
        return {
          ...element,
          style: { ...element.style, x: currentPosition.x, y: currentPosition.y, zIndex }
        };
      }
      
      // Try a new position with some offset
      currentPosition.x += 20;
      currentPosition.y += 20;
      attempts++;
    }
    
    // If we can't find a non-overlapping position, just use the preferred position
    return {
      ...element,
      style: { ...element.style, x: preferredPosition.x, y: preferredPosition.y, zIndex }
    };
  }

  /**
   * Create a validated element that fits within canvas bounds
   */
  static createValidatedElement(
    elementType: string,
    position: { x: number; y: number },
    zIndex: number,
    canvasBounds: { width: number; height: number },
    templateElement?: Partial<Element>
  ): Element {
    const element = templateElement 
      ? { ...this.createElement(elementType, position, 0), ...templateElement }
      : this.createElement(elementType, position, 0);
    
    // Ensure element fits within canvas
    const elementWidth = typeof element.style.width === 'number' 
      ? element.style.width 
      : parseFloat(element.style.width as string);
    const elementHeight = typeof element.style.height === 'number' 
      ? element.style.height 
      : parseFloat(element.style.height as string);
    
    const constrainedX = Math.max(0, Math.min(position.x, canvasBounds.width - elementWidth));
    const constrainedY = Math.max(0, Math.min(position.y, canvasBounds.height - elementHeight));
    
    return {
      ...element,
      style: {
        ...element.style,
        x: constrainedX,
        y: constrainedY,
        zIndex
      }
    };
  }

  /**
   * Clone an element with new position and ID
   */
  static cloneElement(
    element: Element,
    newPosition: { x: number; y: number },
    idSuffix?: string
  ): Element {
    return {
      ...element,
      id: `${element.type}-${idSuffix || Date.now()}`,
      style: {
        ...element.style,
        x: newPosition.x,
        y: newPosition.y
      }
    };
  }

  /**
   * Create element from clipboard
   */
  static createFromClipboard(
    clipboardElement: Element,
    position: { x: number; y: number }
  ): Element {
    return this.cloneElement(clipboardElement, position, `paste-${Date.now()}`);
  }

  /**
   * Create a group from multiple elements
   */
  static createGroupFromElements(elements: Element[]): { group: Element; updatedElements: Element[] } {
    if (elements.length < 2) {
      throw new Error('Need at least 2 elements to create a group');
    }
    
    // Calculate bounding box for all elements
    const bounds = this.calculateBoundingBox(elements);
    
    // Create group element
    const group: Element = {
      id: `group-${Date.now()}`,
      type: 'group',
      content: '',
      childIds: elements.map(el => el.id),
      style: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        fontSize: 16,
        fontWeight: 'normal',
        color: 'transparent',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex: Math.max(...elements.map(el => el.style.zIndex)) + 1
      }
    };
    
    // Update child elements to be relative to group
    const updatedElements = elements.map(element => ({
      ...element,
      parentId: group.id,
      style: {
        ...element.style,
        x: element.style.x - bounds.x,
        y: element.style.y - bounds.y
      }
    }));
    
    return { group, updatedElements };
  }

  /**
   * Calculate bounding box for multiple elements
   */
  private static calculateBoundingBox(elements: Element[]): { x: number; y: number; width: number; height: number } {
    const positions = elements.map(el => ({
      left: el.style.x,
      top: el.style.y,
      right: el.style.x + (typeof el.style.width === 'number' ? el.style.width : parseFloat(el.style.width as string)),
      bottom: el.style.y + (typeof el.style.height === 'number' ? el.style.height : parseFloat(el.style.height as string))
    }));
    
    const left = Math.min(...positions.map(p => p.left));
    const top = Math.min(...positions.map(p => p.top));
    const right = Math.max(...positions.map(p => p.right));
    const bottom = Math.max(...positions.map(p => p.bottom));
    
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }

  /**
   * Check if two elements overlap
   */
  private static elementsOverlap(element1: Element, element2: Element): boolean {
    const el1Width = typeof element1.style.width === 'number' 
      ? element1.style.width 
      : parseFloat(element1.style.width as string);
    const el1Height = typeof element1.style.height === 'number' 
      ? element1.style.height 
      : parseFloat(element1.style.height as string);
    const el2Width = typeof element2.style.width === 'number' 
      ? element2.style.width 
      : parseFloat(element2.style.width as string);
    const el2Height = typeof element2.style.height === 'number' 
      ? element2.style.height 
      : parseFloat(element2.style.height as string);
    
    const rect1 = {
      left: element1.style.x,
      top: element1.style.y,
      right: element1.style.x + el1Width,
      bottom: element1.style.y + el1Height
    };
    
    const rect2 = {
      left: element2.style.x,
      top: element2.style.y,
      right: element2.style.x + el2Width,
      bottom: element2.style.y + el2Height
    };
    
    return !(rect1.right <= rect2.left || 
             rect2.right <= rect1.left || 
             rect1.bottom <= rect2.top || 
             rect2.bottom <= rect1.top);
  }
}

export default ElementFactoryService;