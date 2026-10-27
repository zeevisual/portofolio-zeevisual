import React, { useState } from 'react';
import { profileData } from '../data/profile';

const ContactForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Fotografi');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    const subject = encodeURIComponent(`Kolaborasi ${category} - ${name}`);
    const body = encodeURIComponent(
      `Halo Ziyad (Zeevisual),\n\nSaya ${name} (${email}).\nKategori Kebutuhan: ${category}\n\nPesan:\n${message}`
    );
    window.open(`mailto:${profileData.email}?subject=${subject}&body=${body}`, '_blank');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Halo Ziyad (Zeevisual), saya ${name || 'klien'} ingin berdiskusi mengenai proyek ${category}. ${message}`
    );
    window.open(`${profileData.socials.whatsapp}?text=${text}`, '_blank');
  };

  return (
    <div className="bg-[#231e22] border border-[#56433b]/40 p-5 sm:p-8 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#56433b]/30 pb-4 mb-6">
        <span className="font-headline text-sm sm:text-base font-bold uppercase tracking-tight text-[#ebdfe4]">
          Formulir Pesan & Kolaborasi
        </span>
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#ffbb28]">
          <span className="w-2 h-2 rounded-full bg-[#ffbb28] animate-pulse"></span>
          Tersedia untuk Proyek
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#ddc0b3] mb-1.5">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full bg-[#171216] border border-[#56433b]/50 focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4] font-body outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[#ddc0b3] mb-1.5">
              Alamat Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full bg-[#171216] border border-[#56433b]/50 focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4] font-body outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#ddc0b3] mb-1.5">
            Kategori Proyek
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#171216] border border-[#56433b]/50 focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4] font-mono outline-none transition-colors"
          >
            <option value="Fotografi">Fotografi (Dokumentasi / Potret / Event)</option>
            <option value="Desain Grafis">Desain Grafis (Identitas Visual / Publikasi / Kampanye)</option>
            <option value="Videografi">Videografi (Aftermovie / Profil / Sinematik)</option>
            <option value="Lainnya">Kolaborasi Kreatif Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block font-mono text-[11px] uppercase tracking-wider text-[#ddc0b3] mb-1.5">
            Detail Kebutuhan Proyek *
          </label>
          <textarea
            rows={4}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ceritakan gambaran singkat proyek, jadwal, atau kebutuhan visual Anda..."
            className="w-full bg-[#171216] border border-[#56433b]/50 focus:border-[#ffbb28] px-3.5 py-2.5 text-sm text-[#ebdfe4] font-body outline-none transition-colors resize-y"
          />
        </div>

        {submitted && (
          <div className="p-3 bg-[#ffbb28]/15 border border-[#ffbb28] font-mono text-xs text-[#ffbb28]">
            Aplikasi email Anda telah dibuka untuk mengirim pesan kepada Ziyad Fadhillah.
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-[#a53c00] hover:bg-[#ffbb28] text-[#ffdbcd] hover:text-[#281b00] font-headline font-bold text-xs uppercase tracking-widest py-3.5 px-6 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Kirim via Email
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 bg-[#171216] hover:bg-[#2e282c] text-[#ebdfe4] border border-[#56433b] hover:border-[#ffbb28] font-mono text-xs uppercase tracking-widest py-3.5 px-6 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base text-[#ffbb28]">chat</span>
            Chat WhatsApp
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
