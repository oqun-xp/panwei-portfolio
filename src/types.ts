export interface SocialLink {
  label: string;
  url: string;
}

export interface TimelineItem {
  title: string;
  subtitle: string;
  period: string;
  description: string;
}

export interface Profile {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
  github: string;
  socials: SocialLink[];
  education: TimelineItem[];
  experience: TimelineItem[];
}

export interface Skill {
  id: string;
  category: string;
  name: string;
  level: number;
}

export interface Project {
  id: string;
  title: string;
  summary: string;
  description: string;
  cover: string;
  tags: string[];
  link: string;
  repo: string;
  featured: boolean;
  date: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  date: string;
  cover: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Settings {
  siteTitle: string;
  accent: string;
  footerText: string;
}

export interface ContentData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  posts: Post[];
  messages?: Message[];
  settings: Settings;
  updatedAt: string;
}

export interface AuthUser {
  name: string;
}

export type ToastKind = 'success' | 'error' | 'info';
