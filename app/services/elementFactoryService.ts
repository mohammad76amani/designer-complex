import { Element } from '../types/template';

/**
 * Element factory service for creating different types of elements
 */
export class ElementFactoryService {
  
  /**
   * Create a new element of specified type
   */
  static createElement(
    elementType: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    const baseId = `${elementType}-${Date.now()}`;
    
    switch (elementType) {
      case 'heading':
        return this.createHeadingElement(baseId, position, zIndex, customProps);
      case 'paragraph':
        return this.createParagraphElement(baseId, position, zIndex, customProps);
      case 'button':
        return this.createButtonElement(baseId, position, zIndex, customProps);
      case 'image':
        return this.createImageElement(baseId, position, zIndex, customProps);
      case 'video':
        return this.createVideoElement(baseId, position, zIndex, customProps);
      case 'shape':
        return this.createShapeElement(baseId, position, zIndex, customProps);
      case 'group':
        return this.createGroupElement(baseId, position, zIndex, customProps);
      default:
        return this.createGenericElement(baseId, elementType, position, zIndex, customProps);
    }
  }

  /**
   * Create a heading element
   */
  static createHeadingElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'heading',
      content: 'New Heading',
      style: {
        x: position.x,
        y: position.y,
        width: 200,
        height: 50,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex
      },
      ...customProps
    };
  }

  /**
   * Create a paragraph element
   */
  static createParagraphElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'paragraph',
      content: 'New paragraph text. Double-click to edit.',
      style: {
        x: position.x,
        y: position.y,
        width: 300,
        height: 100,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex
      },
      ...customProps
    };
  }

  /**
   * Create a button element
   */
  static createButtonElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'button',
      content: 'Click Me',
      href: '#',
      style: {
        x: position.x,
        y: position.y,
        width: 120,
        height: 40,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        backgroundColor: '#3498db',
        borderRadius: 4,
        padding: 0,
        textAlign: 'center',
        zIndex
      },
      ...customProps
    };
  }

  /**
   * Create an image element
   */
  static createImageElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'image',
      content: '',
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder image',
      style: {
        x: position.x,
        y: position.y,
        width: 300,
        height: 200,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: '#f0f0f0',
        borderRadius: 0,
        padding: 0,
        textAlign: 'center',
        zIndex,
        objectFit: 'cover'
      },
      ...customProps
    };
  }

  /**
   * Create a video element
   */
  static createVideoElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'video',
      content: '',
      videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
      style: {
        x: position.x,
        y: position.y,
        width: 320,
        height: 240,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: '#000000',
        borderRadius: 0,
        padding: 0,
        textAlign: 'center',
        zIndex,
        objectFit: 'contain'
      },
      ...customProps
    };
  }

  /**
   * Create a shape element
   */
  static createShapeElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'shape',
      content: '',
      shapeType: 'rectangle',
      style: {
        x: position.x,
        y: position.y,
        width: 150,
        height: 150,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: '#e74c3c',
        borderRadius: 0,
        padding: 0,
        textAlign: 'center',
        zIndex,
        borderWidth: 0,
        borderStyle: 'none',
        borderColor: '#000000'
      },
      ...customProps
    };
  }

  /**
   * Create a group element
   */
  static createGroupElement(
    id: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: 'group',
      content: '',
      childIds: [],
      style: {
        x: position.x,
        y: position.y,
        width: 200,
        height: 200,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex
      },
      ...customProps
    };
  }

  /**
   * Create a generic element for unknown types
   */
  static createGenericElement(
    id: string,
    elementType: string,
    position: { x: number; y: number },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return {
      id,
      type: elementType,
      content: `New ${elementType} element`,
      style: {
        x: position.x,
        y: position.y,
        width: 200,
        height: 100,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex
      },
      ...customProps
    };
  }

  /**
   * Clone an existing element with new position and ID
   */
  static cloneElement(
    originalElement: Element,
    newPosition?: { x: number; y: number },
    idSuffix?: string
  ): Element {
    const suffix = idSuffix || `copy-${Date.now()}`;
    const newId = `${originalElement.id}-${suffix}`;
    
    const clonedElement: Element = {
      ...originalElement,
      id: newId,
      style: {
        ...originalElement.style,
        x: newPosition ? newPosition.x : originalElement.style.x + 20,
        y: newPosition ? newPosition.y : originalElement.style.y + 20
      }
    };

    // Remove parent reference for cloned elements
    if (clonedElement.parentId) {
      delete clonedElement.parentId;
    }

    return clonedElement;
  }

  /**
   * Create element from template
   */
  static createFromTemplate(
    template: Partial<Element>,
    position: { x: number; y: number },
    zIndex: number
  ): Element {
    const id = `${template.type || 'element'}-${Date.now()}`;
    
    return {
      id,
      type: template.type || 'generic',
      content: template.content || '',
      style: {
        x: position.x,
        y: position.y,
        width: 200,
        height: 100,
        fontSize: 16,
        fontWeight: 'normal',
        color: '#000000',
        backgroundColor: 'transparent',
        borderRadius: 0,
        padding: 0,
        textAlign: 'left',
        zIndex,
        ...template.style
      },
      ...template
    };
  }

  /**
   * Get default properties for element type
   */
  static getDefaultProperties(elementType: string): Partial<Element> {
    switch (elementType) {
      case 'heading':
        return {
          content: 'New Heading',
          style: {
            fontSize: 24,
            fontWeight: 'bold',
            width: 200,
            height: 50,
            x: 0,
            y: 0,
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'paragraph':
        return {
          content: 'New paragraph text. Double-click to edit.',
          style: {
            fontSize: 16,
            fontWeight: 'normal',
            width: 300,
            height: 100,
            x: 0,
            y: 0,
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'button':
        return {
          content: 'Click Me',
          href: '#',
          style: {
            fontSize: 16,
            fontWeight: 'normal',
            width: 300,
            height: 100,
            x: 0,
            y: 0,
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'image':
        return {
          src: 'https://via.placeholder.com/300x200',
          alt: 'Placeholder image',
          style: {
            fontSize: 16,
            fontWeight: 'normal',
            width: 300,
            height: 100,
            x: 0,
            y: 0,
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'video':
        return {
          videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4',
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          style: {
            width: 320,
            height: 240,
            backgroundColor: '#000000',
            objectFit: 'contain',
            fontWeight: 'normal',
            fontSize: 16,
            x: 0,
            y: 0,
            color: '#000000',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'shape':
        return {
          shapeType: 'rectangle',
          style: {
            width: 150,
            height: 150,
            backgroundColor: '#e74c3c',
            borderWidth: 0,
            borderStyle: 'none',
            borderColor: '#000000',
            fontSize: 16,
            fontWeight: 'normal',

            x: 0,
            y: 0,
            color: '#000000',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      case 'group':
        return {
          childIds: [],
          style: {
            width: 200,
            height: 200,
            backgroundColor: 'transparent',
            fontSize: 16,
            fontWeight: 'normal',

            x: 0,
            y: 0,
            color: '#000000',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
      
      default:
        return {
          content: `New ${elementType} element`,
          style: {
            width: 200,
            height: 100,
            fontSize: 16,
            fontWeight: 'normal',
            x: 0,
            y: 0,
            color: '#000000',
            backgroundColor: 'transparent',
            borderRadius: 0,
            padding: 0,
            textAlign: 'left',
            zIndex: 1
          }
        };
    }
  }

  /**
   * Create multiple elements at once
   */
  static createMultipleElements(
    elementTypes: string[],
    startPosition: { x: number; y: number },
    spacing: { x: number; y: number } = { x: 20, y: 20 },
    startZIndex: number = 1
  ): Element[] {
    return elementTypes.map((type, index) => {
      const position = {
        x: startPosition.x + (index * spacing.x),
        y: startPosition.y + (index * spacing.y)
      };
      
      return this.createElement(type, position, startZIndex + index);
    });
  }

  /**
   * Create element with smart positioning (avoiding overlaps)
   */
  static createElementWithSmartPositioning(
    elementType: string,
    preferredPosition: { x: number; y: number },
    existingElements: Element[],
    zIndex: number,
    maxAttempts: number = 10
  ): Element {
    let position = { ...preferredPosition };
    let attempts = 0;
    
    // Get default size for the element type
    const defaultProps = this.getDefaultProperties(elementType);
    const elementWidth = (defaultProps.style?.width as number) || 200;
    const elementHeight = (defaultProps.style?.height as number) || 100;
    
    while (attempts < maxAttempts) {
      // Check if position overlaps with existing elements
      const hasOverlap = existingElements.some(existing => {
        const existingWidth = typeof existing.style.width === 'number' 
          ? existing.style.width 
          : parseFloat(existing.style.width as string);
        const existingHeight = typeof existing.style.height === 'number' 
          ? existing.style.height 
          : parseFloat(existing.style.height as string);
        
        return !(
          position.x >= existing.style.x + existingWidth ||
          position.x + elementWidth <= existing.style.x ||
          position.y >= existing.style.y + existingHeight ||
          position.y + elementHeight <= existing.style.y
        );
      });
      
      if (!hasOverlap) {
        break;
      }
      
      // Offset position to avoid overlap
      position.x += 20;
      position.y += 20;
      attempts++;
    }
    
    return this.createElement(elementType, position, zIndex);
  }

  /**
   * Create element grid
   */
  static createElementGrid(
    elementType: string,
    rows: number,
    columns: number,
    startPosition: { x: number; y: number },
    spacing: { x: number; y: number },
    startZIndex: number = 1
  ): Element[] {
    const elements: Element[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const position = {
          x: startPosition.x + (col * spacing.x),
          y: startPosition.y + (row * spacing.y)
        };
        
        const element = this.createElement(
          elementType, 
          position, 
          startZIndex + (row * columns + col)
        );
        
        elements.push(element);
      }
    }
    
    return elements;
  }

  /**
   * Create element from clipboard data
   */
  static createFromClipboard(
    clipboardElement: Element,
    pastePosition: { x: number; y: number },
  ): Element {
    return this.cloneElement(clipboardElement, pastePosition, `paste-${Date.now()}`);
  }

  /**
   * Create group from selected elements
   */
  static createGroupFromElements(
    selectedElements: Element[],
    groupId?: string
  ): { group: Element; updatedElements: Element[] } {
    if (selectedElements.length === 0) {
      throw new Error('Cannot create group from empty selection');
    }

    // Calculate bounding box of all selected elements
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    selectedElements.forEach(el => {
      const x = el.style.x;
      const y = el.style.y;
      const width = typeof el.style.width === 'number' ? el.style.width : parseInt(el.style.width as string);
      const height = typeof el.style.height === 'number' ? el.style.height : parseInt(el.style.height as string);
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    // Create group element
    const groupElementId = groupId || `group-${Date.now()}`;
    const group = this.createGroupElement(
      groupElementId,
      { x: minX, y: minY },
      Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1,
      {
        childIds: selectedElements.map(el => el.id),
        style: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          fontSize: 16,
          fontWeight: 'normal',
          color: '#000000',
          backgroundColor: 'transparent',
          borderRadius: 0,
          padding: 0,
          textAlign: 'left',
          zIndex: Math.max(...selectedElements.map(el => el.style.zIndex || 0)) + 1
        }
      }
    );

    // Update child elements to reference their parent group and adjust positions
    const updatedElements = selectedElements.map(el => ({
      ...el,
      parentId: groupElementId,
      style: {
        ...el.style,
        // Make position relative to the group
        x: el.style.x - minX,
        y: el.style.y - minY
      }
    }));

    return { group, updatedElements };
  }

  /**
   * Create elements from JSON data
   */
  static createFromJSON(jsonData: string): Element[] {
    try {
      const data = JSON.parse(jsonData);
      
      if (Array.isArray(data)) {
        return data.map((elementData, index) => 
          this.createFromTemplate(elementData, elementData.style || { x: 0, y: 0 }, index + 1)
        );
      } else if (data && typeof data === 'object') {
        return [this.createFromTemplate(data, data.style || { x: 0, y: 0 }, 1)];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to create elements from JSON:', error);
      return [];
    }
  }

  /**
   * Create element with validation
   */
  static createValidatedElement(
    elementType: string,
    position: { x: number; y: number },
    zIndex: number,
    canvasBounds?: { width: number; height: number },
    customProps?: Partial<Element>
  ): Element {
    let element = this.createElement(elementType, position, zIndex, customProps);
    
    // Validate and constrain to canvas bounds if provided
    if (canvasBounds) {
      const elementWidth = typeof element.style.width === 'number' 
        ? element.style.width 
        : parseFloat(element.style.width as string);
      const elementHeight = typeof element.style.height === 'number' 
        ? element.style.height 
        : parseFloat(element.style.height as string);
      
      // Ensure element fits within canvas
      const constrainedX = Math.max(0, Math.min(position.x, canvasBounds.width - elementWidth));
      const constrainedY = Math.max(0, Math.min(position.y, canvasBounds.height - elementHeight));
      
      element = {
        ...element,
        style: {
          ...element.style,
          x: constrainedX,
          y: constrainedY
        }
      };
    }
    
    return element;
  }

  /**
   * Get element type categories
   */
  static getElementCategories(): { [category: string]: string[] } {
    return {
      text: ['heading', 'paragraph'],
      media: ['image', 'video'],
      interactive: ['button'],
      shapes: ['shape'],
      layout: ['group']
    };
  }

  /**
   * Get supported element types
   */
  static getSupportedElementTypes(): string[] {
    return ['heading', 'paragraph', 'button', 'image', 'video', 'shape', 'group'];
  }

  /**
   * Check if element type is supported
   */
  static isElementTypeSupported(elementType: string): boolean {
    return this.getSupportedElementTypes().includes(elementType);
  }

  /**
   * Get element type metadata
   */
  static getElementTypeMetadata(elementType: string): {
    name: string;
    description: string;
    category: string;
    icon: string;
    defaultSize: { width: number; height: number };
  } {
    const metadata: { [key: string]: any } = {
      heading: {
        name: 'Heading',
        description: 'Large text for titles and headers',
        category: 'text',
        icon: '📝',
        defaultSize: { width: 200, height: 50 }
      },
      paragraph: {
        name: 'Paragraph',
        description: 'Regular text content',
        category: 'text',
        icon: '📄',
        defaultSize: { width: 300, height: 100 }
      },
      button: {
        name: 'Button',
        description: 'Interactive clickable button',
        category: 'interactive',
        icon: '🔘',
        defaultSize: { width: 120, height: 40 }
      },
      image: {
        name: 'Image',
        description: 'Display images and graphics',
        category: 'media',
        icon: '🖼️',
        defaultSize: { width: 300, height: 200 }
      },
      video: {
        name: 'Video',
        description: 'Embed video content',
        category: 'media',
        icon: '🎥',
        defaultSize: { width: 320, height: 240 }
      },
      shape: {
        name: 'Shape',
        description: 'Geometric shapes and forms',
        category: 'shapes',
        icon: '🔷',
        defaultSize: { width: 150, height: 150 }
      },
      group: {
        name: 'Group',
        description: 'Container for multiple elements',
        category: 'layout',
        icon: '📦',
        defaultSize: { width: 200, height: 200 }
      }
    };

    return metadata[elementType] || {
      name: elementType,
      description: 'Unknown element type',
      category: 'unknown',
      icon: '❓',
      defaultSize: { width: 200, height: 100 }
    };
  }

  /**
   * Create element with auto-sizing based on content
   */
  static createElementWithAutoSize(
    elementType: string,
    position: { x: number; y: number },
    content: string,
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    let element = this.createElement(elementType, position, zIndex, customProps);
    
    // Auto-size based on content for text elements
    if (elementType === 'heading' || elementType === 'paragraph') {
      const estimatedWidth = Math.max(200, content.length * 8);
      const estimatedHeight = elementType === 'heading' ? 50 : Math.max(50, Math.ceil(content.length / 50) * 20);
      
      element = {
        ...element,
        content,
        style: {
          ...element.style,
          width: Math.min(estimatedWidth, 600), // Max width constraint
          height: estimatedHeight
        }
      };
    } else {
      element = {
        ...element,
        content
      };
    }
    
    return element;
  }

  /**
   * Create responsive element that adapts to container
   */
  static createResponsiveElement(
    elementType: string,
    position: { x: number; y: number },
    containerSize: { width: number; height: number },
    responsiveRatio: { width: number; height: number }, // e.g., { width: 0.5, height: 0.3 }
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    const responsiveWidth = containerSize.width * responsiveRatio.width;
    const responsiveHeight = containerSize.height * responsiveRatio.height;
    
    return this.createElement(elementType, position, zIndex, {
      ...customProps,
      style: {
        x: position.x,
        y: position.y,
        width: responsiveWidth,
        height: responsiveHeight,
        fontSize: customProps?.style?.fontSize ?? 16,
        fontWeight: customProps?.style?.fontWeight ?? 'normal',
        color: customProps?.style?.color ?? '#000000',
        backgroundColor: customProps?.style?.backgroundColor ?? 'transparent',
        borderRadius: customProps?.style?.borderRadius ?? 0,
        padding: customProps?.style?.padding ?? 0,
        textAlign: customProps?.style?.textAlign ?? 'left',
        zIndex: customProps?.style?.zIndex ?? zIndex,
        ...customProps?.style
      }
    });
  }

  /**
   * Batch create elements with performance optimization
   */
  static batchCreateElements(
    elementConfigs: Array<{
      type: string;
      position: { x: number; y: number };
      customProps?: Partial<Element>;
    }>,
    startZIndex: number = 1
  ): Element[] {
    return elementConfigs.map((config, index) => 
      this.createElement(
        config.type,
        config.position,
        startZIndex + index,
        config.customProps
      )
    );
  }

  /**
   * Create element with theme application
   */
  static createThemedElement(
    elementType: string,
    position: { x: number; y: number },
    theme: {
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      borderRadius?: number;
    },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    const themedProps: Partial<Element> = {
      ...customProps,
      style: {
        x: position.x,
        y: position.y,
        width: customProps?.style?.width ?? 200,
        height: customProps?.style?.height ?? 100,
        fontSize: customProps?.style?.fontSize ?? 16,
        fontWeight: customProps?.style?.fontWeight ?? 'normal',
        textAlign: customProps?.style?.textAlign ?? 'left',
        padding: customProps?.style?.padding ?? 0,
        zIndex: customProps?.style?.zIndex ?? zIndex,
        color: theme.primaryColor ?? customProps?.style?.color ?? '#000000',
        backgroundColor: theme.secondaryColor ?? customProps?.style?.backgroundColor ?? 'transparent',
        borderRadius: theme.borderRadius ?? customProps?.style?.borderRadius ?? 0
      }
    };
    
    return this.createElement(elementType, position, zIndex, themedProps);
  }

  /**
   * Create element with accessibility features
   */
  static createAccessibleElement(
    elementType: string,
    position: { x: number; y: number },
    accessibilityProps: {
      ariaLabel?: string;
      ariaDescription?: string;
      tabIndex?: number;
      role?: string;
    },
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    return this.createElement(elementType, position, zIndex, {
      ...customProps,
      ...accessibilityProps
    });
  }

  /**
   * Create element with animation presets
   */
  static createAnimatedElement(
    elementType: string,
    position: { x: number; y: number },
    animationPreset: 'fade' | 'slide' | 'zoom' | 'bounce' | 'none',
    zIndex: number,
    customProps?: Partial<Element>
  ): Element {
    const animationConfig = {
      entrance: {
        type: animationPreset,
        duration: 1000,
        delay: 0
      },
      click: {
        type: 'none',
        duration: 0,
        delay: 0
      }
    };
    
    return this.createElement(elementType, position, zIndex, {
      ...customProps,
      animation: animationConfig,

    });
  }
}

export default ElementFactoryService;