import React from 'react';
import { Link } from 'react-router-dom';
import { profileData } from '../data/profile';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-12 px-4 sm:px-8 bg-[#120d10] border-t border-[#3a3337]/50">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <Link
              to="/"
              className="inline-block group"
              aria-label="Zeevisual Portfolio"
            >
              <img
                src="/images/logo-zeevisual.png"
                alt="Zeevisual Logo"
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
            <p className="font-body text-sm text-[#ddc0b3]/80 max-w-sm leading-relaxed">
              {profileData.siteTexts?.footerDesc ||
                `Portofolio resmi ${profileData.fullName}. Menampilkan karya terpilih di bidang Fotografi, Desain Grafis, dan Videografi.`}
            </p>
            <p className="font-mono text-xs text-[#ffb597]">
              {profileData.location}
            </p>
          </div>

          {/* Quick Page Links */}
          <div className="md:col-span-4 space-y-2.5">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#ffbb28]">
              Kategori Karya
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <Link to="/" className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors">
                Beranda
              </Link>
              <Link to="/fotografi" className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors">
                Fotografi
              </Link>
              <Link to="/desain-grafis" className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors">
                Desain Grafis
              </Link>
              <Link to="/videografi" className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors">
                Videografi
              </Link>
              <Link to="/karya" className="text-[#ddc0b3] hover:text-[#ffbb28] transition-colors">
                Semua Karya
              </Link>
            </div>
          </div>

          {/* Social & Contact */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#ffbb28]">
              Tautan & Kontak
            </h4>
            <div className="flex flex-col gap-2 font-mono text-xs">
              <a
                href={profileData.socials.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ddc0b3] hover:text-[#ffb597] transition-colors"
              >
                WhatsApp (0896-1411-4644)
              </a>
              <a
                href={profileData.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ddc0b3] hover:text-[#ffb597] transition-colors"
              >
                Instagram ({profileData.instagramHandle})
              </a>
              <a
                href={profileData.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ddc0b3] hover:text-[#ffb597] transition-colors"
              >
                LinkedIn ({profileData.linkedinHandle})
              </a>
              <a
                href={`mailto:${profileData.email}`}
                className="text-[#ddc0b3] hover:text-[#ffb597] transition-colors break-all"
              >
                {profileData.email}
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#56433b]/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div className="font-mono text-xs text-[#ddc0b3]/60">
            © {new Date().getFullYear()} Ziyad Fadhillah (Zeevisual). Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-[#ffbb28]">
              Fotografi • Desain Grafis • Videografi
            </span>
            {typeof window !== 'undefined' &&
              (window.location.hostname === 'localhost' ||
                window.location.hostname === '127.0.0.1') && (
                <Link
                  to="/admin"
                  className="font-mono text-[11px] text-[#ddc0b3]/40 hover:text-[#ffbb28] transition-colors flex items-center gap-1"
                  title="Khusus Admin Portofolio (Localhost)"
                >
                  <span className="material-symbols-outlined text-xs">lock</span>
                  <span>Admin</span>
                </Link>
              )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
