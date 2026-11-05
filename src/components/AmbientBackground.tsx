import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string;
}

interface Meteor {
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  thickness: number;
  progress: number;
  duration: number;
  delay: number;
  hueType: 'gold' | 'amber' | 'warmWhite';
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);
  const gridLayerRef = useRef<HTMLDivElement | null>(null);
  const orb1Ref = useRef<HTMLDivElement | null>(null);
  const orb2Ref = useRef<HTMLDivElement | null>(null);
  const orb3Ref = useRef<HTMLDivElement | null>(null);
  const ring1Ref = useRef<HTMLDivElement | null>(null);
  const ring2Ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas && ctx) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    resizeCanvas();

    // 1. Initialize Twinkling Stardust Particles
    const starColors = ['255, 187, 40', '255, 181, 151', '255, 243, 214'];
    const starCount = width < 640 ? 22 : 42;
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.6 + Math.random() * 1.3,
      baseAlpha: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.025,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // 2. Initialize Silky Vector Meteors (True trajectory alignment, zero stiffness)
    const createMeteor = (initialRandom = false): Meteor => {
      // Angle ~142 degrees (down-left diagonal) with subtle organic variance
      const angle = (Math.PI * 0.785) + (Math.random() - 0.5) * 0.08;
      const spawnX = width * (0.25 + Math.random() * 0.95);
      const spawnY = -40 + Math.random() * (height * 0.55);
      const types: Array<'gold' | 'amber' | 'warmWhite'> = ['gold', 'amber', 'warmWhite'];

      return {
        x: spawnX,
        y: spawnY,
        angle,
        speed: 4.2 + Math.random() * 3.6,
        length: 110 + Math.random() * 110,
        thickness: 1.1 + Math.random() * 0.9,
        progress: initialRandom ? Math.random() : 0,
        duration: 95 + Math.random() * 65,
        delay: initialRandom ? Math.floor(Math.random() * 90) : Math.floor(20 + Math.random() * 140),
        hueType: types[Math.floor(Math.random() * types.length)],
      };
    };

    const meteorCount = width < 640 ? 4 : 7;
    const meteors: Meteor[] = Array.from({ length: meteorCount }, () => createMeteor(true));

    let mouseX = width / 2;
    let mouseY = height / 2;
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
      // Smooth lerp for cursor aura & scroll parallax
      currentX += (mouseX - currentX) * 0.07;
      currentY += (mouseY - currentY) * 0.07;
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

      // Render Canvas Stars & Silky Meteors
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        // Draw Twinkling Stars
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.phase += s.speed;
          const alpha = s.baseAlpha * (0.55 + 0.45 * Math.sin(s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.color}, ${alpha.toFixed(3)})`;
          ctx.fill();
        }

        // Draw Silky Shooting Meteors
        for (let i = 0; i < meteors.length; i++) {
          const m = meteors[i];
          if (m.delay > 0) {
            m.delay -= 1;
            continue;
          }

          m.progress += 1 / m.duration;
          if (m.progress >= 1 || m.x < -200 || m.y > height + 200) {
            meteors[i] = createMeteor(false);
            continue;
          }

          // Smooth bell-curve opacity & subtle gravitational acceleration
          const easeAlpha = Math.sin(m.progress * Math.PI);
          const currentSpeed = m.speed * (0.85 + m.progress * 0.45);
          const vx = Math.cos(m.angle) * currentSpeed;
          const vy = Math.sin(m.angle) * currentSpeed;

          m.x += vx;
          m.y += vy;

          // Tail end coordinate strictly opposite to velocity vector
          const currentLen = m.length * (0.65 + 0.35 * easeAlpha);
          const tailX = m.x - Math.cos(m.angle) * currentLen;
          const tailY = m.y - Math.sin(m.angle) * currentLen;

          const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          const headAlpha = (0.9 * easeAlpha).toFixed(3);
          const midAlpha = (0.45 * easeAlpha).toFixed(3);

          if (m.hueType === 'gold') {
            grad.addColorStop(0, `rgba(255, 248, 225, ${headAlpha})`);
            grad.addColorStop(0.18, `rgba(255, 187, 40, ${midAlpha})`);
            grad.addColorStop(0.55, `rgba(165, 60, 0, ${(0.18 * easeAlpha).toFixed(3)})`);
            grad.addColorStop(1, 'rgba(255, 187, 40, 0)');
          } else if (m.hueType === 'amber') {
            grad.addColorStop(0, `rgba(255, 240, 230, ${headAlpha})`);
            grad.addColorStop(0.2, `rgba(255, 181, 151, ${midAlpha})`);
            grad.addColorStop(1, 'rgba(255, 181, 151, 0)');
          } else {
            grad.addColorStop(0, `rgba(255, 255, 255, ${headAlpha})`);
            grad.addColorStop(0.22, `rgba(255, 210, 120, ${midAlpha})`);
            grad.addColorStop(1, 'rgba(255, 187, 40, 0)');
          }

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = m.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Glowing Starlight Head Bloom
          const headGlow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 9);
          headGlow.addColorStop(0, `rgba(255, 250, 230, ${(0.95 * easeAlpha).toFixed(3)})`);
          headGlow.addColorStop(0.4, `rgba(255, 187, 40, ${(0.45 * easeAlpha).toFixed(3)})`);
          headGlow.addColorStop(1, 'rgba(255, 187, 40, 0)');

          ctx.fillStyle = headGlow;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
        className="absolute -inset-20 opacity-[0.14] will-change-transform"
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

      {/* 60fps HTML5 Canvas Silky Meteor & Starlight Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Subtle Editorial Film Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default AmbientBackground;
