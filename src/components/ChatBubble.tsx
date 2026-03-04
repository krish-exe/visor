import { useEffect, useRef } from 'react';
import { ChatInstance, BUBBLE_SIZE } from '../types/ChatTypes';

interface ChatBubbleProps {
  chat: ChatInstance;
  onRestore: () => void;
  onUpdatePosition: (position: { x: number; y: number }) => void;
}

export default function ChatBubble({
  chat,
  onRestore,
  onUpdatePosition,
}: ChatBubbleProps) {

  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const draggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const rafRef = useRef<number | null>(null);

  const DRAG_THRESHOLD = 6;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();

    draggingRef.current = true;

    dragStartPosRef.current = {
      x: e.clientX,
      y: e.clientY,
    };

    dragOffsetRef.current = {
      x: e.clientX - chat.position.x,
      y: e.clientY - chat.position.y,
    };

    hasDraggedRef.current = false;
  };

  useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {

      if (!draggingRef.current) return;

      const dx = e.clientX - dragStartPosRef.current.x;
      const dy = e.clientY - dragStartPosRef.current.y;

      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > DRAG_THRESHOLD) {
        hasDraggedRef.current = true;
      }

      const newX = e.clientX - dragOffsetRef.current.x;
      const newY = e.clientY - dragOffsetRef.current.y;

      // Direct DOM update for smooth movement
      if (bubbleRef.current) {
        bubbleRef.current.style.left = `${newX}px`;
        bubbleRef.current.style.top = `${newY}px`;
      }

      // Commit position through rAF (reduces render spam)
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(() => {
          onUpdatePosition({ x: newX, y: newY });
          rafRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {

      if (!draggingRef.current) return;

      draggingRef.current = false;

      if (!hasDraggedRef.current) {
        onRestore();
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

  }, [onUpdatePosition, onRestore]);

  return (
    <div
      ref={bubbleRef}
      className="chat-bubble"
      style={{
        left: `${chat.position.x}px`,
        top: `${chat.position.y}px`,
        width: `${BUBBLE_SIZE}px`,
        height: `${BUBBLE_SIZE}px`,
      }}
      onMouseDown={handleMouseDown}
      title="Click to restore chat"
    >
      {chat.isStreaming && (
        <div className="chat-bubble-indicator" />
      )}
    </div>
  );
}