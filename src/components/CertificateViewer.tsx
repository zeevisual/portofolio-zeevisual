import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Certification, CERTIFICATE_CATEGORY_ICONS } from '../data/profile';
import { InteractiveCard } from './InteractiveEffects';

export const getCertIcon = (category?: string) =>
  CERTIFICATE_CATEGORY_ICONS[category || ''] || 'workspace_premium';

const isPdf = (url?: string) => Boolean(url && /\.pdf($|\?)/i.test(url));

/* ------------------------------------------------------------------ */
/* Kartu Sertifikat                                                    */
/* ------------------------------------------------------------------ */
interface CertificateCardProps {
  cert: Certification;
  onOpen: (cert: Certification) => void;
  compact?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onOpen, compact }) => {
  const hasImage = Boolean(cert.image);
  const hasPdf = Boolean(cert.fileUrl);

  return (
    <InteractiveCard
      onClick={() => onOpen(cert)}
      tiltIntensity={3}
      glowColor="rgba(255, 187, 40, 0.16)"
      className="h-full group bg-[#231e22] border border-[#56433b]/30 hover:border-[#ffbb28] cursor-pointer flex flex-col transition-all duration-300"
    >
      {/* Media */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#120d10]">
        {hasImage ? (
          <>
            <img
              src={cert.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-125"
            />
            <img
              src={cert.image}
              alt={cert.title}
              loading="lazy"
              className="relative z-10 w-full h-full object-contain p-3 sm:p-4 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
          </>
        ) : (
          /* Placeholder elegan bila belum ada scan sertifikat */
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
        <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/35 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-[#ffbb28] text-[#281b00] font-mono text-[11px] font-bold uppercase px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
            <span className="material-symbols-outlined text-sm">open_in_full</span>
            Lihat Sertifikat
          </span>
        </div>

        {/* Badges */}
        {cert.category && (
          <span className="absolute top-2.5 left-2.5 z-30 bg-[#171216]/90 text-[#ffbb28] font-mono text-[10px] px-2.5 py-0.5 uppercase border border-[#56433b]/50 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">{getCertIcon(cert.category)}</span>
            {cert.category}
          </span>
        )}
        {hasPdf && (
          <span className="absolute top-2.5 right-2.5 z-30 bg-[#a53c00]/90 text-[#ffdbcd] font-mono text-[10px] px-2 py-0.5 uppercase border border-[#ffb597]/40">
            PDF
          </span>
        )}
      </div>

      {/* Content */}
      <div className={`${compact ? 'p-4' : 'p-5'} flex-1 flex flex-col justify-between gap-3`}>
        <div>
          <span className="font-mono text-[11px] text-[#ffb597] uppercase tracking-wider block mb-1">
            {cert.year}
          </span>
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
/* Viewer Sertifikat Layar Penuh                                       */
/* ------------------------------------------------------------------ */
interface CertificateModalProps {
  cert: Certification | null;
  list: Certification[];
  onClose: () => void;
  onSelect: (cert: Certification) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ cert, list, onClose, onSelect }) => {
  const [zoomed, setZoomed] = useState(false);
  const idx = cert ? list.findIndex((c) => c.id === cert.id) : -1;
  const canNav = list.length > 1 && idx !== -1;

  const go = (dir: 1 | -1) => {
    if (!canNav) return;
    onSelect(list[(idx + dir + list.length) % list.length]);
  };

  useEffect(() => {
    setZoomed(false);
  }, [cert?.id]);

  useEffect(() => {
    if (!cert) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cert, idx, list]);

  if (!cert) return null;

  const showPdfEmbed = !cert.image && isPdf(cert.fileUrl);

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
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 bg-[#231e22] border-b border-[#56433b]/40 shrink-0 gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="bg-[#ffbb28] text-[#281b00] font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">{getCertIcon(cert.category)}</span>
              {cert.category || 'Sertifikat'}
            </span>
            <span className="font-mono text-xs text-[#ddc0b3]">{cert.year}</span>
            {canNav && (
              <span className="font-mono text-[10px] text-[#ddc0b3]/60">
                {idx + 1} / {list.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {cert.image && (
              <button
                onClick={() => setZoomed((z) => !z)}
                className="flex items-center gap-1 font-mono text-xs uppercase text-[#ddc0b3] hover:text-[#ffbb28] px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">{zoomed ? 'zoom_out' : 'zoom_in'}</span>
                <span className="hidden sm:inline">{zoomed ? 'Normal' : 'Perbesar'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 font-mono text-xs uppercase text-[#ddc0b3] hover:text-[#ffbb28] px-2.5 py-1 bg-[#171216] border border-[#56433b]/50 hover:border-[#ffbb28] transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <span className="hidden sm:inline">Tutup</span>
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12">
          {/* Media */}
          <div
            className={`relative lg:col-span-8 bg-[#0b080a] flex items-center justify-center p-3 sm:p-6 min-h-[260px] ${
              zoomed ? 'overflow-auto' : ''
            }`}
          >
            {cert.image ? (
              <img
                src={cert.image}
                alt={cert.title}
                onClick={() => setZoomed((z) => !z)}
                className={`mx-auto shadow-2xl select-none transition-all duration-300 ${
                  zoomed
                    ? 'max-w-none w-[160%] cursor-zoom-out'
                    : 'max-w-full max-h-[62vh] lg:max-h-[74vh] object-contain cursor-zoom-in'
                }`}
              />
            ) : showPdfEmbed ? (
              <iframe
                src={`${cert.fileUrl}#view=FitH`}
                title={cert.title}
                className="w-full h-[62vh] lg:h-[74vh] bg-white"
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

            {canNav && (
              <>
                <button
                  onClick={() => go(-1)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all z-20 cursor-pointer"
                  title="Sertifikat Sebelumnya"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => go(1)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#171216]/90 hover:bg-[#ffbb28] text-[#ebdfe4] hover:text-[#281b00] border border-[#ffbb28]/50 flex items-center justify-center transition-all z-20 cursor-pointer"
                  title="Sertifikat Berikutnya"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-4 p-5 sm:p-7 space-y-5 border-t lg:border-t-0 lg:border-l border-[#56433b]/30">
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
                  className="w-full bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                  Buka File PDF
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
                  Verifikasi Keaslian
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
