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
import { Certification } from '../data/profile';
import {
  ScrollReveal,
  InteractiveCard,
  AnimatedCounter,
  CreativeMarquee,
} from '../components/InteractiveEffects';

const Home: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const featuredCerts = (certifications || []).slice(0, 4);
  const [activeRoleIdx, setActiveRoleIdx] = useState(0);

  const featuredPhotos = getPhotographyProjects()
    .filter((p) => p.featured !== false)
    .slice(0, 4);
  const featuredDesigns = getGraphicDesignProjects()
    .filter((p) => p.featured !== false)
    .slice(0, 3);
  const featuredVideos = getVideographyProjects()
    .filter((p) => p.featured !== false)
    .slice(0, 2);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveRoleIdx((prev) => (prev + 1) % profileData.roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="pt-16 overflow-x-hidden relative">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 py-12 sm:py-20 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Intro & CTA */}
          <ScrollReveal direction="up" className="lg:col-span-7 z-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#231e22]/85 backdrop-blur-md border border-[#56433b]/50 mb-5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#ffbb28] animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffb597]">
                {siteTexts.heroBadge} •{' '}
                <span className="text-[#ffbb28] font-bold transition-all duration-300">
                  {profileData.roles[activeRoleIdx]}
                </span>
              </span>
            </div>

            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.08] text-[#ebdfe4] mb-4 uppercase">
              {profileData.fullName}
              <span className="block bg-gradient-to-r from-[#ffbb28] via-[#ffb597] to-[#ffbb28] bg-clip-text text-transparent text-xl sm:text-3xl md:text-4xl mt-2">
                {profileData.brandName} — {profileData.tagline}
              </span>
            </h1>

            <p className="font-body text-base sm:text-lg text-[#ddc0b3] max-w-2xl mb-8 leading-relaxed">
              {profileData.heroSubtitle}
            </p>

            {/* Quick Category Pills (Separated Photography, Graphic Design, Videography) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 max-w-2xl">
              <Link
                to="/fotografi"
                className="flex items-center justify-between p-3.5 bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffbb28] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,187,40,0.14)] group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffbb28] text-xl group-hover:scale-110 transition-transform">
                    photo_camera
                  </span>
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-[#ebdfe4]">
                    Fotografi
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm text-[#ddc0b3] group-hover:text-[#ffbb28] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>

              <Link
                to="/desain-grafis"
                className="flex items-center justify-between p-3.5 bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffb597] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,181,151,0.14)] group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffb597] text-xl group-hover:scale-110 transition-transform">
                    palette
                  </span>
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-[#ebdfe4]">
                    Desain Grafis
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm text-[#ddc0b3] group-hover:text-[#ffb597] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>

              <Link
                to="/videografi"
                className="flex items-center justify-between p-3.5 bg-[#231e22]/85 backdrop-blur-md hover:bg-[#2e282c] border border-[#56433b]/40 hover:border-[#ffbb28] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(255,187,40,0.14)] group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffbb28] text-xl group-hover:scale-110 transition-transform">
                    movie
                  </span>
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-[#ebdfe4]">
                    Videografi
                  </span>
                </div>
                <span className="material-symbols-outlined text-sm text-[#ddc0b3] group-hover:text-[#ffbb28] group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link
                to="/karya"
                className="btn-interactive bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold uppercase px-6 sm:px-8 py-3.5 text-xs sm:text-sm tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(255,187,40,0.28)] flex items-center gap-2.5 active:scale-95"
              >
                Lihat Semua Karya
                <span className="material-symbols-outlined text-base">arrow_outward</span>
              </Link>
              <a
                href={profileData.cvUrl}
                download
                className="border border-[#56433b] hover:border-[#ffbb28] bg-[#231e22]/60 backdrop-blur-md hover:bg-[#231e22] text-[#ebdfe4] hover:text-[#ffbb28] font-mono text-xs sm:text-sm px-6 py-3.5 uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Unduh CV
              </a>
            </div>
          </ScrollReveal>

          {/* Right Column: User Profile Photo with Interactive 3D Tilt */}
          <ScrollReveal direction="scale" delay={120} className="lg:col-span-5 relative order-1 lg:order-2 max-w-md mx-auto lg:max-w-none w-full">
            <InteractiveCard
              tiltIntensity={6}
              className="bg-[#231e22]/90 backdrop-blur-md p-3 sm:p-4 border border-[#56433b]/50 hover:border-[#ffbb28]/70 shadow-2xl group"
            >
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#171216] relative">
                <img
                  src={profileData.avatarUrl}
                  alt={profileData.fullName}
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171216]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-headline font-extrabold text-lg sm:text-xl text-[#ebdfe4] uppercase tracking-tight">
                      {profileData.fullName}
                    </p>
                    <p className="font-mono text-xs text-[#ffbb28]">
                      {profileData.location}
                    </p>
                  </div>
                  <span className="bg-[#a53c00] group-hover:bg-[#ffbb28] text-[#ffdbcd] group-hover:text-[#281b00] transition-colors duration-300 font-mono text-[10px] uppercase px-2.5 py-1 font-bold">
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

      {/* About / Tentang Section */}
      <section id="tentang" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#201a1e]/60 backdrop-blur-sm border-b border-[#56433b]/25">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <ScrollReveal direction="up" className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-[#ffbb28] block">
                Profil Singkat
              </span>
              <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
                {siteTexts.aboutTitle}
              </h2>
              <div className="h-1 w-16 bg-[#a53c00]" />
              <p className="font-mono text-xs text-[#ddc0b3]/90 pt-2">
                {profileData.role}
              </p>

              {/* Animated Quick Stats */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {statsList.map((st, idx) => (
                  <div
                    key={idx}
                    className="bg-[#171216]/85 backdrop-blur-md p-4 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div
                      className={`font-headline text-2xl sm:text-3xl font-extrabold ${
                        idx === 0
                          ? 'text-[#ffbb28]'
                          : idx === 1
                          ? 'text-[#ffb597]'
                          : 'text-[#ebdfe4]'
                      }`}
                    >
                      <AnimatedCounter target={st.value} suffix={st.suffix} />
                    </div>
                    <div className="font-mono text-[11px] text-[#ddc0b3] mt-1">
                      {st.label}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={120} className="lg:col-span-7 space-y-5">
              <p className="font-headline text-lg sm:text-2xl font-medium text-[#ebdfe4]">
                Hay, Nama Saya{' '}
                <span className="font-extrabold italic text-[#ffbb28]">
                  {profileData.fullName}
                </span>
              </p>
              <p className="font-body text-base sm:text-lg text-[#ebdfe4] leading-relaxed">
                {profileData.shortBio}
              </p>
              <p className="font-body text-sm sm:text-base text-[#ddc0b3] leading-relaxed">
                {profileData.extendedBio}
              </p>

              {/* Services Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {services.map((srv, idx) => (
                  <ScrollReveal key={srv.title} delay={idx * 100} direction="up">
                    <InteractiveCard
                      tiltIntensity={4}
                      className="h-full bg-[#171216]/85 backdrop-blur-md p-5 border border-[#56433b]/35 hover:border-[#ffbb28]/70 group"
                    >
                      <span className="material-symbols-outlined text-[#ffbb28] text-2xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                        {srv.icon}
                      </span>
                      <h3 className="font-headline font-bold text-sm uppercase text-[#ebdfe4] group-hover:text-[#ffbb28] transition-colors mb-2">
                        {srv.title}
                      </h3>
                      <p className="font-body text-xs text-[#ddc0b3]/80 leading-relaxed">
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

      {/* SECTION 1: KARYA FOTOGRAFI PILIHAN (Separated) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
        <ScrollReveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#56433b]/30 pb-6">
            <div>
              <span className="font-mono text-xs text-[#ffbb28] uppercase tracking-widest block mb-2">
                Galeri Karya 01
              </span>
              <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                {siteTexts.homePhotoTitle}
              </h2>
              <p className="font-body text-sm text-[#ddc0b3] mt-1">
                {siteTexts.homePhotoDesc}
              </p>
            </div>
            <Link
              to="/fotografi"
              className="group inline-flex items-center gap-2 font-mono text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
            >
              <span>Lihat Halaman Fotografi</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPhotos.map((photo, idx) => (
            <ScrollReveal key={photo.id} delay={idx * 90} direction="up">
              <ProjectCard
                project={photo}
                onSelect={(p) => setSelectedProject(p)}
                variant="photo"
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* SECTION 2: KARYA DESAIN GRAFIS PILIHAN (Separated) */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#201a1e]/60 backdrop-blur-sm border-y border-[#56433b]/25">
        <div className="max-w-[1440px] mx-auto">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#56433b]/30 pb-6">
              <div>
                <span className="font-mono text-xs text-[#ffb597] uppercase tracking-widest block mb-2">
                  Galeri Karya 02
                </span>
                <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                  {siteTexts.homeDesignTitle}
                </h2>
                <p className="font-body text-sm text-[#ddc0b3] mt-1">
                  {siteTexts.homeDesignDesc}
                </p>
              </div>
              <Link
                to="/desain-grafis"
                className="group inline-flex items-center gap-2 font-mono text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
              >
                <span>Lihat Halaman Desain Grafis</span>
                <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDesigns.map((design, idx) => (
              <ScrollReveal key={design.id} delay={idx * 100} direction="up">
                <ProjectCard
                  project={design}
                  onSelect={(p) => setSelectedProject(p)}
                  variant="design"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: KARYA VIDEOGRAFI PILIHAN */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
        <ScrollReveal direction="up">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#56433b]/30 pb-6">
            <div>
              <span className="font-mono text-xs text-[#ffbb28] uppercase tracking-widest block mb-2">
                Galeri Karya 03
              </span>
              <h2 className="font-headline text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-[#ebdfe4]">
                {siteTexts.homeVideoTitle}
              </h2>
              <p className="font-body text-sm text-[#ddc0b3] mt-1">
                {siteTexts.homeVideoDesc}
              </p>
            </div>
            <Link
              to="/videografi"
              className="group inline-flex items-center gap-2 font-mono text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
            >
              <span>Lihat Halaman Videografi</span>
              <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredVideos.map((video, idx) => (
            <ScrollReveal key={video.id} delay={idx * 120} direction="up">
              <ProjectCard
                project={video}
                onSelect={(p) => setSelectedProject(p)}
                variant="video"
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Experience & Education Section */}
      <section id="pengalaman" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#201a1e]/60 backdrop-blur-sm border-y border-[#56433b]/25">
        <div className="max-w-[1440px] mx-auto">
          <ScrollReveal direction="up" className="mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-[#ffbb28] block mb-2">
              Rekam Jejak
            </span>
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
              Pengalaman & Pendidikan
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Experiences */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-headline text-lg font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-3">
                Pengalaman Organisasi & Profesional
              </h3>
              <div className="space-y-6">
                {experiences.map((exp, idx) => (
                  <ScrollReveal key={exp.id} delay={idx * 100} direction="up">
                    <div className="bg-[#171216]/85 backdrop-blur-md p-5 sm:p-6 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs text-[#ffbb28] font-bold">
                          {exp.period}
                        </span>
                        <span className="font-mono text-[11px] px-2.5 py-0.5 bg-[#231e22] text-[#ddc0b3] border border-[#56433b]/30">
                          {exp.type}
                        </span>
                      </div>
                      <h4 className="font-headline text-lg sm:text-xl font-bold text-[#ebdfe4] uppercase">
                        {exp.role}
                      </h4>
                      <p className="font-mono text-xs text-[#ffb597] mb-3">
                        {exp.organization} — {exp.location}
                      </p>
                      <p className="font-body text-sm text-[#ddc0b3] mb-4 leading-relaxed">
                        {exp.description}
                      </p>
                      <ul className="space-y-1.5">
                        {exp.highlights.map((item, i) => (
                          <li key={i} className="font-body text-xs text-[#ddc0b3]/85 flex items-start gap-2">
                            <span className="text-[#ffbb28] mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Education & Skills */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-6">
                <h3 className="font-headline text-lg font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-3">
                  Pendidikan
                </h3>
                {educationList.map((edu, idx) => (
                  <ScrollReveal key={edu.id} delay={idx * 100} direction="up">
                    <div className="bg-[#171216]/85 backdrop-blur-md p-5 sm:p-6 border border-[#56433b]/35 hover:border-[#ffbb28]/60 transition-all duration-300">
                      <span className="font-mono text-xs text-[#ffbb28] block mb-1">
                        {edu.period}
                      </span>
                      <h4 className="font-headline text-lg font-bold text-[#ebdfe4] uppercase">
                        {edu.institution}
                      </h4>
                      <p className="font-mono text-xs text-[#ffb597] mb-3">
                        {edu.degree} • {edu.field}
                      </p>
                      <p className="font-body text-xs sm:text-sm text-[#ddc0b3] leading-relaxed">
                        {edu.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="font-headline text-lg font-bold uppercase text-[#ffb597] border-b border-[#56433b]/30 pb-3">
                  Keahlian & Perangkat Lunak
                </h3>
                <div className="space-y-4">
                  {skillCategories.map((cat, idx) => (
                    <ScrollReveal key={cat.title} delay={idx * 100} direction="up">
                      <div className="bg-[#171216]/85 backdrop-blur-md p-4 sm:p-5 border border-[#56433b]/35">
                        <h4 className="font-mono text-xs text-[#ffbb28] uppercase tracking-wider mb-3">
                          {cat.title}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((skill) => (
                            <span
                              key={skill.name}
                              className="px-3 py-1 bg-[#231e22] border border-[#56433b]/40 hover:border-[#ffbb28] hover:text-[#ffbb28] font-mono text-xs text-[#ebdfe4] transition-all duration-200 hover:-translate-y-0.5 cursor-default"
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

      {/* Awards & Certifications Section */}
      <section id="prestasi" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1440px] mx-auto">
        <ScrollReveal direction="up" className="mb-10">
          <span className="font-mono text-xs uppercase tracking-widest text-[#ffbb28] block mb-2">
            Pencapaian
          </span>
          <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
            Penghargaan & Sertifikasi
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {awards.map((award, idx) => (
            <ScrollReveal key={award.id} delay={idx * 100} direction="up">
              <InteractiveCard
                tiltIntensity={4}
                className="h-full bg-[#231e22]/85 backdrop-blur-md p-6 border-l-4 border-[#ffbb28] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs text-[#ffbb28] font-bold uppercase">
                      {award.rank} • {award.issuer}
                    </span>
                    <span className="font-mono text-xs text-[#ddc0b3]">{award.year}</span>
                  </div>
                  <h3 className="font-headline text-lg font-bold text-[#ebdfe4] uppercase mb-2">
                    {award.title}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-[#ddc0b3]/90 leading-relaxed">
                    {award.description}
                  </p>
                </div>
              </InteractiveCard>
            </ScrollReveal>
          ))}
        </div>

        {featuredCerts.length > 0 && (
          <div className="mt-14">
            <ScrollReveal direction="up">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 pb-3 border-b border-[#56433b]/30">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[#ffbb28]">workspace_premium</span>
                  <h3 className="font-headline text-xl sm:text-2xl font-bold uppercase text-[#ebdfe4]">
                    Sertifikat
                  </h3>
                  <span className="font-mono text-xs text-[#ffbb28]">({certifications.length})</span>
                </div>
                <Link
                  to="/sertifikat"
                  className="group inline-flex items-center gap-2 font-mono text-xs text-[#ffbb28] hover:text-[#ffb597] uppercase tracking-wider shrink-0"
                >
                  <span>Lihat Semua Sertifikat</span>
                  <span className="material-symbols-outlined text-base group-hover:translate-x-1.5 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredCerts.map((cert, idx) => (
                <ScrollReveal key={cert.id} delay={idx * 90} direction="up">
                  <CertificateCard cert={cert} onOpen={setSelectedCert} compact />
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

        <CertificateModal
          cert={selectedCert}
          list={featuredCerts}
          onClose={() => setSelectedCert(null)}
          onSelect={setSelectedCert}
        />
      </section>

      {/* Contact Section */}
      <section id="kontak" className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#201a1e]/60 backdrop-blur-sm border-t border-[#56433b]/30">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <ScrollReveal direction="up" className="lg:col-span-5 space-y-5">
            <span className="font-mono text-xs uppercase tracking-widest text-[#ffbb28] block">
              Hubungi Saya
            </span>
            <h2 className="font-headline text-2xl sm:text-4xl font-extrabold text-[#ebdfe4] uppercase tracking-tight">
              {siteTexts.contactTitle}
            </h2>
            <p className="font-body text-sm sm:text-base text-[#ddc0b3] leading-relaxed">
              {siteTexts.contactDesc}
            </p>

            <div className="space-y-3 pt-2 font-mono text-xs">
              <div className="flex items-center gap-3 p-3.5 bg-[#171216]/85 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] transition-colors">
                <span className="material-symbols-outlined text-[#ffbb28]">chat</span>
                <a
                  href={profileData.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ebdfe4] hover:text-[#ffbb28]"
                >
                  WhatsApp: 0896-1411-4644
                </a>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#171216]/85 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] transition-colors">
                <span className="material-symbols-outlined text-[#ffbb28]">mail</span>
                <a href={`mailto:${profileData.email}`} className="text-[#ebdfe4] hover:text-[#ffbb28] break-all">
                  {profileData.email}
                </a>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#171216]/85 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] transition-colors">
                <span className="material-symbols-outlined text-[#ffbb28]">location_on</span>
                <span className="text-[#ebdfe4]">{profileData.location}</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#171216]/85 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] transition-colors">
                <span className="material-symbols-outlined text-[#ffbb28]">share</span>
                <a
                  href={profileData.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ebdfe4] hover:text-[#ffbb28]"
                >
                  Instagram {profileData.instagramHandle}
                </a>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-[#171216]/85 backdrop-blur-md border border-[#56433b]/35 hover:border-[#ffbb28] transition-colors">
                <span className="material-symbols-outlined text-[#ffbb28]">work</span>
                <a
                  href={profileData.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ebdfe4] hover:text-[#ffbb28]"
                >
                  LinkedIn: {profileData.linkedinHandle}
                </a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={120} className="lg:col-span-7">
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
