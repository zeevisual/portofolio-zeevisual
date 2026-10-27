import React, { useState, useMemo } from 'react';
import { projects, Project, ProjectCategory } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal, InteractiveCard, ProjectSlideMedia } from '../components/InteractiveEffects';

type FilterOption = 'Semua' | ProjectCategory;

const AllProjects: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filterCategories: FilterOption[] = [
    'Semua',
    'Fotografi',
    'Desain Grafis',
    'Videografi',
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((item) => {
      const matchesCategory =
        activeFilter === 'Semua' || item.category === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.subCategory.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const photoWorks = filteredProjects.filter((p) => p.category === 'Fotografi');
  const designWorks = filteredProjects.filter((p) => p.category === 'Desain Grafis');
  const videoWorks = filteredProjects.filter((p) => p.category === 'Videografi');

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb
        currentPage="Semua Karya"
        subtitle={`${filteredProjects.length} Karya Tersedia`}
      />

      <main className="py-10 sm:py-14 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Header */}
        <ScrollReveal direction="up">
          <header className="mb-10 border-b border-[#56433b]/30 pb-8">
            <span className="font-mono text-xs text-[#ffbb28] uppercase tracking-widest block mb-2">
              Katalog Portofolio
            </span>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-3">
              {siteTexts.allProjectsTitle}
            </h1>
            <p className="font-body text-sm sm:text-base text-[#ddc0b3] max-w-2xl">
              {siteTexts.allProjectsDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Filter & Search Bar */}
        <ScrollReveal direction="up" delay={80}>
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center mb-10">
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((cat) => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                      isActive
                        ? 'bg-[#ffbb28] text-[#281b00] font-bold shadow-[0_4px_15px_rgba(255,187,40,0.3)] -translate-y-0.5'
                        : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffbb28]/50 border border-[#56433b]/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ddc0b3]/60 text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau kategori karya..."
                className="w-full bg-[#231e22] border border-[#56433b]/50 focus:border-[#ffbb28] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#ebdfe4] font-body outline-none transition-colors"
              />
            </div>
          </div>
        </ScrollReveal>

        {filteredProjects.length === 0 ? (
          <div className="bg-[#231e22] border border-[#56433b]/30 p-12 text-center animate-fade-up">
            <p className="font-headline text-lg text-[#ebdfe4] uppercase mb-2">
              Karya Tidak Ditemukan
            </p>
            <p className="font-body text-sm text-[#ddc0b3] mb-4">
              Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
            </p>
            <button
              onClick={() => {
                setActiveFilter('Semua');
                setSearchQuery('');
              }}
              className="bg-[#ffbb28] text-[#281b00] font-mono text-xs font-bold uppercase px-5 py-2.5"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Separated Section: Fotografi */}
            {photoWorks.length > 0 && (
              <section key={`foto-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ffbb28]">photo_camera</span>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ebdfe4]">
                      Karya Fotografi
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#ffbb28]">
                    {photoWorks.length} Karya
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photoWorks.map((item, idx) => (
                    <ScrollReveal key={item.id} delay={idx * 70} direction="up">
                      <InteractiveCard
                        onClick={() => setSelectedProject(item)}
                        className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col"
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden bg-[#120d10] relative">
                          <ProjectSlideMedia
                            image={item.image}
                            images={item.images}
                            alt={item.title}
                            subCategory={item.subCategory}
                            subCategoryStyle="photo"
                            hoverLabel="Buka Foto"
                            hoverIcon="open_in_full"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffbb28] uppercase mb-1.5 transition-colors">
                              {item.title}
                            </h3>
                            <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/80 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="pt-3 mt-4 border-t border-[#56433b]/20 flex justify-between items-center font-mono text-xs text-[#ddc0b3]/70">
                            <span>{item.badge || 'Fotografi'}</span>
                            <span>{item.year}</span>
                          </div>
                        </div>
                      </InteractiveCard>
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            {/* Separated Section: Desain Grafis */}
            {designWorks.length > 0 && (
              <section key={`desain-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ffb597]">palette</span>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ebdfe4]">
                      Hasil Desain Grafis
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#ffb597]">
                    {designWorks.length} Karya
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {designWorks.map((item, idx) => (
                    <ScrollReveal key={item.id} delay={idx * 70} direction="up">
                      <InteractiveCard
                        onClick={() => setSelectedProject(item)}
                        glowColor="rgba(255, 181, 151, 0.16)"
                        className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffb597] cursor-pointer flex flex-col"
                      >
                        <div className="aspect-[3/4] w-full overflow-hidden bg-[#120d10] relative">
                          <ProjectSlideMedia
                            image={item.image}
                            images={item.images}
                            alt={item.title}
                            subCategory={item.subCategory}
                            subCategoryStyle="design"
                            hoverLabel="Lihat Desain"
                            hoverIcon="visibility"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffb597] uppercase mb-1.5 transition-colors">
                              {item.title}
                            </h3>
                            <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/80 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="pt-3 mt-4 border-t border-[#56433b]/20 flex justify-between items-center font-mono text-xs text-[#ddc0b3]/70">
                            <span>{item.badge || 'Desain Visual'}</span>
                            <span>{item.year}</span>
                          </div>
                        </div>
                      </InteractiveCard>
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            {/* Separated Section: Videografi */}
            {videoWorks.length > 0 && (
              <section key={`video-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-3 mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#ffbb28]">movie</span>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ebdfe4]">
                      Karya Videografi
                    </h2>
                  </div>
                  <span className="font-mono text-xs text-[#ffbb28]">
                    {videoWorks.length} Karya
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoWorks.map((item, idx) => (
                    <ScrollReveal key={item.id} delay={idx * 70} direction="up">
                      <InteractiveCard
                        onClick={() => setSelectedProject(item)}
                        className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col"
                      >
                        <div className="aspect-video w-full overflow-hidden bg-[#120d10] relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-[#ffbb28] text-[#281b00] flex items-center justify-center shadow-[0_0_20px_rgba(255,187,40,0.45)] group-hover:scale-110 transition-transform duration-300">
                              <span className="material-symbols-outlined text-2xl">play_arrow</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="font-mono text-[11px] text-[#ffb597] block mb-1">
                              {item.subCategory}
                            </span>
                            <h3 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffbb28] uppercase mb-1.5 transition-colors">
                              {item.title}
                            </h3>
                            <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/80 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <div className="pt-3 mt-4 border-t border-[#56433b]/20 flex justify-between items-center font-mono text-xs text-[#ddc0b3]/70">
                            <span>{item.badge || 'Produksi Video'}</span>
                            <span>{item.year}</span>
                          </div>
                        </div>
                      </InteractiveCard>
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
        allProjects={filteredProjects}
      />
    </div>
  );
};

export default AllProjects;
