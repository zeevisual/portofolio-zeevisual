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

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas
      ? canvas.getContext('2d', { alpha: true, desynchronized: true })
      : null;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        // Use 1x resolution for soft atmospheric particles & meteors -> 4x faster fill rate on high-DPI displays
        canvas.width = width;
        canvas.height = height;
      }
    };
    resizeCanvas();

    // 1. Initialize Twinkling Stardust Particles
    const starColors = ['255, 187, 40', '255, 181, 151', '255, 243, 214'];
    const starCount = width < 640 ? 18 : 32;
    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.7 + Math.random() * 1.2,
      baseAlpha: 0.18 + Math.random() * 0.42,
      phase: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.022,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // 2. Initialize Silky Vector Meteors (True trajectory alignment, zero stiffness)
    const createMeteor = (initialRandom = false): Meteor => {
      const angle = Math.PI * 0.785 + (Math.random() - 0.5) * 0.08;
      const spawnX = width * (0.25 + Math.random() * 0.95);
      const spawnY = -40 + Math.random() * (height * 0.55);
      const types: Array<'gold' | 'amber' | 'warmWhite'> = ['gold', 'amber', 'warmWhite'];

      return {
        x: spawnX,
        y: spawnY,
        angle,
        speed: 4.2 + Math.random() * 3.4,
        length: 105 + Math.random() * 105,
        thickness: 1.1 + Math.random() * 0.8,
        progress: initialRandom ? Math.random() : 0,
        duration: 95 + Math.random() * 65,
        delay: initialRandom ? Math.floor(Math.random() * 90) : Math.floor(25 + Math.random() * 140),
        hueType: types[Math.floor(Math.random() * types.length)],
      };
    };

    const meteorCount = width < 640 ? 3 : 5;
    const meteors: Meteor[] = Array.from({ length: meteorCount }, () => createMeteor(true));

    let rafId: number;

    const animate = () => {
      if (ctx) {
        ctx.clearRect(0, 0, width, height);

        // Draw Twinkling Stars
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          s.phase += s.speed;
          const alpha = s.baseAlpha * (0.55 + 0.45 * Math.sin(s.phase));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${s.color}, ${alpha.toFixed(2)})`;
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

          const easeAlpha = Math.sin(m.progress * Math.PI);
          const currentSpeed = m.speed * (0.85 + m.progress * 0.45);
          const vx = Math.cos(m.angle) * currentSpeed;
          const vy = Math.sin(m.angle) * currentSpeed;

          m.x += vx;
          m.y += vy;

          const currentLen = m.length * (0.65 + 0.35 * easeAlpha);
          const tailX = m.x - Math.cos(m.angle) * currentLen;
          const tailY = m.y - Math.sin(m.angle) * currentLen;

          const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          const headAlpha = (0.9 * easeAlpha).toFixed(2);
          const midAlpha = (0.45 * easeAlpha).toFixed(2);

          if (m.hueType === 'gold') {
            grad.addColorStop(0, `rgba(255, 248, 225, ${headAlpha})`);
            grad.addColorStop(0.18, `rgba(255, 187, 40, ${midAlpha})`);
            grad.addColorStop(0.55, `rgba(165, 60, 0, ${(0.18 * easeAlpha).toFixed(2)})`);
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

          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.strokeStyle = grad;
          ctx.lineWidth = m.thickness;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Glowing Starlight Head
          ctx.fillStyle = `rgba(255, 245, 215, ${(0.85 * easeAlpha).toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      style={{ contain: 'strict' }}
      aria-hidden="true"
    >
      {/* Zero-Blur Pure Gradient Mesh (Replaces expensive CSS filter:blur orbs for 120fps scrolling) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -15%, rgba(165, 60, 0, 0.18), transparent 70%),
            radial-gradient(circle 420px at 12% 20%, rgba(165, 60, 0, 0.14), transparent 70%),
            radial-gradient(circle 400px at 88% 55%, rgba(255, 187, 40, 0.09), transparent 70%),
            radial-gradient(ellipse 60% 50% at 85% 100%, rgba(255, 181, 151, 0.08), transparent 70%),
            #171216
          `,
        }}
      />

      {/* Static Architectural Grid Layer (Zero scroll repaint overhead) */}
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 187, 40, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(221, 192, 179, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Subtle Geometric Camera/Lens Rings */}
      <div className="hidden sm:flex absolute top-[18%] right-[8%] w-72 h-72 rounded-full border border-[#ffbb28]/10 items-center justify-center">
        <div className="w-52 h-52 rounded-full border border-dashed border-[#ffb597]/15 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#ffbb28]/20" />
        </div>
      </div>

      {/* High-FPS HTML5 Canvas Silky Meteor & Starlight Engine */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default AmbientBackground;
