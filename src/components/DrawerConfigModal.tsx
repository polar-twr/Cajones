import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { DrawerConfig, Flashcard } from '../types/leitner';
import { createId, formatIntervalLabel, getDrawerColorTheme } from '../utils/leitner';

interface DrawerConfigModalProps {
  isOpen: boolean;
  topicName: string;
  drawers: DrawerConfig[];
  cards: Flashcard[];
  onClose: () => void;
  onSaveDrawers: (nextDrawers: DrawerConfig[]) => void;
  contained?: boolean;
}

export const DrawerConfigModal: React.FC<DrawerConfigModalProps> = ({
  isOpen,
  topicName,
  drawers,
  cards,
  onClose,
  onSaveDrawers,
  contained = false,
}) => {
  const [draftDrawers, setDraftDrawers] = useState<DrawerConfig[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraftDrawers(drawers.map((d) => ({ ...d })));
      setConfirmDeleteId(null);
    }
  }, [isOpen, drawers]);

  if (!isOpen) return null;

  const handleIntervalChange = (id: string, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    setDraftDrawers((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, intervalDays: Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(365, parsed)) }
          : d
      )
    );
  };

  const handleDeleteDrawer = (id: string) => {
    if (draftDrawers.length <= 1) return;
    setDraftDrawers((prev) => prev.filter((d) => d.id !== id));
    setConfirmDeleteId(null);
  };

  const handleAddDrawer = () => {
    const lastInterval = draftDrawers[draftDrawers.length - 1]?.intervalDays ?? 16;
    const nextNumber = draftDrawers.length + 1;
    setDraftDrawers((prev) => [
      ...prev,
      {
        id: createId(),
        name: `Cajón ${nextNumber}`,
        intervalDays: lastInterval + 5,
      },
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftDrawers.map((d, index) => ({
      ...d,
      name: `Cajón ${index + 1}`,
      intervalDays: Math.max(1, Math.round(d.intervalDays || 1)),
    }));
    onSaveDrawers(cleaned);
    onClose();
  };

  return (
    <div
      className={`${
        contained ? 'absolute inset-0 items-end' : 'fixed inset-0 items-end sm:items-center sm:p-4'
      } z-50 flex justify-center bg-black/50 backdrop-blur-xs`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[90%] w-full max-w-lg flex-col rounded-t-3xl border border-zinc-200 bg-white p-5 pb-safe dark:border-zinc-800 dark:bg-[#16191F] ${
          contained ? '' : 'sm:max-h-[90vh] sm:rounded-2xl sm:p-6'
        }`}
      >
        <div
          className={`mx-auto mb-3 h-1.5 w-10 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 ${
            contained ? '' : 'sm:hidden'
          }`}
        />

        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Configurar cajones
            </h2>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {topicName} · Modifica los días o borra cajones sin uso
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
            {draftDrawers.map((drawer, index) => {
              const cardCount = cards.filter((c) => c.drawerId === drawer.id).length;
              const canDelete = draftDrawers.length > 1;
              const isConfirming = confirmDeleteId === drawer.id;
              const colorTheme = getDrawerColorTheme(index);

              return (
                <div
                  key={drawer.id}
                  className={`rounded-xl border border-zinc-200/80 p-3 dark:border-zinc-800 ${colorTheme.rowBg}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${colorTheme.labelText}`}>
                        Cajón {index + 1}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {formatIntervalLabel(drawer.intervalDays)} · {cardCount}{' '}
                        {cardCount === 1 ? 'tarjeta' : 'tarjetas'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                        <span>Cada</span>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          inputMode="numeric"
                          value={drawer.intervalDays}
                          onChange={(e) => handleIntervalChange(drawer.id, e.target.value)}
                          className="h-10 w-16 rounded-lg border border-zinc-300 bg-white px-2 text-center font-mono-tabular text-sm font-medium text-zinc-900 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-500"
                          aria-label={`Días de repaso para el Cajón ${index + 1}`}
                        />
                        <span>{drawer.intervalDays === 1 ? 'día' : 'días'}</span>
                      </label>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            if (cardCount === 0) {
                              handleDeleteDrawer(drawer.id);
                            } else {
                              setConfirmDeleteId(isConfirming ? null : drawer.id);
                            }
                          }}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                          aria-label={`Borrar Cajón ${index + 1}`}
                          title={`Borrar Cajón ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isConfirming && (
                    <div className="mt-2.5 flex flex-col gap-2 border-t border-zinc-200 pt-2.5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Sus {cardCount} {cardCount === 1 ? 'tarjeta pasará' : 'tarjetas pasarán'} al primer cajón restante.
                      </p>
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="min-h-[36px] rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDrawer(drawer.id)}
                          className="min-h-[36px] rounded-lg bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700"
                        >
                          Borrar cajón
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={handleAddDrawer}
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-zinc-300 bg-transparent px-4 py-2 text-xs font-medium text-zinc-700 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir otro cajón</span>
            </button>
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
