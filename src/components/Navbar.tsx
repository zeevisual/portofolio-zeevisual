import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { profileData } from '../data/profile';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled
            ? 'bg-[#171216]/95 backdrop-blur-xl border-[#56433b]/50 shadow-[0_10px_30px_rgba(0,0,0,0.65)] py-2.5'
            : 'bg-[#171216]/85 backdrop-blur-md border-[#3a3337]/50 py-3.5'
        }`}
      >
        {/* Top Smooth Scroll Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-[2.5px] bg-transparent overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#a53c00] via-[#ffbb28] to-[#ffb597] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="flex justify-between items-center px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto">
          {/* Brand Identity */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5"
            aria-label="Zeevisual Portfolio"
          >
            <img
              src="/images/logo-zeevisual.png"
              alt="Zeevisual Logo"
              className="h-7 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="hidden sm:inline-block text-[10px] font-mono bg-[#231e22] text-[#ffbb28] px-2 py-0.5 border border-[#56433b]/40 group-hover:border-[#ffbb28] transition-colors duration-300">
              PORTFOLIO
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5">
            {pageLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative py-1 font-headline tracking-tight text-xs uppercase transition-colors duration-300 ${
                    isActive
                      ? 'text-[#ffbb28] font-bold'
                      : 'text-[#ddc0b3] hover:text-[#ebdfe4]'
                  } after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#ffbb28] after:transition-transform after:duration-300 after:origin-left ${
                    isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <span className="h-4 w-[1px] bg-[#56433b]/40 mx-1"></span>

            {sectionLinks.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleSectionNavigate(sec.id)}
                className="relative py-1 text-[#ddc0b3]/80 hover:text-[#ffb597] transition-colors duration-300 font-mono text-[11px] uppercase tracking-wider after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#ffb597] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left"
              >
                {sec.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={profileData.cvUrl}
              download
              className="hidden sm:inline-flex items-center gap-1.5 border border-[#56433b] hover:border-[#ffbb28] text-[#ebdfe4] hover:text-[#ffbb28] px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Unduh CV
            </a>
            <button
              onClick={() => handleSectionNavigate('kontak')}
              className="btn-interactive bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] px-3.5 sm:px-5 py-2 font-headline uppercase text-[11px] sm:text-xs font-bold tracking-wider transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,187,40,0.3)] active:scale-95"
            >
              Hubungi Saya
            </button>

            {/* Mobile Hamburger Trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden text-[#ebdfe4] hover:text-[#ffbb28] p-1.5 border border-[#56433b]/40 bg-[#231e22] focus:outline-none transition-transform active:scale-90"
              aria-label="Buka Menu Navigasi"
            >
              <span className="material-symbols-outlined text-2xl block transition-transform duration-300">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation with Smooth Fade-Down */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#171216]/98 backdrop-blur-xl border-b border-[#56433b]/40 px-5 py-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-up">
            <div className="space-y-1">
              <p className="font-mono text-[10px] text-[#ffbb28] uppercase tracking-widest mb-2">
                Halaman Portofolio
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {pageLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 font-headline text-sm uppercase tracking-tight transition-all duration-200 ${
                        isActive
                          ? 'bg-[#231e22] text-[#ffbb28] font-bold border-l-2 border-[#ffbb28] translate-x-1'
                          : 'text-[#ebdfe4] hover:bg-[#231e22]/60 hover:translate-x-1'
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="material-symbols-outlined text-base opacity-70">
                        arrow_forward
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-[#56433b]/30">
              <p className="font-mono text-[10px] text-[#ffb597] uppercase tracking-widest mb-2">
                Bagian Profil {isHome ? '' : '(Beranda)'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {sectionLinks.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => handleSectionNavigate(sec.id)}
                    className="text-left px-3.5 py-2 bg-[#231e22]/60 hover:bg-[#231e22] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-xs uppercase tracking-wider border border-[#56433b]/20 transition-all active:scale-95"
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#56433b]/30 flex flex-col sm:flex-row gap-2.5">
              <a
                href={profileData.cvUrl}
                download
                className="flex-1 flex items-center justify-center gap-2 border border-[#56433b] text-[#ebdfe4] hover:text-[#ffbb28] py-2.5 font-mono text-xs uppercase tracking-widest transition-all"
              >
                <span className="material-symbols-outlined text-base">download</span>
                Unduh CV (PDF)
              </a>
              <button
                onClick={() => handleSectionNavigate('kontak')}
                className="flex-1 bg-[#ffbb28] text-[#281b00] py-2.5 font-headline font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
              >
                Mulai Kolaborasi
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        aria-label="Kembali ke Atas"
        className={`fixed bottom-5 right-5 z-40 w-11 h-11 bg-[#231e22]/90 hover:bg-[#ffbb28] text-[#ffbb28] hover:text-[#281b00] border border-[#56433b]/60 hover:border-[#ffbb28] shadow-xl flex items-center justify-center transition-all duration-300 ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-xl">keyboard_arrow_up</span>
      </button>
    </>
  );
};

export default Navbar;
