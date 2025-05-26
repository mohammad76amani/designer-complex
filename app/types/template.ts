//=============================================================================
// TEMPLATE STRUCTURE TYPES
//=============================================================================

/**
 * Main template structure that defines the entire page layout
 */
export interface Template {
  type: string;
  settings: {
    fontFamily: string;
    colorSchema: {
      primary: string;
      secondary: string;
      text: string;
    };
    styleProperties?: {
      opacity?: boolean;
      letterSpacing?: boolean;
      lineHeight?: boolean;
      border?: {
        width?: boolean;
        style?: boolean;
        color?: boolean;
      };
      shadow?: {
        blur?: boolean;
        spread?: boolean;
        color?: boolean;
      };
      transform?: {
        rotate?: boolean;
        scale?: boolean;
      };
      filters?: {
        blur?: boolean;
        brightness?: boolean;
        contrast?: boolean;
      };
      objectFit?: boolean;
      linkTarget?: boolean;
    };
  };
  sections: {
    [key: string]: Section;
  };
  order?: string[];
}

export interface CanvasInfo {
  id: string;
  name: string;
  template: Template;
}
/**
 * Section component that can contain blocks or nested sections
 */
export interface Section {
  type: string;
  setting?: DirectionSetting;
  settings?: BlockSettings;
  blocks?: Blocks;
  sections?: Section[];
  order?: string[];
}
export interface DirectionSetting {
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor: string;
}
//=============================================================================
// CANVAS AND BLOCKS TYPES
//=============================================================================

/**
 * Blocks container for canvas elements
 */
export interface Blocks {
  elements: Element[];
  setting?: BlockSettings;
  settings?: BlockSettings;
}

/**
 * Settings for the canvas block
 */
export interface BlockSettings {
 canvasWidth?: string | number; // Now supports 'sm', 'lg', or numeric values
  canvasHeight?: string | number;
  backgroundColor?: string;
  gridSize?: number;
  showGrid?: boolean;
  minHeight?: number;
  maxHeight?: number;
  autoResize?: boolean;
  resizable?: boolean;
  breakpoints?: {
    sm: number;
    lg: number;
  };

}

//=============================================================================
// ANIMATION TYPES
//=============================================================================

/**
 * Simple animation configuration for hover and click states
 */
interface SimpleAnimation {
    hover?: 'none' | 'shadow' | 'scale-up' | 'scale-down' | 'border' | 'bg-color' | 'text-color';
    click: 'none' | 'bg-color' | 'text-color' | 'scale-down' | 'bounce' | 'pulse';
  entrance?: {
    type: string;
    duration?: number;
    delay?: number;
  };
  hoverBorderColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  clickBgColor?: string;
  clickTextColor?: string;
}

/**
 * Animation configuration for elements
 */
export interface AnimationConfig {
  // State animations (hover, etc.)
  states?: {
    hover?: Partial<ElementStyle>;
    active?: Partial<ElementStyle>;
  };
  
  // Entrance animations
  entrance?: {
    type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip' | 'none';
    direction?: 'up' | 'down' | 'left' | 'right';
    duration: number; // in milliseconds
    delay: number; // in milliseconds
    easing: string; // CSS easing function
  };
  
  // Continuous animations
  continuous?: {
    type: 'pulse' | 'bounce' | 'shake' | 'spin' | 'float' | 'none';
    duration: number;
    iterationCount: number | 'infinite';
    easing: string;
  };
}

//=============================================================================
// ELEMENT TYPES
//=============================================================================

/**
 * Element that can be placed on the canvas (button, image, text, etc.)
 */
export interface Element {
  id: string;
  type: string;
  content: string;
  style: ElementStyle;
  src?: string;
  alt?: string;
  href?: string;
  target?: '_self' | '_blank';
  shapeType?: string;
  videoSrc?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  // Group-related properties
  childIds?: string[];
  parentId?: string;
  locked?: boolean;
  // Simple animation properties for the AnimationEditor
  animation?: SimpleAnimation;
}

/**
 * Style properties for elements
 */
export interface ElementStyle {
  // Position and size
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  
  // Basic styling
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  textAlign: string;
  zIndex: number;
  
  // Advanced styling
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  
  // Border properties
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;
  
  // Shadow properties
  boxShadowBlur?: number;
  boxShadowSpread?: number;
  boxShadowColor?: string;
  
  // Transform properties
  rotate?: number;
  scale?: number;
  
