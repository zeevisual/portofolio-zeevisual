import React, { useMemo, useState } from 'react';
import { certifications, Certification, CERTIFICATE_CATEGORIES } from '../data/profile';
import Breadcrumb from '../components/Breadcrumb';
import { ScrollReveal } from '../components/InteractiveEffects';
import { CertificateCard, CertificateModal, getCertIcon } from '../components/CertificateViewer';

const Certificates: React.FC = () => {
  const allCerts: Certification[] = certifications || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  // Kategori: urutan bawaan dulu, lalu kategori custom buatan admin
  const categories = useMemo(() => {
    const used = Array.from(new Set(allCerts.map((c) => c.category || 'Lainnya')));
    const ordered = [
      ...CERTIFICATE_CATEGORIES.filter((c) => used.includes(c)),
      ...used.filter((c) => !CERTIFICATE_CATEGORIES.includes(c)),
    ];
    return ['Semua', ...ordered];
  }, [allCerts]);

  const countOf = (cat: string) =>
    cat === 'Semua' ? allCerts.length : allCerts.filter((c) => (c.category || 'Lainnya') === cat).length;

  const filtered = useMemo(() => {
    if (selectedCategory === 'Semua') return allCerts;
    return allCerts.filter((c) => (c.category || 'Lainnya') === selectedCategory);
  }, [allCerts, selectedCategory]);

  return (
    <div className="min-h-screen bg-transparent">
      <Breadcrumb currentPage="Sertifikat" subtitle={`${filtered.length} Sertifikat`} />

      <main className="py-6 sm:py-10 px-3 sm:px-6 max-w-[1200px] mx-auto">
        {/* Header */}
        <ScrollReveal direction="up">
          <header className="mb-6 border-b border-[#56433b]/30 pb-5">
            <span className="font-mono text-[10px] sm:text-xs text-[#ffbb28] uppercase tracking-widest block mb-1">
              Galeri Sertifikat & Kredensial
            </span>
            <h1 className="font-headline text-xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#ebdfe4] mb-2">
              Sertifikat
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#ddc0b3] max-w-xl leading-relaxed">
              Kumpulan sertifikat kompetisi, sertifikasi kompetensi BNSP, pelatihan, dan seminar yang
              menjadi bukti kompetensi dan perjalanan profesional Ziyad Fadhillah (Zeevisual).
            </p>
          </header>
        </ScrollReveal>

        {/* Filter Kategori */}
        <ScrollReveal direction="up" delay={60}>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  data-sound="tab"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#ffbb28] text-[#281b00] font-bold shadow-[0_4px_14px_rgba(255,187,40,0.3)] -translate-y-0.5'
                      : 'bg-[#231e22] text-[#ddc0b3] hover:text-[#ebdfe4] hover:border-[#ffbb28]/50 border border-[#56433b]/40'
                  }`}
                >
                  {cat !== 'Semua' && (
                    <span className="material-symbols-outlined text-xs">{getCertIcon(cat)}</span>
                  )}
                  <span>{cat}</span>
                  <span className={`text-[9px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    ({countOf(cat)})
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Grid (2 cols on mobile, 4 cols on desktop) */}
        {filtered.length === 0 ? (
          <div className="py-14 text-center rounded-xl bg-[#231e22]/50 border border-[#56433b]/30 p-6 max-w-md mx-auto">
            <span className="material-symbols-outlined text-3xl text-[#ffbb28] mb-2 block">workspace_premium</span>
            <p className="font-headline text-sm uppercase text-[#ebdfe4] mb-1">Belum ada sertifikat</p>
            <p className="font-body text-xs text-[#ddc0b3]">
              Sertifikat pada kategori ini akan tampil di sini.
            </p>
          </div>
        ) : (
          <div
            key={selectedCategory}
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {filtered.map((cert, idx) => (
              <ScrollReveal key={cert.id} delay={idx * 55} direction="up">
                <CertificateCard cert={cert} onOpen={setSelectedCert} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </main>

      <CertificateModal
        cert={selectedCert}
        list={filtered}
        onClose={() => setSelectedCert(null)}
        onSelect={setSelectedCert}
      />
    </div>
  );
};

export default Certificates;
