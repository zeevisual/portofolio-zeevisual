import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../data/projects';

interface LightboxModalProps {
  project: Project | null;
  onClose: () => void;
  onSelectProject?: (project: Project) => void;
  allProjects?: Project[];
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  project,
  onClose,
  onSelectProject,
  allProjects = [],
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showIgEmbed, setShowIgEmbed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const instagramEmbedUrl = useMemo(() => {
    if (!project?.instagramUrl) return '';
    const m = project.instagramUrl.match(
      /(?:instagram\.com|instagr\.am)\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i
    );
    if (!m) return '';
    const pType = m[1].toLowerCase() === 'reels' ? 'reel' : m[1].toLowerCase();
    return `https://www.instagram.com/${pType}/${m[2]}/embed/captioned/`;
  }, [project?.instagramUrl]);

  const slides = useMemo(() => {
    if (!project) return [];
    const rawList =
      project.images && project.images.length > 0
        ? project.images
        : [project.image];
    const cleaned = rawList.map((s) => s?.trim()).filter(Boolean) as string[];
    return cleaned.length > 0 ? cleaned : [project.image];
  }, [project]);

  const hasMultipleSlides = !project?.videoUrl && slides.length > 1;

  useEffect(() => {
    setIsZoomed(false);
    setActiveSlideIndex(0);
    setShowIgEmbed(false);
  }, [project?.id]);

