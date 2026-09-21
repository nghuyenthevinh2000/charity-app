import { useState, useContext } from 'react';
import { Header, AppRole } from './components/common/Header';
import { BottomNav, TabId } from './components/common/BottomNav';
import { StewardPinModal } from './components/modals/StewardPinModal';
import { OfferingModal } from './components/modals/OfferingModal';
import { SanctuaryHome } from './components/tabs/SanctuaryHome';
import { UTXOLedger } from './components/tabs/UTXOLedger';
import { PrayerWall } from './components/tabs/PrayerWall';
import { StewardPortal } from './components/tabs/StewardPortal';
import { LanguageContext, LanguageProvider } from './context/LanguageContext';
import { MonasteryStoreContext, MonasteryStoreProvider, useMonasteryStore } from './context/MonasteryStore';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('sanctuary');
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [offeringFundId, setOfferingFundId] = useState<string | null>(null);
  const [ledgerInitialTxHash, setLedgerInitialTxHash] = useState<string | null>(null);
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

  const handleOffer = (fundId: string) => {
    setOfferingFundId(fundId);
  };

  const handleCloseOffering = () => {
    setOfferingFundId(null);
  };

  const handleNavigateToLedger = (txHash: string) => {
    setOfferingFundId(null);
    setLedgerInitialTxHash(txHash);
    setActiveTab('transparency');
  };

  const handleNavigateToPrayerWall = () => {
    setOfferingFundId(null);
    setActiveTab('prayerWall');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      <div className="max-w-md w-full mx-auto min-h-screen bg-parchment-100 shadow-xl flex flex-col relative">
        <Header
          currentRole={currentRole}
          onSelectRole={handleSelectRole}
          onRequestStewardUnlock={handleRequestStewardUnlock}
        />

        <main className="flex-1 overflow-y-auto pb-6">
          {activeTab === 'sanctuary' && (
            <SanctuaryHome onOffer={handleOffer} />
          )}

          {activeTab === 'transparency' && (
            <UTXOLedger initialTxHash={ledgerInitialTxHash} />
          )}

          {activeTab === 'prayerWall' && (
            <PrayerWall />
          )}

          {activeTab === 'steward' && (
            <StewardPortal onLock={() => setActiveTab('sanctuary')} />
          )}
        </main>

        <BottomNav activeTab={activeTab} onTabSelect={handleTabSelect} />

        <StewardPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={handlePinSuccess}
        />

        <OfferingModal
          selectedFundId={offeringFundId}
          onClose={handleCloseOffering}
          onNavigateToLedger={handleNavigateToLedger}
          onNavigateToPrayerWall={handleNavigateToPrayerWall}
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
