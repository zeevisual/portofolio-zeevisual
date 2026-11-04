import React, { useState, useMemo } from 'react';
import { getVideographyProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal } from '../components/InteractiveEffects';
import ProjectCard from '../components/ProjectCard';

type VideoFormatFilter = 'all' | 'landscape' | 'portrait';

const Videography: React.FC = () => {
  const allVideos = getVideographyProjects();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [selectedFormat, setSelectedFormat] = useState<VideoFormatFilter>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Dynamic Subcategories (Kompetisi, Reels, Teaser, etc.)
  const subCategories = useMemo(() => {
    const subs = Array.from(new Set(allVideos.map((p) => p.subCategory)));
    return ['Semua', ...subs];
  }, [allVideos]);

  // 1. Filter by Subcategory
  const subFilteredVideos = useMemo(() => {
    if (selectedSubCategory === 'Semua') return allVideos;
    return allVideos.filter((p) => p.subCategory === selectedSubCategory);
  }, [allVideos, selectedSubCategory]);

  // 2. Filter by Format (Semua / Landscape / Portrait)
  const filteredVideos = useMemo(() => {
    if (selectedFormat === 'all') return subFilteredVideos;
    return subFilteredVideos.filter((p) => (p.videoType || 'landscape') === selectedFormat);
  }, [subFilteredVideos, selectedFormat]);

  // Separate into Landscape (16:9) and Portrait (9:16) for clean layout
  const landscapeVideos = useMemo(() => {
    return filteredVideos.filter((p) => (p.videoType || 'landscape') === 'landscape');
  }, [filteredVideos]);

  const portraitVideos = useMemo(() => {
    return filteredVideos.filter((p) => p.videoType === 'portrait');
  }, [filteredVideos]);

  // Total counts for badges
  const totalLandscapeCount = useMemo(() => {
    return subFilteredVideos.filter((p) => (p.videoType || 'landscape') === 'landscape').length;
  }, [subFilteredVideos]);

  const totalPortraitCount = useMemo(() => {
    return subFilteredVideos.filter((p) => p.videoType === 'portrait').length;
  }, [subFilteredVideos]);

  const hasBothFormats = landscapeVideos.length > 0 && portraitVideos.length > 0;

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb
        currentPage="Videografi"
        subtitle={`${filteredVideos.length} Karya Video`}
      />

      <main className="py-6 sm:py-10 px-3 sm:px-6 max-w-[1200px] mx-auto">
        {/* Page Header (Identik dengan Foto & Desain) */}
        <ScrollReveal direction="up">
          <header className="mb-6 border-b border-[#56433b]/30 pb-5">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffbb28] uppercase tracking-widest block mb-1">
              Galeri Khusus Videografi
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-2">
              {siteTexts.videographyPageTitle}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl leading-relaxed">
              {siteTexts.videographyPageDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Filter Bar (Subkategori + Format Video) */}
        <ScrollReveal direction="up" delay={60}>
          <div className="space-y-3 mb-6 pb-4 border-b border-[#56433b]/20">
            {/* Baris 1: Filter Kategori (Format Persis Foto & Desain) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {subCategories.map((sub) => {
                const isActive = selectedSubCategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-[#ffbb28] text-[#281b00] font-bold shadow-[0_4px_14px_rgba(255,187,40,0.3)] -translate-y-0.5'
                        : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffbb28]/50 border border-[#56433b]/40'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>

            {/* Baris 2: Filter Format Video (Landscape 16:9 vs Reels 9:16) */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-mono text-[10px] text-[#ddc0b3]/70 uppercase tracking-wider mr-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#ffbb28]">aspect_ratio</span>
                Format:
              </span>

              <button
                type="button"
                onClick={() => setSelectedFormat('all')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFormat === 'all'
                    ? 'bg-[#a53c00] text-[#ffdbcd] font-bold border border-[#ffbb28]/40 shadow-sm'
                    : 'bg-[#171216] text-[#ddc0b3]/80 hover:text-[#ffbb28] border border-[#56433b]/30'
                }`}
              >
                <span className="material-symbols-outlined text-xs">dashboard</span>
                <span>Semua ({subFilteredVideos.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('landscape')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFormat === 'landscape'
                    ? 'bg-[#a53c00] text-[#ffdbcd] font-bold border border-[#ffbb28]/40 shadow-sm'
                    : 'bg-[#171216] text-[#ddc0b3]/80 hover:text-[#ffbb28] border border-[#56433b]/30'
                }`}
              >
                <span className="material-symbols-outlined text-xs">tv</span>
                <span>Landscape 16:9 ({totalLandscapeCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFormat('portrait')}
                className={`px-2.5 py-1 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                  selectedFormat === 'portrait'
                    ? 'bg-[#a53c00] text-[#ffdbcd] font-bold border border-[#ffbb28]/40 shadow-sm'
                    : 'bg-[#171216] text-[#ddc0b3]/80 hover:text-[#ffbb28] border border-[#56433b]/30'
                }`}
              >
                <span className="material-symbols-outlined text-xs">phone_iphone</span>
                <span>Reels 9:16 ({totalPortraitCount})</span>
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Video Catalog Area */}
        {filteredVideos.length === 0 ? (
          <div className="py-14 text-center rounded-xl bg-[#231e22]/50 border border-[#56433b]/30 p-6 max-w-md mx-auto">
            <span className="material-symbols-outlined text-3xl text-[#ffbb28] mb-2 block">
              videocam_off
            </span>
            <p className="font-headline text-sm uppercase text-[#ebdfe4] mb-1">
              Tidak ada video ditemukan
            </p>
            <p className="font-body text-xs text-[#ddc0b3] mb-4">
              Belum ada video pada kategori atau format yang dipilih.
            </p>
            <button
              onClick={() => {
                setSelectedSubCategory('Semua');
                setSelectedFormat('all');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#ffbb28] text-[#281b00] font-mono text-[11px] uppercase font-bold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. SEKSI KARYA SINEMATIK & LANDSCAPE (16:9) */}
            {landscapeVideos.length > 0 && (
              <section key={`landscape-${selectedSubCategory}`}>
                {/* Header Sub-seksi (Ditampilkan jika ada kedua format atau saat format all) */}
                {(hasBothFormats || selectedFormat === 'all') && (
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#56433b]/30">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#a53c00]/30 border border-[#a53c00]/60 flex items-center justify-center text-[#ffbb28]">
                        <span className="material-symbols-outlined text-base">movie</span>
                      </div>
                      <div>
                        <h2 className="font-headline text-sm sm:text-lg font-bold uppercase tracking-tight text-[#ebdfe4]">
                          Karya Sinematik & Landscape (16:9)
                        </h2>
                        <p className="font-mono text-[10px] text-[#ddc0b3]/70">
                          Format horizontal layar lebar • Teaser, dokumentasi & kompetisi
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] rounded-lg bg-[#231e22] text-[#ffbb28] px-2.5 py-0.5 border border-[#56433b]/40 font-bold shrink-0">
                      {landscapeVideos.length} Video
                    </span>
                  </div>
                )}

                {/* Grid Rapi Landscape: Semua berukuran 16:9 identik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {landscapeVideos.map((video, idx) => (
                    <ScrollReveal key={video.id} delay={idx * 50} direction="up">
                      <ProjectCard
                        project={video}
                        onSelect={(p) => setSelectedProject(p)}
                        variant="video"
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            {/* 2. SEKSI VIDEO REELS & VERTIKAL (9:16) */}
            {portraitVideos.length > 0 && (
              <section key={`portrait-${selectedSubCategory}`}>
                {/* Header Sub-seksi */}
                {(hasBothFormats || selectedFormat === 'all') && (
                  <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-[#56433b]/30">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#ffbb28]/20 border border-[#ffbb28]/50 flex items-center justify-center text-[#ffbb28]">
                        <span className="material-symbols-outlined text-base">phone_iphone</span>
                      </div>
                      <div>
                        <h2 className="font-headline text-sm sm:text-lg font-bold uppercase tracking-tight text-[#ebdfe4]">
                          Video Reels & Vertikal (9:16)
                        </h2>
                        <p className="font-mono text-[10px] text-[#ddc0b3]/70">
                          Format vertikal smartphone • Instagram Reels & konten kreatif mobile
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] rounded-lg bg-[#231e22] text-[#ffbb28] px-2.5 py-0.5 border border-[#56433b]/40 font-bold shrink-0">
                      {portraitVideos.length} Video
                    </span>
                  </div>
                )}

                {/* Grid Khusus Reels: 2 kolom di HP, 4 kolom di Desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {portraitVideos.map((video, idx) => (
                    <ScrollReveal key={video.id} delay={idx * 50} direction="up">
                      <ProjectCard
                        project={video}
                        onSelect={(p) => setSelectedProject(p)}
                        variant="video"
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <LightboxModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={filteredVideos}
      />
    </div>
  );
};

export default Videography;
