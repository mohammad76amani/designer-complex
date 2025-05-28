import React, { createContext, useContext, useEffect } from 'react';
import { useDesigner } from './DesignerContext';
import { useHistory } from './HistoryContext';

interface KeyboardContextType {
  // This context handles global keyboard shortcuts
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export const useKeyboard = () => {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error('useKeyboard must be used within a KeyboardProvider');
  }
  return context;
};

interface KeyboardProviderProps {
  children: React.ReactNode;
}

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const {
    selectedElement,
    clipboard,
    setClipboard,
    deleteElement,
    selectElement,
    elements,
    updateElements
  } = useDesigner();
  
  const { undo, redo, canUndo, canRedo } = useHistory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input field
      const isInputActive = document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;

      if (isInputActive) return;

      // Delete key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        e.preventDefault();
        deleteElement(selectedElement.id);
      }

      // Copy (Ctrl+C or Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedElement) {
        e.preventDefault();
        setClipboard(selectedElement);
      }

      // Cut (Ctrl+X or Cmd+X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x' && selectedElement) {
        e.preventDefault();
        setClipboard(selectedElement);
        deleteElement(selectedElement.id);
      }

      // Paste (Ctrl+V or Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
        e.preventDefault();
        // Implement paste logic
      }

      // Undo (Ctrl+Z or Cmd+Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Redo (Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }

      // Select All (Ctrl+A or Cmd+A)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        // Select all elements logic
      }

      // Escape key to clear selection
      if (e.key === 'Escape') {
        selectElement(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, clipboard, undo, redo, canUndo, canRedo, deleteElement, setClipboard, selectElement]);

  const value = {};

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};