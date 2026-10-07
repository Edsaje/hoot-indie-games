import type { LocalizedText } from './game';

export type MicroIndiePlatform = 'itch' | 'steam' | 'web' | 'both';

export interface MicroIndieGame {
  id: string;
  title: string;
  developer: string;
  tagline: LocalizedText;
  description: LocalizedText;
  releaseYear: number;
  genre: string[];
  artStyle: LocalizedText;
  camera?: LocalizedText;
  platform: MicroIndiePlatform;
  itchUrl?: string;
  steamUrl?: string;
  playInBrowserUrl?: string;
  isFree: boolean;
  pricingText?: {
    fr: string;
    en: string;
    [key: string]: string | undefined;
  };
  jam?: string;
  coverImage: string;
  screenshots: string[];
  developerMessage?: LocalizedText;
  discoveredBy?: string;
  likesCount?: number;
  featured?: boolean;
  dateAdded: string;
  approved?: boolean;
  approvedAt?: string;
}

export interface MicroIndieSubmission {
  title: string;
  developer: string;
  pitch: string;
  platform: MicroIndiePlatform;
  itchUrl?: string;
  steamUrl?: string;
  playInBrowserUrl?: string;
  isFree: boolean;
  price?: string;
  genre: string;
  artStyle: string;
  jam?: string;
  coverImage: string;
  submittedBy: string;
  developerMessage?: string;
}
