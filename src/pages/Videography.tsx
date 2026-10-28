import React, { useState } from 'react';
import { getVideographyProjects, Project } from '../data/projects';
import { siteTexts } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import LightboxModal from '../components/LightboxModal';
import { ScrollReveal, InteractiveCard } from '../components/InteractiveEffects';

const Videography: React.FC = () => {
  const allVideos = getVideographyProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const mainVideo = allVideos[0];

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb
        currentPage="Videografi"
        subtitle={`${allVideos.length} Karya Video`}
      />

      <main className="py-10 sm:py-14 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
        {/* Page Header */}
        <ScrollReveal direction="up">
          <header className="mb-10 border-b border-[#56433b]/30 pb-8">
            <span className="font-mono text-xs text-[#ffbb28] uppercase tracking-widest block mb-2">
              Galeri Karya Videografi
            </span>
            <h1 className="font-headline text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-3">
              {siteTexts.videographyPageTitle}
            </h1>
            <p className="font-body text-sm sm:text-base text-[#ddc0b3] max-w-2xl leading-relaxed">
              {siteTexts.videographyPageDesc}
            </p>
          </header>
        </ScrollReveal>

        {/* Featured Showreel / Main Video */}
        {mainVideo && (
          <ScrollReveal direction="scale" delay={80} className="mb-14">
            <InteractiveCard
              tiltIntensity={3}
              className="bg-[#231e22] border border-[#56433b]/40 hover:border-[#ffbb28] overflow-hidden shadow-xl"
            >
              <div
                onClick={() => setSelectedProject(mainVideo)}
                className="relative aspect-video w-full bg-[#0f0b0e] overflow-hidden cursor-pointer group"
              >
                <img
                  src={mainVideo.image}
                  alt={mainVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171216] via-black/30 to-transparent flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ffbb28] text-[#281b00] flex items-center justify-center shadow-[0_0_35px_rgba(255,187,40,0.6)] group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-4xl">play_arrow</span>
                  </div>
                </div>
                {mainVideo.badge && (
                  <span className="absolute top-4 left-4 bg-[#171216]/90 text-[#ffbb28] font-mono text-xs px-3 py-1 border border-[#56433b]/40 uppercase">
                    {mainVideo.badge}
                  </span>
                )}
              </div>

              <div className="p-5 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#ffb597]">
                    <span>Karya Unggulan</span>
                    <span>•</span>
                    <span>{mainVideo.subCategory}</span>
                    <span>•</span>
                    <span>{mainVideo.year}</span>
                  </div>
                  <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#ebdfe4] uppercase">
                    {mainVideo.title}
                  </h2>
                  <p className="font-body text-sm sm:text-base text-[#ddc0b3] leading-relaxed">
                    {mainVideo.description}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedProject(mainVideo)}
                  className="btn-interactive bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-6 py-3.5 transition-all shrink-0 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">play_circle</span>
                  Putar Video Sekarang
                </button>
              </div>
            </InteractiveCard>
          </ScrollReveal>
        )}

        {/* All Videos Grid */}
        <section>
          <ScrollReveal direction="up">
            <h3 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ebdfe4] mb-6 border-b border-[#56433b]/30 pb-3">
              Daftar Karya Video
            </h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allVideos.map((video, idx) => (
              <ScrollReveal key={video.id} delay={idx * 80} direction="up">
                <InteractiveCard
                  onClick={() => setSelectedProject(video)}
                  className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col"
                >
                  <div
                    className={`w-full overflow-hidden bg-[#120d10] relative transition-all ${
                      video.videoType === 'portrait' ? 'aspect-[4/5]' : 'aspect-video'
                    }`}
                  >
                    {video.videoType === 'portrait' && (
                      <img
                        src={video.image}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-35 scale-125"
                      />
                    )}
                    <img
                      src={video.image}
                      alt={video.title}
                      className={`w-full h-full relative z-10 ${
                        video.videoType === 'portrait' ? 'object-contain' : 'object-cover'
                      } group-hover:scale-105 transition-transform duration-700 ease-out`}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 z-20 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-[#ffbb28] text-[#281b00] flex items-center justify-center shadow-[0_0_20px_rgba(255,187,40,0.5)] group-hover:scale-110 transition-transform duration-300">
                        <span className="material-symbols-outlined text-2xl">play_arrow</span>
                      </div>
                    </div>
                    {video.badge && (
                      <span className="absolute top-2.5 left-2.5 z-20 bg-[#171216]/90 text-[#ffbb28] font-mono text-[10px] px-2.5 py-0.5 uppercase border border-[#56433b]/40">
                        {video.badge}
                      </span>
                    )}
                    {video.videoType === 'portrait' && (
                      <span className="absolute bottom-2.5 right-2.5 z-20 bg-[#171216]/90 text-[#ffbb28] font-mono text-[10px] px-2 py-0.5 uppercase border border-[#ffbb28]/40 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">phone_iphone</span>
                        Reels
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-xs text-[#ffb597] block mb-1">
                        {video.subCategory}
                      </span>
                      <h4 className="font-headline font-bold text-lg text-[#ebdfe4] group-hover:text-[#ffbb28] transition-colors uppercase mb-2">
                        {video.title}
                      </h4>
                      <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/85 leading-relaxed mb-4">
                        {video.description}
                      </p>
                    </div>

                    <div>
                      {video.tools && video.tools.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {video.tools.map((tool) => (
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
                        <span>{video.client || 'Produksi Visual'}</span>
                        <span>{video.year}</span>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </main>

      <LightboxModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={allVideos}
      />
    </div>
  );
};

export default Videography;
