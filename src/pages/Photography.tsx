import React, { useState, useMemo } from 'react';
import { getPhotographyProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal } from '../components/InteractiveEffects';
import ProjectCard from '../components/ProjectCard';

const Photography: React.FC = () => {
  const allPhotos = getPhotographyProjects();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const subCategories = useMemo(() => {
    const subs = Array.from(new Set(allPhotos.map((p) => p.subCategory)));
    return ['Semua', ...subs];
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    if (selectedSubCategory === 'Semua') return allPhotos;
    return allPhotos.filter((p) => p.subCategory === selectedSubCategory);
  }, [allPhotos, selectedSubCategory]);

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb
        currentPage="Fotografi"
        subtitle={`${filteredPhotos.length} Karya Fotografi`}
      />

      <main className="py-6 sm:py-10 px-3 sm:px-6 max-w-[1200px] mx-auto">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <header className="mb-6 border-b border-[#56433b]/30 pb-5">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffbb28] uppercase tracking-widest block mb-1">
              Galeri Khusus Fotografi
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-extrabold uppercase tracking-[-0.02em] text-[#ebdfe4] mb-2">
              KARYA <span className="accent-serif text-[#ffbb28]">FOTOGRAFI</span>
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl leading-relaxed">
              {siteTexts.photographyPageDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Subcategory Filter Buttons */}
        <ScrollReveal direction="up" delay={60}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
            {subCategories.map((sub) => {
              const isActive = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  type="button"
                  data-sound="tab"
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
        </ScrollReveal>

        {/* Responsive Auto-Layout Photo Grid (2 cols on mobile, 4 cols on desktop) */}
        <div
          key={selectedSubCategory}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredPhotos.map((photo, idx) => (
            <ScrollReveal key={photo.id} delay={idx * 55} direction="up">
              <ProjectCard
                project={photo}
                onSelect={(p) => setSelectedProject(p)}
                variant="photo"
              />
            </ScrollReveal>
          ))}
        </div>
      </main>

      <LightboxModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={filteredPhotos}
      />
    </div>
  );
};

export default Photography;
