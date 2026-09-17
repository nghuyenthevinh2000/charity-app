import React, { useState } from 'react';
import { Layers, ShieldCheck, Receipt, Filter } from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { MonasteryTransaction, SpentOutput } from '../../types';
import { UTXOFlowCard } from '../transparency/UTXOFlowCard';
import { ReceiptInspectionDrawer } from '../transparency/ReceiptInspectionDrawer';
import { ProvenanceSearch } from '../transparency/ProvenanceSearch';

export interface UTXOLedgerProps {
  initialTxHash?: string | null;
}

export const UTXOLedger: React.FC<UTXOLedgerProps> = ({ initialTxHash }) => {
  const { transactions, funds, getFund } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [selectedFundId, setSelectedFundId] = useState<string>('all');
  const [selectedSpentOutput, setSelectedSpentOutput] = useState<SpentOutput | null>(null);
  const [selectedTx, setSelectedTx] = useState<MonasteryTransaction | null>(null);

  const handleInspectReceipt = (spentOutput: SpentOutput, tx?: MonasteryTransaction) => {
    setSelectedSpentOutput(spentOutput);
    if (tx) {
      setSelectedTx(tx);
    } else {
      // Find transaction containing this spent output if not passed
      const foundTx = transactions.find((t) => t.spentOutput.id === spentOutput.id);
      setSelectedTx(foundTx || null);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedSpentOutput(null);
    setSelectedTx(null);
  };

  const filterOptions = [
    { id: 'all', label: t('transparency.allFunds') || 'All Funds' },
    ...funds.map((f) => ({
      id: f.id,
      label:
        f.id === 'healthcare'
          ? 'Healthcare'
          : f.id === 'alms'
          ? 'Alms & Food'
          : f.id === 'utilities'
          ? 'Utilities'
          : f.name,
    })),
  ];

  const filteredTransactions =
    selectedFundId === 'all'
      ? transactions
      : transactions.filter((tx) => tx.fundId === selectedFundId);

  return (
    <section
      role="region"
      aria-label="UTXO Transparency Ledger"
      className="p-4 space-y-5"
    >
      {/* Tab Header Banner */}
      <div className="border-b border-parchment-300 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-saffron-100 text-saffron-800">
            <Layers className="w-5 h-5 text-saffron-700" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-stone-900">
              {t('transparency.title') || 'UTXO Transparency Ledger'}
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {t('transparency.subtitle') || 'Tap any spent output to inspect verified merchant receipts'}
            </p>
          </div>
        </div>
      </div>

      {/* Devotee Offering Provenance Search */}
      <ProvenanceSearch
        initialTxHash={initialTxHash}
        onInspectReceipt={(output) => handleInspectReceipt(output)}
      />

      {/* Fund Category Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Filter className="w-3.5 h-3.5 text-amber-700" />
          <span>{language === 'vi' ? 'Lọc theo quỹ thiện nguyện' : 'Filter by Cause Fund'}</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterOptions.map((opt) => {
            const isSelected = selectedFundId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFundId(opt.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-stone-900 text-amber-300 ring-2 ring-amber-400 font-semibold'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50 hover:text-stone-900'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transactions Flow Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-stone-500">
            {language === 'vi' ? 'Dòng giao dịch chi tiêu' : 'Expenditure Batch Flows'} ({filteredTransactions.length})
          </span>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Monastery Audited</span>
          </span>
        </div>

        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <UTXOFlowCard
                key={tx.id}
                transaction={tx}
                fundName={getFund(tx.fundId)?.name}
                onInspectReceipt={handleInspectReceipt}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-2">
            <Receipt className="w-10 h-10 text-stone-400 mx-auto" />
            <h4 className="text-sm font-semibold text-stone-800">
              {language === 'vi' ? 'Chưa có khoản chi nào cho quỹ này' : 'No Expenditures Logged Yet'}
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              {language === 'vi'
                ? 'Tất cả các khoản cúng dường đang được lưu trữ an toàn trong kho bạc tu viện.'
                : 'Offerings for this cause are safely preserved in monastery treasury reserves.'}
            </p>
          </div>
        )}
      </div>

      {/* Tap-to-Inspect Receipt Bottom Sheet */}
      <ReceiptInspectionDrawer
        isOpen={Boolean(selectedSpentOutput)}
        spentOutput={selectedSpentOutput}
        txHash={selectedTx?.txHash}
        fundName={selectedTx ? getFund(selectedTx.fundId)?.name : undefined}
        onClose={handleCloseDrawer}
      />
    </section>
  );
};

export default UTXOLedger;
