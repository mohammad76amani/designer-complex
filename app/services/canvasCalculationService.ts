import { Element } from '../types/template';

/**
 * Service for canvas position, size, and geometric calculations
 */
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
   * Calculate distance between two elements (center to center)
   */
  static getElementDistance(element1: Element, element2: Element): number {
    const center1 = this.getElementCenter(element1);
    const center2 = this.getElementCenter(element2);
    return this.getDistance(center1, center2);
  }

  /**
   * Check if a point is inside an element
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
   * Check if a point is inside a rectangle
   */
  static isPointInRect(
    point: { x: number; y: number },
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  /**
   * Calculate intersection area between two rectangles
   */
  static getRectIntersection(
    rect1: { x: number; y: number; width: number; height: number },
    rect2: { x: number; y: number; width: number; height: number }
  ): { x: number; y: number; width: number; height: number } | null {
    const left = Math.max(rect1.x, rect2.x);
    const top = Math.max(rect1.y, rect2.y);
    const right = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
    const bottom = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);

    if (left < right && top < bottom) {
      return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top
      };
    }

    return null; // No intersection
  }

  /**
   * Calculate union (bounding box) of multiple rectangles
   */
  static getRectUnion(
    rects: { x: number; y: number; width: number; height: number }[]
  ): { x: number; y: number; width: number; height: number } {
    if (rects.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    rects.forEach(rect => {
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);

      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Calculate bounding box for multiple elements
   */
  static getElementsBoundingBox(elements: Element[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (elements.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const rects = elements.map(el => {
      const bounds = this.getElementBounds(el);
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height
      };
    });

    return this.getRectUnion(rects);
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
   * Snap element to grid
   */
  static snapElementToGrid(element: Element, gridSize: number): Element {
    const snappedPosition = this.snapToGrid(
      { x: element.style.x, y: element.style.y },
      gridSize
    );

    return {
      ...element,
      style: {
        ...element.style,
        x: snappedPosition.x,
        y: snappedPosition.y
      }
    };
  }

  /**
   * Calculate snap guides for element positioning
   */
  static calculateSnapGuides(
    movingElement: Element,
    otherElements: Element[],
    snapThreshold: number = 5
  ): {
    vertical: number[];
    horizontal: number[];
    snappedPosition: { x: number; y: number } | null;
  } {
    const movingBounds = this.getElementBounds(movingElement);
    const guides = {
      vertical: [] as number[],
      horizontal: [] as number[]
    };

    let snappedX: number | null = null;
    let snappedY: number | null = null;

    otherElements.forEach(element => {
      if (element.id === movingElement.id) return;

      const bounds = this.getElementBounds(element);

      // Vertical guides (for X positioning)
      const verticalLines = [
        bounds.left,           // Left edge
        bounds.left + bounds.width / 2,  // Center
        bounds.right          // Right edge
      ];

      // Horizontal guides (for Y positioning)
      const horizontalLines = [
        bounds.top,            // Top edge
        bounds.top + bounds.height / 2,  // Center
        bounds.bottom         // Bottom edge
      ];

      // Check for snapping to vertical guides
      verticalLines.forEach(line => {
        const snapPoints = [
          movingBounds.left,     // Snap left edge
          movingBounds.left + movingBounds.width / 2,  // Snap center
          movingBounds.right     // Snap right edge
        ];

        snapPoints.forEach((snapPoint, index) => {
          const distance = Math.abs(snapPoint - line);
          if (distance <= snapThreshold) {
            guides.vertical.push(line);
            
            // Calculate snapped X position
            if (snappedX === null) {
              switch (index) {
                case 0: // Snap left edge
                  snappedX = line;
                  break;
                case 1: // Snap center
                  snappedX = line - movingBounds.width / 2;
                  break;
                case 2: // Snap right edge
                  snappedX = line - movingBounds.width;
                  break;
              }
            }
          }
        });
      });

      // Check for snapping to horizontal guides
      horizontalLines.forEach(line => {
        const snapPoints = [
          movingBounds.top,      // Snap top edge
          movingBounds.top + movingBounds.height / 2,  // Snap center
          movingBounds.bottom    // Snap bottom edge
        ];

        snapPoints.forEach((snapPoint, index) => {
          const distance = Math.abs(snapPoint - line);
          if (distance <= snapThreshold) {
            guides.horizontal.push(line);
            
            // Calculate snapped Y position
            if (snappedY === null) {
              switch (index) {
                case 0: // Snap top edge
                  snappedY = line;
                  break;
                case 1: // Snap center
                  snappedY = line - movingBounds.height / 2;
                  break;
                case 2: // Snap bottom edge
                  snappedY = line - movingBounds.height;
                  break;
              }
            }
          }
        });
      });
    });

    // Remove duplicates
    guides.vertical = [...new Set(guides.vertical)];
    guides.horizontal = [...new Set(guides.horizontal)];

    return {
      ...guides,
      snappedPosition: (snappedX !== null || snappedY !== null) ? {
        x: snappedX ?? movingElement.style.x,
        y: snappedY ?? movingElement.style.y
      } : null
    };
  }

  /**
   * Calculate resize constraints
   */
  static calculateResizeConstraints(
    element: Element,
    handle: string,
    mousePosition: { x: number; y: number },
    initialBounds: { x: number; y: number; width: number; height: number },
    initialMousePosition: { x: number; y: number },
    minSize: { width: number; height: number } = { width: 20, height: 20 },
    aspectRatio?: number
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const deltaX = mousePosition.x - initialMousePosition.x;
    const deltaY = mousePosition.y - initialMousePosition.y;

    let newX = initialBounds.x;
    let newY = initialBounds.y;
    let newWidth = initialBounds.width;
    let newHeight = initialBounds.height;

    // Calculate new dimensions based on resize handle
    switch (handle) {
      case 'n': // North (top)
        newHeight = Math.max(minSize.height, initialBounds.height - deltaY);
        newY = initialBounds.y + (initialBounds.height - newHeight);
        break;
      case 's': // South (bottom)
        newHeight = Math.max(minSize.height, initialBounds.height + deltaY);
        break;
      case 'e': // East (right)
        newWidth = Math.max(minSize.width, initialBounds.width + deltaX);
        break;
      case 'w': // West (left)
        newWidth = Math.max(minSize.width, initialBounds.width - deltaX);
        newX = initialBounds.x + (initialBounds.width - newWidth);
        break;
      case 'ne': // Northeast
        newWidth = Math.max(minSize.width, initialBounds.width + deltaX);
        newHeight = Math.max(minSize.height, initialBounds.height - deltaY);
        newY = initialBounds.y + (initialBounds.height - newHeight);
        break;
      case 'nw': // Northwest
        newWidth = Math.max(minSize.width, initialBounds.width - deltaX);
        newHeight = Math.max(minSize.height, initialBounds.height - deltaY);
        newX = initialBounds.x + (initialBounds.width - newWidth);
        newY = initialBounds.y + (initialBounds.height - newHeight);
        break;
      case 'se': // Southeast
        newWidth = Math.max(minSize.width, initialBounds.width + deltaX);
        newHeight = Math.max(minSize.height, initialBounds.height + deltaY);
        break;
      case 'sw': // Southwest
        newWidth = Math.max(minSize.width, initialBounds.width - deltaX);
        newHeight = Math.max(minSize.height, initialBounds.height + deltaY);
        newX = initialBounds.x + (initialBounds.width - newWidth);
        break;
    }

    // Apply aspect ratio constraint if specified
    if (aspectRatio && (handle.includes('n') || handle.includes('s') || handle.includes('e') || handle.includes('w'))) {
      if (handle.includes('e') || handle.includes('w')) {
        // Width changed, adjust height
        newHeight = newWidth / aspectRatio;
        if (handle.includes('n')) {
          newY = initialBounds.y + (initialBounds.height - newHeight);
        }
      } else {
        // Height changed, adjust width
        newWidth = newHeight * aspectRatio;
        if (handle.includes('w')) {
          newX = initialBounds.x + (initialBounds.width - newWidth);
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
    return {
      x: Math.max(0, Math.min(bounds.x, canvasBounds.width - bounds.width)),
      y: Math.max(0, Math.min(bounds.y, canvasBounds.height - bounds.height)),
      width: Math.min(bounds.width, canvasBounds.width),
      height: Math.min(bounds.height, canvasBounds.height)
    };
  }

  /**
   * Calculate element position relative to parent
   */
  static getRelativePosition(
    element: Element,
    parent: Element
  ): { x: number; y: number } {
    return {
      x: element.style.x - parent.style.x,
      y: element.style.y - parent.style.y
    };
  }

  /**
   * Calculate element position in absolute coordinates
   */
  static getAbsolutePosition(
    element: Element,
    parent: Element
  ): { x: number; y: number } {
    return {
      x: element.style.x + parent.style.x,
      y: element.style.y + parent.style.y
    };
  }

  /**
   * Calculate zoom-adjusted coordinates
   */
  static adjustForZoom(
    coordinates: { x: number; y: number },
    zoomLevel: number
  ): { x: number; y: number } {
    return {
      x: coordinates.x / zoomLevel,
      y: coordinates.y / zoomLevel
    };
  }

  /**
   * Calculate viewport visible area
   */
  static getVisibleArea(
    canvasElement: HTMLElement,
    scrollPosition: { x: number; y: number },
    zoomLevel: number = 1
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const rect = canvasElement.getBoundingClientRect();
    
    return {
      x: scrollPosition.x / zoomLevel,
      y: scrollPosition.y / zoomLevel,
      width: rect.width / zoomLevel,
      height: rect.height / zoomLevel
    };
  }

  /**
   * Check if element is visible in viewport
   */
  static isElementVisible(
    element: Element,
    viewportBounds: { x: number; y: number; width: number; height: number }
  ): boolean {
    const elementBounds = this.getElementBounds(element);
    
    return !(
      elementBounds.right < viewportBounds.x ||
      elementBounds.left > viewportBounds.x + viewportBounds.width ||
      elementBounds.bottom < viewportBounds.y ||
      elementBounds.top > viewportBounds.y + viewportBounds.height
    );
  }

  /**
   * Calculate rotation transformation
   */
  static rotatePoint(
    point: { x: number; y: number },
    center: { x: number; y: number },
    angle: number
  ): { x: number; y: number } {
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: center.x + (dx * cos - dy * sin),
      y: center.y + (dx * sin + dy * cos)
    };
  }

  /**
   * Calculate rotated element bounds
   */
  static getRotatedElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
    corners: { x: number; y: number }[];
  } {
    const bounds = this.getElementBounds(element);
    const center = this.getElementCenter(element);
    const rotation = element.style.rotate || 0;

    if (rotation === 0) {
      return {
        ...bounds,
        corners: [
          { x: bounds.left, y: bounds.top },
          { x: bounds.right, y: bounds.top },
          { x: bounds.right, y: bounds.bottom },
          { x: bounds.left, y: bounds.bottom }
        ]
      };
    }

    // Calculate rotated corners
    const corners = [
      { x: bounds.left, y: bounds.top },
      { x: bounds.right, y: bounds.top },
      { x: bounds.right, y: bounds.bottom },
      { x: bounds.left, y: bounds.bottom }
    ].map(corner => this.rotatePoint(corner, center, rotation));

    // Calculate bounding box of rotated element
    const xs = corners.map(c => c.x);
    const ys = corners.map(c => c.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      corners
    };
  }

  /**
   * Calculate scale transformation bounds
   */
  static getScaledElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const bounds = this.getElementBounds(element);
    const scale = element.style.scale || 1;
    const center = this.getElementCenter(element);

    const scaledWidth = bounds.width * scale;
    const scaledHeight = bounds.height * scale;

    return {
      x: center.x - scaledWidth / 2,
      y: center.y - scaledHeight / 2,
      width: scaledWidth,
      height: scaledHeight
    };
  }

  /**
   * Calculate element bounds with all transformations applied
   */
  static getTransformedElementBounds(element: Element): {
    x: number;
    y: number;
    width: number;
    height: number;
    corners: { x: number; y: number }[];
  } {
    let bounds = this.getElementBounds(element);
    const rotation = element.style.rotate || 0;
    const scale = element.style.scale || 1;

    // Apply scale first
    if (scale !== 1) {
      const scaledBounds = this.getScaledElementBounds(element);
      bounds = {
        ...scaledBounds,
        left: scaledBounds.x,
        top: scaledBounds.y,
        right: scaledBounds.x + scaledBounds.width,
        bottom: scaledBounds.y + scaledBounds.height
      };
    }

    // Then apply rotation
    if (rotation !== 0) {
      const rotatedBounds = this.getRotatedElementBounds({
        ...element,
        style: {
          ...element.style,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        }
      });
      return rotatedBounds;
    }

    // No rotation, return corners for consistency
    return {
      ...bounds,
      corners: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
      ]
    };
  }

  /**
   * Calculate selection rectangle for multiple elements
   */
  static getSelectionBounds(elements: Element[]): {
    x: number;
    y: number;
    width: number;
    height: number;
    handles: { position: string; x: number; y: number }[];
  } {
    if (elements.length === 0) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        handles: []
      };
    }

    const boundingBox = this.getElementsBoundingBox(elements);
    
    // Calculate handle positions
    const handles = [
      { position: 'nw', x: boundingBox.x, y: boundingBox.y },
      { position: 'n', x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y },
      { position: 'ne', x: boundingBox.x + boundingBox.width, y: boundingBox.y },
      { position: 'e', x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height / 2 },
      { position: 'se', x: boundingBox.x + boundingBox.width, y: boundingBox.y + boundingBox.height },
      { position: 's', x: boundingBox.x + boundingBox.width / 2, y: boundingBox.y + boundingBox.height },
      { position: 'sw', x: boundingBox.x, y: boundingBox.y + boundingBox.height },
      { position: 'w', x: boundingBox.x, y: boundingBox.y + boundingBox.height / 2 }
    ];

    return {
      ...boundingBox,
      handles
    };
  }

  /**
   * Calculate grid lines for canvas
   */
  static calculateGridLines(
    canvasBounds: { width: number; height: number },
    gridSize: number,
    viewportBounds?: { x: number; y: number; width: number; height: number }
  ): {
    vertical: number[];
    horizontal: number[];
  } {
    const viewport = viewportBounds || {
      x: 0,
      y: 0,
      width: canvasBounds.width,
      height: canvasBounds.height
    };

    const vertical: number[] = [];
    const horizontal: number[] = [];

    // Calculate visible vertical lines
    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const endX = viewport.x + viewport.width;
    for (let x = startX; x <= endX; x += gridSize) {
      if (x >= 0 && x <= canvasBounds.width) {
        vertical.push(x);
      }
    }

    // Calculate visible horizontal lines
    const startY = Math.floor(viewport.y / gridSize) * gridSize;
    const endY = viewport.y + viewport.height;
    for (let y = startY; y <= endY; y += gridSize) {
      if (y >= 0 && y <= canvasBounds.height) {
        horizontal.push(y);
      }
    }

    return { vertical, horizontal };
  }

  /**
   * Calculate optimal zoom level to fit elements
   */
  static calculateFitZoom(
    elements: Element[],
    viewportBounds: { width: number; height: number },
    padding: number = 50
  ): number {
    if (elements.length === 0) return 1;

    const boundingBox = this.getElementsBoundingBox(elements);
    
    const availableWidth = viewportBounds.width - (padding * 2);
    const availableHeight = viewportBounds.height - (padding * 2);
    
    const scaleX = availableWidth / boundingBox.width;
    const scaleY = availableHeight / boundingBox.height;
    
    return Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  }

  /**
   * Calculate pan offset to center elements
   */
  static calculateCenterOffset(
    elements: Element[],
    viewportBounds: { width: number; height: number },
    zoomLevel: number = 1
  ): { x: number; y: number } {
    if (elements.length === 0) {
      return { x: 0, y: 0 };
    }

    const boundingBox = this.getElementsBoundingBox(elements);
    const boundingCenter = {
      x: boundingBox.x + boundingBox.width / 2,
      y: boundingBox.y + boundingBox.height / 2
    };

    const viewportCenter = {
      x: viewportBounds.width / 2,
      y: viewportBounds.height / 2
    };

    return {
      x: (viewportCenter.x / zoomLevel) - boundingCenter.x,
      y: (viewportCenter.y / zoomLevel) - boundingCenter.y
    };
  }

  /**
   * Calculate element collision detection
   */
  static detectCollisions(
    movingElement: Element,
    staticElements: Element[],
    tolerance: number = 0
  ): Element[] {
    const movingBounds = this.getTransformedElementBounds(movingElement);
    const collisions: Element[] = [];

    staticElements.forEach(element => {
      if (element.id === movingElement.id) return;

      const elementBounds = this.getTransformedElementBounds(element);
      
      // Expand bounds by tolerance
      const expandedBounds = {
        x: elementBounds.x - tolerance,
        y: elementBounds.y - tolerance,
        width: elementBounds.width + (tolerance * 2),
        height: elementBounds.height + (tolerance * 2)
      };

      const intersection = this.getRectIntersection(
        {
          x: movingBounds.x,
          y: movingBounds.y,
          width: movingBounds.width,
          height: movingBounds.height
        },
        expandedBounds
      );

      if (intersection) {
        collisions.push(element);
      }
    });

    return collisions;
  }

  /**
   * Calculate magnetic snap points
   */
  static calculateMagneticSnap(
    movingElement: Element,
    targetElements: Element[],
    snapDistance: number = 10
  ): {
    snapX: number | null;
    snapY: number | null;
    guides: { vertical: number[]; horizontal: number[] };
  } {
    const movingBounds = this.getElementBounds(movingElement);
    const guides = { vertical: [] as number[], horizontal: [] as number[] };
    let snapX: number | null = null;
    let snapY: number | null = null;
    let minDistanceX = snapDistance;
    let minDistanceY = snapDistance;

    targetElements.forEach(element => {
      if (element.id === movingElement.id) return;

      const bounds = this.getElementBounds(element);

      // Vertical snap points (X coordinates)
      const verticalSnapPoints = [
        bounds.left,                    // Left edge
        bounds.left + bounds.width / 2, // Center
        bounds.right                    // Right edge
      ];

      // Horizontal snap points (Y coordinates)
      const horizontalSnapPoints = [
        bounds.top,                     // Top edge
        bounds.top + bounds.height / 2, // Center
        bounds.bottom                   // Bottom edge
      ];

      // Check vertical snapping
      verticalSnapPoints.forEach(snapPoint => {
        const movingSnapPoints = [
          movingBounds.left,
          movingBounds.left + movingBounds.width / 2,
          movingBounds.right
        ];

        movingSnapPoints.forEach((movingPoint, index) => {
          const distance = Math.abs(movingPoint - snapPoint);
          if (distance < minDistanceX) {
            minDistanceX = distance;
            guides.vertical.push(snapPoint);
            
            // Calculate snap position
            switch (index) {
              case 0: // Snap left edge
                snapX = snapPoint;
                break;
              case 1: // Snap center
                snapX = snapPoint - movingBounds.width / 2;
                break;
              case 2: // Snap right edge
                snapX = snapPoint - movingBounds.width;
                break;
            }
          }
        });
      });

      // Check horizontal snapping
      horizontalSnapPoints.forEach(snapPoint => {
        const movingSnapPoints = [
          movingBounds.top,
          movingBounds.top + movingBounds.height / 2,
          movingBounds.bottom
        ];

        movingSnapPoints.forEach((movingPoint, index) => {
          const distance = Math.abs(movingPoint - snapPoint);
          if (distance < minDistanceY) {
            minDistanceY = distance;
            guides.horizontal.push(snapPoint);
            
            // Calculate snap position
            switch (index) {
              case 0: // Snap top edge
                snapY = snapPoint;
                break;
              case 1: // Snap center
                snapY = snapPoint - movingBounds.height / 2;
                break;
              case 2: // Snap bottom edge
                snapY = snapPoint - movingBounds.height;
                break;
            }
          }
        });
      });
    });

    // Remove duplicate guides
    guides.vertical = [...new Set(guides.vertical)];
    guides.horizontal = [...new Set(guides.horizontal)];

    return { snapX, snapY, guides };
  }

  /**
   * Calculate element spacing distribution
   */
  static calculateSpacingDistribution(
    elements: Element[],
    direction: 'horizontal' | 'vertical',
    spacing: number
  ): { x: number; y: number }[] {
    if (elements.length < 2) return [];

    const sortedElements = [...elements].sort((a, b) => {
      return direction === 'horizontal' ? a.style.x - b.style.x : a.style.y - b.style.y;
    });

    const positions: { x: number; y: number }[] = [];
    let currentPosition = direction === 'horizontal' 
      ? sortedElements[0].style.x 
      : sortedElements[0].style.y;

    sortedElements.forEach((element, index) => {
      if (index === 0) {
        positions.push({ x: element.style.x, y: element.style.y });
      } else {
        const bounds = this.getElementBounds(element);
        
        if (direction === 'horizontal') {
          positions.push({ x: currentPosition, y: element.style.y });
          currentPosition += bounds.width + spacing;
        } else {
          positions.push({ x: element.style.x, y: currentPosition });
          currentPosition += bounds.height + spacing;
        }
      }
    });

    return positions;
  }

  /**
   * Calculate responsive breakpoint adjustments
   */
  static calculateResponsiveAdjustments(
    element: Element,
    originalCanvasWidth: number,
    newCanvasWidth: number,
    breakpoints: { mobile: number; tablet: number; desktop: number }
  ): Partial<Element['style']> {
    const scale = newCanvasWidth / originalCanvasWidth;
    
    // Determine current breakpoint
    let currentBreakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (newCanvasWidth <= breakpoints.mobile) {
      currentBreakpoint = 'mobile';
    } else if (newCanvasWidth <= breakpoints.tablet) {
      currentBreakpoint = 'tablet';
    }

    // Calculate responsive adjustments
    const adjustments: Partial<Element['style']> = {
      x: element.style.x * scale,
      y: element.style.y * scale,
      width: (typeof element.style.width === 'number' ? element.style.width : parseFloat(element.style.width as string)) * scale,
      height: (typeof element.style.height === 'number' ? element.style.height : parseFloat(element.style.height as string)) * scale
    };

    // Adjust font sizes for text elements
    if (['heading', 'paragraph', 'button'].includes(element.type)) {
      const fontScaleFactors = {
        mobile: 0.8,
        tablet: 0.9,
        desktop: 1.0
      };
      
      adjustments.fontSize = element.style.fontSize * fontScaleFactors[currentBreakpoint];
    }

    return adjustments;
  }
}

export default CanvasCalculationService;