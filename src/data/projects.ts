import rawProjects from './projectsData.json';

export type ProjectCategory = 'Fotografi' | 'Desain Grafis' | 'Videografi';

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  subCategory: string;
  year: number;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[];
  altText: string;
  tags: string[];
  tools: string[];
  popularity: number;
  featured?: boolean;
  videoUrl?: string;
  videoType?: 'landscape' | 'portrait';
  instagramUrl?: string;
  client?: string;
  badge?: string;
  location?: string;
  duration?: string;
}

export const projectsData: Project[] = rawProjects as Project[];

export const projects: Project[] = projectsData;

export const getPhotographyProjects = (): Project[] =>
  projectsData.filter((p) => p.category === 'Fotografi');

export const getGraphicDesignProjects = (): Project[] =>
  projectsData.filter((p) => p.category === 'Desain Grafis');

export const getVideographyProjects = (): Project[] =>
  projectsData.filter((p) => p.category === 'Videografi');
