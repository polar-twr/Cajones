import React, { useMemo, useState } from 'react';
import {
  FileText,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { Flashcard, TopicBox } from '../types/leitner';
import { formatIntervalLabel, getDrawerColorTheme, isCardDue } from '../utils/leitner';

interface TopicDetailProps {
  topic: TopicBox;
  cards: Flashcard[];
  todayStr: string;
  onStartStudyDue: () => void;
  onStartPracticeAll: () => void;
  onOpenAddCard: () => void;
  onOpenImportTxt: () => void;
  onOpenConfigureDrawers: () => void;
  onDeleteDrawer: (drawerId: string) => void;
  onRenameTopic: () => void;
  onDeleteTopic: () => void;
  contained?: boolean;
}

export const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  cards,
  todayStr,
  onStartStudyDue,
  onStartPracticeAll,
  onOpenAddCard,
  onOpenImportTxt,
  onOpenConfigureDrawers,
  onDeleteDrawer,
  onRenameTopic,
  onDeleteTopic,
  contained = false,
}) => {
  const [confirmDeleteTopic, setConfirmDeleteTopic] = useState(false);
  const [confirmDeleteDrawerId, setConfirmDeleteDrawerId] = useState<string | null>(null);

  const dueCards = useMemo(
    () => cards.filter((c) => isCardDue(c, todayStr)),
    [cards, todayStr]
  );

  return (
    <div className="space-y-6">
      {/* Topic Header & Primary CTA Card */}
      <div
        className={`rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#16191F] ${
          contained ? '' : 'sm:p-6'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              className={`text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance ${
                contained ? '' : 'sm:text-2xl'
              }`}
            >
              {topic.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 tabular-nums">
              {dueCards.length} {dueCards.length === 1 ? 'pendiente hoy' : 'pendientes hoy'} ·{' '}
              {cards.length} {cards.length === 1 ? 'tarjeta en total' : 'tarjetas en total'}
            </p>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onRenameTopic}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="Renombrar caja"
              title="Renombrar caja"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteTopic((v) => !v)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
              aria-label="Eliminar caja"
              title="Eliminar caja"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {confirmDeleteTopic && (
          <div
            className={`mt-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30 ${
              contained ? '' : 'sm:flex-row sm:items-center sm:justify-between'
            }`}
          >
            <p className="text-sm text-rose-900 dark:text-rose-200">
              ¿Eliminar la caja «{topic.name}» y sus {cards.length} tarjetas?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmDeleteTopic(false)}
                className="min-h-[44px] rounded-lg px-3.5 py-2 text-xs font-medium text-zinc-700 hover:bg-white/80 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteTopic(false);
                  onDeleteTopic();
                }}
                className="min-h-[44px] rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-rose-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        )}

        {/* Primary Study CTA + Add Actions */}
        <div
          className={`mt-5 flex flex-col gap-2.5 ${
            contained ? '' : 'sm:flex-row sm:flex-wrap sm:items-center'
          }`}
        >
          {dueCards.length > 0 ? (
            <button
              type="button"
              onClick={onStartStudyDue}
              className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap shrink-0 ${
                contained ? '' : 'sm:w-auto'
              }`}
            >
              <Play className="h-4 w-4 fill-current" />
              <span className="tabular-nums">
                Repasar pendientes ({dueCards.length})
              </span>
            </button>
          ) : cards.length > 0 ? (
            <button
              type="button"
              onClick={onStartPracticeAll}
              className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-100 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-100 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0 ${
                contained ? '' : 'sm:w-auto'
              }`}
            >
              <RotateCcw className="h-4 w-4" />
              <span>Practicar toda la caja</span>
            </button>
          ) : null}

          <div
            className={`grid grid-cols-2 gap-2.5 ${
              contained ? '' : 'sm:flex sm:items-center'
            }`}
          >
            <button
              type="button"
              onClick={onOpenAddCard}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800/60 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Añadir tarjeta</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportTxt}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800/60 whitespace-nowrap shrink-0"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Importar .txt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drawers Overview (Counts & Intervals only, no card list shown) */}
      <section aria-label="Cajones de la caja">
        <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Cajones ({topic.drawers.length})
          </h3>

          <button
            type="button"
            onClick={onOpenConfigureDrawers}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30 whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Configurar intervalos</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white divide-y divide-zinc-200/80 dark:border-zinc-800 dark:bg-[#16191F] dark:divide-zinc-800/80">
          {topic.drawers.map((drawer, idx) => {
            const drawerCards = cards.filter((c) => c.drawerId === drawer.id);
            const drawerDue = drawerCards.filter((c) => isCardDue(c, todayStr)).length;
            const canDelete = topic.drawers.length > 1;
            const isConfirming = confirmDeleteDrawerId === drawer.id;
            const colorTheme = getDrawerColorTheme(idx);

            return (
              <div key={drawer.id} className={`px-4 py-3.5 transition-colors ${colorTheme.rowBg}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-[15px] font-semibold ${colorTheme.labelText}`}>
                        Cajón {idx + 1}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        · {formatIntervalLabel(drawer.intervalDays)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right font-mono-tabular">
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {drawerCards.length}
                      </span>
                      <span className="ml-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {drawerCards.length === 1 ? 'tarjeta' : 'tarjetas'}
                      </span>
                      {drawerDue > 0 && (
                        <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                          · {drawerDue} hoy
                        </span>
                      )}
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (drawerCards.length === 0) {
                            onDeleteDrawer(drawer.id);
                          } else {
                            setConfirmDeleteDrawerId(isConfirming ? null : drawer.id);
                          }
                        }}
                        className="flex min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        aria-label={`Borrar Cajón ${idx + 1}`}
                        title={`Borrar Cajón ${idx + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {isConfirming && (
                  <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Este cajón tiene {drawerCards.length}{' '}
                      {drawerCards.length === 1 ? 'tarjeta' : 'tarjetas'}. Si lo borras, pasarán al primer cajón restante.
                    </p>
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteDrawerId(null)}
                        className="min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteDrawerId(null);
                          onDeleteDrawer(drawer.id);
                        }}
                        className="min-h-[38px] rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                      >
                        Borrar cajón
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
