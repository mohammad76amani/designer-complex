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

/**
 * Section component that can contain blocks or nested sections
 */
export interface Section {
  type: string;
  setting?: any;
  settings?: any;
  blocks?: Blocks;
  sections?: Section[];
  order?: string[];
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
  canvasWidth: string;
  canvasHeight: string;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
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

/**
 * Props for FloatingStyleEditor component
 */
export interface FloatingStyleEditorProps {
  element: Element;
  onUpdateElement: (updatedElement: Element) => void;
  onClose: () => void;
}

/**
 * Props for CanvasRenderer component
 */
export interface CanvasRendererProps {
  blocks: Blocks;
  onSelectElement: (element: Element) => void;
  selectedElementId?: string;
  onUpdateElement: (updatedElement: Element) => void;
  onElementContextMenu: (element: Element, x: number, y: number) => void;
  onCanvasContextMenu?: (x: number, y: number) => void;
  onCloseContextMenu?: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  onOpenStyleEditor?: (element: Element) => void;
}

/**
 * Props for DesignerRenderer component
 */
export interface DesignerRendererProps {
  template: Template;
}

/**
 * Props for ElementEditor component
 */
export interface ElementEditorProps {
  element: Element;
  onUpdateElement: (updatedElement: Element) => void;
}

/**
 * Props for ElementRenderer component
 */
export interface ElementRendererProps {
  element: Element;
  onSelect: () => void;
  isSelected: boolean;
  onUpdateElement: (updatedElement: Element) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  onContextMenu: (element: Element, x: number, y: number) => void;
  onOpenStyleEditor?: () => void;
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
