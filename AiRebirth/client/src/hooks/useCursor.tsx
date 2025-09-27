import { useEffect, useCallback } from 'react';

export type CursorType = 
  | 'default'
  | 'pointer'
  | 'text'
  | 'grab'
  | 'grabbing'
  | 'move'
  | 'resize-ns'
  | 'resize-ew'
  | 'crosshair'
  | 'help'
  | 'wait'
  | 'not-allowed';

export function useCursor() {
  const setCursor = useCallback((type: CursorType, element?: HTMLElement) => {
    const target = element || document.body;
    
    // Remove all cursor classes
    const cursorClasses = [
      'cursor-default',
      'cursor-pointer',
      'cursor-text',
      'cursor-grab',
      'cursor-grabbing',
      'cursor-move',
      'cursor-resize-ns',
      'cursor-resize-ew',
      'cursor-crosshair',
      'cursor-help',
      'cursor-wait',
      'cursor-not-allowed'
    ];
    
    target.classList.remove(...cursorClasses);
    
    // Add the new cursor class
    target.classList.add(`cursor-${type}`);
  }, []);

  const resetCursor = useCallback((element?: HTMLElement) => {
    setCursor('default', element);
  }, [setCursor]);

  const setTemporaryCursor = useCallback((type: CursorType, duration: number = 1000, element?: HTMLElement) => {
    setCursor(type, element);
    setTimeout(() => resetCursor(element), duration);
  }, [setCursor, resetCursor]);

  return {
    setCursor,
    resetCursor,
    setTemporaryCursor
  };
}

// Higher-order component for cursor management
export function withCursor<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  cursorType: CursorType
) {
  return function CursorWrapper(props: T) {
    const { setCursor, resetCursor } = useCursor();

    const handleMouseEnter = useCallback(() => {
      setCursor(cursorType);
    }, [setCursor]);

    const handleMouseLeave = useCallback(() => {
      resetCursor();
    }, [resetCursor]);

    return (
      <Component 
        {...props}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    );
  };
}

// Utility hook for drag operations
export function useDragCursor() {
  const { setCursor } = useCursor();

  const onDragStart = useCallback(() => {
    setCursor('grabbing');
  }, [setCursor]);

  const onDragEnd = useCallback(() => {
    setCursor('grab');
  }, [setCursor]);

  return { onDragStart, onDragEnd };
}