import React, { useState, useMemo } from 'react';
import { getPhotographyProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal, InteractiveCard, ProjectSlideMedia } from '../components/InteractiveEffects';

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

      <main className="py-10 sm:py-14 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <header className="mb-10 border-b border-[#56433b]/30 pb-8">
            <span className="font-mono text-xs text-[#ffbb28] uppercase tracking-widest block mb-2">
              Galeri Khusus Fotografi
            </span>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-3">
              {siteTexts.photographyPageTitle}
            </h1>
            <p className="font-body text-sm sm:text-base text-[#ddc0b3] max-w-2xl leading-relaxed">
              {siteTexts.photographyPageDesc}
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
                      : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffbb28]/50 border border-[#56433b]/40'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Responsive Auto-Layout Photo Grid */}
        <div key={selectedSubCategory} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, idx) => (
            <ScrollReveal key={photo.id} delay={idx * 75} direction="up">
              <InteractiveCard
                onClick={() => setSelectedProject(photo)}
                className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/3] sm:aspect-[4/4] w-full overflow-hidden bg-[#120d10] relative">
                  <ProjectSlideMedia
                    image={photo.image}
                    images={photo.images}
                    alt={photo.title}
                    subCategory={photo.subCategory}
                    subCategoryStyle="photo"
                    hoverLabel="Buka Foto"
                    hoverIcon="open_in_full"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffbb28] transition-colors uppercase mb-2">
                      {photo.title}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/85 leading-relaxed line-clamp-2">
                      {photo.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-4 border-t border-[#56433b]/20 flex items-center justify-between font-mono text-xs text-[#ddc0b3]/70">
                    <span>{photo.badge || 'Aceh, Indonesia'}</span>
                    <span>{photo.year}</span>
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
        allProjects={filteredPhotos}
      />
    </div>
  );
};

export default Photography;
