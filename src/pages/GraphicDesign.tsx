import React, { useState, useMemo } from 'react';
import { getGraphicDesignProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal, InteractiveCard, ProjectSlideMedia } from '../components/InteractiveEffects';

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

      <main className="py-10 sm:py-14 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <header className="mb-10 border-b border-[#56433b]/30 pb-8">
            <span className="font-mono text-xs text-[#ffb597] uppercase tracking-widest block mb-2">
              Galeri Khusus Desain Visual
            </span>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-3">
              {siteTexts.graphicDesignPageTitle}
            </h1>
            <p className="font-body text-sm sm:text-base text-[#ddc0b3] max-w-2xl leading-relaxed">
              {siteTexts.graphicDesignPageDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Subcategory Filter Buttons */}
        <ScrollReveal direction="up" delay={80}>
          <div className="flex flex-wrap gap-2 mb-10">
            {subCategories.map((sub) => {
              const isActive = selectedSubCategory === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubCategory(sub)}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    isActive
                      ? 'bg-[#ffbb28] text-[#281b00] font-bold shadow-[0_4px_15px_rgba(255,187,40,0.3)] -translate-y-0.5'
                      : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffb597]/50 border border-[#56433b]/40'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Responsive Auto-Layout Design Grid */}
        <div key={selectedSubCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design, idx) => (
            <ScrollReveal key={design.id} delay={idx * 75} direction="up">
              <InteractiveCard
                onClick={() => setSelectedProject(design)}
                glowColor="rgba(255, 181, 151, 0.16)"
                className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffb597] cursor-pointer flex flex-col"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#120d10] relative">
                  <ProjectSlideMedia
                    image={design.image}
                    images={design.images}
                    alt={design.title}
                    subCategory={design.subCategory}
                    subCategoryStyle="design"
                    hoverLabel="Lihat Detail Desain"
                    hoverIcon="visibility"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffb597] transition-colors uppercase mb-2">
                      {design.title}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/85 leading-relaxed mb-4">
                      {design.description}
                    </p>
                  </div>

                  <div>
                    {design.tools && design.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {design.tools.map((tool) => (
                          <span
                            key={tool}
                            className="font-mono text-[10px] px-2 py-0.5 bg-[#171216] text-[#ffbb28] border border-[#56433b]/30"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="pt-3 border-t border-[#56433b]/20 flex items-center justify-between font-mono text-xs text-[#ddc0b3]/70">
                      <span>{design.badge || 'Desain Visual'}</span>
                      <span>{design.year}</span>
                    </div>
                  </div>
                </div>
              </InteractiveCard>
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
