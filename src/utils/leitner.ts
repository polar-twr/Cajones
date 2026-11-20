import { AppData, DrawerConfig, Flashcard, ParsedTxtResult, TopicBox } from '../types/leitner';

export const STORAGE_KEY = 'leitner_local_v1';

export const DEFAULT_INTERVALS = [1, 3, 7, 11, 16] as const;

export function createDefaultDrawers(): DrawerConfig[] {
  return DEFAULT_INTERVALS.map((intervalDays, idx) => ({
    id: String(idx + 1),
    name: `Cajón ${idx + 1}`,
    intervalDays,
  }));
}

export function formatIntervalLabel(intervalDays: number): string {
  return intervalDays === 1 ? 'Todos los días' : `Cada ${intervalDays} días`;
}

export interface DrawerColorTheme {
  rowBg: string;
  cardSurface: string;
  labelText: string;
  progressBar: string;
}

const DRAWER_COLOR_THEMES: DrawerColorTheme[] = [
  {
    // Cajón 1: Gris
    rowBg: 'bg-slate-100/70 dark:bg-slate-800/35',
    cardSurface: 'bg-slate-50/90 border-slate-300/80 dark:bg-[#171C23] dark:border-slate-700/70',
    labelText: 'text-slate-700 dark:text-slate-300',
    progressBar: 'bg-slate-500 dark:bg-slate-400',
  },
  {
    // Cajón 2: Azul
    rowBg: 'bg-[#EFF6FF]/85 dark:bg-[#172554]/35',
    cardSurface: 'bg-[#F5F9FF] border-[#BFDBFE] dark:bg-[#121B2B] dark:border-[#1E3A8A]/70',
    labelText: 'text-[#1E40AF] dark:text-[#93C5FD]',
    progressBar: 'bg-[#3B82F6] dark:bg-[#60A5FA]',
  },
  {
    // Cajón 3: Verde
    rowBg: 'bg-[#F0FDF4]/85 dark:bg-[#052E16]/35',
    cardSurface: 'bg-[#F5FCF7] border-[#BBF7D0] dark:bg-[#111E17] dark:border-[#166534]/70',
    labelText: 'text-[#166534] dark:text-[#86EFAC]',
    progressBar: 'bg-[#16A34A] dark:bg-[#4ADE80]',
  },
  {
    // Cajón 4: Salmón
    rowBg: 'bg-[#FFF1EE]/90 dark:bg-[#3B1813]/40',
    cardSurface: 'bg-[#FFF6F4] border-[#FBC4B8] dark:bg-[#231513] dark:border-[#7A3428]/75',
    labelText: 'text-[#A34230] dark:text-[#F7A99A]',
    progressBar: 'bg-[#E07A67] dark:bg-[#EB8A77]',
  },
  {
    // Cajón 5: Granate
    rowBg: 'bg-[#FDF2F4]/90 dark:bg-[#3A121D]/40',
    cardSurface: 'bg-[#FDF7F8] border-[#E2B4BE] dark:bg-[#221217] dark:border-[#6E2236]/75',
    labelText: 'text-[#7B1E36] dark:text-[#E89EB0]',
    progressBar: 'bg-[#9E2A47] dark:bg-[#C44D69]',
  },
];

export function getDrawerColorTheme(index: number): DrawerColorTheme {
  const safeIndex = ((index % DRAWER_COLOR_THEMES.length) + DRAWER_COLOR_THEMES.length) % DRAWER_COLOR_THEMES.length;
  return DRAWER_COLOR_THEMES[safeIndex];
}

export function shuffleItems<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToLocalDate(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

export function diffDaysLocal(fromStr: string, toStr: string): number {
  const [y1, m1, d1] = fromStr.split('-').map(Number);
  const [y2, m2, d2] = toStr.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / 86400000);
}

export function isCardDue(card: Flashcard, todayStr: string): boolean {
  return card.dueDate <= todayStr;
}

export function formatRelativeDue(dueDate: string, todayStr: string): string {
  const diff = diffDaysLocal(todayStr, dueDate);
  if (diff <= 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  return `En ${diff} días`;
}

export function applyReviewResult(
  card: Flashcard,
  drawers: DrawerConfig[],
  knewIt: boolean,
  todayStr: string
): Flashcard {
  const safeDrawers = drawers.length > 0 ? drawers : createDefaultDrawers();
  const currentIdx = safeDrawers.findIndex((d) => d.id === card.drawerId);
  const resolvedIdx = currentIdx >= 0 ? currentIdx : 0;

  const targetDrawer = knewIt
    ? safeDrawers[Math.min(safeDrawers.length - 1, resolvedIdx + 1)]
    : safeDrawers[0];

  return {
    ...card,
    drawerId: targetDrawer.id,
    dueDate: addDaysToLocalDate(todayStr, targetDrawer.intervalDays),
    lastReviewedAt: new Date().toISOString(),
  };
}

export function parseTxtContent(content: string): ParsedTxtResult {
  const lines = content.split(/\r?\n/);
  const valid: Array<{ question: string; answer: string }> = [];
  const skipped: Array<{ lineNumber: number; text: string; reason: string }> = [];

  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    const slashIndex = trimmed.indexOf('/');
    if (slashIndex === -1) {
      skipped.push({
        lineNumber: index + 1,
        text: trimmed,
        reason: 'Falta la barra "/" entre pregunta y respuesta',
      });
      return;
    }

    const question = trimmed.slice(0, slashIndex).trim();
    const answer = trimmed.slice(slashIndex + 1).trim();

    if (!question || !answer) {
      skipped.push({
        lineNumber: index + 1,
        text: trimmed,
        reason: !question ? 'Pregunta vacía' : 'Respuesta vacía',
      });
      return;
    }

    valid.push({ question, answer });
  });

  return { valid, skipped };
}

