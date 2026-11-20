import React from 'react';
import { ChevronRight, Play, Plus } from 'lucide-react';
import { Flashcard, TopicBox } from '../types/leitner';
import { isCardDue } from '../utils/leitner';

interface TopicListProps {
  topics: TopicBox[];
  cards: Flashcard[];
  todayStr: string;
  selectedTopicId: string | null;
  onSelectTopic: (topicId: string) => void;
  onStartStudyTopic: (topicId: string) => void;
  onOpenNewTopic: () => void;
  onLoadSample: () => void;
  contained?: boolean;
}

export const TopicList: React.FC<TopicListProps> = ({
  topics,
  cards,
  todayStr,
  selectedTopicId,
  onSelectTopic,
  onStartStudyTopic,
  onOpenNewTopic,
  onLoadSample,
  contained = false,
}) => {
  const totalDue = cards.filter((c) => isCardDue(c, todayStr)).length;

  if (topics.length === 0) {
    return (
      <div
        className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#16191F] ${
          contained ? '' : 'sm:p-8'
        }`}
      >
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
          Tus cajas temáticas de estudio
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Organiza tus preguntas en cajones de repaso espaciado (por defecto 1, 3, 7, 11 y 16 días). Todo se guarda únicamente en este dispositivo.
        </p>

        <div
          className={`mt-6 flex flex-col gap-3 ${
            contained ? '' : 'sm:flex-row sm:items-center'
          }`}
        >
          <button
            type="button"
            onClick={onOpenNewTopic}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Crear primera caja</span>
          </button>

          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-zinc-200 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/70 whitespace-nowrap shrink-0"
          >
            Cargar caja de ejemplo
          </button>
        </div>
      </div>
    );
  }

  return (
    <section aria-label="Temáticas disponibles">
      <div className="mb-3 flex items-baseline justify-between px-1">
        <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Temáticas
        </h1>
        <p className="font-mono-tabular text-xs text-zinc-500 dark:text-zinc-400">
          {totalDue} {totalDue === 1 ? 'pendiente hoy' : 'pendientes hoy'} · {topics.length}{' '}
          {topics.length === 1 ? 'caja' : 'cajas'}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-200/80 dark:border-zinc-800 dark:bg-[#16191F] dark:divide-zinc-800/80">
        {topics.map((topic) => {
          const topicCards = cards.filter((c) => c.topicId === topic.id);
          const dueCount = topicCards.filter((c) => isCardDue(c, todayStr)).length;
          const pendingRatio = topicCards.length > 0 ? dueCount / topicCards.length : 0;
          const isSelected = selectedTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className={`group flex items-center justify-between gap-3 px-4 py-3.5 transition-colors ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-blue-950/25'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectTopic(topic.id)}
                className="flex min-h-[48px] min-w-0 flex-1 flex-col items-start justify-center text-left focus-visible:outline-2 focus-visible:outline-blue-600 rounded-lg"
              >
                <span className="w-full truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
                  {topic.name}
                </span>

                <div
                  className="mt-1.5 h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-800"
                  role="progressbar"
                  aria-valuenow={dueCount}
                  aria-valuemin={0}
                  aria-valuemax={topicCards.length}
                  aria-label={`${dueCount} pendientes hoy de ${topicCards.length} tarjetas`}
                >
                  <div
                    className="h-full w-full origin-left rounded-full bg-blue-600 transition-transform duration-200 dark:bg-blue-500"
                    style={{ transform: `scaleX(${pendingRatio})` }}
                  />
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <span
                    className={`tabular-nums font-medium ${
                      dueCount > 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {dueCount > 0 ? `${dueCount} para hoy` : 'Al día'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {topicCards.length} {topicCards.length === 1 ? 'tarjeta' : 'tarjetas'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {topic.drawers.length} {topic.drawers.length === 1 ? 'cajón' : 'cajones'}
                  </span>
                </div>

                {topicCards.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px] text-zinc-400 dark:text-zinc-500">
                    {topic.drawers.map((drawer, idx) => {
                      const count = topicCards.filter((c) => c.drawerId === drawer.id).length;
                      return (
                        <React.Fragment key={drawer.id}>
                          {idx > 0 && <span aria-hidden="true">/</span>}
                          <span title={drawer.name}>
                            C{idx + 1}:{count}
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {dueCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onStartStudyTopic(topic.id)}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
                    aria-label={`Repasar ${topic.name}`}
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Repasar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectTopic(topic.id)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/60 hover:text-zinc-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 focus-visible:outline-2 focus-visible:outline-blue-600"
                  aria-label={`Abrir ${topic.name}`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
