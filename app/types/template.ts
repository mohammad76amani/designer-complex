// Define TypeScript interfaces for your JSON structure
export interface Template {
  type: string;
  settings: {
    fontFamily: string;
    colorSchema: {
      primary: string;
      secondary: string;
      text: string;
    };
  };
  sections: {
    children: {
      sections: Section[];
      order: string[];
    };
  };
  order: string[];
}

export interface TemplateSettings {
  fontFamily: string;
  colorSchema: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export interface Section {
  type: string;
  setting: {
    paddingTop: string;
    paddingBottom: string;
    paddingLeft: string;
    paddingRight: string;
    marginTop: string;
    marginBottom: string;
    backgroundColor: string;
  };
  blocks: Blocks;
}

export interface SectionSettings {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop?: string;
  marginBottom?: string;
  backgroundColor: string;
}

export interface Blocks {
  elements: Element[];
  setting?: {
    canvasWidth: string;
    canvasHeight: string;
    backgroundColor: string;
    gridSize: number;
    showGrid: boolean;
  };
  settings?: {
    canvasWidth: string;
    canvasHeight: string;
    backgroundColor: string;
    gridSize: number;
    showGrid: boolean;
  };
}

export interface BlockSettings {
  canvasWidth: string;
  canvasHeight: string;
  backgroundColor: string;
  gridSize: number;
  showGrid: boolean;
}

export interface Element {
  id: string;
  type: string;
  content: string;
  style: {
    x: number;
    y: number;
    width: number | string;
    height: number | string;
    fontSize: number;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    borderRadius: number;
    padding: number;
    textAlign: string;
    zIndex: number;
  };
  src?: string;
  alt?: string;
  href?: string;
}

export interface ElementStyle {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  borderRadius: number;
  padding: number;
  textAlign: 'left' | 'center' | 'right';
  zIndex: number;
}
