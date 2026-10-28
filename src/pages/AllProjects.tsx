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

                <div className="space-y-10">
                  {/* Landscape videos (16:9) */}
                  {videoWorks.filter((p) => (p.videoType || 'landscape') === 'landscape').length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {videoWorks
                        .filter((p) => (p.videoType || 'landscape') === 'landscape')
                        .map((item, idx) => (
                          <ScrollReveal key={item.id} delay={idx * 60} direction="up">
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
                    <div className="pt-4 border-t border-[#56433b]/20">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-[#ffbb28] text-base">phone_iphone</span>
                        <h3 className="font-headline text-sm font-bold uppercase text-[#ddc0b3] tracking-wider">
                          Reels & Video Vertikal (9:16)
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videoWorks
                          .filter((p) => p.videoType === 'portrait')
                          .map((item, idx) => (
                            <ScrollReveal key={item.id} delay={idx * 60} direction="up">
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
