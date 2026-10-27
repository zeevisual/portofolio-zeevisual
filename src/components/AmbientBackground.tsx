import React, { useEffect, useRef } from 'react';

export const AmbientBackground: React.FC = () => {
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const orb1Ref = useRef<HTMLDivElement | null>(null);
  const orb2Ref = useRef<HTMLDivElement | null>(null);
  const orb3Ref = useRef<HTMLDivElement | null>(null);
  const ring1Ref = useRef<HTMLDivElement | null>(null);
  const ring2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let targetScrollY = window.scrollY;
    let currentScrollY = targetScrollY;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };

    const animate = () => {
      // Smooth lerp for cursor aura (0.07 factor = silky smooth lag)
      currentX += (mouseX - currentX) * 0.07;
      currentY += (mouseY - currentY) * 0.07;

      // Smooth lerp for scroll parallax (0.08 factor = buttery smooth scroll response)
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;

      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform = `translate3d(${currentX - 350}px, ${currentY - 350}px, 0)`;
      }

      if (gridLayerRef.current) {
        const gridOffset = (currentScrollY * 0.18) % 64;
        gridLayerRef.current.style.transform = `translate3d(0, ${-gridOffset}px, 0)`;
      }

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate3d(${Math.sin(currentScrollY * 0.002) * 40}px, ${currentScrollY * -0.15}px, 0)`;
      }

      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate3d(${Math.cos(currentScrollY * 0.002) * -50}px, ${currentScrollY * -0.09}px, 0)`;
      }

      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate3d(${Math.sin(currentScrollY * 0.0015) * 35}px, ${currentScrollY * -0.12}px, 0)`;
      }

      if (ring1Ref.current) {
        ring1Ref.current.style.transform = `translate3d(0, ${currentScrollY * -0.22}px, 0) rotate(${currentScrollY * 0.04}deg)`;
      }

      if (ring2Ref.current) {
        ring2Ref.current.style.transform = `translate3d(0, ${currentScrollY * -0.14}px, 0) rotate(${-currentScrollY * 0.03}deg)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Base Rich Gradient Mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -15%, rgba(165, 60, 0, 0.18), transparent 70%), radial-gradient(ellipse 60% 50% at 90% 100%, rgba(255, 187, 40, 0.09), transparent 70%), #171216',
        }}
      />

      {/* Parallax Architectural Grid Layer */}
      <div
        ref={gridLayerRef}
        className="absolute -inset-20 opacity-[0.16] will-change-transform"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 187, 40, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(221, 192, 179, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 45%, black 30%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 75% at 50% 45%, black 30%, transparent 100%)',
        }}
      />

      {/* Fine Dot Matrix Accent */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 187, 40, 0.45) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 85%)',
        }}
      />

      {/* Interactive Smooth Mouse-Following Aura */}
      <div
        ref={cursorGlowRef}
        className="hidden md:block absolute top-0 left-0 w-[700px] h-[700px] rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 187, 40, 0.11) 0%, rgba(165, 60, 0, 0.06) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      {/* Scroll-Reactive Parallax Aurora Orbs */}
      <div
        ref={orb1Ref}
        className="absolute top-[8%] left-[5%] w-[360px] sm:w-[500px] h-[360px] sm:h-[500px] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(165, 60, 0, 0.22) 0%, transparent 70%)',
          filter: 'blur(65px)',
        }}
      />

      <div
        ref={orb2Ref}
        className="absolute top-[45%] right-[2%] w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(255, 187, 40, 0.15) 0%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />

      <div
        ref={orb3Ref}
        className="absolute top-[85%] left-[18%] w-[380px] sm:w-[540px] h-[380px] sm:h-[540px] rounded-full will-change-transform"
        style={{
          background: 'radial-gradient(circle, rgba(255, 181, 151, 0.13) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      {/* Parallax Geometric Camera/Lens Rings */}
      <div
        ref={ring1Ref}
        className="hidden sm:flex absolute top-[18%] right-[8%] w-72 h-72 rounded-full border border-[#ffbb28]/10 items-center justify-center will-change-transform"
      >
        <div className="w-52 h-52 rounded-full border border-dashed border-[#ffb597]/15 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#ffbb28]/20" />
        </div>
      </div>

      <div
        ref={ring2Ref}
        className="hidden sm:flex absolute top-[68%] left-[6%] w-80 h-80 rounded-full border border-[#56433b]/20 items-center justify-center will-change-transform"
      >
        <div className="w-60 h-60 rounded-full border border-dashed border-[#ffbb28]/10" />
      </div>

      {/* Subtle Editorial Film Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AmbientBackground;
