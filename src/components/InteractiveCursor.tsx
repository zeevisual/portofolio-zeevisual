import React, { useEffect, useRef, useState } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const InteractiveCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const lastHoverRef = useRef<boolean>(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number | null = null;

    const animate = () => {
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;
      ringX += dx * 0.22;
      ringY += dy * 0.22;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0)`;
      }

      if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }

      const target = e.target as HTMLElement | null;
      const clickable = Boolean(
        target?.closest('a, button, [role="button"], .interactive-card, input, select, textarea')
      );
      if (clickable !== lastHoverRef.current) {
        lastHoverRef.current = clickable;
        setIsHovering(clickable);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 550);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Click Ripple Sonar Bursts */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="fixed -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#ffbb28]/80 animate-click-ripple pointer-events-none"
        />
      ))}

      {/* Desktop Camera Viewfinder Cursor Ring */}
      <div
        ref={ringRef}
        className="hidden lg:block fixed top-0 left-0 -ml-4 -mt-4 pointer-events-none"
      >
        <div
          className={`w-8 h-8 rounded-full border transition-all duration-200 flex items-center justify-center ${
            isClicking
              ? 'scale-75 border-[#ffbb28] bg-[#ffbb28]/20'
              : isHovering
              ? 'scale-125 border-[#ffbb28]/90 bg-[#ffbb28]/10'
              : 'scale-100 border-[#ffbb28]/35 bg-transparent'
          }`}
        />
      </div>

      {/* Desktop Cursor Center Dot */}
      <div
        ref={dotRef}
        className="hidden lg:block fixed top-0 left-0 -ml-1 -mt-1 pointer-events-none"
      >
        <div
          className={`w-2 h-2 rounded-full transition-transform duration-150 ${
            isHovering ? 'scale-0 bg-[#ffbb28]' : 'scale-100 bg-[#ffbb28]/80'
          }`}
        />
      </div>
    </div>
  );
};

export default InteractiveCursor;
