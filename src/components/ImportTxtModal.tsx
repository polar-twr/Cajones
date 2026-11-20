import React, { useMemo, useRef, useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { parseTxtContent } from '../utils/leitner';

interface ImportTxtModalProps {
  isOpen: boolean;
  topicName: string;
  onClose: () => void;
  onImport: (items: Array<{ question: string; answer: string }>) => void;
  contained?: boolean;
}

export const ImportTxtModal: React.FC<ImportTxtModalProps> = ({
  isOpen,
  topicName,
  onClose,
  onImport,
  contained = false,
}) => {
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseTxtContent(rawText), [rawText]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawText(reader.result);
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (parsed.valid.length === 0) return;
    onImport(parsed.valid);
    setRawText('');
    setFileName(null);
  };

  const handleClose = () => {
    setRawText('');
    setFileName(null);
    onClose();
  };

  return (
    <div
      className={`${
        contained ? 'absolute inset-0 items-end' : 'fixed inset-0 items-end sm:items-center sm:p-4'
      } z-50 flex justify-center bg-black/50 backdrop-blur-xs`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className={`flex max-h-[90%] w-full max-w-xl flex-col rounded-t-3xl border border-zinc-200 bg-white p-5 pb-safe dark:border-zinc-800 dark:bg-[#16191F] ${
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
              Importar archivo .txt
            </h2>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {topicName} · Formato: pregunta / respuesta
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex min-h-[44px] min-w-[44px] -mr-2 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              Ejemplo de contenido:
            </p>
            <p className="mt-1 font-mono-tabular">
              Capital de Francia / París
              <br />
              Símbolo del oro / Au
            </p>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
              <a
                href="/ingles-b2-300.txt"
                download="ingles-b2-300.txt"
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar Inglés B2 completo (699 fichas .txt)</span>
              </a>
              <a
                href="/ingles-b2.txt"
                download="ingles-b2.txt"
                className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Pack corto (60 fichas .txt)</span>
              </a>
            </div>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition-colors hover:border-blue-500 hover:bg-blue-50/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
            >
              <Upload className="h-4 w-4" />
              <span>
                {fileName ? `Archivo cargado: ${fileName}` : 'Seleccionar archivo .txt'}
              </span>
            </button>
          </div>

          <div>
            <label
              htmlFor="import-txt-textarea"
              className="block text-xs font-medium text-zinc-600 dark:text-zinc-400"
            >
              O pega el texto aquí (una tarjeta por línea):
            </label>
            <textarea
              id="import-txt-textarea"
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={'Pregunta 1 / Respuesta 1\nPregunta 2 / Respuesta 2'}
              className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500"
            />
          </div>

          {rawText.trim().length > 0 && (
            <div className="space-y-2 rounded-xl border border-zinc-200 p-3.5 dark:border-zinc-800">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-medium text-zinc-800 dark:text-zinc-200 tabular-nums">
                  {parsed.valid.length}{' '}
                  {parsed.valid.length === 1
                    ? 'tarjeta lista para importar'
                    : 'tarjetas listas para importar'}
                </span>
                {parsed.skipped.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                    {parsed.skipped.length}{' '}
                    {parsed.skipped.length === 1 ? 'línea omitida' : 'líneas omitidas'}
                  </span>
                )}
              </div>

              {parsed.valid.length > 0 && (
                <div className="max-h-32 space-y-1.5 overflow-y-auto border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
                  {parsed.valid.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="truncate text-zinc-600 dark:text-zinc-400">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.question}
                      </span>{' '}
                      / {item.answer}
                    </div>
                  ))}
                  {parsed.valid.length > 5 && (
                    <p className="text-zinc-400 dark:text-zinc-500 tabular-nums">
                      ...y {parsed.valid.length - 5} más
                    </p>
                  )}
                </div>
              )}

              {parsed.skipped.length > 0 && (
                <div className="border-t border-zinc-100 pt-2 text-xs text-amber-700 dark:border-zinc-800 dark:text-amber-300">
                  {parsed.skipped.slice(0, 3).map((s) => (
                    <p key={s.lineNumber} className="truncate">
                      Línea {s.lineNumber}: {s.reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleClose}
            className="min-h-[44px] rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={parsed.valid.length === 0}
            onClick={handleConfirm}
            className="min-h-[44px] rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-600 tabular-nums"
          >
            Importar ({parsed.valid.length}) al Cajón 1
          </button>
        </div>
      </div>
    </div>
  );
};
