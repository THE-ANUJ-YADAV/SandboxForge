import { useState, useEffect, useRef } from 'react';
import { useLayout } from '../context/useLayout';

export default function ResizeDivider({ onResize, direction = 'vertical' }) {
  const { setIsResizing } = useLayout();
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      if (direction === 'vertical') {
        const delta = e.clientX - startPosRef.current;
        startPosRef.current = e.clientX;
        onResize(delta);
      } else {
        const delta = startPosRef.current - e.clientY;
        startPosRef.current = e.clientY;
        onResize(delta);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, direction, onResize, setIsResizing]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setIsResizing(true);
    startPosRef.current = direction === 'vertical' ? e.clientX : e.clientY;
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  if (direction === 'horizontal') {
    return (
      <div
        onMouseDown={handleMouseDown}
        className="group relative h-2.5 -my-1 cursor-row-resize flex items-center justify-center z-30 transition-colors"
      >
        <div
          className={`h-px w-full transition-colors ${
            isDragging
              ? 'bg-indigo-500 shadow-glow-indigo'
              : 'bg-slate-300 dark:bg-slate-800/80 group-hover:bg-indigo-500'
          }`}
        />
        <div
          className={`absolute w-8 h-1 rounded-full transition-opacity ${
            isDragging
              ? 'bg-indigo-600 dark:bg-cyan-400 opacity-100 shadow-glow-cyan'
              : 'bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100'
          }`}
        />
      </div>
    );
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      className="group relative w-2.5 -mx-1 cursor-col-resize flex items-center justify-center z-30 transition-colors select-none shrink-0"
    >
      <div
        className={`w-px h-full transition-colors ${
          isDragging
            ? 'bg-indigo-500 shadow-glow-indigo'
            : 'bg-slate-300 dark:bg-slate-800/80 group-hover:bg-indigo-500'
        }`}
      />
      <div
        className={`absolute h-8 w-1 rounded-full transition-opacity ${
          isDragging
            ? 'bg-indigo-600 dark:bg-cyan-400 opacity-100 shadow-glow-cyan'
            : 'bg-slate-400 dark:bg-slate-600 opacity-0 group-hover:opacity-100'
        }`}
      />
    </div>
  );
}