  // Auto-scroll active thumbnail into view when changing slides
  useEffect(() => {
    const activeThumb = thumbRefs.current[activeSlideIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSlideIndex]);

  const currentIndex = project
    ? allProjects.findIndex((p) => p.id === project.id)
    : -1;
  const hasMultipleProjects =
    allProjects.length > 1 && currentIndex !== -1 && Boolean(onSelectProject);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleSlides) return;
    setIsZoomed(false);
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleSlides) return;
    setIsZoomed(false);
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleProjects || !onSelectProject) return;
    const prevIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
    onSelectProject(allProjects[prevIndex]);
  };

  const handleNextProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleProjects || !onSelectProject) return;
    const nextIndex = (currentIndex + 1) % allProjects.length;
    onSelectProject(allProjects[nextIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (hasMultipleSlides) {
          setIsZoomed(false);
          setActiveSlideIndex((prev) => (prev + 1) % slides.length);
        } else if (hasMultipleProjects && onSelectProject) {
          const nextIndex = (currentIndex + 1) % allProjects.length;
          onSelectProject(allProjects[nextIndex]);
        }
      } else if (e.key === 'ArrowLeft') {
        if (hasMultipleSlides) {
          setIsZoomed(false);
          setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
        } else if (hasMultipleProjects && onSelectProject) {
          const prevIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
          onSelectProject(allProjects[prevIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    project,
    onClose,
    onSelectProject,
    allProjects,
    currentIndex,
    hasMultipleSlides,
    hasMultipleProjects,
    slides.length,
  ]);

  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [project]);

  if (!project) return null;

  const currentSlideUrl = slides[activeSlideIndex] || project.image;

  const isDirectVideoFile =
    project.videoUrl &&
    (project.videoUrl.startsWith('/videos/') ||
      project.videoUrl.startsWith('data:video/') ||
      project.videoUrl.endsWith('.mp4') ||
      project.videoUrl.endsWith('.mov') ||
      project.videoUrl.endsWith('.webm') ||
      project.videoUrl.includes('gtv-videos-bucket') ||
      project.videoUrl.includes('mixkit.co'));

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        key={project.id}
        className="relative w-full max-w-5xl bg-[#171216] border border-[#56433b]/60 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[94vh] overflow-hidden animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar (Always Pinned & Never Clipped) */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 bg-[#231e22] border-b border-[#56433b]/40 shrink-0 gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#ffbb28] text-[#281b00] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
              {project.category}
            </span>
            <span className="font-mono text-xs text-[#ddc0b3]">
              {project.subCategory} • {project.year}
            </span>
            {hasMultipleSlides && (
              <span className="bg-[#a53c00] text-[#ffdbcd] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">burst_mode</span>
                Slide {activeSlideIndex + 1} / {slides.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasMultipleProjects && (
              <div className="hidden md:flex items-center gap-1 mr-1">
                <button
                  onClick={handlePrevProject}
                  className="px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Karya Sebelumnya"
                >
                  <span className="material-symbols-outlined text-sm">skip_previous</span>
                  <span>Karya Seb.</span>
                </button>
                <button
                  onClick={handleNextProject}
                  className="px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Karya Berikutnya"
                >
                  <span>Karya Ber.</span>
                  <span className="material-symbols-outlined text-sm">skip_next</span>
                </button>
              </div>
            )}

            {!project.videoUrl && !showIgEmbed && (
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#ddc0b3] hover:text-[#ffbb28] transition-colors px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] cursor-pointer"
                title={isZoomed ? 'Ukuran Normal' : 'Perbesar Gambar'}
              >
                <span className="material-symbols-outlined text-base">
                  {isZoomed ? 'zoom_out' : 'zoom_in'}
                </span>
                <span className="hidden sm:inline">{isZoomed ? 'Normal' : 'Perbesar'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-[#ddc0b3] hover:text-[#ffbb28] transition-colors px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] cursor-pointer"
              aria-label="Tutup Preview"
            >
              <span className="hidden sm:inline">Tutup</span>
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body (Block flow so children never get squished vertically) */}
        <div className="overflow-y-auto flex-1">
          {/* 1. Full Uncropped Media Viewer Area */}
          <div
            className="relative w-full bg-[#0b080a] flex items-center justify-center px-2 sm:px-12 py-3 sm:py-5 select-none"
            onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStartX === null || !hasMultipleSlides) return;
              const diff = touchStartX - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) {
                if (diff > 0) handleNextSlide();
                else handlePrevSlide();
              }
              setTouchStartX(null);
            }}
          >
            {showIgEmbed && instagramEmbedUrl ? (
              <div className="w-full flex items-center justify-center py-2">
                <iframe
                  src={instagramEmbedUrl}
                  title={`Instagram - ${project.title}`}
                  className="w-full max-w-lg min-h-[540px] sm:min-h-[620px] bg-white border border-[#56433b]/40 shadow-2xl"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : project.videoUrl ? (
              isDirectVideoFile ? (
                <div className="relative w-full flex items-center justify-center">
                  <video
                    key={project.videoUrl}
                    poster={project.image}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className={`w-auto max-w-full object-contain mx-auto shadow-2xl transition-all cursor-pointer ${
                      project.videoType === 'portrait'
                        ? 'max-h-[78vh] sm:max-h-[82vh] aspect-[9/16] rounded-lg'
                        : 'max-h-[66vh] sm:max-h-[72vh] aspect-video'
                    }`}
                    onClick={(e) => {
                      const v = e.currentTarget;
                      if (v.paused) {
                        v.play().catch(() => {});
                      } else {
                        v.pause();
                      }
                    }}
                  >
                    <source src={project.videoUrl} type="video/mp4" />
                    Browser Anda tidak mendukung pemutaran video langsung. Silakan buka file secara manual.
                  </video>
                </div>
              ) : (
                <div className="w-full flex items-center justify-center py-2">
                  <iframe
                    src={project.videoUrl}
                    title={project.title}
                    className={`w-full border border-[#56433b]/30 shadow-2xl ${
                      project.videoUrl.includes('instagram.com')
                        ? 'max-w-lg min-h-[540px] sm:min-h-[620px] bg-white'
                        : 'max-w-3xl aspect-video'
                    }`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            ) : (
              <div className={`w-full flex items-center justify-center ${isZoomed ? 'overflow-auto' : ''}`}>
                <img
                  key={currentSlideUrl}
                  src={currentSlideUrl}
                  alt={`${project.title} - Slide ${activeSlideIndex + 1}`}
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`w-auto max-w-full object-contain mx-auto transition-all duration-300 ease-out select-none shadow-2xl block ${
                    isZoomed
                      ? 'max-h-none sm:max-w-[90%] cursor-zoom-out'
                      : 'max-h-[58vh] sm:max-h-[66vh] cursor-zoom-in'
                  }`}
                />
              </div>
            )}

            {/* Slide Prev / Next Arrows */}
            {hasMultipleSlides && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer z-20"
                  title="Slide Sebelumnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer z-20"
                  title="Slide Berikutnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>
              </>
            )}

            {/* Project Prev / Next Arrows (When Only 1 Slide in Project) */}
            {!hasMultipleSlides && hasMultipleProjects && (
              <>
                <button
                  onClick={handlePrevProject}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer z-20"
                  title="Karya Sebelumnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextProject}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer z-20"
                  title="Karya Berikutnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* 2. Unsquished Thumbnail Strip & Progress Bar for Multi-Slide Projects */}
          {hasMultipleSlides && (
            <div className="bg-[#120d10] border-t border-[#56433b]/40 px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-[#ffb597] uppercase font-bold">
                  Galeri Slide ({activeSlideIndex + 1} dari {slides.length} Foto):
                </span>
                {/* Clean Dot Indicator Row */}
                <div className="flex items-center gap-1 flex-wrap justify-end">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsZoomed(false);
                        setActiveSlideIndex(idx);
                      }}
                      className={`h-1.5 transition-all duration-200 cursor-pointer ${
                        idx === activeSlideIndex
                          ? 'w-5 bg-[#ffbb28]'
                          : 'w-1.5 bg-[#ddc0b3]/35 hover:bg-[#ddc0b3]'
                      }`}
                      title={`Lihat Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5">
                {slides.map((slideUrl, idx) => {
                  const isSelected = idx === activeSlideIndex;
                  return (
                    <button
                      key={`${slideUrl}-${idx}`}
                      ref={(el) => {
                        thumbRefs.current[idx] = el;
                      }}
                      type="button"
                      onClick={() => {
                        setIsZoomed(false);
                        setActiveSlideIndex(idx);
                      }}
                      className={`relative w-16 h-20 min-w-[64px] min-h-[80px] shrink-0 overflow-hidden border-2 transition-all cursor-pointer bg-[#171216] ${
                        isSelected
                          ? 'border-[#ffbb28] ring-1 ring-[#ffbb28] opacity-100'
                          : 'border-[#56433b]/40 opacity-55 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={slideUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover block"
                      />
                      <span
                        className={`absolute bottom-0 right-0 font-mono text-[9px] px-1 font-bold ${
                          isSelected
                            ? 'bg-[#ffbb28] text-[#281b00]'
                            : 'bg-[#171216]/90 text-[#ffbb28]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Project Details Area */}
          <div className="p-4 sm:p-7 bg-[#171216] border-t border-[#56433b]/30">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight mb-2.5">
                  {project.title}
                </h2>
                <p className="font-body text-sm sm:text-base text-[#ddc0b3] leading-relaxed mb-4 whitespace-pre-line">
                  {project.longDescription || project.description}
                </p>

                {/* Tags / Tools */}
                {project.tools && project.tools.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tools.map((tool) => (
                      <span
                        key={tool}
                        className="px-3 py-1 bg-[#231e22] border border-[#56433b]/40 font-mono text-[11px] text-[#ffb597] uppercase tracking-wider hover:border-[#ffbb28] transition-colors"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Clean Info Box */}
              <div className="lg:col-span-4 bg-[#231e22] p-4 sm:p-5 border border-[#56433b]/30 space-y-2.5">
                <div className="flex justify-between items-center border-b border-[#56433b]/20 pb-2">
                  <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Kategori</span>
                  <span className="font-mono text-xs text-[#ebdfe4] font-bold">{project.category}</span>
                </div>
                <div className="flex justify-between items-center border-b border-[#56433b]/20 pb-2">
                  <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Sub-Bidang</span>
                  <span className="font-mono text-xs text-[#ffbb28]">{project.subCategory}</span>
                </div>
                {hasMultipleSlides && (
                  <div className="flex justify-between items-center border-b border-[#56433b]/20 pb-2">
                    <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Jumlah Slide</span>
                    <span className="font-mono text-xs text-[#ffbb28] font-bold">{slides.length} Foto / Slide</span>
                  </div>
                )}
                {project.badge && (
                  <div className="flex justify-between items-center border-b border-[#56433b]/20 pb-2">
                    <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Sorotan</span>
                    <span className="font-mono text-xs text-[#ffb597] text-right">{project.badge}</span>
                  </div>
                )}
                {project.client && (
                  <div className="flex justify-between items-center border-b border-[#56433b]/20 pb-2">
                    <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Instansi / Klien</span>
                    <span className="font-mono text-xs text-[#ebdfe4] text-right">{project.client}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] text-[#ddc0b3]/70 uppercase">Tahun Karya</span>
                  <span className="font-mono text-xs text-[#ebdfe4]">{project.year}</span>
                </div>
                {project.instagramUrl && (
                  <div className="pt-2 border-t border-[#56433b]/30">
                    <a
                      href={project.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      Lihat Postingan di Instagram
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LightboxModal;
