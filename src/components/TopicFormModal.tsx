import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface TopicFormModalProps {
  isOpen: boolean;
  initialName?: string;
  mode: 'create' | 'rename';
  onClose: () => void;
  onSubmit: (name: string) => void;
  contained?: boolean;
}

export const TopicFormModal: React.FC<TopicFormModalProps> = ({
  isOpen,
  initialName = '',
  mode,
  onClose,
  onSubmit,
  contained = false,
}) => {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
    }
  }, [isOpen, initialName]);

  if (!isOpen) return null;

  const trimmed = name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
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
        className={`w-full max-w-md rounded-t-3xl border border-zinc-200 bg-white p-5 pb-safe dark:border-zinc-800 dark:bg-[#16191F] ${
          contained ? '' : 'sm:rounded-2xl sm:p-6'
        }`}
      >
        <div
          className={`mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 ${
            contained ? '' : 'sm:hidden'
          }`}
        />

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {mode === 'create' ? 'Nueva caja temática' : 'Renombrar caja'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="topic-name-input"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Nombre de la temática
            </label>
            <input
              id="topic-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Anatomía, Inglés B2, Historia..."
              className="mt-1.5 w-full min-h-[46px] rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!trimmed}
              className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {mode === 'create' ? 'Crear caja' : 'Guardar nombre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
