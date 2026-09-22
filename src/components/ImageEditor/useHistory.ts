import { useState, useRef, useEffect, useCallback } from 'react';

export interface UseHistoryReturn<T> {
  history: T[];
  redoStack: T[];
  historyRef: React.RefObject<T[]>;
  redoStackRef: React.RefObject<T[]>;
  push: (item: T) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useHistory = <T>(
  initialHistory: T[] = []
): UseHistoryReturn<T> => {
  const [history, setHistory] = useState<T[]>(initialHistory);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  // Synchronized refs for event handlers and listeners
  const historyRef = useRef<T[]>(history);
  const redoStackRef = useRef<T[]>(redoStack);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    redoStackRef.current = redoStack;
  }, [redoStack]);

  const push = useCallback((item: T) => {
    setHistory((prev) => [...prev, item]);
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    const current = historyRef.current;
    if (current.length === 0) return;

    const lastItem = current[current.length - 1];
    setRedoStack((prev) => [...prev, lastItem]);
    setHistory((prev) => prev.slice(0, -1));
  }, []);

  const redo = useCallback(() => {
    const currentRedo = redoStackRef.current;
    if (currentRedo.length === 0) return;

    const itemToRestore = currentRedo[currentRedo.length - 1];
    setHistory((prev) => [...prev, itemToRestore]);
    setRedoStack((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    if (historyRef.current.length === 0) return;
    setRedoStack(historyRef.current);
    setHistory([]);
  }, []);

  return {
    history,
    redoStack,
    historyRef,
    redoStackRef,
    push,
    undo,
    redo,
    clear,
  };
};
