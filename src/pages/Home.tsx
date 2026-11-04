import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  profileData,
  experiences,
  educationList,
  awards,
  certifications,
  skillCategories,
  services,
  statsList,
  siteTexts,
  Certification,
} from '../data/profile';
import {
  projects,
  getPhotographyProjects,
  getGraphicDesignProjects,
  getVideographyProjects,
  Project,
} from '../data/projects';
import LightboxModal from '../components/LightboxModal';
import ContactForm from '../components/ContactForm';
import ProjectCard from '../components/ProjectCard';
import { CertificateCard, CertificateModal } from '../components/CertificateViewer';
import {
  ScrollReveal,
  InteractiveCard,
  AnimatedCounter,
  CreativeMarquee,
} from '../components/InteractiveEffects';

type ShowcaseTab = 'semua' | 'foto' | 'desain' | 'video' | 'sertifikat';

const Home: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);
  const [showcaseTab, setShowcaseTab] = useState<ShowcaseTab>('semua');

  const allPhotos = getPhotographyProjects();
  const allDesigns = getGraphicDesignProjects();
  const allVideos = getVideographyProjects();
  const allCerts = certifications || [];

  const featuredPhotos = allPhotos.filter((p) => p.featured !== false).slice(0, 4);
  const featuredDesigns = allDesigns.filter((p) => p.featured !== false).slice(0, 4);
  const featuredVideos = allVideos.filter((p) => p.featured !== false).slice(0, 3);
  const featuredCerts = allCerts.slice(0, 4);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoleIdx((prev) => (prev + 1) % profileData.roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="pt-14 sm:pt-16 overflow-x-hidden relative">
      {/* Hero Section (Compacted & Proportional for Mobile & Desktop) */}
      <section className="relative flex flex-col justify-center px-3.5 sm:px-6 py-8 sm:py-14 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column: Intro & CTA */}
          <ScrollReveal direction="up" className="lg:col-span-7 z-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#231e22]/90 backdrop-blur-md border border-[#56433b]/50 mb-3.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffbb28] animate-ping" />
              <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-[#ffb597]">
                {siteTexts.heroBadge} •{' '}
                <span className="text-[#ffbb28] font-bold transition-all duration-300">
                  {profileData.roles[activeRoleIdx]}
                </span>
              </span>
            </div>

            <h1 className="font-headline text-2xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.12] text-[#ebdfe4] mb-3 uppercase">
              {profileData.fullName}
              <span className="block bg-gradient-to-r from-[#ffbb28] via-[#ffb597] to-[#ffbb28] bg-clip-text text-transparent text-base sm:text-xl lg:text-2xl mt-1.5">
                {profileData.brandName} — {profileData.tagline}
              </span>
            </h1>

            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl mb-5 leading-relaxed">
              {profileData.heroSubtitle}
            </p>

            {/* Quick Category Pills (3 Columns on Mobile & Desktop) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mb-5 max-w-xl">
              <Link
                to="/fotografi"
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffbb28] transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#ffbb28] text-base sm:text-lg shrink-0 group-hover:scale-110 transition-transform">
                    photo_camera
                  </span>
                  <span className="font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#ebdfe4] truncate">
                    Fotografi
                  </span>
                </div>
                <span className="material-symbols-outlined text-xs text-[#ddc0b3] group-hover:text-[#ffbb28] group-hover:translate-x-0.5 transition-all hidden sm:inline">
                  arrow_forward
                </span>
              </Link>

              <Link
                to="/desain-grafis"
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffb597] transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#ffb597] text-base sm:text-lg shrink-0 group-hover:scale-110 transition-transform">
                    palette
                  </span>
                  <span className="font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#ebdfe4] truncate">
                    Desain
                  </span>
                </div>
                <span className="material-symbols-outlined text-xs text-[#ddc0b3] group-hover:text-[#ffb597] group-hover:translate-x-0.5 transition-all hidden sm:inline">
                  arrow_forward
                </span>
              </Link>

              <Link
                to="/videografi"
                className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffbb28] transition-all duration-300 hover:-translate-y-0.5 group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[#ffbb28] text-base sm:text-lg shrink-0 group-hover:scale-110 transition-transform">
                    movie
                  </span>
                  <span className="font-headline font-bold text-[10px] sm:text-xs uppercase tracking-wider text-[#ebdfe4] truncate">
                    Video
                  </span>
                </div>
                <span className="material-symbols-outlined text-xs text-[#ddc0b3] group-hover:text-[#ffbb28] group-hover:translate-x-0.5 transition-all hidden sm:inline">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                to="/karya"
                className="btn-interactive rounded-xl bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold uppercase px-4 sm:px-5 py-2.5 text-[11px] sm:text-xs tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(255,187,40,0.28)] flex items-center gap-1.5 active:scale-95"
              >
                Lihat Semua Karya
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </Link>
              <a
                href={profileData.cvUrl}
                download
                className="rounded-xl border border-[#56433b] hover:border-[#ffbb28] bg-[#231e22]/60 backdrop-blur-md hover:bg-[#231e22] text-[#ebdfe4] hover:text-[#ffbb28] font-mono text-[11px] sm:text-xs px-4 sm:px-5 py-2.5 uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Unduh CV
              </a>
            </div>
          </ScrollReveal>

          {/* Right Column: User Profile Photo (Proportional Framed Card) */}
          <ScrollReveal
            direction="scale"
            delay={100}
            className="lg:col-span-5 relative order-1 lg:order-2 max-w-[220px] sm:max-w-[270px] lg:max-w-[310px] mx-auto w-full"
          >
            <InteractiveCard
              tiltIntensity={5}
              className="rounded-2xl bg-gradient-to-br from-[#231e22]/95 to-[#171216]/95 backdrop-blur-md p-2.5 sm:p-3 border border-[#56433b]/50 hover:border-[#ffbb28]/70 shadow-2xl group"
            >
              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#171216] relative">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.fullName}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171216]/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-headline font-extrabold text-sm sm:text-base text-[#ebdfe4] uppercase tracking-tight truncate">
                      {profileData.fullName}
                    </p>
                    <p className="font-mono text-[10px] text-[#ffbb28] truncate">
                      {profileData.location}
                    </p>
                  </div>
                  <span className="rounded-md bg-[#a53c00] group-hover:bg-[#ffbb28] text-[#ffdbcd] group-hover:text-[#281b00] transition-colors duration-300 font-mono text-[9px] uppercase px-2 py-0.5 font-bold shrink-0">
                    {profileData.brandName}
                  </span>
                </div>
              </div>
            </InteractiveCard>
          </ScrollReveal>
        </div>
      </section>

      {/* Kinetic Typography Marquee Ribbon */}
      <CreativeMarquee items={siteTexts.marqueeItems} />

      {/* About / Tentang Section (Compact Bento Layout) */}
      <section
        id="tentang"
        className="py-10 sm:py-16 px-3.5 sm:px-6 bg-[#201a1e]/60 backdrop-blur-sm border-b border-[#56433b]/25"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <ScrollReveal direction="up" className="lg:col-span-5 space-y-3">
              <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#ffbb28] block">
                Profil Singkat
              </span>
              <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
                {siteTexts.aboutTitle}
              </h2>
              <div className="h-1 w-12 rounded-full bg-[#a53c00]" />
              <p className="font-mono text-[11px] text-[#ddc0b3]/90 pt-1">
                {profileData.role}
              </p>

              {/* Animated Quick Stats (Sleek Bento Stat Cards adapted from Alfari) */}
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                {statsList.map((st, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-[#171216]/90 backdrop-blur-md p-3 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div
                      className={`font-headline text-lg sm:text-2xl font-extrabold ${
                        idx === 0
                          ? 'text-[#ffbb28]'
                          : idx === 1
                          ? 'text-[#ffb597]'
                          : 'text-[#ebdfe4]'
                      }`}
                    >
                      <AnimatedCounter target={st.value} suffix={st.suffix} />
                    </div>
                    <div className="font-mono text-[9px] sm:text-[10px] text-[#ddc0b3] mt-0.5 leading-tight">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100} className="lg:col-span-7 space-y-3.5">
              <p className="font-headline text-base sm:text-xl font-medium text-[#ebdfe4]">
                Hay, Nama Saya{' '}
                <span className="font-extrabold italic text-[#ffbb28]">
                  {profileData.fullName}
                </span>
              </p>
              <p className="font-body text-xs sm:text-sm text-[#ebdfe4] leading-relaxed">
                {profileData.shortBio}
              </p>
              <p className="font-body text-xs sm:text-sm text-[#ddc0b3] leading-relaxed">
                {profileData.extendedBio}
              </p>

              {/* Services Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {services.map((srv, idx) => (
                  <ScrollReveal key={srv.title} delay={idx * 80} direction="up">
                    <InteractiveCard
                      tiltIntensity={3}
                      className="h-full rounded-xl bg-[#171216]/90 backdrop-blur-md p-3.5 border border-[#56433b]/35 hover:border-[#ffbb28]/70 group"
                    >
                      <span className="material-symbols-outlined text-[#ffbb28] text-xl mb-2 block group-hover:scale-110 transition-transform duration-300">
                        {srv.icon}
                      </span>
                      <h3 className="font-headline font-bold text-xs uppercase text-[#ebdfe4] group-hover:text-[#ffbb28] transition-colors mb-1">
                        {srv.title}
                      </h3>
                      <p className="font-body text-[11px] text-[#ddc0b3]/80 leading-relaxed">
                        {srv.description}
                      </p>
                    </InteractiveCard>
                  </ScrollReveal>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* INTERACTIVE PORTFOLIO SHOWCASE (Adapted from Alfari.my.id Segmented Tab Bar) */}
      <section className="py-10 sm:py-16 px-3.5 sm:px-6 max-w-[1200px] mx-auto">
        <ScrollReveal direction="up">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffbb28] uppercase tracking-widest block mb-1.5">
              Eksplorasi Portofolio
            </span>
            <h2 className="font-headline text-xl sm:text-3xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
              Showcase Karya & Sertifikat
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] mt-1">
              Pilih tab di bawah untuk menelusuri karya secara ringkas atau gulir ke bawah per kategori.
            </p>
          </div>

          {/* Alfari-Style Glassmorphic Segmented Tab Bar */}
          <div className="max-w-2xl mx-auto mb-7 p-1.5 rounded-2xl bg-[#120d10]/90 backdrop-blur-xl border border-[#56433b]/45 shadow-[0_12px_30px_rgba(0,0,0,0.45)] grid grid-cols-5 gap-1">
            {[
              { id: 'semua' as ShowcaseTab, label: 'Semua', icon: 'apps', count: projects.length },
              { id: 'foto' as ShowcaseTab, label: 'Foto', icon: 'photo_camera', count: allPhotos.length },
              { id: 'desain' as ShowcaseTab, label: 'Desain', icon: 'palette', count: allDesigns.length },
              { id: 'video' as ShowcaseTab, label: 'Video', icon: 'movie', count: allVideos.length },
              { id: 'sertifikat' as ShowcaseTab, label: 'Sertif', icon: 'workspace_premium', count: allCerts.length },
            ].map((tab) => {
              const isActive = showcaseTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setShowcaseTab(tab.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 px-1.5 sm:px-3 rounded-xl font-headline text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#ffbb28] to-[#ffb597] text-[#281b00] font-extrabold shadow-[0_6px_18px_rgba(255,187,40,0.28)]'
                      : 'text-[#ddc0b3]/80 hover:text-[#ebdfe4] hover:bg-[#231e22]/60'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                  <span
                    className={`hidden md:inline-block font-mono text-[9px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#281b00]/20 text-[#281b00]' : 'bg-[#231e22] text-[#ffbb28]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Quick Filtered View When a Specific Tab is Selected */}
        {showcaseTab !== 'semua' && (
          <div key={showcaseTab} className="animate-fade-up mb-4">
            {showcaseTab === 'foto' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {allPhotos.slice(0, 8).map((photo) => (
                    <ProjectCard
                      key={photo.id}
                      project={photo}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="photo"
                    />
                  ))}
                </div>
                <div className="mt-5 text-center">
                  <Link
                    to="/fotografi"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#231e22] border border-[#ffbb28]/40 text-[#ffbb28] hover:bg-[#ffbb28] hover:text-[#281b00] font-mono text-xs uppercase font-bold transition-all"
                  >
                    <span>Buka Halaman Penuh Fotografi ({allPhotos.length})</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {showcaseTab === 'desain' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {allDesigns.slice(0, 8).map((design) => (
                    <ProjectCard
                      key={design.id}
                      project={design}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="design"
                    />
                  ))}
                </div>
                <div className="mt-5 text-center">
                  <Link
                    to="/desain-grafis"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#231e22] border border-[#ffb597]/40 text-[#ffb597] hover:bg-[#ffb597] hover:text-[#281b00] font-mono text-xs uppercase font-bold transition-all"
                  >
                    <span>Buka Halaman Penuh Desain Grafis ({allDesigns.length})</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {showcaseTab === 'video' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                  {allVideos.slice(0, 6).map((video) => (
                    <ProjectCard
                      key={video.id}
                      project={video}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="video"
                    />
                  ))}
                </div>
                <div className="mt-5 text-center">
                  <Link
                    to="/videografi"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#231e22] border border-[#ffbb28]/40 text-[#ffbb28] hover:bg-[#ffbb28] hover:text-[#281b00] font-mono text-xs uppercase font-bold transition-all"
                  >
                    <span>Buka Halaman Penuh Videografi ({allVideos.length})</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}

            {showcaseTab === 'sertifikat' && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {allCerts.map((cert) => (
                    <CertificateCard key={cert.id} cert={cert} onOpen={setSelectedCert} compact />
                  ))}
                </div>
                <div className="mt-5 text-center">
                  <Link
                    to="/sertifikat"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#231e22] border border-[#ffbb28]/40 text-[#ffbb28] hover:bg-[#ffbb28] hover:text-[#281b00] font-mono text-xs uppercase font-bold transition-all"
                  >
                    <span>Buka Halaman Penuh Sertifikat ({allCerts.length})</span>
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Default "Semua" View: Separated Compact Sections for Fotografi, Desain Grafis, Videografi */}
        {showcaseTab === 'semua' && (
          <div className="space-y-12 sm:space-y-14">
            {/* 1. KARYA FOTOGRAFI PILIHAN */}
            <div>
              <div className="flex items-end justify-between mb-4 pb-3 border-b border-[#56433b]/30 gap-2">
                <div>
                  <span className="font-mono text-[10px] text-[#ffbb28] uppercase tracking-widest block mb-0.5">
                    Galeri Karya 01
                  </span>
                  <h3 className="font-headline text-lg sm:text-2xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                    {siteTexts.homePhotoTitle}
                  </h3>
                </div>
                <Link
                  to="/fotografi"
                  className="group inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
                >
                  <span>Semua Foto</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredPhotos.map((photo, idx) => (
                  <ScrollReveal key={photo.id} delay={idx * 60} direction="up">
                    <ProjectCard
                      project={photo}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="photo"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* 2. KARYA DESAIN GRAFIS PILIHAN */}
            <div>
              <div className="flex items-end justify-between mb-4 pb-3 border-b border-[#56433b]/30 gap-2">
                <div>
                  <span className="font-mono text-[10px] text-[#ffb597] uppercase tracking-widest block mb-0.5">
                    Galeri Karya 02
                  </span>
                  <h3 className="font-headline text-lg sm:text-2xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                    {siteTexts.homeDesignTitle}
                  </h3>
                </div>
                <Link
                  to="/desain-grafis"
                  className="group inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
                >
                  <span>Semua Desain</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {featuredDesigns.map((design, idx) => (
                  <ScrollReveal key={design.id} delay={idx * 60} direction="up">
                    <ProjectCard
                      project={design}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="design"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* 3. KARYA VIDEOGRAFI PILIHAN */}
            <div>
              <div className="flex items-end justify-between mb-4 pb-3 border-b border-[#56433b]/30 gap-2">
                <div>
                  <span className="font-mono text-[10px] text-[#ffbb28] uppercase tracking-widest block mb-0.5">
                    Galeri Karya 03
                  </span>
                  <h3 className="font-headline text-lg sm:text-2xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                    {siteTexts.homeVideoTitle}
                  </h3>
                </div>
                <Link
                  to="/videografi"
                  className="group inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
                >
                  <span>Semua Video</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {featuredVideos.map((video, idx) => (
                  <ScrollReveal key={video.id} delay={idx * 70} direction="up">
                    <ProjectCard
                      project={video}
                      onSelect={(p) => setSelectedProject(p)}
                      variant="video"
                    />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Experience & Education Section (Compact 2-Column Layout) */}
      <section
        id="pengalaman"
        className="py-10 sm:py-16 px-3.5 sm:px-6 bg-[#201a1e]/60 backdrop-blur-sm border-y border-[#56433b]/25"
      >
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal direction="up" className="mb-7">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#ffbb28] block mb-1">
              Rekam Jejak
            </span>
            <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
              Pengalaman & Pendidikan
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Experiences */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-headline text-sm sm:text-base font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-2">
                Pengalaman Organisasi & Profesional
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {experiences.map((exp, idx) => (
                  <ScrollReveal key={exp.id} delay={idx * 70} direction="up">
                    <div className="h-full rounded-xl bg-[#171216]/90 backdrop-blur-md p-3.5 sm:p-4 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                          <span className="font-mono text-[10px] text-[#ffbb28] font-bold">
                            {exp.period}
                          </span>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#231e22] text-[#ddc0b3] border border-[#56433b]/30">
                            {exp.type}
                          </span>
                        </div>
                        <h4 className="font-headline text-xs sm:text-sm font-bold text-[#ebdfe4] uppercase leading-snug">
                          {exp.role}
                        </h4>
                        <p className="font-mono text-[10px] text-[#ffb597] mt-0.5 mb-2">
                          {exp.organization}
                        </p>
                        <p className="font-body text-[11px] sm:text-xs text-[#ddc0b3]/90 mb-2.5 leading-relaxed line-clamp-3">
                          {exp.description}
                        </p>
                      </div>
                      <ul className="space-y-1 pt-2 border-t border-[#56433b]/20">
                        {exp.highlights.slice(0, 2).map((item, i) => (
                          <li
                            key={i}
                            className="font-body text-[10px] sm:text-[11px] text-[#ddc0b3]/80 flex items-start gap-1.5"
                          >
                            <span className="text-[#ffbb28] mt-0.5">•</span>
                            <span className="line-clamp-2">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Education & Skills */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-3.5">
                <h3 className="font-headline text-sm sm:text-base font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-2">
                  Pendidikan
                </h3>
                {educationList.map((edu, idx) => (
                  <ScrollReveal key={edu.id} delay={idx * 80} direction="up">
                    <div className="rounded-xl bg-[#171216]/90 backdrop-blur-md p-3.5 sm:p-4 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300">
                      <span className="font-mono text-[10px] text-[#ffbb28] block mb-0.5">
                        {edu.period}
                      </span>
                      <h4 className="font-headline text-sm sm:text-base font-bold text-[#ebdfe4] uppercase">
                        {edu.institution}
                      </h4>
                      <p className="font-mono text-[10px] sm:text-[11px] text-[#ffb597] mb-2">
                        {edu.degree} • {edu.field}
                      </p>
                      <p className="font-body text-[11px] sm:text-xs text-[#ddc0b3] leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="font-headline text-sm sm:text-base font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-2">
                  Keahlian & Perangkat Lunak
                </h3>
                <div className="space-y-2.5">
                  {skillCategories.map((cat, idx) => (
                    <ScrollReveal key={cat.title} delay={idx * 70} direction="up">
                      <div className="rounded-xl bg-[#171216]/90 backdrop-blur-md p-3 sm:p-3.5 border border-[#56433b]/35">
                        <h4 className="font-mono text-[10px] text-[#ffbb28] uppercase tracking-wider mb-2">
                          {cat.title}
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.items.map((skill) => (
                            <span
                              key={skill.name}
                              className="px-2.5 py-1 rounded-lg bg-[#231e22] border border-[#56433b]/40 hover:border-[#ffbb28] hover:text-[#ffbb28] font-mono text-[10px] text-[#ebdfe4] transition-all duration-200 cursor-default"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Certifications Section (Compacted) */}
      <section id="prestasi" className="py-10 sm:py-16 px-3.5 sm:px-6 max-w-[1200px] mx-auto">
        <ScrollReveal direction="up" className="mb-6">
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#ffbb28] block mb-1">
            Pencapaian
          </span>
          <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
            Penghargaan & Sertifikasi
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
          {awards.map((award, idx) => (
            <ScrollReveal key={award.id} delay={idx * 80} direction="up">
              <InteractiveCard
                tiltIntensity={3}
                className="h-full rounded-xl bg-[#231e22]/90 backdrop-blur-md p-4 border border-[#56433b]/40 border-l-4 border-l-[#ffbb28] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] text-[#ffbb28] font-bold uppercase truncate">
                      {award.rank} • {award.issuer}
                    </span>
                    <span className="font-mono text-[10px] text-[#ddc0b3] shrink-0">{award.year}</span>
                  </div>
                  <h3 className="font-headline text-xs sm:text-sm font-bold text-[#ebdfe4] uppercase mb-1.5 leading-snug">
                    {award.title}
                  </h3>
                  <p className="font-body text-[11px] sm:text-xs text-[#ddc0b3]/85 leading-relaxed">
                    {award.description}
                  </p>
                </div>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </div>

        {featuredCerts.length > 0 && (
          <div className="mt-8">
            <ScrollReveal direction="up">
              <div className="flex items-end justify-between gap-2 mb-4 pb-2.5 border-b border-[#56433b]/30">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#ffbb28] text-lg">
                    workspace_premium
                  </span>
                  <h3 className="font-headline text-base sm:text-xl font-bold uppercase text-[#ebdfe4]">
                    Sertifikat Terpilih
                  </h3>
                  <span className="font-mono text-[11px] text-[#ffbb28]">
                    ({certifications.length})
                  </span>
                </div>
                <Link
                  to="/sertifikat"
                  className="group inline-flex items-center gap-1 font-mono text-[10px] sm:text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
                >
                  <span>Semua Sertifikat</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featuredCerts.map((cert, idx) => (
                <ScrollReveal key={cert.id} delay={idx * 70} direction="up">
                  <CertificateCard cert={cert} onOpen={setSelectedCert} compact />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        <CertificateModal
          cert={selectedCert}
          list={allCerts}
          onClose={() => setSelectedCert(null)}
          onSelect={setSelectedCert}
        />
      </section>

      {/* Contact Section (Compacted) */}
      <section
        id="kontak"
        className="py-10 sm:py-16 px-3.5 sm:px-6 bg-[#201a1e]/60 backdrop-blur-sm border-t border-[#56433b]/30"
      >
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          <ScrollReveal direction="up" className="lg:col-span-5 space-y-3.5">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#ffbb28] block">
              Hubungi Saya
            </span>
            <h2 className="font-headline text-xl sm:text-3xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
              {siteTexts.contactTitle}
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] leading-relaxed">
              {siteTexts.contactDesc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 pt-1 font-mono text-[11px]">
              <a
                href={profileData.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#171216]/90 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] transition-colors"
              >
                <span className="material-symbols-outlined text-[#ffbb28] text-base">chat</span>
                <span className="truncate">WhatsApp: 0896-1411-4644</span>
              </a>
              <a
                href={`mailto:${profileData.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#171216]/90 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] transition-colors"
              >
                <span className="material-symbols-outlined text-[#ffbb28] text-base">mail</span>
                <span className="truncate">{profileData.email}</span>
              </a>
              <a
                href={profileData.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#171216]/90 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] transition-colors"
              >
                <span className="material-symbols-outlined text-[#ffbb28] text-base">share</span>
                <span className="truncate">Instagram {profileData.instagramHandle}</span>
              </a>
              <a
                href={profileData.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#171216]/90 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] transition-colors"
              >
                <span className="material-symbols-outlined text-[#ffbb28] text-base">work</span>
                <span className="truncate">LinkedIn: {profileData.linkedinHandle}</span>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100} className="lg:col-span-7">
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      {/* Auto-Scale Lightbox Preview Modal */}
      <LightboxModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(proj) => setSelectedProject(proj)}
        allProjects={projects}
      />
    </main>
  );
};

export default Home;
