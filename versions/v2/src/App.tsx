import { useState, useContext } from 'react';
import { BottomNav, TabId } from './components/common/BottomNav';
import { StewardPinModal } from './components/modals/StewardPinModal';
import { MarketplaceCarousel } from './components/market/MarketplaceCarousel';
import { ProofExplorer } from './components/proof/ProofExplorer';
import { StewardPortal } from './components/steward/StewardPortal';
import { ProfileView } from './components/profile/ProfileView';
import { LanguageContext, LanguageProvider } from './context/LanguageContext';
import { MonasteryStoreContext, MonasteryStoreProvider, useMonasteryStore } from './context/MonasteryStore';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('market');
  const [initialProofId, setInitialProofId] = useState<string | undefined>(undefined);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const { isStewardUnlocked, lockSteward } = useMonasteryStore();

  const handleTabSelect = (tab: TabId) => {
    if (tab === 'steward' && !isStewardUnlocked) {
      setIsPinModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setActiveTab('steward');
  };

  const handleLockSteward = () => {
    lockSteward();
    setActiveTab('profile');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      <div className="max-w-md w-full mx-auto min-h-screen bg-parchment-100 shadow-xl flex flex-col relative">
        <main className="flex-1 overflow-y-auto pb-6">
          {activeTab === 'market' && (
            <MarketplaceCarousel
              onOpenProofExplorer={(pkgId) => {
                setInitialProofId(pkgId);
                setActiveTab('proof');
              }}
            />
          )}

          {activeTab === 'proof' && (
            <ProofExplorer initialProofId={initialProofId} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              onRequestStewardUnlock={() => setIsPinModalOpen(true)}
              onNavigateToSteward={() => setActiveTab('steward')}
              onViewProof={(pkgId) => {
                setInitialProofId(pkgId);
                setActiveTab('proof');
              }}
            />
          )}

          {activeTab === 'steward' && (
            <StewardPortal onLock={handleLockSteward} />
          )}
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
          isStewardUnlocked={isStewardUnlocked}
        />

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
