export interface BuilderLesson {
  _id: string;
  title: string;
  videoId: string;
  duration: string;
  isPreview: boolean;
  note: string;
}

export interface BuilderSection {
  _id: string;
  sectionTitle: string;
  lessons: BuilderLesson[];
}

export interface BuilderDemoClass {
  _id: string;
  title: string;
  description: string;
  videoId: string;
  durationLabel: string;
}

export interface FormData {
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  level: string;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  previewVideoId: string;
}

export interface CourseFormInitial {
  _id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  longDescription?: string;
  category?: string;
  level?: string;
  price?: number;
  isFree?: boolean;
  isPublished?: boolean;
  previewVideoId?: string;
  thumbnail?: string;
  curriculum?: Array<{
    _id?: string;
    sectionTitle: string;
    lessons: Array<{
      _id?: string;
      title: string;
      videoId?: string;
      duration?: string;
      isPreview?: boolean;
      note?: string;
    }>;
  }>;
  demoClasses?: Array<{
    _id?: string;
    title: string;
    description?: string;
    videoId?: string;
    durationLabel?: string;
  }>;
}

export type TabKey = 'details' | 'media' | 'curriculum' | 'settings';

export type TabErrors = Record<TabKey, string[]>;
