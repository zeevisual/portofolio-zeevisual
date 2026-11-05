import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { profileData } from '../data/profile';
import { soundManager } from '../utils/sound';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => soundManager.isEnabled());

  const isHome = location.pathname === '/';

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 30);
      setShowBackToTop(scrollTop > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionNavigate = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleToggleSound = () => {
    const nextState = soundManager.toggle();
    setSoundEnabled(nextState);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageLinks = [
    { path: '/', label: 'Beranda' },
    { path: '/fotografi', label: 'Fotografi' },
    { path: '/desain-grafis', label: 'Desain Grafis' },
    { path: '/videografi', label: 'Videografi' },
    { path: '/karya', label: 'Semua Karya' },
    { path: '/sertifikat', label: 'Sertifikat' },
  ];

  const sectionLinks = [
    { id: 'tentang', label: 'Tentang' },
    { id: 'pengalaman', label: 'Pengalaman' },
    { id: 'prestasi', label: 'Prestasi' },
    { id: 'kontak', label: 'Kontak' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 px-2.5 sm:px-5 pt-2 sm:pt-3 transition-all duration-300">
        <div
          className={`relative max-w-[1260px] mx-auto rounded-2xl xl:rounded-full ios-glass-nav transition-all duration-300 ${
            isScrolled
              ? 'py-2 px-3.5 sm:px-4 shadow-[0_18px_42px_rgba(0,0,0,0.75)]'
              : 'py-2.5 px-3.5 sm:px-4'
          }`}
        >
          {/* Top Smooth Scroll Progress Bar Inside Pill */}
          <div className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-transparent overflow-hidden rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#a53c00] via-[#ffbb28] to-[#ffb597] transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <div className="flex justify-between items-center gap-2">
            {/* Brand Identity */}
            <Link
              to="/"
              className="group flex items-center gap-2 shrink-0 py-0.5"
              aria-label="Zeevisual Portfolio"
            >
              <img
                src="/images/logo-zeevisual.png"
                alt="Zeevisual Logo"
                loading="eager"
                fetchPriority="high"
                className="h-6 sm:h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <span className="hidden 2xl:inline-flex items-center gap-1.5 text-[9px] font-mono bg-[#231e22]/90 text-[#ffbb28] px-2 py-0.5 rounded-full border border-[#56433b]/50 group-hover:border-[#ffbb28] transition-colors duration-300 whitespace-nowrap shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffbb28] shadow-[0_0_8px_#ffbb28]" />
                PORTFOLIO
              </span>
            </Link>

            {/* Desktop Navigation (Single-Line Guaranteed with whitespace-nowrap shrink-0) */}
            <nav className="hidden xl:flex items-center gap-0.5 ios-glass-pill p-1 rounded-full shrink-0">
              {pageLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-2.5 py-1 rounded-full font-headline tracking-tight text-[10.5px] uppercase whitespace-nowrap shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#ffbb28]/25 to-[#ffb597]/20 text-[#ffbb28] font-bold border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_0_16px_rgba(255,187,40,0.22)]'
                        : 'text-[#ddc0b3]/90 hover:text-[#ebdfe4] hover:bg-white/[0.06] border border-transparent'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <span className="h-3.5 w-[1px] bg-white/15 mx-1 shrink-0" />

              {sectionLinks.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => handleSectionNavigate(sec.id)}
                  className="px-2 py-1 rounded-full text-[#ddc0b3]/80 hover:text-[#ffb597] hover:bg-white/[0.06] transition-all duration-200 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {sec.label}
                </button>
              ))}
            </nav>

            {/* Action Buttons + Sound Toggle */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Sound Effect Toggle Button */}
              <button
                type="button"
                data-sound-toggle="true"
                onClick={handleToggleSound}
                title={soundEnabled ? 'Suara Klik Aktif (Klik untuk Matikan)' : 'Suara Klik Nonaktif (Klik untuk Aktifkan)'}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all duration-300 cursor-pointer shrink-0 ${
                  soundEnabled
                    ? 'bg-[#231e22]/90 border-[#ffbb28]/45 text-[#ffbb28] hover:bg-[#ffbb28] hover:text-[#281b00]'
                    : 'bg-[#171216]/80 border-[#56433b]/40 text-[#ddc0b3]/50 hover:text-[#ebdfe4]'
                }`}
                aria-label="Toggle Sound Effects"
              >
                <span className="material-symbols-outlined text-sm sm:text-base">
                  {soundEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>

              <a
                href={profileData.cvUrl}
                download
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#56433b]/60 hover:border-[#ffbb28] bg-[#231e22]/70 text-[#ebdfe4] hover:text-[#ffbb28] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                CV
              </a>
              <button
                type="button"
                onClick={() => handleSectionNavigate('kontak')}
                className="btn-interactive rounded-full bg-gradient-to-r from-[#a53c00] to-[#c44900] hover:from-[#ffbb28] hover:to-[#ffb597] text-[#ffdbcd] hover:text-[#281b00] px-3 sm:px-3.5 py-1.5 font-headline uppercase text-[10px] sm:text-[11px] font-bold tracking-wider whitespace-nowrap shrink-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(255,187,40,0.3)] active:scale-95 cursor-pointer"
              >
                Kontak
              </button>

              {/* Mobile Hamburger Trigger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden text-[#ebdfe4] hover:text-[#ffbb28] p-1.5 rounded-xl border border-[#56433b]/50 bg-[#231e22]/90 focus:outline-none transition-transform active:scale-90 shrink-0"
                aria-label="Buka Menu Navigasi"
              >
                <span className="material-symbols-outlined text-xl block transition-transform duration-300">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Drawer Navigation with Smooth Fade-Down */}
          {mobileMenuOpen && (
            <div className="xl:hidden mt-2.5 pt-3 border-t border-[#56433b]/40 px-1 pb-2 space-y-3 max-h-[80vh] overflow-y-auto animate-fade-up">
              <div>
                <p className="font-mono text-[9px] text-[#ffbb28] uppercase tracking-widest mb-1.5 px-1">
                  Halaman Portofolio
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {pageLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl font-headline text-xs uppercase tracking-tight transition-all duration-200 ${
                          isActive
                            ? 'bg-[#ffbb28]/15 text-[#ffbb28] font-bold border border-[#ffbb28]/40'
                            : 'bg-[#231e22]/70 text-[#ebdfe4] border border-[#56433b]/25 hover:border-[#ffbb28]/40'
                        }`}
                      >
                        <span className="whitespace-nowrap">{link.label}</span>
                        <span className="material-symbols-outlined text-xs opacity-70">
                          arrow_forward
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-[#56433b]/30">
                <p className="font-mono text-[9px] text-[#ffb597] uppercase tracking-widest mb-1.5 px-1">
                  Bagian Profil {isHome ? '' : '(Beranda)'}
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {sectionLinks.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleSectionNavigate(sec.id)}
                      className="text-center px-2 py-1.5 rounded-lg bg-[#231e22]/60 hover:bg-[#231e22] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[10px] uppercase tracking-wider border border-[#56433b]/25 transition-all active:scale-95"
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#56433b]/30 grid grid-cols-2 gap-2">
                <a
                  href={profileData.cvUrl}
                  download
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-[#56433b] bg-[#231e22]/60 text-[#ebdfe4] hover:text-[#ffbb28] py-2 font-mono text-[10px] uppercase tracking-wider transition-all"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Unduh CV
                </a>
                <button
                  type="button"
                  onClick={() => handleSectionNavigate('kontak')}
                  className="rounded-xl bg-[#ffbb28] text-[#281b00] py-2 font-headline font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
                >
                  Hubungi Saya
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Back to Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Kembali ke Atas"
        className={`fixed bottom-4 right-4 z-40 w-9 h-9 rounded-full bg-[#231e22]/90 hover:bg-[#ffbb28] text-[#ffbb28] hover:text-[#281b00] border border-[#56433b]/60 hover:border-[#ffbb28] shadow-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-lg">keyboard_arrow_up</span>
      </button>
    </>
  );
};

export default Navbar;
