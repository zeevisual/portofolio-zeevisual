import React, { useEffect, useState, useMemo } from 'react';
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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
  }, [project?.id]);

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
    (project.videoUrl.endsWith('.mp4') ||
      project.videoUrl.endsWith('.webm') ||
      project.videoUrl.includes('gtv-videos-bucket') ||
      project.videoUrl.includes('mixkit.co'));

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 md:p-8 overflow-y-auto animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        key={project.id}
        className="relative w-full max-w-5xl bg-[#171216] border border-[#56433b]/50 shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto flex flex-col max-h-[92vh] animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#231e22] border-b border-[#56433b]/30 shrink-0 gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
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

          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasMultipleProjects && (
              <div className="hidden md:flex items-center gap-1 mr-1">
                <button
                  onClick={handlePrevProject}
                  className="px-2 py-1 bg-[#171216]/70 border border-[#56433b]/40 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors"
                  title="Karya Sebelumnya"
                >
                  <span className="material-symbols-outlined text-sm">skip_previous</span>
                  <span>Karya Seb.</span>
                </button>
                <button
                  onClick={handleNextProject}
                  className="px-2 py-1 bg-[#171216]/70 border border-[#56433b]/40 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors"
                  title="Karya Berikutnya"
                >
                  <span>Karya Ber.</span>
                  <span className="material-symbols-outlined text-sm">skip_next</span>
                </button>
              </div>
            )}

            {!project.videoUrl && (
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#ddc0b3] hover:text-[#ffbb28] transition-colors px-2.5 py-1 bg-[#171216]/60 border border-[#56433b]/40 hover:border-[#ffbb28]"
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
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#ddc0b3] hover:text-[#ffbb28] transition-colors px-2.5 py-1 bg-[#171216]/60 border border-[#56433b]/40 hover:border-[#ffbb28]"
              aria-label="Tutup Preview"
            >
              <span className="hidden sm:inline">Tutup</span>
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Container with Auto-Scale Media */}
        <div className="overflow-y-auto flex-1 flex flex-col">
          {/* Media Area - Auto Scale + Touch Swipe for Slides */}
          <div
            className={`relative w-full bg-[#0f0b0e] flex items-center justify-center p-2 sm:p-4 min-h-[240px] sm:min-h-[360px] select-none ${
              isZoomed ? 'overflow-auto max-h-[68vh]' : 'max-h-[55vh] sm:max-h-[60vh] overflow-hidden'
            }`}
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
            {project.videoUrl ? (
              isDirectVideoFile ? (
                <video
                  src={project.videoUrl}
                  poster={project.image}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[50vh] sm:max-h-[56vh] w-auto max-w-full object-contain mx-auto shadow-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={project.videoUrl}
                    title={project.title}
                    className="w-full max-w-3xl aspect-video border border-[#56433b]/30 shadow-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )
            ) : (
              <img
                key={currentSlideUrl}
                src={currentSlideUrl}
                alt={`${project.title} - Slide ${activeSlideIndex + 1}`}
                onClick={() => setIsZoomed(!isZoomed)}
                className={`max-h-[48vh] sm:max-h-[56vh] w-auto max-w-full object-contain mx-auto transition-all duration-300 ease-out select-none shadow-lg ${
                  isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
              />
            )}

            {/* Slide Prev / Next Arrows (When Project Has Multiple Slides) */}
            {hasMultipleSlides && (
              <>
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl"
                  title="Slide Sebelumnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl"
                  title="Slide Berikutnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>

                {/* Bottom Pill Dots for Slide Indicator */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#171216]/85 backdrop-blur-md px-3 py-1.5 border border-[#56433b]/50 flex items-center gap-1.5 shadow-lg">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(false);
                        setActiveSlideIndex(idx);
                      }}
                      className={`h-2 transition-all duration-300 ${
                        idx === activeSlideIndex
                          ? 'w-6 bg-[#ffbb28]'
                          : 'w-2 bg-[#ddc0b3]/40 hover:bg-[#ddc0b3]'
                      }`}
                      title={`Lihat Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Project Prev / Next Arrows (When Only 1 Slide in Project) */}
            {!hasMultipleSlides && hasMultipleProjects && (
              <>
                <button
                  onClick={handlePrevProject}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  title="Karya Sebelumnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNextProject}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  title="Karya Berikutnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Strip Bar for Multi-Slide Projects */}
          {hasMultipleSlides && (
            <div className="bg-[#120d10] border-t border-[#56433b]/30 px-4 py-2.5 flex items-center gap-2.5 overflow-x-auto">
              <span className="font-mono text-[11px] text-[#ddc0b3]/80 uppercase shrink-0 mr-1">
                Galeri Slide ({slides.length}):
              </span>
              {slides.map((slideUrl, idx) => {
                const isSelected = idx === activeSlideIndex;
                return (
                  <button
                    key={`${slideUrl}-${idx}`}
                    type="button"
                    onClick={() => {
                      setIsZoomed(false);
                      setActiveSlideIndex(idx);
                    }}
                    className={`relative w-16 h-12 sm:w-20 sm:h-14 shrink-0 overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-[#ffbb28] scale-105 shadow-[0_0_12px_rgba(255,187,40,0.4)]'
                        : 'border-[#56433b]/40 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={slideUrl}
                      alt={`Slide ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 bg-[#171216]/85 text-[#ffbb28] font-mono text-[9px] px-1">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Project Details Area */}
          <div className="p-4 sm:p-7 bg-[#171216] border-t border-[#56433b]/20">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LightboxModal;
