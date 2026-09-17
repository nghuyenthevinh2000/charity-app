import { useState, useContext } from 'react';
import { Header, AppRole } from './components/common/Header';
import { BottomNav, TabId } from './components/common/BottomNav';
import { StewardPinModal } from './components/modals/StewardPinModal';
import { SanctuaryHome } from './components/tabs/SanctuaryHome';
import { LanguageContext, LanguageProvider, useTranslation } from './context/LanguageContext';
import { MonasteryStoreContext, MonasteryStoreProvider, useMonasteryStore } from './context/MonasteryStore';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('sanctuary');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const { t } = useTranslation();
  const { isStewardUnlocked } = useMonasteryStore();

  const currentRole: AppRole = activeTab === 'steward' ? 'steward' : 'devotee';

  const handleTabSelect = (tab: TabId) => {
    if (tab === 'steward' && !isStewardUnlocked) {
      setIsPinModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleSelectRole = (role: AppRole) => {
    if (role === 'steward') {
      if (isStewardUnlocked) {
        setActiveTab('steward');
      } else {
        setIsPinModalOpen(true);
      }
    } else {
      setActiveTab('sanctuary');
    }
  };

  const handleRequestStewardUnlock = () => {
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    setActiveTab('steward');
  };

  const handleOffer = (_fundId: string) => {
    // Contextual OfferingModal integration in Task 7
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      <div className="max-w-md w-full mx-auto min-h-screen bg-parchment-100 shadow-xl flex flex-col relative">
        <Header
          currentRole={currentRole}
          onSelectRole={handleSelectRole}
          onRequestStewardUnlock={handleRequestStewardUnlock}
        />

        <main className="flex-1 overflow-y-auto">
          {activeTab === 'sanctuary' && (
            <SanctuaryHome onOffer={handleOffer} />
          )}

          {activeTab === 'transparency' && (
            <section className="p-4 space-y-4" aria-label="UTXO Transparency Ledger">
              <div className="border-b border-parchment-300 pb-3">
                <h2 className="text-base font-serif font-bold text-stone-900">
                  {t('transparency.title')}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t('transparency.subtitle')}
                </p>
              </div>
            </section>
          )}

          {activeTab === 'prayerWall' && (
            <section className="p-4 space-y-4" aria-label="Prayer Wall">
              <div className="border-b border-parchment-300 pb-3">
                <h2 className="text-base font-serif font-bold text-stone-900">
                  {t('prayerWall.title')}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t('prayerWall.subtitle')}
                </p>
              </div>
            </section>
          )}

          {activeTab === 'steward' && (
            <section className="p-4 space-y-4" aria-label="Steward Portal">
              <div className="border-b border-parchment-300 pb-3">
                <h2 className="text-base font-serif font-bold text-stone-900">
                  {t('steward.title')}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  {t('steward.authenticated')}
                </p>
              </div>
            </section>
          )}
        </main>

        <BottomNav activeTab={activeTab} onTabSelect={handleTabSelect} />

        <StewardPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={handlePinSuccess}
        />
      </div>
    </div>
  );
}

export default function App() {
  const hasLanguage = useContext(LanguageContext);
  const hasStore = useContext(MonasteryStoreContext);

  let content = <AppContent />;

  if (!hasStore) {
    content = <MonasteryStoreProvider>{content}</MonasteryStoreProvider>;
  }

  if (!hasLanguage) {
    content = <LanguageProvider>{content}</LanguageProvider>;
  }

  return content;
}
