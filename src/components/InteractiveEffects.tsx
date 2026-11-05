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
  threshold = 0.08,
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
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const getInitialTransform = () => {
    switch (direction) {
      case 'up':
        return 'translate3d(0, 24px, 0)';
      case 'down':
        return 'translate3d(0, -24px, 0)';
      case 'left':
        return 'translate3d(24px, 0, 0)';
      case 'right':
        return 'translate3d(-24px, 0, 0)';
      case 'scale':
        return 'scale(0.96) translate3d(0, 16px, 0)';
      default:
        return 'translate3d(0, 24px, 0)';
    }
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : getInitialTransform(),
        transition: `opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
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
  onClick?: (e?: React.MouseEvent) => void;
  tiltIntensity?: number;
  glowColor?: string;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  onClick,
  tiltIntensity = 5,
  glowColor = 'rgba(255, 187, 40, 0.16)',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hoverState, setHoverState] = useState<{
    active: boolean;
    transform: string;
    x: number;
    y: number;
  }>({
    active: false,
    transform: '',
    x: 50,
    y: 50,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el || window.innerWidth < 768) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -(tiltIntensity * 0.55);
    const rotateY = ((x - centerX) / centerX) * (tiltIntensity * 0.55);

    setHoverState({
      active: true,
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-3px)`,
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
    });
  };

  const handleMouseLeave = () => {
    if (hoverState.active) {
      setHoverState((prev) => ({ ...prev, active: false, transform: '' }));
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: hoverState.active ? hoverState.transform : undefined,
        transition: hoverState.active
          ? 'transform 0.12s ease-out, border-color 0.25s ease'
          : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease',
      }}
      className={`interactive-card relative overflow-hidden active:scale-[0.98] ${className}`}
    >
      {/* Dynamic Cursor Spotlight Overlay (Only rendered when actively hovered) */}
      {hoverState.active && (
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background: `radial-gradient(320px circle at ${hoverState.x}% ${hoverState.y}%, ${glowColor}, transparent 70%)`,
          }}
        />
      )}
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
    <div className="relative w-full overflow-hidden bg-[#171216]/90 border-y border-[#56433b]/30 py-2.5 select-none">
      <div className="animate-marquee flex items-center gap-6">
        {repeated.map((text, idx) => (
          <div key={idx} className="flex items-center gap-6 shrink-0">
            <span className="font-headline text-[11px] sm:text-xs font-bold tracking-[0.18em] uppercase text-[#ddc0b3]/85 hover:text-[#ffbb28] transition-colors">
              {text}
            </span>
            <span className="w-1.5 h-1.5 rotate-45 bg-[#ffbb28] inline-block" />
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
  const [imgError, setImgError] = useState(false);
  const hasMultiple = slides.length > 1;
  const activeUrl = slides[currentIdx] || image;

  React.useEffect(() => {
    setImgError(false);
  }, [activeUrl]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at center, #231b20 0%, #0f0b0e 100%)',
      }}
    >
      {imgError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-[#171216] text-[#ddc0b3]">
          <span className="material-symbols-outlined text-4xl text-[#ffbb28] mb-1">image_not_supported</span>
          <span className="font-mono text-xs uppercase font-bold text-[#ffb597]">Preview Tidak Tersedia</span>
          <span className="font-mono text-[10px] text-[#ddc0b3]/70 mt-1 line-clamp-2 max-w-xs">{alt}</span>
        </div>
      ) : (
        <img
          key={activeUrl}
          src={activeUrl}
          alt={`${alt}${hasMultiple ? ` - Slide ${currentIdx + 1}` : ''}`}
          className="relative z-[1] w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      )}

      {/* Subcategory Badge Top Left */}
      {subCategory && (
        <div className="absolute top-2 left-2 z-10">
          {subCategoryStyle === 'design' ? (
            <span className="bg-[#a53c00]/95 text-[#ffdbcd] font-mono text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase font-bold shadow">
              {subCategory}
            </span>
          ) : (
            <span className="bg-[#171216]/95 text-[#ffbb28] font-mono text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase border border-[#56433b]/40 shadow">
              {subCategory}
            </span>
          )}
        </div>
      )}

      {/* Multi-Slide Indicator Top Right */}
      {hasMultiple && (
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-[#171216]/95 text-[#ffbb28] border border-[#ffbb28]/45 font-mono text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 uppercase flex items-center gap-0.5 shadow-md">
            <span className="material-symbols-outlined text-[11px]">burst_mode</span>
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
              absolute left-1.5 top-1/2 -translate-y-1/2 z-30
              w-6 h-6 sm:w-7 sm:h-7 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00]
              border border-[#56433b]/60 flex items-center justify-center
              opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-md
            "
            title="Slide Sebelumnya"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="
              absolute right-1.5 top-1/2 -translate-y-1/2 z-30
              w-6 h-6 sm:w-7 sm:h-7 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00]
              border border-[#56433b]/60 flex items-center justify-center
              opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-md
            "
            title="Slide Berikutnya"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>

          {/* Mini Slide Dots at Bottom */}
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#171216]/80 px-1.5 py-0.5 border border-[#56433b]/40 max-w-[85%] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {slides.slice(0, 8).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(i);
                }}
                className={`h-1 transition-all ${
                  i === currentIdx ? 'w-3 bg-[#ffbb28]' : 'w-1 bg-[#ddc0b3]/50'
                }`}
                title={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Center / Bottom Hover Action Label */}
      <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 hidden sm:flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-300 bg-[#ffbb28] text-[#281b00] font-mono text-[10px] font-bold uppercase px-2.5 py-1 shadow-xl flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">{hoverIcon}</span>
          {hasMultiple ? `${hoverLabel} (${slides.length})` : hoverLabel}
        </span>
      </div>
    </div>
  );
};
