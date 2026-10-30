import rawProfile from './profileData.json';

export interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  period: string;
  status: string;
  location: string;
  gpa: string;
  description: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  title: string;
  company: string;
  period: string;
  type: string;
  location: string;
  division: string;
  description: string;
  highlights: string[];
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  rank: string;
  level: string;
  year: string;
  description: string;
  icon: string;
}

export interface Certification {
  id: string;
  title: string;
  organizer: string;
  year: string;
  credential: string;
  /** Kategori sertifikat, mis. "Lomba", "BNSP", "Pelatihan", "Seminar", "Kepanitiaan", "Lainnya" */
  category: string;
  /** Gambar utama / sampul depan sertifikat (JPG/PNG) */
  image: string;
  /** Daftar foto/scan slide jika sertifikat memiliki lebih dari 1 halaman (depan, belakang, transkrip nilai, dll.) */
  images: string[];
  /** File PDF sertifikat (opsional) */
  fileUrl: string;
  /** Link verifikasi online (opsional), mis. halaman verifikasi BNSP / Dicoding */
  credentialUrl: string;
  /** Keterangan singkat (opsional) */
  description: string;
}

/** Kategori bawaan sertifikat (urutan tampil di filter). Kategori baru buatan admin tetap otomatis muncul. */
export const CERTIFICATE_CATEGORIES: string[] = [
  'Lomba',
  'BNSP',
  'Pelatihan',
  'Seminar',
  'Kepanitiaan',
  'Lainnya',
];

export const CERTIFICATE_CATEGORY_ICONS: Record<string, string> = {
  Lomba: 'emoji_events',
  BNSP: 'verified',
  Pelatihan: 'school',
  Seminar: 'record_voice_over',
  Kepanitiaan: 'groups',
  Lainnya: 'workspace_premium',
};

export interface SkillCategory {
  title: string;
  items: { name: string }[];
}

export interface Service {
  id: string;
  title: string;
  icon: string;
  colorClass: string;
  description: string;
  scopes: string[];
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface SiteTexts {
  heroBadge: string;
  marqueeItems: string[];
  aboutTitle: string;
  homePhotoTitle: string;
  homePhotoDesc: string;
  homeDesignTitle: string;
  homeDesignDesc: string;
  homeVideoTitle: string;
  homeVideoDesc: string;
  contactTitle: string;
  contactDesc: string;
  allProjectsTitle: string;
  allProjectsDesc: string;
  photographyPageTitle: string;
  photographyPageDesc: string;
  graphicDesignPageTitle: string;
  graphicDesignPageDesc: string;
  videographyPageTitle: string;
  videographyPageDesc: string;
  footerDesc: string;
}

export interface ProfileData {
  name: string;
  fullName: string;
  brand: string;
  brandName: string;
  tagline: string;
  role: string;
  roles: string[];
  heroSubtitle: string;
  shortBio: string;
  extendedBio: string;
  bio: string;
  location: string;
  email: string;
  instagram: string;
  instagramHandle: string;
  linkedinHandle: string;
  whatsapp: string;
  linkedin: string;
  cvUrl: string;
  avatarUrl: string;
  socials: {
    instagram: string;
    linkedin: string;
    whatsapp: string;
    youtube: string;
  };
  stats: StatItem[];
  siteTexts: SiteTexts;
  education: Education;
  educationList?: Education[];
  experiences: Experience[];
  achievements: Achievement[];
  awards?: Achievement[];
  certifications?: Certification[];
  skillCategories?: SkillCategory[];
  services: Service[];
}

export const educationList: Education[] = rawProfile.educationList as Education[];
export const experiences: Experience[] = rawProfile.experiences as Experience[];
export const awards: Achievement[] = rawProfile.awards as Achievement[];
export const certifications: Certification[] = rawProfile.certifications as Certification[];
export const skillCategories: SkillCategory[] = rawProfile.skillCategories as SkillCategory[];
export const services: Service[] = rawProfile.services as Service[];
export const statsList: StatItem[] = rawProfile.stats as StatItem[];
export const siteTexts: SiteTexts = rawProfile.siteTexts as SiteTexts;

export const profileData: ProfileData = {
  ...(rawProfile as unknown as ProfileData),
  stats: statsList,
  siteTexts,
  education: educationList[0],
  experiences,
  achievements: awards,
  services,
};
