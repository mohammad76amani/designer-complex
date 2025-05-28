import { Element } from '../types/template';

export class CanvasCalculationService {

  /**
   * Convert screen coordinates to canvas coordinates
   */
  static screenToCanvas(
    screenX: number,
    screenY: number,
    canvasElement: HTMLElement
  ): { x: number; y: number } {
    const canvasRect = canvasElement.getBoundingClientRect();
    return {
      x: screenX - canvasRect.left,
      y: screenY - canvasRect.top
    };
  }

  /**
   * Convert canvas coordinates to screen coordinates
   */
  static canvasToScreen(
    canvasX: number,
    canvasY: number,
    canvasElement: HTMLElement
  ): { x: number; y: number } {
    const canvasRect = canvasElement.getBoundingClientRect();
    return {
      x: canvasX + canvasRect.left,
      y: canvasY + canvasRect.top
    };
  }

  /**
   * Calculate element bounds (position + dimensions)
   */
  static getElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
  } {
    const width = typeof element.style.width === 'number' 
      ? element.style.width 
      : parseFloat(element.style.width as string);
    const height = typeof element.style.height === 'number' 
      ? element.style.height 
      : parseFloat(element.style.height as string);

    return {
      x: element.style.x,
      y: element.style.y,
      width,
      height,
      left: element.style.x,
      top: element.style.y,
      right: element.style.x + width,
      bottom: element.style.y + height
    };
  }

  /**
   * Calculate center point of an element
   */
  static getElementCenter(element: Element): { x: number; y: number } {
    const bounds = this.getElementBounds(element);
    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2
    };
  }

  /**
   * Calculate distance between two points
   */
  static getDistance(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Snap position to grid
   */
  static snapToGrid(
    position: { x: number; y: number },
    gridSize: number
  ): { x: number; y: number } {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }

  /**
   * Calculate snap guides for smart alignment
   */
  static calculateSnapGuides(
    element: Element,
    otherElements: Element[],
    snapThreshold: number = 5
  ): {
    snappedPosition: { x: number; y: number } | null;
    guides: Array<{ type: 'vertical' | 'horizontal'; position: number }>;
  } {
    const elementBounds = this.getElementBounds(element);
    const guides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];
    let snappedX = elementBounds.x;
    let snappedY = elementBounds.y;
    let hasSnappedX = false;
    let hasSnappedY = false;

    for (const otherElement of otherElements) {
      if (otherElement.id === element.id) continue;
      
      const otherBounds = this.getElementBounds(otherElement);
      
      // Vertical alignment checks
      if (!hasSnappedX) {
        // Left edges align
        if (Math.abs(elementBounds.x - otherBounds.left) <= snapThreshold) {
          snappedX = otherBounds.left;
          hasSnappedX = true;
          guides.push({ type: 'vertical', position: otherBounds.left });
        }
        // Right edges align
        else if (Math.abs(elementBounds.right - otherBounds.right) <= snapThreshold) {
          snappedX = otherBounds.right - elementBounds.width;
          hasSnappedX = true;
          guides.push({ type: 'vertical', position: otherBounds.right });
        }
        // Centers align
        else if (Math.abs((elementBounds.x + elementBounds.width / 2) - (otherBounds.left + otherBounds.width / 2)) <= snapThreshold) {
          snappedX = otherBounds.left + otherBounds.width / 2 - elementBounds.width / 2;
          hasSnappedX = true;
          guides.push({ type: 'vertical', position: otherBounds.left + otherBounds.width / 2 });
        }
      }
      
      // Horizontal alignment checks
      if (!hasSnappedY) {
        // Top edges align
        if (Math.abs(elementBounds.y - otherBounds.top) <= snapThreshold) {
          snappedY = otherBounds.top;
          hasSnappedY = true;
          guides.push({ type: 'horizontal', position: otherBounds.top });
        }
        // Bottom edges align
        else if (Math.abs(elementBounds.bottom - otherBounds.bottom) <= snapThreshold) {
          snappedY = otherBounds.bottom - elementBounds.height;
          hasSnappedY = true;
          guides.push({ type: 'horizontal', position: otherBounds.bottom });
        }
        // Centers align
        else if (Math.abs((elementBounds.y + elementBounds.height / 2) - (otherBounds.top + otherBounds.height / 2)) <= snapThreshold) {
          snappedY = otherBounds.top + otherBounds.height / 2 - elementBounds.height / 2;
          hasSnappedY = true;
          guides.push({ type: 'horizontal', position: otherBounds.top + otherBounds.height / 2 });
        }
      }
    }

    const snappedPosition = (hasSnappedX || hasSnappedY) ? { x: snappedX, y: snappedY } : null;
    return { snappedPosition, guides };
  }

  /**
   * Calculate resize constraints for element resizing
   */
  static calculateResizeConstraints(
    element: Element,
    handle: string,
    mousePosition: { x: number; y: number },
    initialBounds: { x: number; y: number; width: number; height: number },
    initialMousePosition: { x: number; y: number },
    minSize: { width: number; height: number },
    aspectRatio?: number
  ): { x: number; y: number; width: number; height: number } {
    const deltaX = mousePosition.x - initialMousePosition.x;
    const deltaY = mousePosition.y - initialMousePosition.y;
    
    let newX = initialBounds.x;
    let newY = initialBounds.y;
    let newWidth = initialBounds.width;
    let newHeight = initialBounds.height;

    switch (handle) {
      case 'n': // North
        newY = initialBounds.y + deltaY;
        newHeight = initialBounds.height - deltaY;
        break;
      case 's': // South
        newHeight = initialBounds.height + deltaY;
        break;
      case 'e': // East
        newWidth = initialBounds.width + deltaX;
        break;
      case 'w': // West
        newX = initialBounds.x + deltaX;
        newWidth = initialBounds.width - deltaX;
        break;
      case 'ne': // Northeast
        newWidth = initialBounds.width + deltaX;
        newY = initialBounds.y + deltaY;
        newHeight = initialBounds.height - deltaY;
        break;
      case 'nw': // Northwest
        newX = initialBounds.x + deltaX;
        newWidth = initialBounds.width - deltaX;
        newY = initialBounds.y + deltaY;
        newHeight = initialBounds.height - deltaY;
        break;
      case 'se': // Southeast
        newWidth = initialBounds.width + deltaX;
        newHeight = initialBounds.height + deltaY;
        break;
      case 'sw': // Southwest
        newX = initialBounds.x + deltaX;
        newWidth = initialBounds.width - deltaX;
        newHeight = initialBounds.height + deltaY;
        break;
    }

    // Apply minimum size constraints
    if (newWidth < minSize.width) {
      if (handle.includes('w')) {
        newX = newX - (minSize.width - newWidth);
      }
      newWidth = minSize.width;
    }
    
    if (newHeight < minSize.height) {
      if (handle.includes('n')) {
        newY = newY - (minSize.height - newHeight);
      }
      newHeight = minSize.height;
    }

    // Apply aspect ratio if specified
    if (aspectRatio) {
      const currentRatio = newWidth / newHeight;
      if (Math.abs(currentRatio - aspectRatio) > 0.01) {
        if (handle.includes('e') || handle.includes('w')) {
          // Width changed, adjust height
          newHeight = newWidth / aspectRatio;
          if (handle.includes('n')) {
            newY = initialBounds.y + initialBounds.height - newHeight;
          }
        } else {
          // Height changed, adjust width
          newWidth = newHeight * aspectRatio;
          if (handle.includes('w')) {
            newX = initialBounds.x + initialBounds.width - newWidth;
          }
        }
      }
    }

    return { x: newX, y: newY, width: newWidth, height: newHeight };
  }

  /**
   * Constrain element to canvas bounds
   */
  static constrainToCanvas(
    bounds: { x: number; y: number; width: number; height: number },
    canvasBounds: { width: number; height: number }
  ): { x: number; y: number; width: number; height: number } {
    let { x, y, width, height } = bounds;
    
    // Ensure element doesn't go outside canvas
    x = Math.max(0, Math.min(x, canvasBounds.width - width));
    y = Math.max(0, Math.min(y, canvasBounds.height - height));
    
    // Ensure element fits within canvas
    if (x + width > canvasBounds.width) {
      width = canvasBounds.width - x;
    }
    if (y + height > canvasBounds.height) {
      height = canvasBounds.height - y;
    }
    
    return { x, y, width, height };
  }

  /**
   * Detect collisions between elements
   */
  static detectCollisions(
    element: Element,
    otherElements: Element[],
    tolerance: number = 0
  ): Element[] {
    const elementBounds = this.getElementBounds(element);
    const collisions: Element[] = [];
    
    for (const otherElement of otherElements) {
      if (otherElement.id === element.id) continue;
      
      const otherBounds = this.getElementBounds(otherElement);
      
      // Check for overlap with tolerance
      const overlap = !(
        elementBounds.right + tolerance <= otherBounds.left ||
        otherBounds.right + tolerance <= elementBounds.left ||
        elementBounds.bottom + tolerance <= otherBounds.top ||
        otherBounds.bottom + tolerance <= elementBounds.top
      );
      
      if (overlap) {
        collisions.push(otherElement);
      }
    }
    
    return collisions;
  }

  /**
   * Calculate grid lines for canvas
   */
  static calculateGridLines(
    canvasBounds: { width: number; height: number },
    gridSize: number
  ): { vertical: number[]; horizontal: number[] } {
    const vertical: number[] = [];
    const horizontal: number[] = [];
    
    // Vertical lines
    for (let x = 0; x <= canvasBounds.width; x += gridSize) {
      vertical.push(x);
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvasBounds.height; y += gridSize) {
      horizontal.push(y);
    }
    
    return { vertical, horizontal };
  }

  /**
   * Calculate optimal zoom level for canvas
   */
  static calculateOptimalZoom(
    canvasBounds: { width: number; height: number },
    containerBounds: { width: number; height: number },
    padding: number = 40
  ): number {
    const availableWidth = containerBounds.width - padding * 2;
    const availableHeight = containerBounds.height - padding * 2;
    
    const scaleX = availableWidth / canvasBounds.width;
    const scaleY = availableHeight / canvasBounds.height;
    
    return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  }

  /**
   * Check if point is inside element bounds
   */
  static isPointInElement(
    point: { x: number; y: number },
    element: Element
  ): boolean {
    const bounds = this.getElementBounds(element);
    return (
      point.x >= bounds.left &&
      point.x <= bounds.right &&
      point.y >= bounds.top &&
      point.y <= bounds.bottom
    );
  }

  /**
   * Find elements at a specific point
   */
  static getElementsAtPoint(
    point: { x: number; y: number },
    elements: Element[]
  ): Element[] {
    return elements
      .filter(element => this.isPointInElement(point, element))
      .sort((a, b) => b.style.zIndex - a.style.zIndex); // Sort by z-index, highest first
  }

  /**
   * Calculate bounding box for multiple elements
   */
  static calculateBoundingBox(elements: Element[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    
    const bounds = elements.map(el => this.getElementBounds(el));
    
    const left = Math.min(...bounds.map(b => b.left));
    const top = Math.min(...bounds.map(b => b.top));
    const right = Math.max(...bounds.map(b => b.right));
    const bottom = Math.max(...bounds.map(b => b.bottom));
    
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top
    };
  }
}

export default CanvasCalculationService;