  // Filter properties
  blur?: number;
  brightness?: number;
  contrast?: number;
  
  // Image-specific properties
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  
  // Animation properties
  transition?: string;
}

/**
 * Animation configuration for elements
 */
export interface ElementAnimation {
  entrance?: {
    type: 'none' | 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip';
    direction?: 'up' | 'down' | 'left' | 'right' | 'in' | 'out';
    duration?: number;
    delay?: number;
    easing?: string;
  };
  continuous?: {
    type: 'none' | 'pulse' | 'bounce' | 'shake' | 'spin' | 'float';
    duration?: number;
    iterationCount?: string | number;
    easing?: string;
  };
  states?: {
    hover?: Record<string, unknown>;
    active?: Record<string, unknown>;
  };
}

//=============================================================================
// COMPONENT PROPS TYPES
//=============================================================================

/**
 * Props for SectionRenderer component
 */
export interface SectionRendererProps {
  sectionKey: string;
  section: Section;
}
export interface AnimationConfig {
  click?: string;
  hover?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  clickBgColor?: string;
  clickTextColor?: string;
}
/**
 * Props for FloatingStyleEditor component
 */
export interface FloatingStyleEditorProps {
  element: Element;
  onUpdateElement: (updatedElement: Element) => void;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

/**
 * Props for CanvasRenderer component
 */
export interface CanvasRendererProps {
  blocks: Blocks;
  onSelectElement: (element: Element | null, isMultiSelect?: boolean) => void;
  selectedElementIds?: string[];
  selectedElementId?: string;
  onUpdateElement?: (element: Element) => void;
  onUpdateElements?: (elements: Element[]) => void;
  onElementContextMenu?: (element: Element, x: number, y: number) => void;
  onCanvasContextMenu?: (x: number, y: number) => void;
  onCloseContextMenu?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  onOpenStyleEditor?: (element: Element) => void;
  onCanvasHeightUpdate?: (newHeight: number) => void; // Add this back
}


/**
 * Props for DesignerRenderer component
 */
export interface DesignerRendererProps {
  template: Template;
  onTemplateUpdate?: (updatedTemplate: Template) => void;
}

/**
 * Props for ElementEditor component
 */
export interface DesignerRendererProps {
  template: Template;
  canvasId?: string;
  onTemplateUpdate?: (updatedTemplate: Template) => void;
}

/**
 * Props for ElementRenderer component
 */
export interface ElementRendererProps {
  element: Element;
  onSelect: (isMultiSelect?: boolean) => void;
  isSelected: boolean;
  onUpdateElement: (updatedElement: Element) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onContextMenu: (element: Element, x: number, y: number) => void;
  onOpenStyleEditor?: () => void;
  isInGroup?: boolean;
}


/**
 * Props for ContextMenu component
 */
export interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste?: () => void;
  canPaste: boolean;
}

/**
 * Props for AnimationPreview component
 */
export interface AnimationPreviewProps {
  element: Element;
}

/**
 * Props for AnimationEditor component
 */
export interface AnimationEditorProps {
  element: Element;
  onUpdateElement: (updatedElement: Element) => void;
}





 export interface CanvasDimensionControlsProps {
  width: number;
  height: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  onSizeChange: (width: number, height: number) => void;
}

/**
 * Props for ResponsiveCanvasToolbar component
 */

export interface GroupContainerProps {
  group: Element;
  elements: Element[];
  onSelect: (e: React.MouseEvent) => void;
  isSelected: boolean;
  onUpdateElement: (updatedElement: Element) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onContextMenu: (element: Element, x: number, y: number) => void;
  onOpenStyleEditor?: () => void;
  onSelectGroupElement: (element: Element, isMultiSelect: boolean) => void;
  selectedElementIds: string[];
}


export interface ResponsiveCanvasToolbarProps {
  currentBreakpoint: 'sm' | 'lg';
  onBreakpointChange: (breakpoint: 'sm' | 'lg') => void;
  breakpoints: { sm: number; lg: number };
}


export interface ElementToolbarProps {
  onAddElement: (elementType: string) => void;
}

/**
 * Props for shape selector component
 */
export interface ShapeSelectorProps {
  onSelectShape: (shapeType: string) => void;
  onClose: () => void;
}

/**
 * History state interface
 */
 export interface HistoryState {
  elements: Element[];
  selectedElementIds: string[];
  selectedElementId: string | null;
  timestamp: number;
  description?: string;
}