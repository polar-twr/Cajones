import React, { useRef, useState } from 'react';
import {
  Download,
  FileText,
  Lock,
  RotateCcw,
  Share,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppData, TopicBox } from '../types/leitner';
import { exportTopicToTxt, normalizeAppData } from '../utils/leitner';

interface PrivacyAndDataModalProps {
  isOpen: boolean;
  data: AppData;
  selectedTopic: TopicBox | null;
  onClose: () => void;
  onRestoreBackup: (backup: AppData) => void;
  onClearAll: () => void;
  contained?: boolean;
}

export const PrivacyAndDataModal: React.FC<PrivacyAndDataModalProps> = ({
  isOpen,
  data,
  selectedTopic,
  onClose,
  onRestoreBackup,
  onClearAll,
  contained = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [confirmClear, setConfirmClear] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const dateSlug = new Date().toISOString().slice(0, 10);
    triggerDownload(
      JSON.stringify(data, null, 2),
      `leitner-copia-${dateSlug}.json`,
      'application/json'
    );
    setStatusMsg('Copia local descargada.');
  };

  const handleExportSelectedTxt = () => {
    if (!selectedTopic) return;
    const topicCards = data.cards.filter((c) => c.topicId === selectedTopic.id);
    const txt = exportTopicToTxt(topicCards);
    const safeName = selectedTopic.name
      .toLowerCase()
      .replace(/[^a-z0-9áéíóúñ]+/gi, '-')
      .replace(/^-|-$/g, '');
    triggerDownload(txt, `${safeName || 'caja'}.txt`, 'text/plain;charset=utf-8');
    setStatusMsg(`Exportado ${selectedTopic.name}.txt`);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (typeof reader.result !== 'string') return;
        const parsed = JSON.parse(reader.result) as Partial<AppData>;
        if (!Array.isArray(parsed.topics) || !Array.isArray(parsed.cards)) {
          setStatusMsg('El archivo no tiene un formato de copia válido.');
          return;
        }
        onRestoreBackup(normalizeAppData(parsed));
        setStatusMsg('Copia local restaurada correctamente.');
      } catch {
        setStatusMsg('No se pudo leer el archivo JSON.');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
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
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Privacidad y datos locales
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

        <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1">
          {/* Local Privacy Statement */}
          <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                100 % local en tu dispositivo
              </p>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Tus cajas, tarjetas y progreso se guardan exclusivamente en el almacenamiento local de este dispositivo. No se envía ningún dato a servidores externos.
              </p>
            </div>
          </div>

          {/* iPhone / PWA Install section */}
          {!isInstalled && (
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                <Smartphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Instalar en iPhone como aplicación</span>
              </div>

              {isInstallable ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={install}
                    className="min-h-[44px] w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    Instalar aplicación
                  </button>
                </div>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {isIOS ? (
                    <>
                      En Safari, pulsa el botón{' '}
                      <span className="inline-flex items-center gap-0.5 font-medium text-zinc-900 dark:text-zinc-100">
                        <Share className="inline h-3.5 w-3.5" /> Compartir
                      </span>{' '}
                      y elige <strong>Añadir a pantalla de inicio</strong> para usarla a pantalla completa y sin conexión.
                    </>
                  ) : (
                    <>
                      Para usarla en tu iPhone a pantalla completa y sin conexión, ábrela en Safari, pulsa <strong>Compartir</strong> y selecciona <strong>Añadir a pantalla de inicio</strong>.
                    </>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Local Backup & Export */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Copia de seguridad local
            </h3>

            <div
              className={`grid grid-cols-1 gap-2 ${
                contained ? '' : 'sm:grid-cols-2'
              }`}
            >
              <button
                type="button"
                onClick={handleExportJson}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <Download className="h-4 w-4 shrink-0" />
                <span>Descargar copia (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => restoreInputRef.current?.click()}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span>Restaurar copia (.json)</span>
              </button>
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </div>

            {selectedTopic && (
              <button
                type="button"
                onClick={handleExportSelectedTxt}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Descargar «{selectedTopic.name}» como .txt
                </span>
              </button>
            )}
          </div>

          {statusMsg && (
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {statusMsg}
            </p>
          )}

          {/* Danger Zone: Clear local data */}
          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            {!confirmClear ? (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl px-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <Trash2 className="h-4 w-4" />
                <span>Borrar todos los datos locales</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30">
                <p className="text-xs text-rose-900 dark:text-rose-200">
                  Se eliminarán todas las cajas y tarjetas guardadas en este dispositivo.
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="min-h-[40px] rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(false);
                      onClearAll();
                      setStatusMsg('Se han borrado todos los datos locales.');
                    }}
                    className="min-h-[40px] rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700"
                  >
                    Confirmar borrado
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
