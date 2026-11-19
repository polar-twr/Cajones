import React from 'react';
import { ChevronLeft, Monitor, Moon, Plus, ShieldCheck, Smartphone, Sun } from 'lucide-react';
import { ThemeMode } from '../types/leitner';

interface HeaderBarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenNewTopic: () => void;
  onOpenSettings: () => void;
  mobileBackTitle?: string | null;
  onMobileBack?: () => void;
  isPhonePreview?: boolean;
  onTogglePhonePreview?: () => void;
  contained?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  theme,
  onToggleTheme,
  onOpenNewTopic,
  onOpenSettings,
  mobileBackTitle,
  onMobileBack,
  isPhonePreview = false,
  onTogglePhonePreview,
  contained = false,
}) => {
  return (
    <header
      className={`${
        contained ? 'sticky top-0' : 'sticky top-0'
      } z-30 h-14 border-b border-zinc-200/80 bg-[#F8F8F6]/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-[#0E1013]/90`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Left: Brand or mobile back */}
        <div className="flex min-w-0 items-center gap-2">
          {mobileBackTitle && onMobileBack ? (
            <button
              type="button"
              onClick={onMobileBack}
              className={`flex min-h-[44px] min-w-[44px] -ml-2 items-center gap-1 rounded-lg px-2 text-zinc-700 hover:bg-zinc-200/60 dark:text-zinc-200 dark:hover:bg-zinc-800/70 focus-visible:outline-2 focus-visible:outline-blue-600 ${
                contained ? '' : 'lg:hidden'
              }`}
              aria-label="Volver a la lista de temáticas"
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span className="max-w-[140px] truncate text-sm font-medium">
                Temáticas
              </span>
            </button>
          ) : null}

          <span
            className={`text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 whitespace-nowrap shrink-0 ${
              mobileBackTitle ? (contained ? 'hidden' : 'hidden lg:inline') : ''
            }`}
          >
            Leitner
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {!contained && onTogglePhonePreview && (
            <button
              type="button"
              onClick={onTogglePhonePreview}
              className="hidden lg:inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 whitespace-nowrap shrink-0"
            >
              {isPhonePreview ? (
                <>
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Vista escritorio</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Vista iPhone</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleTheme}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label="Privacidad, copias locales e instalación"
            title="Datos locales y privacidad"
          >
            <ShieldCheck className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={onOpenNewTopic}
            className="ml-1 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-[0.98] dark:bg-blue-500 dark:hover:bg-blue-600 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Nueva caja</span>
          </button>
        </div>
      </div>
    </header>
  );
};
