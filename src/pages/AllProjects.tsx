import React, { useState, useMemo } from 'react';
import { projects, Project, ProjectCategory } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal } from '../components/InteractiveEffects';
import ProjectCard from '../components/ProjectCard';

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

      <main className="py-6 sm:py-10 px-3 sm:px-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <ScrollReveal direction="up">
          <header className="mb-6 border-b border-[#56433b]/30 pb-5">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffbb28] uppercase tracking-widest block mb-1">
              Katalog Portofolio
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-2">
              {siteTexts.allProjectsTitle}
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl">
              {siteTexts.allProjectsDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Filter & Search Bar */}
        <ScrollReveal direction="up" delay={60}>
          <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center mb-6">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {filterCategories.map((cat) => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-[#ffbb28] text-[#281b00] font-bold shadow-[0_4px_14px_rgba(255,187,40,0.3)] -translate-y-0.5'
                        : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffbb28]/50 border border-[#56433b]/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#ddc0b3]/60 text-base">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau kategori karya..."
                className="w-full rounded-xl bg-[#231e22] border border-[#56433b]/50 focus:border-[#ffbb28] pl-9 pr-3.5 py-2 text-xs text-[#ebdfe4] font-body outline-none transition-colors"
              />
            </div>
          </div>
        </ScrollReveal>

        {filteredProjects.length === 0 ? (
          <div className="rounded-xl bg-[#231e22] border border-[#56433b]/30 p-8 text-center animate-fade-up">
            <p className="font-headline text-sm text-[#ebdfe4] uppercase mb-1">
              Karya Tidak Ditemukan
            </p>
            <p className="font-body text-xs text-[#ddc0b3] mb-3">
              Coba gunakan kata kunci pencarian lain atau pilih kategori Semua.
            </p>
            <button
              onClick={() => {
                setActiveFilter('Semua');
                setSearchQuery('');
              }}
              className="rounded-lg bg-[#ffbb28] text-[#281b00] font-mono text-[11px] font-bold uppercase px-4 py-2"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Separated Section: Fotografi */}
            {photoWorks.length > 0 && (
              <section key={`foto-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffbb28] text-lg">photo_camera</span>
                    <h2 className="font-headline text-base sm:text-xl font-bold uppercase text-[#ebdfe4]">
                      Karya Fotografi
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-[#ffbb28]">
                    {photoWorks.length} Karya
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {photoWorks.map((item, idx) => (
                    <ScrollReveal key={item.id} delay={idx * 55} direction="up">
                      <ProjectCard
                        project={item}
                        onSelect={(p) => setSelectedProject(p)}
                        variant="photo"
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            {/* Separated Section: Desain Grafis */}
            {designWorks.length > 0 && (
              <section key={`desain-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb597] text-lg">palette</span>
                    <h2 className="font-headline text-base sm:text-xl font-bold uppercase text-[#ebdfe4]">
                      Hasil Desain Grafis
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-[#ffb597]">
                    {designWorks.length} Karya
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {designWorks.map((item, idx) => (
                    <ScrollReveal key={item.id} delay={idx * 55} direction="up">
                      <ProjectCard
                        project={item}
                        onSelect={(p) => setSelectedProject(p)}
                        variant="design"
                      />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            )}

            {/* Separated Section: Videografi */}
            {videoWorks.length > 0 && (
              <section key={`video-${activeFilter}`}>
                <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffbb28] text-lg">movie</span>
                    <h2 className="font-headline text-base sm:text-xl font-bold uppercase text-[#ebdfe4]">
                      Karya Videografi
                    </h2>
                  </div>
                  <span className="font-mono text-[11px] text-[#ffbb28]">
                    {videoWorks.length} Karya
                  </span>
                </div>

                <div className="space-y-8">
                  {/* Landscape videos (16:9) */}
                  {videoWorks.filter((p) => (p.videoType || 'landscape') === 'landscape').length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                      {videoWorks
                        .filter((p) => (p.videoType || 'landscape') === 'landscape')
                        .map((item, idx) => (
                          <ScrollReveal key={item.id} delay={idx * 50} direction="up">
                            <ProjectCard
                              project={item}
                              onSelect={(p) => setSelectedProject(p)}
                              variant="video"
                            />
                          </ScrollReveal>
                        ))}
                    </div>
                  )}

                  {/* Portrait videos (9:16) */}
                  {videoWorks.filter((p) => p.videoType === 'portrait').length > 0 && (
                    <div className="pt-3 border-t border-[#56433b]/20">
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="material-symbols-outlined text-[#ffbb28] text-sm">phone_iphone</span>
                        <h3 className="font-headline text-xs font-bold uppercase text-[#ddc0b3] tracking-wider">
                          Reels & Video Vertikal (9:16)
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {videoWorks
                          .filter((p) => p.videoType === 'portrait')
                          .map((item, idx) => (
                            <ScrollReveal key={item.id} delay={idx * 50} direction="up">
                              <ProjectCard
                                project={item}
                                onSelect={(p) => setSelectedProject(p)}
                                variant="video"
                              />
                            </ScrollReveal>
                          ))}
                      </div>
                    </div>
                  )}
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
