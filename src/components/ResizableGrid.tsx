import React, { useRef, useState, useEffect, PropsWithChildren } from 'react';

interface ResizableGridProps {
  topLeft: React.ReactNode;
  topRight: React.ReactNode;
  bottomLeft: React.ReactNode;
  bottomRight: React.ReactNode;
  minColPx?: number;
  minRowPx?: number;
  initialColPct?: number; // percentage (0-100) width of left column
  initialRowPct?: number; // percentage (0-100) height of top row
}

const ResizableGrid: React.FC<PropsWithChildren<ResizableGridProps>> = ({
  topLeft, topRight, bottomLeft, bottomRight,
  minColPx = 260, minRowPx = 220, initialColPct = 50, initialRowPct = 50,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [colPct, setColPct] = useState(initialColPct);
  const [rowPct, setRowPct] = useState(initialRowPct);
  const [isDraggingV, setDraggingV] = useState(false);
  const [isDraggingH, setDraggingH] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (isDraggingV) {
        const x = Math.max(rect.left + minColPx, Math.min(e.clientX, rect.right - minColPx));
        const pct = ((x - rect.left) / rect.width) * 100;
        setColPct(pct);
      }
      if (isDraggingH) {
        const y = Math.max(rect.top + minRowPx, Math.min(e.clientY, rect.bottom - minRowPx));
        const pct = ((y - rect.top) / rect.height) * 100;
        setRowPct(pct);
      }
    };
    const onUp = () => { setDraggingV(false); setDraggingH(false); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDraggingV, isDraggingH, minColPx, minRowPx]);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${colPct}% 6px ${100 - colPct}%`,
    gridTemplateRows: `${rowPct}% 6px ${100 - rowPct}%`,
    height: '100%',
    width: '100%',
    gap: 0,
    position: 'relative',
  };

  const handleStyle: React.CSSProperties = {
    background: 'rgba(167,139,250,0.5)',
    cursor: 'col-resize',
  };

  const handleHStyle: React.CSSProperties = {
    background: 'rgba(167,139,250,0.5)',
    cursor: 'row-resize',
  };

  return (
    <div ref={containerRef} style={gridStyle}>
      <div style={{ gridColumn: '1 / 2', gridRow: '1 / 2', overflow: 'hidden' }}>{topLeft}</div>
      <div
        style={{ gridColumn: '2 / 3', gridRow: '1 / 4', ...handleStyle }}
        onMouseDown={(e) => { e.preventDefault(); setDraggingV(true); }}
        title="Drag to resize columns"
      />
      <div style={{ gridColumn: '3 / 4', gridRow: '1 / 2', overflow: 'hidden' }}>{topRight}</div>

      <div
        style={{ gridColumn: '1 / 4', gridRow: '2 / 3', ...handleHStyle }}
        onMouseDown={(e) => { e.preventDefault(); setDraggingH(true); }}
        title="Drag to resize rows"
      />

      <div style={{ gridColumn: '1 / 2', gridRow: '3 / 4', overflow: 'hidden' }}>{bottomLeft}</div>
      <div style={{ gridColumn: '3 / 4', gridRow: '3 / 4', overflow: 'hidden' }}>{bottomRight}</div>
    </div>
  );
};

export default ResizableGrid;
