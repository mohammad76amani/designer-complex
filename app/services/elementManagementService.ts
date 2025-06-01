import { Element } from '../types/template';

/**
 * Service for managing element CRUD operations and transformations
 */
export class ElementManagementService {

  /**
   * Create a new element with default properties
   */
  static createElement(
    elementType: string,
    position: { x: number; y: number },
    existingElementsCount: number = 0
  ): Element {
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
          href: '#',
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
          src: 'https://via.placeholder.com/300x200',
          alt: 'Placeholder image',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 300,
            height: 200,
            backgroundColor: '#f0f0f0',
            textAlign: 'center',
            objectFit: 'cover'
          }
        };

      case 'video':
        return {
          id: `video-${Date.now()}`,
          type: 'video',
          content: '',
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 320,
            height: 240,
            backgroundColor: '#000000',
            textAlign: 'center',
            objectFit: 'contain'
          }
        };

      case 'shape':
        return {
          id: `shape-${Date.now()}`,
          type: 'shape',
          content: '',
          shapeType: 'rectangle',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 150,
            height: 150,
            backgroundColor: '#e74c3c',
            textAlign: 'center',
            borderWidth: 0,
            borderStyle: 'none',
            borderColor: '#000000'
          }
        };

      default:
        return {
          id: `element-${Date.now()}`,
          type: elementType,
          content: 'New Element',
          ...baseElement,
          style: {
            ...baseElement.style,
            width: 100,
            height: 100
          }
        };
    }
  }

  /**
   * Clone an element with a new ID and optional position offset
   */
  static cloneElement(
    element: Element,
    positionOffset: { x: number; y: number } = { x: 20, y: 20 }
  ): Element {
    const newId = `${element.id}-copy-${Date.now()}`;
    
    return {
      ...element,
      id: newId,
      style: {
        ...element.style,
        x: element.style.x + positionOffset.x,
        y: element.style.y + positionOffset.y
      }
    };
  }

  /**
   * Delete element from elements array
   */
  static deleteElement(elements: Element[], elementId: string): Element[] {
    return elements.filter(el => el.id !== elementId);
  }

  /**
   * Delete multiple elements from elements array
   */
  static deleteElements(elements: Element[], elementIds: string[]): Element[] {
    return elements.filter(el => !elementIds.includes(el.id));
  }

  /**
   * Update element in elements array
   */
  static updateElement(elements: Element[], updatedElement: Element): Element[] {
    return elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
  }

  /**
   * Update multiple elements in elements array
   */
  static updateElements(elements: Element[], updatedElements: Element[]): Element[] {
    const updatedElementsMap = new Map(updatedElements.map(el => [el.id, el]));
    
    return elements.map(el => 
      updatedElementsMap.has(el.id) ? updatedElementsMap.get(el.id)! : el
    );
  }

  /**
   * Find element by ID
   */
  static findElementById(elements: Element[], elementId: string): Element | undefined {
    return elements.find(el => el.id === elementId);
  }

  /**
   * Find elements by IDs
   */
  static findElementsByIds(elements: Element[], elementIds: string[]): Element[] {
    return elements.filter(el => elementIds.includes(el.id));
  }

  /**
   * Get elements by type
   */
  static getElementsByType(elements: Element[], elementType: string): Element[] {
    return elements.filter(el => el.type === elementType);
  }

  /**
   * Get child elements of a group
   */
  static getChildElements(elements: Element[], parentId: string): Element[] {
    return elements.filter(el => el.parentId === parentId);
  }

  /**
   * Get top-level elements (not in any group)
   */
  static getTopLevelElements(elements: Element[]): Element[] {
    return elements.filter(el => !el.parentId);
  }

  /**
   * Calculate bounding box for multiple elements
   */
  static calculateBoundingBox(elements: Element[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  } {
    if (elements.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    elements.forEach(el => {
      const x = el.style.x;
      const y = el.style.y;
      const width = typeof el.style.width === 'number' ? el.style.width : parseInt(el.style.width as string);
      const height = typeof el.style.height === 'number' ? el.style.height : parseInt(el.style.height as string);
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Create a group from selected elements
   */
  static createGroup(elements: Element[], selectedElementIds: string[]): {
    updatedElements: Element[];
    groupElement: Element;
  } {
    if (selectedElementIds.length <= 1) {
      throw new Error('Need at least 2 elements to create a group');
    }

    const selectedElements = this.findElementsByIds(elements, selectedElementIds);
    const boundingBox = this.calculateBoundingBox(selectedElements);
    
    // Create group element
    const groupId = `group-${Date.now()}`;
    const groupElement: Element = {
      id: groupId,
      type: 'group',
      content: '',
      childIds: selectedElementIds,
      style: {
        x: boundingBox.minX,
        y: boundingBox.minY,
        width: boundingBox.width,
        height: boundingBox.height,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex: Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1
      }
    };

    // Update child elements to reference their parent group and adjust positions
    const updatedElements = elements.map(el => {
      if (selectedElementIds.includes(el.id)) {
        return {
          ...el,
          parentId: groupId,
          style: {
            ...el.style,
            // Make position relative to the group
            x: el.style.x - boundingBox.minX,
            y: el.style.y - boundingBox.minY
          }
        };
      }
      return el;
    });

    // Add the group element
    return {
      updatedElements: [...updatedElements, groupElement],
      groupElement
    };
  }

  /**
   * Ungroup elements from a group
   */
  static ungroupElements(elements: Element[], groupElement: Element): Element[] {
    if (groupElement.type !== 'group' || !groupElement.childIds) {
      throw new Error('Element is not a group or has no child elements');
    }

    // Update child elements to remove parent reference and restore absolute positioning
    const updatedElements = elements.map(el => {
      if (el.parentId === groupElement.id) {
        return {
          ...el,
          parentId: undefined,
          style: {
            ...el.style,
            // Restore absolute positioning
            x: el.style.x + groupElement.style.x,
            y: el.style.y + groupElement.style.y
          }
        };
      }
      return el;
    });

    // Remove the group element
    return updatedElements.filter(el => el.id !== groupElement.id);
  }

  /**
   * Move element(s) by delta
   */
  static moveElements(
    elements: Element[], 
    elementIds: string[], 
    delta: { x: number; y: number }
  ): Element[] {
    return elements.map(el => {
      if (elementIds.includes(el.id)) {
        return {
          ...el,
          style: {
            ...el.style,
            x: el.style.x + delta.x,
            y: el.style.y + delta.y
          }
        };
      }
      return el;
    });
  }

  /**
   * Resize element
   */
  static resizeElement(
    element: Element,
    newSize: { width: number; height: number },
    newPosition?: { x: number; y: number }
  ): Element {
    return {
      ...element,
      style: {
        ...element.style,
        width: newSize.width,
        height: newSize.height,
        ...(newPosition && { x: newPosition.x, y: newPosition.y })
      }
    };
  }

  /**
   * Duplicate element at position
   */
  static duplicateElement(
    elements: Element[],
    elementId: string,
    position: { x: number; y: number }
  ): { updatedElements: Element[]; newElement: Element } {
    const elementToDuplicate = this.findElementById(elements, elementId);
    
    if (!elementToDuplicate) {
      throw new Error('Element not found');
    }

    const newElement = this.cloneElement(elementToDuplicate, {
      x: position.x - elementToDuplicate.style.x,
      y: position.y - elementToDuplicate.style.y
    });

    return {
      updatedElements: [...elements, newElement],
      newElement
    };
  }

  /**
   * Get element z-index range
   */
  static getZIndexRange(elements: Element[]): { min: number; max: number } {
    if (elements.length === 0) {
      return { min: 0, max: 0 };
    }

    const zIndexes = elements.map(el => el.style.zIndex || 0);
    return {
      min: Math.min(...zIndexes),
      max: Math.max(...zIndexes)
    };
  }

  /**
   * Bring element to front
   */
  static bringToFront(elements: Element[], elementId: string): Element[] {
    const { max } = this.getZIndexRange(elements);
    
    return elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          style: {
            ...el.style,
            zIndex: max + 1
          }
        };
      }
      return el;
    });
  }

  /**
   * Send element to back
   */
  static sendToBack(elements: Element[], elementId: string): Element[] {
    const { min } = this.getZIndexRange(elements);
    
    return elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          style: {
            ...el.style,
            zIndex: min - 1
          }
        };
      }
      return el;
    });
  }

  /**
   * Check if element is within canvas bounds
   */
  static isElementWithinBounds(
    element: Element,
    canvasBounds: { width: number; height: number }
  ): boolean {
    const elementWidth = typeof element.style.width === 'number' 
      ? element.style.width 
      : parseInt(element.style.width as string);
    const elementHeight = typeof element.style.height === 'number' 
      ? element.style.height 
      : parseInt(element.style.height as string);

    return (
      element.style.x >= 0 &&
      element.style.y >= 0 &&
      element.style.x + elementWidth <= canvasBounds.width &&
      element.style.y + elementHeight <= canvasBounds.height
    );
  }

  /**
   * Constrain element to canvas bounds
   */
  static constrainToCanvas(
    element: Element,
    canvasBounds: { width: number; height: number }
  ): Element {
    const elementWidth = typeof element.style.width === 'number' 
      ? element.style.width 
      : parseInt(element.style.width as string);
    const elementHeight = typeof element.style.height === 'number' 
      ? element.style.height 
      : parseInt(element.style.height as string);

    const constrainedX = Math.max(0, Math.min(element.style.x, canvasBounds.width - elementWidth));
    const constrainedY = Math.max(0, Math.min(element.style.y, canvasBounds.height - elementHeight));

    return {
      ...element,
      style: {
        ...element.style,
        x: constrainedX,
        y: constrainedY
      }
    };
  }

  /**
   * Sort elements by z-index
   */
  static sortElementsByZIndex(elements: Element[], ascending: boolean = true): Element[] {
    return [...elements].sort((a, b) => {
      const aZIndex = a.style.zIndex || 0;
      const bZIndex = b.style.zIndex || 0;
      return ascending ? aZIndex - bZIndex : bZIndex - aZIndex;
    });
  }

  /**
   * Get elements at position (for hit testing)
   */
  static getElementsAtPosition(
    elements: Element[],
    position: { x: number; y: number }
  ): Element[] {
    return elements.filter(el => {
      const elementWidth = typeof el.style.width === 'number' 
        ? el.style.width 
        : parseInt(el.style.width as string);
      const elementHeight = typeof el.style.height === 'number' 
        ? el.style.height 
        : parseInt(el.style.height as string);

      return (
        position.x >= el.style.x &&
        position.x <= el.style.x + elementWidth &&
        position.y >= el.style.y &&
        position.y <= el.style.y + elementHeight
      );
    });
  }

  /**
   * Get top element at position (highest z-index)
   */
  static getTopElementAtPosition(
    elements: Element[],
    position: { x: number; y: number }
  ): Element | undefined {
    const elementsAtPosition = this.getElementsAtPosition(elements, position);
    const sortedElements = this.sortElementsByZIndex(elementsAtPosition, false);
    return sortedElements[0];
  }

  /**
   * Check if elements overlap
   */
  static doElementsOverlap(element1: Element, element2: Element): boolean {
    const el1Width = typeof element1.style.width === 'number' 
      ? element1.style.width 
      : parseInt(element1.style.width as string);
    const el1Height = typeof element1.style.height === 'number' 
      ? element1.style.height 
      : parseInt(element1.style.height as string);
    const el2Width = typeof element2.style.width === 'number' 
      ? element2.style.width 
      : parseInt(element2.style.width as string);
    const el2Height = typeof element2.style.height === 'number' 
      ? element2.style.height 
      : parseInt(element2.style.height as string);

    return !(
      element1.style.x + el1Width < element2.style.x ||
      element2.style.x + el2Width < element1.style.x ||
      element1.style.y + el1Height < element2.style.y ||
      element2.style.y + el2Height < element1.style.y
    );
  }

  /**
   * Get overlapping elements
   */
  static getOverlappingElements(elements: Element[], targetElement: Element): Element[] {
    return elements.filter(el => 
      el.id !== targetElement.id && this.doElementsOverlap(el, targetElement)
    );
  }

  /**
   * Align elements
   */
  static alignElements(
    elements: Element[],
    elementIds: string[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
  ): Element[] {
    const elementsToAlign = this.findElementsByIds(elements, elementIds);
    
    if (elementsToAlign.length < 2) {
      return elements;
    }

    const boundingBox = this.calculateBoundingBox(elementsToAlign);
    
    return elements.map(el => {
      if (elementIds.includes(el.id)) {
        const elementWidth = typeof el.style.width === 'number' 
          ? el.style.width 
          : parseInt(el.style.width as string);
        const elementHeight = typeof el.style.height === 'number' 
          ? el.style.height 
          : parseInt(el.style.height as string);

        let newX = el.style.x;
        let newY = el.style.y;

        switch (alignment) {
          case 'left':
            newX = boundingBox.minX;
            break;
          case 'center':
            newX = boundingBox.minX + (boundingBox.width - elementWidth) / 2;
            break;
          case 'right':
            newX = boundingBox.maxX - elementWidth;
            break;
          case 'top':
            newY = boundingBox.minY;
            break;
          case 'middle':
            newY = boundingBox.minY + (boundingBox.height - elementHeight) / 2;
            break;
          case 'bottom':
            newY = boundingBox.maxY - elementHeight;
            break;
        }

        return {
          ...el,
          style: {
            ...el.style,
            x: newX,
            y: newY
          }
        };
      }
      return el;
    });
  }

  /**
   * Distribute elements evenly
   */
  static distributeElements(
    elements: Element[],
    elementIds: string[],
    direction: 'horizontal' | 'vertical'
  ): Element[] {
    const elementsToDistribute = this.findElementsByIds(elements, elementIds);
    
    if (elementsToDistribute.length < 3) {
      return elements;
    }

    // Sort elements by position
    const sortedElements = elementsToDistribute.sort((a, b) => {
      return direction === 'horizontal' ? a.style.x - b.style.x : a.style.y - b.style.y;
    });

    const first = sortedElements[0];
    const last = sortedElements[sortedElements.length - 1];
    
    const firstEnd = direction === 'horizontal' 
      ? first.style.x + (typeof first.style.width === 'number' ? first.style.width : parseInt(first.style.width as string))
      : first.style.y + (typeof first.style.height === 'number' ? first.style.height : parseInt(first.style.height as string));
    
    const lastStart = direction === 'horizontal' ? last.style.x : last.style.y;
    const totalSpace = lastStart - firstEnd;
    const gap = totalSpace / (sortedElements.length - 1);

    return elements.map(el => {
      const elementIndex = sortedElements.findIndex(sortedEl => sortedEl.id === el.id);
      
      if (elementIndex > 0 && elementIndex < sortedElements.length - 1) {
        const prevElement = sortedElements[elementIndex - 1];
        const prevElementEnd = direction === 'horizontal'
          ? prevElement.style.x + (typeof prevElement.style.width === 'number' ? prevElement.style.width : parseInt(prevElement.style.width as string))
          : prevElement.style.y + (typeof prevElement.style.height === 'number' ? prevElement.style.height : parseInt(prevElement.style.height as string));

        const newPosition = prevElementEnd + gap;

        return {
          ...el,
          style: {
            ...el.style,
            ...(direction === 'horizontal' ? { x: newPosition } : { y: newPosition })
          }
        };
      }
      return el;
    });
  }

  /**
   * Lock/unlock element
   */
  static toggleElementLock(elements: Element[], elementId: string): Element[] {
    return elements.map(el => {
      if (el.id === elementId) {
        return {
          ...el,
          locked: !el.locked
        };
      }
      return el;
    });
  }

  /**
   * Get locked elements
   */
  static getLockedElements(elements: Element[]): Element[] {
    return elements.filter(el => el.locked);
  }

  /**
   * Get unlocked elements
   */
  static getUnlockedElements(elements: Element[]): Element[] {
    return elements.filter(el => !el.locked);
  }

  /**
   * Validate element data
   */
  static validateElement(element: Element): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!element.id) errors.push('Element ID is required');
    if (!element.type) errors.push('Element type is required');
    if (!element.style) errors.push('Element style is required');

    // Style validation
    if (element.style) {
      if (typeof element.style.x !== 'number') errors.push('X position must be a number');
      if (typeof element.style.y !== 'number') errors.push('Y position must be a number');
      if (!element.style.width) errors.push('Width is required');
      if (!element.style.height) errors.push('Height is required');
    }

    // Type-specific validation
    switch (element.type) {
      case 'image':
        if (!element.src) errors.push('Image source is required');
        break;
      case 'video':
        if (!element.videoSrc) errors.push('Video source is required');
        break;
      case 'button':
        if (!element.content) errors.push('Button content is required');
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get element statistics
   */
  static getElementStatistics(elements: Element[]): {
    total: number;
    byType: Record<string, number>;
    locked: number;
    grouped: number;
    topLevel: number;
  } {
    const stats = {
      total: elements.length,
      byType: {} as Record<string, number>,
      locked: 0,
      grouped: 0,
      topLevel: 0
    };

    elements.forEach(el => {
      // Count by type
      stats.byType[el.type] = (stats.byType[el.type] || 0) + 1;
      
      // Count locked
      if (el.locked) stats.locked++;
      
      // Count grouped
      if (el.parentId) stats.grouped++;
      
      // Count top level
      if (!el.parentId) stats.topLevel++;
    });

    return stats;
  }
}

export default ElementManagementService;