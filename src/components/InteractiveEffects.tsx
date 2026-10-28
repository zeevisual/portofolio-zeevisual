import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  threshold = 0.1,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin: '0px 0px -35px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate3d(0, 38px, 0) scale(0.985)';
      case 'down':
        return 'translate3d(0, -38px, 0) scale(0.985)';
      case 'left':
        return 'translate3d(38px, 0, 0) scale(0.985)';
      case 'right':
        return 'translate3d(-38px, 0, 0) scale(0.985)';
      case 'scale':
        return 'scale(0.92) translate3d(0, 24px, 0)';
      default:
        return 'translate3d(0, 38px, 0) scale(0.985)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(5px)',
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getInitialTransform(),
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: 'opacity, transform, filter',
      }}
      className={className}
    >
      {children}
    </div>
  );
};

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tiltIntensity?: number;
  glowColor?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
  tiltIntensity = 5.5,
  glowColor = 'rgba(255, 187, 40, 0.18)',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
  );
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    if (window.innerWidth < 768) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
    const rotateY = ((x - centerX) / centerX) * tiltIntensity;

    setTransformStyle(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-7px)`
    );
    setSpotlightPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)');
    setSpotlightPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: spotlightPos.opacity
          ? 'transform 0.14s ease-out, border-color 0.3s ease, box-shadow 0.3s ease'
          : 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.55s ease',
      }}
      className={`interactive-card relative overflow-hidden active:scale-[0.98] ${className}`}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={{
          opacity: spotlightPos.opacity,
          background: `radial-gradient(400px circle at ${spotlightPos.x}% ${spotlightPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
};

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  suffix = '',
  duration = 1400,
  className = '',
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, target, duration]);

  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  );
};

interface CreativeMarqueeProps {
  items?: string[];
}

export const CreativeMarquee: React.FC<CreativeMarqueeProps> = ({
  items = [
    'VIDEOGRAFI',
    'FOTOGRAFI',
    'DESAIN GRAFIS',
    'PENGEDITAN VIDEO & FOTO',
    'ZEEVISUAL PORTFOLIO',
    'SOCIAL MEDIA SPECIALIST',
  ],
}) => {
  const repeated = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-[#171216]/80 backdrop-blur-md border-y border-[#56433b]/35 py-3.5 select-none">
      <div className="animate-marquee flex items-center gap-8">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center gap-8 shrink-0">
            <span className="font-headline text-xs sm:text-sm font-bold tracking-[0.2em] uppercase text-[#ddc0b3]/90 hover:text-[#ffbb28] transition-colors">
              {text}
            </span>
            <span className="w-2 h-2 rotate-45 bg-[#ffbb28] inline-block" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectSlideMediaProps {
  image: string;
  images?: string[];
  alt: string;
  subCategory?: string;
  subCategoryStyle?: 'photo' | 'design';
  hoverLabel?: string;
  hoverIcon?: string;
}

export const ProjectSlideMedia: React.FC<ProjectSlideMediaProps> = ({
  image,
  images,
  alt,
  subCategory,
  subCategoryStyle = 'photo',
  hoverLabel = 'Buka Karya',
  hoverIcon = 'open_in_full',
}) => {
  const slides = React.useMemo(() => {
    const raw = images && images.length > 0 ? images : [image];
    const cleaned = raw.map((s) => s?.trim()).filter(Boolean) as string[];
    return cleaned.length > 0 ? cleaned : [image];
  }, [image, images]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const hasMultiple = slides.length > 1;
  const activeUrl = slides[currentIdx] || image;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#0f0b0e] flex items-center justify-center">
      {/* Subtle Blurred Backdrop so landscape/portrait mixed slides never have harsh bars or crop */}
      <img
        src={activeUrl}
        alt=""
        aria-hidden="true"
        className="
          absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none select-none
        "
        loading="lazy"
      />
      <img
        key={activeUrl}
        src={activeUrl}
        alt={`${alt}${hasMultiple ? ` - Slide ${currentIdx + 1}` : ''}`}
        className="
          relative z-[1] w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700 ease-out
        "
        loading="lazy"
      />

      {/* Subcategory Badge Top Left */}
      {subCategory && (
        <div className="absolute top-3 left-3 z-10">
          {subCategoryStyle === 'design' ? (
            <span className="bg-[#a53c00] text-[#ffdbcd] font-mono text-[10px] px-2.5 py-1 uppercase font-bold shadow">
              {subCategory}
            </span>
          ) : (
            <span className="bg-[#171216]/90 backdrop-blur-sm text-[#ffbb28] font-mono text-[10px] px-2.5 py-1 uppercase border border-[#56433b]/40 shadow">
              {subCategory}
            </span>
          )}
        </div>
      )}

      {/* Multi-Slide Indicator Top Right */}
      {hasMultiple && (
        <div className="absolute top-3 right-3 z-10">
          <span className="bg-[#171216]/90 backdrop-blur-sm text-[#ffbb28] border border-[#ffbb28]/50 font-mono text-[10px] font-bold px-2 py-1 uppercase flex items-center gap-1 shadow-lg">
            <span className="material-symbols-outlined text-xs">burst_mode</span>
            {currentIdx + 1}/{slides.length}
          </span>
        </div>
      )}

      {/* On-Card Slide Prev/Next Controls */}
      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="
              absolute left-2 top-1/2 -translate-y-1/2 z-30
              w-8 h-8 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00]
              border border-[#56433b]/60 flex items-center justify-center
              opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-lg
            "
            title="Slide Sebelumnya"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="
              absolute right-2 top-1/2 -translate-y-1/2 z-30
              w-8 h-8 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00]
              border border-[#56433b]/60 flex items-center justify-center
              opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-lg
            "
            title="Slide Berikutnya"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>

          {/* Mini Slide Dots at Bottom */}
          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#171216]/75 px-2 py-1 border border-[#56433b]/40"
            onClick={(e) => e.stopPropagation()}
          >
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(i);
                }}
                className={`h-1.5 transition-all ${
                  i === currentIdx ? 'w-4 bg-[#ffbb28]' : 'w-1.5 bg-[#ddc0b3]/50'
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Center / Bottom Hover Action Label */}
      <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-[#ffbb28] text-[#281b00] font-mono text-[11px] font-bold uppercase px-3.5 py-1.5 shadow-xl flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm">{hoverIcon}</span>
          {hasMultiple ? `${hoverLabel} (${slides.length} Slide)` : hoverLabel}
        </span>
      </div>
    </div>
  );
};
