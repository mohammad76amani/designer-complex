import { BlockSettings } from '../types/template';

export const parseCanvasHeight = (height: string | number | undefined): number => {
  if (typeof height === 'number') {
    return isNaN(height) ? 500 : height;
  }
  
  if (typeof height === 'string') {
    const parsed = parseFloat(height.replace('px', ''));
    return isNaN(parsed) ? 500 : parsed;
  }
  
  return 500; // Default fallback
};

export const formatCanvasHeight = (height: number): number => {
  return isNaN(height) ? 500 : Math.max(height, 200); // Minimum 200px
};

export const updateCanvasSettings = (
  currentSettings: BlockSettings,
  newHeight: number
): BlockSettings => {
  return {
    ...currentSettings,
    canvasHeight: formatCanvasHeight(newHeight)
  };
};
