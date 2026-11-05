import React, { useState, useMemo } from 'react';
import { getGraphicDesignProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal } from '../components/InteractiveEffects';
import ProjectCard from '../components/ProjectCard';

const GraphicDesign: React.FC = () => {
  const allDesigns = getGraphicDesignProjects();
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Semua');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const subCategories = useMemo(() => {
    const subs = Array.from(new Set(allDesigns.map((d) => d.subCategory)));
    return ['Semua', ...subs];
  }, [allDesigns]);

  const filteredDesigns = useMemo(() => {
    if (selectedSubCategory === 'Semua') return allDesigns;
    return allDesigns.filter((d) => d.subCategory === selectedSubCategory);
  }, [allDesigns, selectedSubCategory]);

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb
        currentPage="Desain Grafis"
        subtitle={`${filteredDesigns.length} Karya Desain`}
      />

      <main className="py-6 sm:py-10 px-3 sm:px-6 max-w-[1200px] mx-auto">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <header className="mb-6 border-b border-[#56433b]/30 pb-5">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffb597] uppercase tracking-widest block mb-1">
              Galeri Khusus Desain Visual
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-2">
              {siteTexts.graphicDesignPageTitle}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl leading-relaxed">
              {siteTexts.graphicDesignPageDesc}
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
                      : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffb597]/50 border border-[#56433b]/40'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Responsive Auto-Layout Design Grid (2 cols on mobile, 4 cols on desktop) */}
        <div
          key={selectedSubCategory}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          {filteredDesigns.map((design, idx) => (
            <ScrollReveal key={design.id} delay={idx * 55} direction="up">
              <ProjectCard
                project={design}
                onSelect={(p) => setSelectedProject(p)}
                variant="design"
              />
            </ScrollReveal>
          ))}
        </div>
      </main>

      <LightboxModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={filteredDesigns}
      />
    </div>
  );
};

export default GraphicDesign;
