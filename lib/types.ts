export type Magazine = {
  id: number;
  slug: string;
  title: string;
  issue: string;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  pageCount: number;
  pages: string[];
  pageRatio: number;
  publishedAt: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MagazineInput = Omit<Magazine, "id" | "createdAt" | "updatedAt">;

export type HeroSettings = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
};
