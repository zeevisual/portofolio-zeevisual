import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    setIsZoomed(false);
  }, [project?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && onSelectProject && allProjects.length > 1) {
        const currentIndex = allProjects.findIndex((p) => p.id === project.id);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % allProjects.length;
          onSelectProject(allProjects[nextIndex]);
        }
      } else if (e.key === 'ArrowLeft' && onSelectProject && allProjects.length > 1) {
        const currentIndex = allProjects.findIndex((p) => p.id === project.id);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
          onSelectProject(allProjects[prevIndex]);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose, onSelectProject, allProjects]);

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

  const currentIndex = allProjects.findIndex((p) => p.id === project.id);
  const hasMultiple = allProjects.length > 1 && currentIndex !== -1 && Boolean(onSelectProject);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultiple || !onSelectProject) return;
    const prevIndex = (currentIndex - 1 + allProjects.length) % allProjects.length;
    onSelectProject(allProjects[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultiple || !onSelectProject) return;
    const nextIndex = (currentIndex + 1) % allProjects.length;
    onSelectProject(allProjects[nextIndex]);
  };

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
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#231e22] border-b border-[#56433b]/30 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-[#ffbb28] text-[#281b00] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider">
              {project.category}
            </span>
            <span className="font-mono text-xs text-[#ddc0b3]">
              {project.subCategory} • {project.year}
            </span>
            {hasMultiple && (
              <span className="hidden sm:inline-block font-mono text-[11px] text-[#ffb597]/80 ml-1">
                ({currentIndex + 1} / {allProjects.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!project.videoUrl && (
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-[#ddc0b3] hover:text-[#ffbb28] transition-colors px-2.5 py-1 bg-[#171216]/60 border border-[#56433b]/40 hover:border-[#ffbb28]"
                title={isZoomed ? 'Ukuran Normal' : 'Perbesar Gambar'}
              >
                <span className="material-symbols-outlined text-base">
                  {isZoomed ? 'zoom_out' : 'zoom_in'}
                </span>
                <span className="hidden md:inline">{isZoomed ? 'Normal' : 'Perbesar'}</span>
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
          {/* Media Area - Auto Scale to fit viewport cleanly on mobile & desktop */}
          <div
            className={`relative w-full bg-[#0f0b0e] flex items-center justify-center p-2 sm:p-4 min-h-[240px] sm:min-h-[360px] ${
              isZoomed ? 'overflow-auto max-h-[68vh]' : 'max-h-[55vh] sm:max-h-[62vh] overflow-hidden'
            }`}
          >
            {project.videoUrl ? (
              isDirectVideoFile ? (
                <video
                  src={project.videoUrl}
                  poster={project.image}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[50vh] sm:max-h-[58vh] w-auto max-w-full object-contain mx-auto shadow-lg"
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
                src={project.image}
                alt={project.title}
                onClick={() => setIsZoomed(!isZoomed)}
                className={`max-h-[50vh] sm:max-h-[58vh] w-auto max-w-full object-contain mx-auto transition-transform duration-500 ease-out select-none shadow-lg ${
                  isZoomed ? 'scale-125 sm:scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
              />
            )}

            {/* Prev / Next Navigation Buttons */}
            {hasMultiple && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  title="Karya Sebelumnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                  title="Karya Berikutnya"
                >
                  <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Project Details Area */}
          <div className="p-4 sm:p-7 bg-[#171216] border-t border-[#56433b]/20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <h2 className="font-headline text-xl sm:text-2xl md:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight mb-2.5">
                  {project.title}
                </h2>
                <p className="font-body text-sm sm:text-base text-[#ddc0b3] leading-relaxed mb-4">
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
