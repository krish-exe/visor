import { useState, useEffect } from 'react';

interface SelectionOverlayProps {
  onComplete: (region: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
  isCapturing?: boolean;
}

export default function SelectionOverlay({ onComplete, onCancel, isCapturing = false }: SelectionOverlayProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCapturing) {
        console.log('ESC pressed - canceling selection');
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isCapturing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCapturing) return;
    
    console.log('Selection started at:', e.clientX, e.clientY);
    setIsDrawing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || isCapturing) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDrawing || isCapturing) return;
    
    setIsDrawing(false);

    // Calculate selection rectangle
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Only complete if selection has meaningful size
    if (width > 10 && height > 10) {
      console.log('Selection complete:', { x, y, width, height });
      onComplete({ x, y, width, height });
    } else {
      console.log('Selection too small, canceling');
      onCancel();
    }
  };

  // Calculate rectangle dimensions for rendering
  const getSelectionRect = () => {
    if (!isDrawing && startPos.x === 0) return null;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    return { x, y, width, height };
  };

  const rect = getSelectionRect();

  return (
    <div
      className="selection-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {rect && (
        <div
          className="selection-rectangle"
          style={{
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          }}
        />
      )}
      {isCapturing && (
        <div className="capturing-indicator">
          <div className="spinner"></div>
          <span>CAPTURING...</span>
        </div>
      )}
    </div>
  );
}
