export type ThemeMode = 'light' | 'dark';

export interface DrawerConfig {
  id: string;
  name: string;
  intervalDays: number;
}

export interface TopicBox {
  id: string;
  name: string;
  createdAt: string;
  drawers: DrawerConfig[];
}

export interface Flashcard {
  id: string;
  topicId: string;
  question: string;
  answer: string;
  drawerId: string;
  box?: number; // legacy field for automatic migration
  dueDate: string; // YYYY-MM-DD local calendar date
  createdAt: string;
  lastReviewedAt?: string;
}

export interface AppData {
  topics: TopicBox[];
  cards: Flashcard[];
  theme: ThemeMode;
}

export interface SkippedImportLine {
  lineNumber: number;
  text: string;
  reason: string;
}

export interface ParsedTxtResult {
  valid: Array<{ question: string; answer: string }>;
  skipped: SkippedImportLine[];
}
