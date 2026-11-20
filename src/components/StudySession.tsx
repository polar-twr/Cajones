import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Eye, RotateCcw } from 'lucide-react';
import { DrawerConfig, Flashcard } from '../types/leitner';
import { formatIntervalLabel, getDrawerColorTheme } from '../utils/leitner';

interface StudySessionProps {
  topicName: string;
  drawers: DrawerConfig[];
  queue: Flashcard[];
  isPracticeMode: boolean;
  onAnswerCard: (cardId: string, knewIt: boolean) => void;
  onExit: () => void;
  contained?: boolean;
}

export const StudySession: React.FC<StudySessionProps> = ({
  topicName,
  drawers,
  queue,
  isPracticeMode,
  onAnswerCard,
  onExit,
  contained = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [knewCount, setKnewCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);

  const total = queue.length;
  const isFinished = currentIndex >= total;
  const currentCard = !isFinished ? queue[currentIndex] : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (!revealed) {
          e.preventDefault();
          setRevealed(true);
        }
      } else if (revealed && (e.key === 'ArrowLeft' || e.key === '1')) {
        e.preventDefault();
        handleAnswer(false);
      } else if (revealed && (e.key === 'ArrowRight' || e.key === '2')) {
        e.preventDefault();
        handleAnswer(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleAnswer = (knewIt: boolean) => {
    if (!currentCard) return;
    onAnswerCard(currentCard.id, knewIt);
    if (knewIt) {
      setKnewCount((n) => n + 1);
    } else {
      setResetCount((n) => n + 1);
    }
    setRevealed(false);
    setCurrentIndex((i) => i + 1);
  };

  const containerPosition = contained ? 'absolute inset-0' : 'fixed inset-0';
  const firstDrawer = drawers[0];

  if (isFinished) {
    return (
      <div
        className={`${containerPosition} z-50 flex flex-col bg-[#F8F8F6] dark:bg-[#0E1013]`}
      >
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-[#16191F]">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 text-balance">
              Sesión completada
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Has repasado {total} {total === 1 ? 'tarjeta' : 'tarjetas'} de {topicName}.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800">
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Avanzan de cajón</p>
                <p className="mt-1 font-mono-tabular text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {knewCount}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Vuelven al {firstDrawer?.name ?? 'Cajón 1'}
                </p>
                <p className="mt-1 font-mono-tabular text-2xl font-semibold text-amber-600 dark:text-amber-400">
                  {resetCount}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onExit}
              className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Volver a la caja
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const currentIdx = drawers.findIndex((d) => d.id === currentCard.drawerId);
  const resolvedIdx = currentIdx >= 0 ? currentIdx : 0;
  const currentDrawer = drawers[resolvedIdx] ?? firstDrawer;
  const nextDrawer = drawers[Math.min(drawers.length - 1, resolvedIdx + 1)] ?? currentDrawer;
  const isLastDrawer = resolvedIdx >= drawers.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);
  const colorTheme = getDrawerColorTheme(resolvedIdx);

  return (
    <div
      className={`${containerPosition} z-50 flex flex-col bg-[#F8F8F6] dark:bg-[#0E1013]`}
    >
      {/* Minimal top study bar */}
      <header className="h-14 shrink-0 border-b border-zinc-200/80 bg-[#F8F8F6] dark:border-zinc-800/80 dark:bg-[#0E1013]">
        <div className="mx-auto flex h-full max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={onExit}
            className="flex min-h-[44px] items-center gap-1.5 -ml-2 rounded-lg px-2 text-sm font-medium text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Salir</span>
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {topicName}
            </p>
            <p className={`font-mono-tabular text-xs font-medium ${colorTheme.labelText}`}>
              {currentIndex + 1} / {total} · Cajón {resolvedIdx + 1} ({currentDrawer.intervalDays}d)
              {isPracticeMode ? ' · Repaso libre' : ''}
            </p>
          </div>

          <div className="w-14 shrink-0" aria-hidden="true" />
        </div>
      </header>

      {/* Hairline progress bar */}
      <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className={`h-full transition-transform duration-200 ease-out origin-left ${colorTheme.progressBar}`}
          style={{ transform: `scaleX(${progressPercent / 100})` }}
        />
      </div>

      {/* Main distraction-free flashcard canvas */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center overflow-y-auto px-4 py-6">
        <div
          onClick={() => {
            if (!revealed) setRevealed(true);
          }}
          role={!revealed ? 'button' : undefined}
          tabIndex={!revealed ? 0 : undefined}
          onKeyDown={(e) => {
            if (!revealed && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setRevealed(true);
            }
          }}
          className={`flex min-h-[260px] flex-col justify-center rounded-3xl border p-6 transition-colors duration-150 ${colorTheme.cardSurface} ${
            contained ? '' : 'sm:min-h-[340px] sm:p-10'
          } ${!revealed ? 'cursor-pointer active:scale-[0.995]' : ''}`}
        >
          <div>
            <p className={`text-xs font-semibold ${colorTheme.labelText}`}>
              Pregunta · Cajón {resolvedIdx + 1} ({formatIntervalLabel(currentDrawer.intervalDays).toLowerCase()})
            </p>
            <p
              className={`mt-3 text-xl font-semibold leading-relaxed text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap break-words ${
                contained ? '' : 'sm:text-2xl'
              }`}
            >
              {currentCard.question}
            </p>
          </div>

          {revealed ? (
            <div className="mt-7 border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                Respuesta
              </p>
              <p
                className={`mt-2.5 text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words ${
                  contained ? '' : 'sm:text-xl'
                }`}
              >
                {currentCard.answer}
              </p>
            </div>
          ) : (
            <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
              Toca la tarjeta o pulsa «Mostrar respuesta»
            </p>
          )}
        </div>
      </main>

      {/* Thumb-zone bottom action controls */}
      <footer className="shrink-0 border-t border-zinc-200/80 bg-[#F8F8F6] px-4 pt-3 pb-safe dark:border-zinc-800/80 dark:bg-[#0E1013]">
        <div className="mx-auto max-w-2xl">
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Eye className="h-5 w-5" />
              <span>Mostrar respuesta</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAnswer(false)}
                className="flex min-h-[56px] flex-col items-center justify-center rounded-2xl border border-amber-300/80 bg-amber-50 px-3 py-2.5 text-amber-950 transition-colors hover:bg-amber-100 active:scale-[0.98] dark:border-amber-800/70 dark:bg-amber-950/35 dark:text-amber-100 dark:hover:bg-amber-950/60"
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>No lo sabía</span>
                </span>
                <span className="mt-0.5 text-[11px] text-amber-800/80 dark:text-amber-300/80">
                  Vuelve al Cajón 1 ({firstDrawer.intervalDays}d)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleAnswer(true)}
                className="flex min-h-[56px] flex-col items-center justify-center rounded-2xl bg-emerald-600 px-3 py-2.5 text-white transition-colors hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>Lo sabía</span>
                </span>
                <span className="mt-0.5 text-[11px] text-emerald-100">
                  {isLastDrawer
                    ? `Sigue en el Cajón ${resolvedIdx + 1} (${currentDrawer.intervalDays}d)`
                    : `Pasa al Cajón ${resolvedIdx + 2} (${nextDrawer.intervalDays}d)`}
                </span>
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
