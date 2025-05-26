import { Element } from '../types/template';
import { HistoryState } from '../types/template';

/**
 * History service for undo/redo functionality
 */
export class HistoryService {
  private static history: HistoryState[] = [];
  private static currentIndex: number = -1;
  private static maxHistorySize: number = 50;
  private static isUndoRedoOperation: boolean = false;

  /**
   * Initialize history with initial state
   */
  static initialize(
    elements: Element[],
    selectedElementIds: string[] = [],
    selectedElementId: string | null = null
  ): void {
    const initialState: HistoryState = {
      elements: [...elements],
      selectedElementIds: [...selectedElementIds],
      selectedElementId,
      timestamp: Date.now(),
      description: 'Initial state'
    };

    this.history = [initialState];
    this.currentIndex = 0;
    this.isUndoRedoOperation = false;
  }

  /**
   * Add a new state to history
   */
  static addState(
    elements: Element[],
    selectedElementIds: string[] = [],
    selectedElementId: string | null = null,
    description?: string
  ): void {
    // Skip if this is from undo/redo operation
    if (this.isUndoRedoOperation) {
      this.isUndoRedoOperation = false;
      return;
    }

    // Skip if elements haven't actually changed
    if (this.history.length > 0) {
      const lastState = this.history[this.currentIndex];
      const elementsChanged = JSON.stringify(elements) !== JSON.stringify(lastState.elements);
      const selectedChanged = selectedElementId !== lastState.selectedElementId;
      const selectedIdsChanged = JSON.stringify(selectedElementIds) !== JSON.stringify(lastState.selectedElementIds);
      
      if (!elementsChanged && !selectedChanged && !selectedIdsChanged) {
        return;
      }
    }

    const newState: HistoryState = {
      elements: [...elements],
      selectedElementIds: [...selectedElementIds],
      selectedElementId,
      timestamp: Date.now(),
      description
    };

    // If we're not at the end of history, truncate it
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push(newState);
    this.currentIndex++;

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Undo to previous state
   */
  static undo(): HistoryState | null {
    if (!this.canUndo()) {
      return null;
    }

    this.isUndoRedoOperation = true;
    this.currentIndex--;
    return { ...this.history[this.currentIndex] };
  }

  /**
   * Redo to next state
   */
  static redo(): HistoryState | null {
    if (!this.canRedo()) {
      return null;
    }

    this.isUndoRedoOperation = true;
    this.currentIndex++;
    return { ...this.history[this.currentIndex] };
  }

  /**
   * Check if undo is possible
   */
  static canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  static canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  static getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return { ...this.history[this.currentIndex] };
    }
    return null;
  }

  /**
   * Get history length
   */
  static getHistoryLength(): number {
    return this.history.length;
  }

  /**
   * Get current index
   */
  static getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Clear all history
   */
  static clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.isUndoRedoOperation = false;
  }

  /**
   * Get history summary for debugging
   */
  static getHistorySummary(): Array<{
    index: number;
    description: string;
    timestamp: number;
    elementCount: number;
    isCurrent: boolean;
  }> {
    return this.history.map((state, index) => ({
      index,
      description: state.description || `State ${index}`,
      timestamp: state.timestamp,
      elementCount: state.elements.length,
      isCurrent: index === this.currentIndex
    }));
  }

  /**
   * Set maximum history size
   */
  static setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      const trimAmount = this.history.length - this.maxHistorySize;
      this.history = this.history.slice(trimAmount);
      this.currentIndex = Math.max(0, this.currentIndex - trimAmount);
    }
  }

  /**
   * Get maximum history size
   */
  static getMaxHistorySize(): number {
    return this.maxHistorySize;
  }

  /**
   * Check if currently performing undo/redo operation
   */
  static isPerformingUndoRedo(): boolean {
    return this.isUndoRedoOperation;
  }

  /**
   * Mark that an undo/redo operation is starting
   */
  static markUndoRedoStart(): void {
    this.isUndoRedoOperation = true;
  }

  /**
   * Mark that an undo/redo operation has ended
   */
  static markUndoRedoEnd(): void {
    this.isUndoRedoOperation = false;
  }

  /**
   * Go to specific state by index
   */
  static goToState(index: number): HistoryState | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }

    this.isUndoRedoOperation = true;
    this.currentIndex = index;
    return { ...this.history[this.currentIndex] };
  }

  /**
   * Get state at specific index
   */
  static getStateAt(index: number): HistoryState | null {
    if (index < 0 || index >= this.history.length) {
      return null;
    }
    return { ...this.history[index] };
  }

  /**
   * Create a checkpoint with description
   */
  static createCheckpoint(
    elements: Element[],
    selectedElementIds: string[] = [],
    selectedElementId: string | null = null,
    description: string
  ): void {
    this.addState(elements, selectedElementIds, selectedElementId, description);
  }

  /**
   * Batch multiple operations into single history entry
   */
  static startBatch(): void {
    this.isUndoRedoOperation = true;
  }

  /**
   * End batch and add single history entry
   */
  static endBatch(
    elements: Element[],
    selectedElementIds: string[] = [],
    selectedElementId: string | null = null,
    description?: string
  ): void {
    this.isUndoRedoOperation = false;
    this.addState(elements, selectedElementIds, selectedElementId, description);
  }

  /**
   * Get undo description
   */
  static getUndoDescription(): string | null {
    if (!this.canUndo()) return null;
    const prevState = this.history[this.currentIndex - 1];
    return prevState.description || `Undo to state ${this.currentIndex - 1}`;
  }

  /**
   * Get redo description
   */
  static getRedoDescription(): string | null {
    if (!this.canRedo()) return null;
    const nextState = this.history[this.currentIndex + 1];
    return nextState.description || `Redo to state ${this.currentIndex + 1}`;
  }

  /**
   * Export history for debugging or persistence
   */
  static exportHistory(): {
    history: HistoryState[];
    currentIndex: number;
    maxHistorySize: number;
  } {
    return {
      history: [...this.history],
      currentIndex: this.currentIndex,
      maxHistorySize: this.maxHistorySize
    };
  }

  /**
   * Import history from exported data
   */
  static importHistory(data: {
    history: HistoryState[];
    currentIndex: number;
    maxHistorySize: number;
  }): void {
    this.history = [...data.history];
    this.currentIndex = data.currentIndex;
    this.maxHistorySize = data.maxHistorySize;
    this.isUndoRedoOperation = false;
  }

  /**
   * Get memory usage estimate
   */
  static getMemoryUsage(): {
    stateCount: number;
    estimatedSizeKB: number;
    averageElementsPerState: number;
  } {
    const totalElements = this.history.reduce((sum, state) => sum + state.elements.length, 0);
    const estimatedSizeKB = Math.round((JSON.stringify(this.history).length / 1024) * 100) / 100;
    
    return {
      stateCount: this.history.length,
      estimatedSizeKB,
      averageElementsPerState: Math.round((totalElements / this.history.length) * 100) / 100
    };
  }

  /**
   * Optimize history by removing redundant states
   */
  static optimizeHistory(): number {
    if (this.history.length <= 1) return 0;

    const originalLength = this.history.length;
    const optimizedHistory: HistoryState[] = [this.history[0]];
    
    for (let i = 1; i < this.history.length; i++) {
      const current = this.history[i];
      const previous = optimizedHistory[optimizedHistory.length - 1];
      
      // Keep state if elements have changed significantly
      const elementsChanged = JSON.stringify(current.elements) !== JSON.stringify(previous.elements);
      const selectionChanged = current.selectedElementId !== previous.selectedElementId;
      
      if (elementsChanged || selectionChanged) {
        optimizedHistory.push(current);
      }
    }

    this.history = optimizedHistory;
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1);
    
    return originalLength - this.history.length;
  }
}

export default HistoryService;