import React, { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Certification, CERTIFICATE_CATEGORY_ICONS } from '../data/profile';
import { InteractiveCard } from './InteractiveEffects';

export const getCertIcon = (category?: string) =>
  CERTIFICATE_CATEGORY_ICONS[category || ''] || 'workspace_premium';

const isPdf = (url?: string) => Boolean(url && /\.pdf($|\?)/i.test(url));

/* ------------------------------------------------------------------ */
/* Helper ambil semua slide sertifikat (array of string)              */
/* ------------------------------------------------------------------ */
export const getCertSlides = (cert: Certification): string[] => {
  const raw = cert.images && cert.images.length > 0 ? cert.images : (cert.image ? [cert.image] : []);
  const cleaned = raw.map((s) => s?.trim()).filter(Boolean) as string[];
  return cleaned.length > 0 ? cleaned : (cert.image ? [cert.image] : []);
};

/* ------------------------------------------------------------------ */
/* Kartu Sertifikat (Mendukung Multi-Slide Halaman Depan / Belakang)  */
/* ------------------------------------------------------------------ */
interface CertificateCardProps {
  cert: Certification;
  onOpen: (cert: Certification) => void;
  compact?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onOpen, compact }) => {
  const slides = useMemo(() => getCertSlides(cert), [cert]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const hasMultiple = slides.length > 1;
  const activeSlideUrl = slides[currentSlideIdx] || cert.image;
  const hasImage = Boolean(activeSlideUrl);
  const hasPdf = Boolean(cert.fileUrl);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
  };

  return (
    <InteractiveCard
      onClick={() => onOpen(cert)}
      tiltIntensity={3}
      glowColor="rgba(255, 187, 40, 0.16)"
      className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col transition-all duration-300"
    >
      {/* Media Viewer Area */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#120d10] flex items-center justify-center">
        {hasImage ? (
          <>
            <img
              src={activeSlideUrl}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125 pointer-events-none select-none"
            />
            <img
              key={activeSlideUrl}
              src={activeSlideUrl}
              alt={`${cert.title}${hasMultiple ? ` - Halaman ${currentSlideIdx + 1}` : ''}`}
              loading="lazy"
              className="relative z-10 w-full h-full object-contain p-3 sm:p-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
          </>
        ) : (
          /* Placeholder bila belum ada scan */
          <div className="absolute inset-0 flex items-center justify-center p-5 bg-gradient-to-br from-[#2b2226] via-[#1b1519] to-[#120d10]">
            <div className="w-full h-full border border-[#ffbb28]/25 outline outline-1 outline-offset-4 outline-[#56433b]/30 flex flex-col items-center justify-center text-center px-4">
              <span className="material-symbols-outlined text-4xl sm:text-5xl text-[#ffbb28] mb-2">
                {hasPdf ? 'picture_as_pdf' : getCertIcon(cert.category)}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#ffb597]/80">
                Certificate
              </span>
              <span className="font-headline text-xs sm:text-sm font-bold uppercase text-[#ebdfe4]/90 mt-1 line-clamp-2">
                {cert.title}
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-[#ffbb28] text-[#281b00] font-mono text-[11px] font-bold uppercase px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-sm">open_in_full</span>
            Lihat Sertifikat
          </span>
        </div>

        {/* Badge Kategori Kiri Atas */}
        {cert.category && (
          <span className="absolute top-2.5 left-2.5 z-30 bg-[#171216]/90 text-[#ffbb28] font-mono text-[10px] px-2.5 py-0.5 uppercase border border-[#56433b]/50 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">{getCertIcon(cert.category)}</span>
            {cert.category}
          </span>
        )}

        {/* Badge Multi-Slide / Halaman Kanan Atas */}
        {hasMultiple ? (
          <span className="absolute top-2.5 right-2.5 z-30 bg-[#a53c00]/95 text-[#ffdbcd] font-mono text-[10px] font-bold px-2 py-0.5 uppercase border border-[#ffbb28]/50 flex items-center gap-1 shadow-md">
            <span className="material-symbols-outlined text-xs">burst_mode</span>
            {currentSlideIdx + 1}/{slides.length} Slide
          </span>
        ) : hasPdf ? (
          <span className="absolute top-2.5 right-2.5 z-30 bg-[#a53c00]/90 text-[#ffdbcd] font-mono text-[10px] px-2 py-0.5 uppercase border border-[#ffb597]/40">
            PDF
          </span>
        ) : null}

        {/* Tombol Panah Ganti Slide Langsung di Kartu */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/60 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/60 flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 shadow-lg cursor-pointer"
              title="Halaman Berikutnya"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>

            {/* Mini Slide Dots di Bagian Bawah Gambar */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-[#171216]/80 px-2 py-0.5 border border-[#56433b]/40 rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlideIdx(i);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIdx ? 'w-4 bg-[#ffbb28]' : 'w-1.5 bg-[#ddc0b3]/40 hover:bg-[#ddc0b3]'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className={`${compact ? 'p-4' : 'p-5'} flex-1 flex flex-col justify-between gap-3`}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-mono text-[11px] text-[#ffb597] uppercase tracking-wider block">
              {cert.year}
            </span>
            {hasMultiple && (
              <span className="font-mono text-[10px] text-[#ffbb28]/90">
                {slides.length} Halaman
              </span>
            )}
          </div>
          <h3
            className={`font-headline font-bold ${
              compact ? 'text-sm' : 'text-base sm:text-lg'
            } text-[#ebdfe4] uppercase tracking-tight leading-snug group-hover:text-[#ffbb28] transition-colors line-clamp-3`}
          >
            {cert.title}
          </h3>
          <p className="font-body text-xs text-[#ddc0b3]/80 mt-1">{cert.organizer}</p>
        </div>
        {cert.credential && (
          <div className="pt-3 border-t border-[#56433b]/25 flex items-center gap-1.5 font-mono text-[10px] text-[#ffbb28]/90">
            <span className="material-symbols-outlined text-xs">badge</span>
            <span className="truncate">{cert.credential}</span>
          </div>
        )}
      </div>
    </InteractiveCard>
  );
};

/* ------------------------------------------------------------------ */
/* Viewer Sertifikat Layar Penuh (Multi-Slide Fullscreen Viewer)       */
/* ------------------------------------------------------------------ */
interface CertificateModalProps {
  cert: Certification | null;
  list: Certification[];
  onClose: () => void;
  onSelect: (cert: Certification) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ cert, list, onClose, onSelect }) => {
  const [zoomed, setZoomed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const slides = useMemo(() => {
    if (!cert) return [];
    return getCertSlides(cert);
  }, [cert]);

  const hasMultipleSlides = slides.length > 1;
  const currentSlideUrl = slides[activeSlideIndex] || cert?.image || '';

  const idx = cert ? list.findIndex((c) => c.id === cert.id) : -1;
  const hasMultipleCerts = list.length > 1 && idx !== -1;

  const handlePrevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleSlides) return;
    setZoomed(false);
    setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleSlides) return;
    setZoomed(false);
    setActiveSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrevCert = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleCerts) return;
    const prevIndex = (idx - 1 + list.length) % list.length;
    onSelect(list[prevIndex]);
  };

  const handleNextCert = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!hasMultipleCerts) return;
    const nextIndex = (idx + 1) % list.length;
    onSelect(list[nextIndex]);
  };

  useEffect(() => {
    setZoomed(false);
    setActiveSlideIndex(0);
  }, [cert?.id]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    const activeThumb = thumbRefs.current[activeSlideIndex];
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeSlideIndex]);

  useEffect(() => {
    if (!cert) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (hasMultipleSlides) {
          setZoomed(false);
          setActiveSlideIndex((prev) => (prev + 1) % slides.length);
        } else if (hasMultipleCerts) {
          const nextIndex = (idx + 1) % list.length;
          onSelect(list[nextIndex]);
        }
      } else if (e.key === 'ArrowLeft') {
        if (hasMultipleSlides) {
          setZoomed(false);
          setActiveSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
        } else if (hasMultipleCerts) {
          const prevIndex = (idx - 1 + list.length) % list.length;
          onSelect(list[prevIndex]);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [cert, idx, list, hasMultipleSlides, hasMultipleCerts, slides.length, onClose, onSelect]);

  if (!cert) return null;

  const showPdfEmbed = !currentSlideUrl && isPdf(cert.fileUrl);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-modal-backdrop"
      onClick={onClose}
    >
      <div
        key={cert.id}
        className="relative w-full max-w-6xl bg-[#171216] border border-[#56433b]/60 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[94vh] overflow-hidden animate-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 bg-[#231e22] border-b border-[#56433b]/40 shrink-0 gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="bg-[#ffbb28] text-[#281b00] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">{getCertIcon(cert.category)}</span>
              {cert.category || 'Sertifikat'}
            </span>
            <span className="font-mono text-xs text-[#ddc0b3]">{cert.year}</span>
            {hasMultipleSlides && (
              <span className="bg-[#a53c00] text-[#ffdbcd] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">burst_mode</span>
                Slide {activeSlideIndex + 1} / {slides.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {hasMultipleCerts && (
              <div className="hidden sm:flex items-center gap-1 mr-1">
                <button
                  type="button"
                  onClick={handlePrevCert}
                  className="px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Sertifikat Sebelumnya"
                >
                  <span className="material-symbols-outlined text-sm">skip_previous</span>
                  <span>Sertif Seb.</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextCert}
                  className="px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] text-[#ddc0b3] hover:text-[#ffbb28] font-mono text-[11px] uppercase flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Sertifikat Berikutnya"
                >
                  <span>Sertif Ber.</span>
                  <span className="material-symbols-outlined text-sm">skip_next</span>
                </button>
              </div>
            )}

            {currentSlideUrl && (
              <button
                type="button"
                onClick={() => setZoomed((z) => !z)}
                className="flex items-center gap-1 font-mono text-xs uppercase text-[#ddc0b3] hover:text-[#ffbb28] px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">{zoomed ? 'zoom_out' : 'zoom_in'}</span>
                <span className="hidden sm:inline">{zoomed ? 'Normal' : 'Perbesar'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 font-mono text-xs uppercase text-[#ddc0b3] hover:text-[#ffbb28] px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <span className="hidden sm:inline">Tutup</span>
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12">
          {/* Media Viewer Area */}
          <div className="lg:col-span-8 flex flex-col bg-[#0b080a] border-b lg:border-b-0 lg:border-r border-[#56433b]/30">
            <div
              className={`relative flex-1 flex items-center justify-center p-3 sm:p-6 min-h-[300px] select-none ${
                zoomed ? 'overflow-auto' : ''
              }`}
            >
              {currentSlideUrl ? (
                <img
                  key={currentSlideUrl}
                  src={currentSlideUrl}
                  alt={`${cert.title} - Slide ${activeSlideIndex + 1}`}
                  onClick={() => setZoomed((z) => !z)}
                  className={`mx-auto shadow-2xl select-none transition-all duration-300 ${
                    zoomed
                      ? 'max-w-none w-[170%] cursor-zoom-out'
                      : 'max-w-full max-h-[58vh] lg:max-h-[66vh] object-contain cursor-zoom-in'
                  }`}
                />
              ) : showPdfEmbed ? (
                <iframe
                  src={`${cert.fileUrl}#view=FitH`}
                  title={cert.title}
                  className="w-full h-[58vh] lg:h-[66vh] bg-white shadow-2xl"
                />
              ) : (
                <div className="text-center py-16 px-6">
                  <span className="material-symbols-outlined text-6xl text-[#ffbb28] mb-3 block">
                    {getCertIcon(cert.category)}
                  </span>
                  <p className="font-mono text-xs text-[#ddc0b3]/70 uppercase tracking-widest">
                    Scan sertifikat belum diunggah
                  </p>
                </div>
              )}

              {/* Slide Prev / Next Arrows */}
              {hasMultipleSlides && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer z-20"
                    title="Slide Sebelumnya"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextSlide}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-xl cursor-pointer z-20"
                    title="Slide Berikutnya"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                  </button>
                </>
              )}

              {/* Cert Prev / Next Arrows (When Only 1 Slide in Cert) */}
              {!hasMultipleSlides && hasMultipleCerts && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevCert}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer z-20"
                    title="Sertifikat Sebelumnya"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">chevron_left</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextCert}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-[#171216]/85 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#56433b]/50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg cursor-pointer z-20"
                    title="Sertifikat Berikutnya"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip untuk Multi-Slide */}
            {hasMultipleSlides && (
              <div className="bg-[#120d10] border-t border-[#56433b]/40 px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-[#ffb597] uppercase font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">burst_mode</span>
                    Galeri Slide ({activeSlideIndex + 1} dari {slides.length} Halaman):
                  </span>
                  <div className="flex items-center gap-1">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setZoomed(false);
                          setActiveSlideIndex(i);
                        }}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          i === activeSlideIndex ? 'w-5 bg-[#ffbb28]' : 'w-2 bg-[#56433b] hover:bg-[#ddc0b3]'
                        }`}
                        aria-label={`Ke Halaman ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {slides.map((slideUrl, sIdx) => {
                    const isActive = sIdx === activeSlideIndex;
                    return (
                      <button
                        key={sIdx}
                        ref={(el) => (thumbRefs.current[sIdx] = el)}
                        type="button"
                        onClick={() => {
                          setZoomed(false);
                          setActiveSlideIndex(sIdx);
                        }}
                        className={`relative shrink-0 w-20 h-14 sm:w-24 sm:h-16 bg-[#0b080a] border-2 transition-all overflow-hidden cursor-pointer ${
                          isActive
                            ? 'border-[#ffbb28] shadow-[0_0_12px_rgba(255,187,40,0.5)] scale-105'
                            : 'border-[#56433b]/50 hover:border-[#ffbb28]/60 opacity-60 hover:opacity-100'
                        }`}
                        title={`Buka Halaman ${sIdx + 1}`}
                      >
                        <img src={slideUrl} alt="" className="w-full h-full object-contain p-1" />
                        <span
                          className={`absolute bottom-0 right-0 font-mono text-[9px] px-1 font-bold ${
                            isActive ? 'bg-[#ffbb28] text-[#281b00]' : 'bg-[#171216]/90 text-[#ddc0b3]'
                          }`}
                        >
                          {sIdx === 0 ? 'Depan' : sIdx === 1 ? 'Belakang' : `Hal. ${sIdx + 1}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Kolom Informasi Detail Sertifikat */}
          <div className="lg:col-span-4 p-5 sm:p-7 space-y-5">
            <div>
              <h2 className="font-headline text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#ebdfe4] leading-tight">
                {cert.title}
              </h2>
              {cert.description && (
                <p className="font-body text-sm text-[#ddc0b3] leading-relaxed mt-3 whitespace-pre-line">
                  {cert.description}
                </p>
              )}
            </div>

            <div className="bg-[#231e22] border border-[#56433b]/40 divide-y divide-[#56433b]/30 font-mono text-xs">
              {[
                ['Kategori', cert.category || '-'],
                ['Jumlah Slide', `${slides.length} Halaman`],
                ['Penerbit', cert.organizer || '-'],
                ['Tahun / Masa Berlaku', cert.year || '-'],
                ['No. / Keterangan', cert.credential || '-'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                  <span className="text-[#ddc0b3]/70 uppercase text-[10px] shrink-0">{k}</span>
                  <span className="text-[#ebdfe4] text-right break-words">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {cert.fileUrl && (
                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-4 py-3 flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  Buka File PDF Asli
                </a>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#171216] border border-[#ffbb28]/50 hover:border-[#ffbb28] text-[#ffbb28] font-mono text-xs uppercase tracking-wider px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  Verifikasi Keaslian Online
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CertificateCard;
