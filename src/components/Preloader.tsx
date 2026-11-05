import React, { useEffect, useState } from 'react';
import { profileData, certifications } from '../data/profile';
import {
  getPhotographyProjects,
  getGraphicDesignProjects,
  getVideographyProjects,
} from '../data/projects';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('MEMUAT PROFIL & ASET VISUAL...');
  const [isExiting, setIsExiting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Collect critical above-the-fold & featured images so nothing downloads/pops-in after preloader
    const criticalUrls: string[] = [
      '/images/logo-zeevisual.png',
      profileData.avatarUrl,
      ...getPhotographyProjects().slice(0, 4).map((p) => p.image),
      ...getGraphicDesignProjects().slice(0, 4).map((p) => p.image),
      ...getVideographyProjects().slice(0, 3).map((p) => p.image),
      ...(certifications || []).slice(0, 2).map((c) => c.image || ''),
    ].filter(Boolean);

    const uniqueUrls = Array.from(new Set(criticalUrls));
    let loadedCount = 0;
    const total = uniqueUrls.length || 1;

    const preloadOne = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'sync';
        const done = () => {
          loadedCount += 1;
          if (isMounted) {
            const pct = Math.min(95, Math.round((loadedCount / total) * 90) + 10);
            setProgress((prev) => Math.max(prev, pct));
            if (pct > 55) {
              setStatusText('MENYIAPKAN GALERI FOTOGRAFI, DESAIN & VIDEO...');
            }
          }
          resolve();
        };

        img.onload = () => {
          if (typeof img.decode === 'function') {
            img.decode().then(done).catch(done);
          } else {
            done();
          }
        };
        img.onerror = done;
        img.src = url;
      });
    };

    // Smooth minimum progress ticker so percentage feels fluid
    const ticker = setInterval(() => {
      if (!isMounted) return;
      setProgress((prev) => {
        if (prev >= 92) return prev;
        return prev + 3;
      });
    }, 45);

    // Wait for critical images (especially profile avatar & logo) + minimum 850ms for smooth animation
    const minTimer = new Promise<void>((res) => setTimeout(res, 900));
    const maxTimeout = new Promise<void>((res) => setTimeout(res, 2800));

    // Prioritize avatar & logo strictly, race rest against maxTimeout
    const avatarAndLogo = Promise.all([
      preloadOne('/images/logo-zeevisual.png'),
      preloadOne(profileData.avatarUrl),
    ]);
    const allAssets = Promise.all(uniqueUrls.slice(2).map(preloadOne));

    Promise.all([avatarAndLogo, minTimer, Promise.race([allAssets, maxTimeout])]).then(() => {
      if (!isMounted) return;
      clearInterval(ticker);
      setProgress(100);
      setStatusText('PORTFOLIO SIAP DITAMPILKAN');

      setTimeout(() => {
        if (!isMounted) return;
        setIsExiting(true);
        setTimeout(() => {
          if (!isMounted) return;
          setIsHidden(true);
          if (onComplete) onComplete();
        }, 620);
      }, 220);
    });

    return () => {
      isMounted = false;
      clearInterval(ticker);
    };
  }, [onComplete]);

  if (isHidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#120d10] select-none overflow-hidden transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Glow & Grid inside Preloader */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 187, 40, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(221, 192, 179, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
      <div
        className="absolute w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255, 187, 40, 0.18) 0%, rgba(165, 60, 0, 0.08) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Camera Viewfinder Frame Corners */}
      <div className="relative z-10 w-[300px] sm:w-[380px] p-7 sm:p-9 rounded-3xl bg-[#171216]/90 backdrop-blur-xl border border-[#56433b]/50 shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col items-center">
        {/* Corner Viewfinder Brackets */}
        <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#ffbb28]/80 rounded-tl" />
        <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#ffbb28]/80 rounded-tr" />
        <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#ffbb28]/80 rounded-bl" />
        <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#ffbb28]/80 rounded-br" />

        {/* Top Viewfinder REC Status */}
        <div className="w-full flex items-center justify-between font-mono text-[9px] text-[#ddc0b3]/75 uppercase tracking-widest mb-5">
          <span className="inline-flex items-center gap-1.5 text-[#ffbb28]">
            <span className="w-2 h-2 rounded-full bg-[#ffbb28] animate-ping" />
            REC • RAW 4K
          </span>
          <span>ISO 100 • f/1.4</span>
        </div>

        {/* Rotating Camera Aperture Ring + Logo */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-5">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#ffbb28]/45 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border border-[#ffb597]/25 animate-reverse-spin" />
          <div className="relative z-10 px-3 py-2 rounded-2xl bg-[#231e22]/90 border border-[#56433b]/50 shadow-inner">
            <img
              src="/images/logo-zeevisual.png"
              alt="Zeevisual"
              className="h-7 sm:h-8 w-auto object-contain"
              loading="eager"
            />
          </div>
        </div>

        {/* Name & Tagline */}
        <p className="font-headline text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#ebdfe4] text-center">
          {profileData.fullName}
        </p>
        <p className="font-mono text-[10px] text-[#ffb597] uppercase tracking-widest mt-0.5 mb-5 text-center">
          Fotografi • Desain Grafis • Videografi
        </p>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#231e22] rounded-full overflow-hidden border border-[#56433b]/40 mb-2.5">
          <div
            className="h-full bg-gradient-to-r from-[#a53c00] via-[#ffbb28] to-[#ffb597] rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_#ffbb28]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status & Percentage */}
        <div className="w-full flex items-center justify-between font-mono text-[10px]">
          <span className="text-[#ddc0b3]/80 truncate pr-2">{statusText}</span>
          <span className="text-[#ffbb28] font-bold shrink-0">{progress}%</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
