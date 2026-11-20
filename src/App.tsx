import { useEffect, useMemo, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { CardFormModal } from './components/CardFormModal';
import { DrawerConfigModal } from './components/DrawerConfigModal';
import { HeaderBar } from './components/HeaderBar';
import { ImportTxtModal } from './components/ImportTxtModal';
import { PrivacyAndDataModal } from './components/PrivacyAndDataModal';
import { StudySession } from './components/StudySession';
import { TopicDetail } from './components/TopicDetail';
import { TopicFormModal } from './components/TopicFormModal';
import { TopicList } from './components/TopicList';
import { AppData, DrawerConfig, Flashcard, TopicBox } from './types/leitner';
import {
  applyReviewResult,
  buildSampleData,
  createDefaultDrawers,
  createId,
  getLocalDateString,
  isCardDue,
  loadAppData,
  saveAppData,
  shuffleItems,
} from './utils/leitner';

interface ActiveStudy {
  topicId: string;
  topicName: string;
  drawers: DrawerConfig[];
  queue: Flashcard[];
  isPracticeMode: boolean;
}

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState<string>(() => getLocalDateString());
  const [isPhonePreview, setIsPhonePreview] = useState(false);

  // Modals state
  const [topicModal, setTopicModal] = useState<{
    open: boolean;
    mode: 'create' | 'rename';
    topic: TopicBox | null;
  }>({ open: false, mode: 'create', topic: null });

  const [cardModal, setCardModal] = useState<{
    open: boolean;
    editingCard: Flashcard | null;
  }>({ open: false, editingCard: null });

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [drawerModalOpen, setDrawerModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [activeStudy, setActiveStudy] = useState<ActiveStudy | null>(null);

  // Persist to localStorage
  useEffect(() => {
    saveAppData(data);
  }, [data]);

  // Sync dark class & theme-color meta tag
  useEffect(() => {
    const isDark = data.theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0E1013' : '#F8F8F6');
    }
  }, [data.theme]);

  // Keep today's local date fresh when returning to the app on iPhone
  useEffect(() => {
    const refreshDate = () => {
      const current = getLocalDateString();
      setTodayStr((prev) => (prev !== current ? current : prev));
    };
    window.addEventListener('focus', refreshDate);
    document.addEventListener('visibilitychange', refreshDate);
    return () => {
      window.removeEventListener('focus', refreshDate);
      document.removeEventListener('visibilitychange', refreshDate);
    };
  }, []);

  const selectedTopic = useMemo(
    () => data.topics.find((t) => t.id === selectedTopicId) ?? null,
    [data.topics, selectedTopicId]
  );

  const desktopFallbackTopic = useMemo(() => {
    if (selectedTopic) return selectedTopic;
    return data.topics[0] ?? null;
  }, [selectedTopic, data.topics]);

  const selectedTopicCards = useMemo(() => {
    if (!selectedTopic) return [];
    return data.cards.filter((c) => c.topicId === selectedTopic.id);
  }, [data.cards, selectedTopic]);

  const desktopTopicCards = useMemo(() => {
    if (!desktopFallbackTopic) return [];
    return data.cards.filter((c) => c.topicId === desktopFallbackTopic.id);
  }, [data.cards, desktopFallbackTopic]);

  const handleToggleTheme = () => {
    setData((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleCreateOrRenameTopic = (name: string) => {
    if (topicModal.mode === 'create') {
      const newTopic: TopicBox = {
        id: createId(),
        name,
        createdAt: new Date().toISOString(),
        drawers: createDefaultDrawers(),
      };
      setData((prev) => ({
        ...prev,
        topics: [newTopic, ...prev.topics],
      }));
      setSelectedTopicId(newTopic.id);
    } else if (topicModal.topic) {
      const targetId = topicModal.topic.id;
      setData((prev) => ({
        ...prev,
        topics: prev.topics.map((t) =>
          t.id === targetId ? { ...t, name } : t
        ),
      }));
    }
    setTopicModal({ open: false, mode: 'create', topic: null });
  };

  const handleDeleteTopic = (topicId: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== topicId),
      cards: prev.cards.filter((c) => c.topicId !== topicId),
    }));
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
    }
  };

  const handleSaveDrawers = (topicId: string, nextDrawers: DrawerConfig[]) => {
    if (nextDrawers.length === 0) return;
    const validIds = new Set(nextDrawers.map((d) => d.id));
    const fallbackDrawerId = nextDrawers[0].id;

    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId ? { ...t, drawers: nextDrawers } : t
      ),
      cards: prev.cards.map((c) =>
        c.topicId === topicId && !validIds.has(c.drawerId)
          ? { ...c, drawerId: fallbackDrawerId }
          : c
      ),
    }));
  };

  const handleDeleteDrawer = (topicId: string, drawerId: string) => {
    const topic = data.topics.find((t) => t.id === topicId);
    if (!topic || topic.drawers.length <= 1) return;

    const remaining = topic.drawers
      .filter((d) => d.id !== drawerId)
      .map((d, idx) => ({ ...d, name: `Cajón ${idx + 1}` }));

    handleSaveDrawers(topicId, remaining);
  };

  const handleSaveCard = (
    topicId: string,
    question: string,
    answer: string,
    keepOpen: boolean
  ) => {
    const topic = data.topics.find((t) => t.id === topicId);
    const firstDrawerId = topic?.drawers[0]?.id ?? '1';

    if (cardModal.editingCard) {
      const editId = cardModal.editingCard.id;
      setData((prev) => ({
        ...prev,
        cards: prev.cards.map((c) =>
          c.id === editId ? { ...c, question, answer } : c
        ),
      }));
      setCardModal({ open: false, editingCard: null });
      return;
    }

    const newCard: Flashcard = {
      id: createId(),
      topicId,
      question,
      answer,
      drawerId: firstDrawerId,
      dueDate: todayStr,
      createdAt: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      cards: [newCard, ...prev.cards],
    }));

    if (!keepOpen) {
      setCardModal({ open: false, editingCard: null });
    }
  };

  const handleImportTxt = (
    topicId: string,
    items: Array<{ question: string; answer: string }>
  ) => {
    const topic = data.topics.find((t) => t.id === topicId);
    const firstDrawerId = topic?.drawers[0]?.id ?? '1';
    const now = new Date().toISOString();

    const newCards: Flashcard[] = items.map((item) => ({
      id: createId(),
      topicId,
      question: item.question,
      answer: item.answer,
      drawerId: firstDrawerId,
      dueDate: todayStr,
      createdAt: now,
    }));

    setData((prev) => ({
      ...prev,
      cards: [...newCards, ...prev.cards],
    }));
    setImportModalOpen(false);
  };

  const handleStartStudy = (topicId: string, practiceAll: boolean) => {
    const topic = data.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const topicCards = data.cards.filter((c) => c.topicId === topicId);
    const candidates = practiceAll
      ? topicCards
      : topicCards.filter((c) => isCardDue(c, todayStr));
    const queue = shuffleItems(candidates);

    if (queue.length === 0) return;

    setSelectedTopicId(topicId);
    setActiveStudy({
      topicId,
      topicName: topic.name,
      drawers: topic.drawers,
      queue,
      isPracticeMode: practiceAll,
    });
  };

  const handleAnswerStudyCard = (cardId: string, knewIt: boolean) => {
    setData((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => {
        if (c.id !== cardId) return c;
        const topic = prev.topics.find((t) => t.id === c.topicId);
        return applyReviewResult(
          c,
          topic?.drawers ?? createDefaultDrawers(),
          knewIt,
          todayStr
        );
      }),
    }));
  };

  const handleLoadSample = () => {
    const sample = buildSampleData(todayStr);
    setData((prev) => ({
      ...prev,
      topics: sample.topics,
      cards: sample.cards,
    }));
    setSelectedTopicId(sample.topics[0]?.id ?? null);
  };

  const activeDetailTopic = selectedTopic ?? desktopFallbackTopic;

  const renderModalsAndStudy = (contained: boolean) => {
    const modalTopic = contained ? selectedTopic : activeDetailTopic;
    const modalTopicCards = modalTopic
      ? data.cards.filter((c) => c.topicId === modalTopic.id)
      : [];

    return (
      <>
        {activeStudy && (
          <StudySession
            topicName={activeStudy.topicName}
            drawers={activeStudy.drawers}
            queue={activeStudy.queue}
            isPracticeMode={activeStudy.isPracticeMode}
            onAnswerCard={handleAnswerStudyCard}
            onExit={() => setActiveStudy(null)}
            contained={contained}
          />
        )}

        <TopicFormModal
          isOpen={topicModal.open}
          mode={topicModal.mode}
          initialName={topicModal.topic?.name ?? ''}
          onClose={() =>
            setTopicModal({ open: false, mode: 'create', topic: null })
          }
          onSubmit={handleCreateOrRenameTopic}
          contained={contained}
        />

        {modalTopic && (
          <>
            <CardFormModal
              isOpen={cardModal.open}
              topicName={modalTopic.name}
              editingCard={cardModal.editingCard}
              onClose={() => setCardModal({ open: false, editingCard: null })}
              onSave={(q, a, keepOpen) =>
                handleSaveCard(modalTopic.id, q, a, keepOpen)
              }
              contained={contained}
            />

            <ImportTxtModal
              isOpen={importModalOpen}
              topicName={modalTopic.name}
              onClose={() => setImportModalOpen(false)}
              onImport={(items) => handleImportTxt(modalTopic.id, items)}
              contained={contained}
            />

            <DrawerConfigModal
              isOpen={drawerModalOpen}
              topicName={modalTopic.name}
              drawers={modalTopic.drawers}
              cards={modalTopicCards}
              onClose={() => setDrawerModalOpen(false)}
              onSaveDrawers={(nextDrawers) =>
                handleSaveDrawers(modalTopic.id, nextDrawers)
              }
              contained={contained}
            />
          </>
        )}

        <PrivacyAndDataModal
          isOpen={privacyModalOpen}
          data={data}
          selectedTopic={modalTopic}
          onClose={() => setPrivacyModalOpen(false)}
          onRestoreBackup={(backup) => {
            setData(backup);
            setSelectedTopicId(backup.topics[0]?.id ?? null);
          }}
          onClearAll={() => {
            setData((prev) => ({
              ...prev,
              topics: [],
              cards: [],
            }));
            setSelectedTopicId(null);
          }}
          contained={contained}
        />
      </>
    );
  };

  const renderMobileContent = (contained: boolean) => (
    <>
      {!selectedTopic ? (
        <div className="space-y-6">
          <TopicList
            topics={data.topics}
            cards={data.cards}
            todayStr={todayStr}
            selectedTopicId={null}
            onSelectTopic={(id) => setSelectedTopicId(id)}
            onStartStudyTopic={(id) => handleStartStudy(id, false)}
            onOpenNewTopic={() =>
              setTopicModal({ open: true, mode: 'create', topic: null })
            }
            onLoadSample={handleLoadSample}
            contained={contained}
          />

          <p className="px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            Almacenamiento 100 % local en tu dispositivo. Puedes personalizar los intervalos de cada cajón dentro de cada caja.
          </p>
        </div>
      ) : (
        <TopicDetail
          topic={selectedTopic}
          cards={selectedTopicCards}
          todayStr={todayStr}
          onStartStudyDue={() => handleStartStudy(selectedTopic.id, false)}
          onStartPracticeAll={() => handleStartStudy(selectedTopic.id, true)}
          onOpenAddCard={() =>
            setCardModal({ open: true, editingCard: null })
          }
          onOpenImportTxt={() => setImportModalOpen(true)}
          onOpenConfigureDrawers={() => setDrawerModalOpen(true)}
          onDeleteDrawer={(drawerId) =>
            handleDeleteDrawer(selectedTopic.id, drawerId)
          }
          onRenameTopic={() =>
            setTopicModal({
              open: true,
              mode: 'rename',
              topic: selectedTopic,
            })
          }
          onDeleteTopic={() => handleDeleteTopic(selectedTopic.id)}
          contained={contained}
        />
      )}
    </>
  );

  return (
    <div className="notranslate min-h-screen bg-[#F8F8F6] text-zinc-900 dark:bg-[#0E1013] dark:text-zinc-100">
      {/* Desktop iPhone Visualization Mode (lg+ only) */}
      {isPhonePreview ? (
        <div className="hidden lg:flex min-h-screen flex-col items-center justify-center bg-zinc-200/70 px-6 py-6 dark:bg-zinc-950">
          {/* Desktop control bar above phone frame */}
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Visualización en iPhone (390 px)
            </span>
            <span aria-hidden="true" className="text-zinc-400">
              ·
            </span>
            <button
              type="button"
              onClick={handleToggleTheme}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {data.theme === 'dark' ? (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span>Tema claro</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span>Tema oscuro</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsPhonePreview(false)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Volver a vista escritorio</span>
            </button>
          </div>

          {/* Interactive iPhone Viewport Shell */}
          <div className="relative flex h-[780px] max-h-[calc(100vh-6rem)] w-[390px] flex-col overflow-hidden rounded-[46px] border-[8px] border-zinc-900 bg-[#F8F8F6] shadow-2xl dark:border-zinc-700 dark:bg-[#0E1013]">
            {/* Top Dynamic Island bezel */}
            <div className="flex h-8 shrink-0 items-center justify-center bg-[#F8F8F6] dark:bg-[#0E1013]">
              <div className="h-5 w-24 rounded-full bg-zinc-900 dark:bg-black" />
            </div>

            <div className="relative flex flex-1 flex-col overflow-hidden">
              <HeaderBar
                theme={data.theme}
                onToggleTheme={handleToggleTheme}
                onOpenNewTopic={() =>
                  setTopicModal({ open: true, mode: 'create', topic: null })
                }
                onOpenSettings={() => setPrivacyModalOpen(true)}
                mobileBackTitle={selectedTopic ? selectedTopic.name : null}
                onMobileBack={() => setSelectedTopicId(null)}
                contained
              />

              <div className="flex-1 overflow-y-auto px-4 py-5">
                {renderMobileContent(true)}
              </div>

              {renderModalsAndStudy(true)}
            </div>

            {/* Bottom iOS Home Indicator */}
            <div className="flex h-6 shrink-0 items-center justify-center bg-[#F8F8F6] dark:bg-[#0E1013]">
              <div className="h-1 w-28 rounded-full bg-zinc-900/25 dark:bg-zinc-100/25" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Standard Responsive App */}
      <div className={isPhonePreview ? 'lg:hidden' : ''}>
        <HeaderBar
          theme={data.theme}
          onToggleTheme={handleToggleTheme}
          onOpenNewTopic={() =>
            setTopicModal({ open: true, mode: 'create', topic: null })
          }
          onOpenSettings={() => setPrivacyModalOpen(true)}
          mobileBackTitle={selectedTopic ? selectedTopic.name : null}
          onMobileBack={() => setSelectedTopicId(null)}
          isPhonePreview={isPhonePreview}
          onTogglePhonePreview={() => setIsPhonePreview((v) => !v)}
        />

        <main className="mx-auto max-w-6xl px-4 py-5 pb-safe sm:px-6 sm:py-7">
          {/* Mobile Layout (< lg): list OR selected topic */}
          <div className="lg:hidden">{renderMobileContent(false)}</div>

          {/* Desktop Layout (>= lg): balanced 2-column master-detail */}
          <div className="hidden lg:grid lg:grid-cols-[360px_1fr] lg:items-start lg:gap-8">
            <div className="space-y-4">
              <TopicList
                topics={data.topics}
                cards={data.cards}
                todayStr={todayStr}
                selectedTopicId={activeDetailTopic?.id ?? null}
                onSelectTopic={(id) => setSelectedTopicId(id)}
                onStartStudyTopic={(id) => handleStartStudy(id, false)}
                onOpenNewTopic={() =>
                  setTopicModal({ open: true, mode: 'create', topic: null })
                }
                onLoadSample={handleLoadSample}
              />

              <p className="px-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
                100 % local en este dispositivo.
              </p>
            </div>

            <div>
              {activeDetailTopic ? (
                <TopicDetail
                  topic={activeDetailTopic}
                  cards={selectedTopic ? selectedTopicCards : desktopTopicCards}
                  todayStr={todayStr}
                  onStartStudyDue={() =>
                    handleStartStudy(activeDetailTopic.id, false)
                  }
                  onStartPracticeAll={() =>
                    handleStartStudy(activeDetailTopic.id, true)
                  }
                  onOpenAddCard={() => {
                    if (!selectedTopic) setSelectedTopicId(activeDetailTopic.id);
                    setCardModal({ open: true, editingCard: null });
                  }}
                  onOpenImportTxt={() => {
                    if (!selectedTopic) setSelectedTopicId(activeDetailTopic.id);
                    setImportModalOpen(true);
                  }}
                  onOpenConfigureDrawers={() => {
                    if (!selectedTopic) setSelectedTopicId(activeDetailTopic.id);
                    setDrawerModalOpen(true);
                  }}
                  onDeleteDrawer={(drawerId) => {
                    if (!selectedTopic) setSelectedTopicId(activeDetailTopic.id);
                    handleDeleteDrawer(activeDetailTopic.id, drawerId);
                  }}
                  onRenameTopic={() =>
                    setTopicModal({
                      open: true,
                      mode: 'rename',
                      topic: activeDetailTopic,
                    })
                  }
                  onDeleteTopic={() => handleDeleteTopic(activeDetailTopic.id)}
                />
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center dark:border-zinc-800 dark:bg-[#16191F]/40">
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    Selecciona o crea una caja
                  </h2>
                  <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    Crea una caja temática para añadir tarjetas manualmente o importarlas desde un archivo .txt.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {!isPhonePreview && renderModalsAndStudy(false)}
      </div>
    </div>
  );
}
