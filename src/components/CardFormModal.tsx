import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Flashcard } from '../types/leitner';

interface CardFormModalProps {
  isOpen: boolean;
  topicName: string;
  editingCard: Flashcard | null;
  onClose: () => void;
  onSave: (question: string, answer: string, keepOpen: boolean) => void;
  contained?: boolean;
}

export const CardFormModal: React.FC<CardFormModalProps> = ({
  isOpen,
  topicName,
  editingCard,
  onClose,
  onSave,
  contained = false,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuestion(editingCard ? editingCard.question : '');
      setAnswer(editingCard ? editingCard.answer : '');
      setAddedFeedback(false);
    }
  }, [isOpen, editingCard]);

  if (!isOpen) return null;

  const qTrimmed = question.trim();
  const aTrimmed = answer.trim();
  const isValid = Boolean(qTrimmed && aTrimmed);

  const handleSave = (keepOpen: boolean) => {
    if (!isValid) return;
    onSave(qTrimmed, aTrimmed, keepOpen);
    if (keepOpen) {
      setQuestion('');
      setAnswer('');
      setAddedFeedback(true);
      setTimeout(() => {
        questionRef.current?.focus();
      }, 20);
    }
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
        className={`w-full max-w-lg rounded-t-3xl border border-zinc-200 bg-white p-5 pb-safe dark:border-zinc-800 dark:bg-[#16191F] ${
          contained ? 'max-h-[92%] overflow-y-auto' : 'sm:rounded-2xl sm:p-6'
        }`}
      >
        <div
          className={`mx-auto mb-3 h-1.5 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700 ${
            contained ? '' : 'sm:hidden'
          }`}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {editingCard ? 'Editar tarjeta' : 'Nueva tarjeta'}
            </h2>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {topicName} {!editingCard ? '· Entrará en el Cajón 1' : ''}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="mt-4 space-y-4"
        >
          <div>
            <label
              htmlFor="card-question-input"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Pregunta
            </label>
            <textarea
              ref={questionRef}
              id="card-question-input"
              rows={3}
              autoFocus
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (addedFeedback) setAddedFeedback(false);
              }}
              placeholder="Escribe la pregunta o el término..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="card-answer-input"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Respuesta
            </label>
            <textarea
              id="card-answer-input"
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Escribe la respuesta..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
            />
          </div>

          {addedFeedback && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Tarjeta guardada en el Cajón 1. Ya puedes escribir la siguiente.
            </p>
          )}

          <div
            className={`flex flex-col-reverse gap-2 pt-1 ${
              contained ? '' : 'sm:flex-row sm:items-center sm:justify-end'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cerrar
            </button>

            {!editingCard && (
              <button
                type="button"
                disabled={!isValid}
                onClick={() => handleSave(true)}
                className="min-h-[44px] rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
              >
                Guardar y añadir otra
              </button>
            )}

            <button
              type="submit"
              disabled={!isValid}
              className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {editingCard ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
