import React, { createContext, useContext, useCallback } from 'react';
import HistoryService from '../services/historyService';

interface HistoryContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  createCheckpoint: (description: string) => void;
  getUndoDescription: () => string | null;
  getRedoDescription: () => string | null;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};

interface HistoryProviderProps {
  children: React.ReactNode;
  onHistoryChange: (elements: any[], selectedElementIds: string[], selectedElementId: string | null) => void;
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
  onHistoryChange
}) => {
  const undo = useCallback(() => {
    const previousState = HistoryService.undo();
    if (previousState) {
      onHistoryChange(
        previousState.elements,
        previousState.selectedElementIds,
        previousState.selectedElementId
      );
    }
  }, [onHistoryChange]);

  const redo = useCallback(() => {
    const nextState = HistoryService.redo();
    if (nextState) {
      onHistoryChange(
        nextState.elements,
        nextState.selectedElementIds,
        nextState.selectedElementId
      );
    }
  }, [onHistoryChange]);

  const createCheckpoint = useCallback((description: string) => {
    // This would need access to current state - might need to be handled differently
    console.log('Create checkpoint:', description);
  }, []);

  const value: HistoryContextType = {
    canUndo: HistoryService.canUndo(),
    canRedo: HistoryService.canRedo(),
    undo,
    redo,
    createCheckpoint,
    getUndoDescription: () => HistoryService.getUndoDescription(),
    getRedoDescription: () => HistoryService.getRedoDescription()
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};