export function exportTopicToTxt(cards: Flashcard[]): string {
  return cards.map((card) => `${card.question} / ${card.answer}`).join('\n');
}

export function getPreferredTheme(): 'light' | 'dark' {
  if (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

export function normalizeAppData(parsed: Partial<AppData>): AppData {
  const topics: TopicBox[] = Array.isArray(parsed.topics)
    ? parsed.topics
        .filter(
          (t): t is TopicBox =>
            Boolean(t && typeof t.id === 'string' && typeof t.name === 'string')
        )
        .map((t) => {
          const validDrawers =
            Array.isArray(t.drawers) && t.drawers.length > 0
              ? t.drawers
                  .filter(
                    (d) =>
                      Boolean(
                        d &&
                          typeof d.id === 'string' &&
                          typeof d.name === 'string' &&
                          typeof d.intervalDays === 'number' &&
                          d.intervalDays >= 1
                      )
                  )
                  .map((d) => ({
                    ...d,
                    intervalDays: Math.max(1, Math.round(d.intervalDays)),
                  }))
              : createDefaultDrawers();

          return {
            id: t.id,
            name: t.name,
            createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date().toISOString(),
            drawers: validDrawers.length > 0 ? validDrawers : createDefaultDrawers(),
          };
        })
    : [];

  const topicMap = new Map(topics.map((t) => [t.id, t]));

  const cards: Flashcard[] = Array.isArray(parsed.cards)
    ? parsed.cards
        .filter((c): c is Flashcard => {
          if (
            !c ||
            typeof c.id !== 'string' ||
            typeof c.topicId !== 'string' ||
            !topicMap.has(c.topicId) ||
            typeof c.question !== 'string' ||
            typeof c.answer !== 'string' ||
            typeof c.dueDate !== 'string'
          ) {
            return false;
          }
          return typeof c.drawerId === 'string' || typeof c.box === 'number';
        })
        .map((c) => {
          const topic = topicMap.get(c.topicId)!;
          const legacyId = typeof c.box === 'number' ? String(c.box) : '';
          const candidateId = typeof c.drawerId === 'string' ? c.drawerId : legacyId;
          const hasDrawer = topic.drawers.some((d) => d.id === candidateId);
          return {
            id: c.id,
            topicId: c.topicId,
            question: c.question,
            answer: c.answer,
            drawerId: hasDrawer ? candidateId : topic.drawers[0].id,
            dueDate: c.dueDate,
            createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString(),
            lastReviewedAt: c.lastReviewedAt,
          };
        })
    : [];

  const theme =
    parsed.theme === 'dark' || parsed.theme === 'light'
      ? parsed.theme
      : getPreferredTheme();

  return { topics, cards, theme };
}

export function loadAppData(): AppData {
  const defaultData: AppData = {
    topics: [],
    cards: [],
    theme: getPreferredTheme(),
  };

  if (typeof window === 'undefined') return defaultData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return normalizeAppData(parsed);
  } catch {
    return defaultData;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function buildSampleData(todayStr: string): {
  topics: TopicBox[];
  cards: Flashcard[];
} {
  const now = new Date().toISOString();
  const topic1Id = createId();
  const topic2Id = createId();

  const topics: TopicBox[] = [
    {
      id: topic1Id,
      name: 'Vocabulario en inglés',
      createdAt: now,
      drawers: createDefaultDrawers(),
    },
    {
      id: topic2Id,
      name: 'Cultura general',
      createdAt: now,
      drawers: createDefaultDrawers(),
    },
  ];

  const cards: Flashcard[] = [
    {
      id: createId(),
      topicId: topic1Id,
      question: 'Resilient',
      answer: 'Resiliente, capaz de recuperarse rápido',
      drawerId: '1',
      dueDate: todayStr,
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic1Id,
      question: 'Overwhelming',
      answer: 'Abrumador / abrumadora',
      drawerId: '1',
      dueDate: todayStr,
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic1Id,
      question: 'Nevertheless',
      answer: 'Sin embargo, no obstante',
      drawerId: '2',
      dueDate: addDaysToLocalDate(todayStr, 2),
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic1Id,
      question: 'Thorough',
      answer: 'Minucioso, exhaustivo',
      drawerId: '3',
      dueDate: todayStr,
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic2Id,
      question: '¿Cuál es el río más largo de la península ibérica?',
      answer: 'El río Tajo',
      drawerId: '1',
      dueDate: todayStr,
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic2Id,
      question: '¿En qué año llegó el ser humano a la Luna?',
      answer: 'En 1969 (Apolo 11)',
      drawerId: '2',
      dueDate: todayStr,
      createdAt: now,
    },
    {
      id: createId(),
      topicId: topic2Id,
      question: '¿Qué elemento químico tiene el símbolo Au?',
      answer: 'El oro',
      drawerId: '4',
      dueDate: addDaysToLocalDate(todayStr, 9),
      createdAt: now,
    },
  ];

  return { topics, cards };
}
