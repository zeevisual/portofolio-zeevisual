import React, { useEffect, useRef, useState } from 'react';
import { playClickSound, playHoverSound } from '../utils/sound';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const InteractiveCursor: React.FC = () => {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  useEffect(() => {
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target as HTMLElement | null;
      const clickable = target?.closest('a, button, [role="button"], .interactive-card, input, select, textarea');
      const nowHovering = Boolean(clickable);
      setIsHovering((prev) => {
        if (!prev && nowHovering) {
          playHoverSound();
        }
        return nowHovering;
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);

      // Spawn click ripple burst
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);

      // Play appropriate click sound if clicking an interactive element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Avoid double sound on sound-toggle button itself
      if (target.closest('[data-sound-toggle="true"]')) return;

      const isTabOrFilter = target.closest('[data-sound="tab"]');
      const isCard = target.closest('.interactive-card');
      const isButtonOrLink = target.closest('a, button, [role="button"]');

      if (isTabOrFilter) {
        playClickSound('tab');
      } else if (isButtonOrLink) {
        playClickSound('primary');
      } else if (isCard) {
        playClickSound('card');
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden select-none" aria-hidden="true">
      {/* Click Ripple Sonar Bursts (Works on both Mobile & Desktop) */}
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
        className="hidden lg:block fixed top-0 left-0 -ml-4 -mt-4 pointer-events-none will-change-transform"
      >
        <div
          className={`w-8 h-8 rounded-full border transition-all duration-200 flex items-center justify-center ${
            isClicking
              ? 'scale-75 border-[#ffbb28] bg-[#ffbb28]/20'
              : isHovering
              ? 'scale-135 border-[#ffbb28]/90 bg-[#ffbb28]/10 shadow-[0_0_15px_rgba(255,187,40,0.35)]'
              : 'scale-100 border-[#ffbb28]/35 bg-transparent'
          }`}
        />
      </div>

      {/* Desktop Cursor Center Dot */}
      <div
        ref={dotRef}
        className="hidden lg:block fixed top-0 left-0 -ml-1 -mt-1 pointer-events-none will-change-transform"
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
