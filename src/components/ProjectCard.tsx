import React, { useState, useRef } from 'react';
import { Project } from '../data/projects';
import { InteractiveCard, ProjectSlideMedia } from './InteractiveEffects';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  variant?: 'photo' | 'design' | 'video';
  className?: string;
  glowColor?: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  variant,
  className = '',
  glowColor,
}) => {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastClickRef = useRef<number>(0);

  const effectiveVariant: 'photo' | 'design' | 'video' =
    variant ||
    (project.category === 'Videografi'
      ? 'video'
      : project.category === 'Desain Grafis'
      ? 'design'
      : 'photo');

  const defaultGlow =
    effectiveVariant === 'design'
      ? 'rgba(255, 181, 151, 0.16)'
      : 'rgba(255, 187, 40, 0.18)';

  // Handle double click / double tap: "Tekan 2 kali" reveals description
  const handleCardClick = (e?: React.MouseEvent) => {
    const now = Date.now();
    const timeDiff = now - lastClickRef.current;

    if (timeDiff < 320) {
      // DOUBLE CLICK / TEKAN 2 KALI!
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      lastClickRef.current = 0;
      if (e) e.stopPropagation();
      setIsDescOpen((prev) => !prev);
      return;
    }

    lastClickRef.current = now;
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      onSelect(project);
    }, 280);
  };

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    onSelect(project);
  };

  const handleToggleDesc = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDescOpen((prev) => !prev);
  };

  return (
    <InteractiveCard
      onClick={handleCardClick}
      glowColor={glowColor || defaultGlow}
      className={`h-full group p-2 sm:p-3 ios-glass-card ${
        effectiveVariant === 'design' ? 'hover:border-[#ffb597]/70' : 'hover:border-[#ffbb28]/70'
      } cursor-pointer flex flex-col transition-all duration-300 ${className}`}
    >
      {/* 1. SHARP SQUARE PHOTO/VIDEO FRAME (Consistent No-Radius Editorial Corners) */}
      {effectiveVariant === 'video' ? (
        <div
          onClick={handleMediaClick}
          className={`w-full overflow-hidden border border-[#56433b]/30 relative transition-all ${
            project.videoType === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
          }`}
          style={{
            background: 'radial-gradient(circle at center, #231b20 0%, #120d10 100%)',
          }}
        >
          <img
            src={project.image}
            alt={project.title}
            className={`w-full h-full relative z-10 ${
              project.videoType === 'portrait' ? 'object-contain' : 'object-cover'
            } group-hover:scale-105 transition-transform duration-500 ease-out`}
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 z-20 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ffbb28] text-[#281b00] flex items-center justify-center shadow-[0_0_18px_rgba(255,187,40,0.5)] group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-lg sm:text-xl">play_arrow</span>
            </div>
          </div>
          {project.badge && (
            <span className="absolute top-2 left-2 z-20 bg-[#171216]/90 text-[#ffbb28] font-mono text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 uppercase border border-[#56433b]/40">
              {project.badge}
            </span>
          )}
          {project.videoType === 'portrait' && (
            <span className="absolute bottom-2 right-2 z-20 bg-[#171216]/90 text-[#ffbb28] font-mono text-[8px] sm:text-[9px] px-1.5 py-0.5 uppercase border border-[#ffbb28]/40 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[11px]">phone_iphone</span>
              Reels
            </span>
          )}
        </div>
      ) : (
        <div
          onClick={handleMediaClick}
          className="aspect-[4/3] w-full overflow-hidden bg-[#120d10] border border-[#56433b]/30 relative"
        >
          <ProjectSlideMedia
            image={project.image}
            images={project.images}
            alt={project.title}
            subCategory={project.subCategory}
            subCategoryStyle={effectiveVariant === 'design' ? 'design' : 'photo'}
            hoverLabel={effectiveVariant === 'design' ? 'Lihat Desain' : 'Buka Foto'}
            hoverIcon={effectiveVariant === 'design' ? 'visibility' : 'open_in_full'}
          />
        </div>
      )}

      {/* 2. COMPACT CARD CONTENT AREA */}
      <div className="pt-2.5 sm:pt-3 px-1 pb-0.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Subkategori & Quick Toggle Deskripsi */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <span className="font-mono text-[9px] sm:text-[10px] text-[#ffb597] uppercase tracking-wider truncate">
              {project.subCategory}
            </span>
            <button
              type="button"
              onClick={handleToggleDesc}
              className={`font-mono text-[8px] sm:text-[9px] px-1.5 py-0.5 border transition-colors flex items-center gap-0.5 cursor-pointer shrink-0 ${
                isDescOpen
                  ? 'bg-[#ffbb28] text-[#281b00] border-[#ffbb28] font-bold'
                  : 'bg-[#171216]/90 text-[#ddc0b3]/75 border-[#56433b]/40 hover:text-[#ffbb28] hover:border-[#ffbb28]/60'
              }`}
              title="Tekan 2x kartu atau klik tombol ini untuk membaca deskripsi"
            >
              <span className="material-symbols-outlined text-[11px]">
                {isDescOpen ? 'expand_less' : 'notes'}
              </span>
              <span>{isDescOpen ? 'Tutup' : 'Info'}</span>
            </button>
          </div>

          {/* Judul Karya (Proportional & Neat) */}
          <h3
            className={`font-headline font-bold text-xs sm:text-sm text-[#ebdfe4] uppercase tracking-tight leading-snug line-clamp-2 transition-colors ${
              effectiveVariant === 'design'
                ? 'group-hover:text-[#ffb597]'
                : 'group-hover:text-[#ffbb28]'
            }`}
          >
            {project.title}
          </h3>

          {/* Deskripsi: MUNCUL HANYA KETIKA DITEKAN 2 KALI ATAU TOMBOL DIKLIK */}
          {isDescOpen && project.description && (
            <div className="mt-2 p-2.5 bg-[#171216] border border-[#ffbb28]/40 shadow-lg text-[11px] sm:text-xs text-[#ebdfe4] leading-relaxed animate-accordion space-y-1.5">
              <p className="whitespace-pre-line font-body text-[#ddc0b3]">
                {project.description}
              </p>
              <div className="flex items-center justify-between pt-1.5 border-t border-[#56433b]/40 font-mono text-[9px]">
                <span className="text-[#ffbb28]/90">💡 Tekan 2x tutup</span>
                <button
                  type="button"
                  onClick={handleToggleDesc}
                  className="text-[#ffb597] hover:text-[#ffbb28] uppercase font-bold underline cursor-pointer"
                >
                  Tutup ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. COMPACT CARD FOOTER (Tools & Meta) */}
        <div className="mt-2.5 pt-2 border-t border-[#56433b]/20">
          {project.tools && project.tools.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {project.tools.slice(0, 3).map((tool: string) => (
                <span
                  key={tool}
                  className="font-mono text-[8px] sm:text-[9px] px-1.5 py-0.5 bg-[#171216]/90 text-[#ffbb28]/95 border border-[#56433b]/30"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between gap-2 font-mono text-[9px] sm:text-[10px] text-[#ddc0b3]/65">
            <span className="truncate">
              {project.client ||
                project.badge ||
                (effectiveVariant === 'video' ? 'Produksi Video' : 'Karya Visual')}
            </span>
            <span className="shrink-0">{project.year}</span>
          </div>
        </div>
      </div>
    </InteractiveCard>
  );
};

export default ProjectCard;
