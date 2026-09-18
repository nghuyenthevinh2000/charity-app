import React from 'react';
import {
  ArrowDown,
  Receipt,
  Landmark,
  ShieldCheck,
  CheckCircle,
  Coins,
  Layers,
} from 'lucide-react';
import { MonasteryTransaction, SpentOutput } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

export interface UTXOFlowCardProps {
  transaction: MonasteryTransaction;
  fundName?: string;
  onInspectReceipt: (spentOutput: SpentOutput, tx: MonasteryTransaction) => void;
}

export const UTXOFlowCard: React.FC<UTXOFlowCardProps> = ({
  transaction,
  fundName,
  onInspectReceipt,
}) => {
  const { t, language } = useTranslation();

  const totalInputs = transaction.inputs.reduce((sum, inp) => sum + inp.amountContributed, 0);
  const totalOutputs = transaction.spentOutput.amount + transaction.changeOutput.amount;
  const isBalanced = Math.abs(totalInputs - totalOutputs) < 0.01;

  const formatCurrency = (num: number) => `$${num.toFixed(2)}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-stone-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-300">
                TX #{transaction.txHash.slice(0, 10)}
              </span>
              <span className="text-[10px] bg-stone-700/80 text-stone-300 px-2 py-0.5 rounded-full font-mono">
                {transaction.date}
              </span>
            </div>
            {fundName && (
              <p className="text-[11px] text-stone-300 font-medium truncate max-w-[200px]">
                {fundName}
              </p>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase tracking-wider text-stone-400 block">
            Batch Pool
          </span>
          <span className="text-sm font-bold font-serif text-amber-300">
            {formatCurrency(totalInputs)}
          </span>
        </div>
      </div>

      {/* Main Flow Section */}
      <div className="p-4 space-y-3 bg-stone-50/50">
        {/* Section 1: Inputs (Donations) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-amber-600" />
              <span>{t('transparency.inputsHeader') || 'INPUTS (Donations)'}</span>
            </div>
            <span className="font-mono text-stone-400">
              {transaction.inputs.length} {transaction.inputs.length === 1 ? 'offering' : 'offerings'}
            </span>
          </div>

          <div className="space-y-1.5">
            {transaction.inputs.map((inp, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-2.5 border border-stone-200/80 flex items-center justify-between text-xs shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-800 block">
                      {inp.donorName}
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      tx:{inp.txHash.slice(0, 10)}...
                    </span>
                  </div>
                </div>
                <div className="font-serif font-bold text-stone-800 text-sm">
                  {formatCurrency(inp.amountContributed)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center Flow Connector / Batch Pool Node */}
        <div className="flex flex-col items-center my-1">
          <div className="flex items-center gap-1.5 bg-amber-100/90 text-amber-900 border border-amber-300/80 px-3 py-1 rounded-full text-[11px] font-medium shadow-2xs">
            <ArrowDown className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
            <span>
              {language === 'vi' ? 'Tổng Hợp Chi Phí Quỹ' : 'Batch Allocation Node'}:{' '}
              <strong className="font-mono">{formatCurrency(totalInputs)}</strong>
            </span>
          </div>
        </div>

        {/* Section 2: Outputs (Spent + Change) */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
            <div className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-saffron-600" />
              <span>{t('transparency.outputsHeader') || 'OUTPUTS (Spending & Change)'}</span>
            </div>
          </div>

          <div className="space-y-2">
            {/* SPENT OUTPUT (Clickable to inspect receipt) */}
            <button
              type="button"
              onClick={() => onInspectReceipt(transaction.spentOutput, transaction)}
              className="w-full text-left bg-gradient-to-r from-amber-50/90 via-white to-amber-50/50 rounded-xl p-3 border-2 border-amber-300 hover:border-amber-500 hover:shadow-md transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label={`Inspect receipt for ${transaction.spentOutput.merchant}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-saffron-600 text-white px-2 py-0.5 rounded-md">
                      {t('transparency.spentLabel') || 'SPENT'}
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{t('transparency.verified')}</span>
                    </span>
                  </div>
                  <div className="font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors truncate">
                    {transaction.spentOutput.merchant}
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-1 mt-0.5">
                    {transaction.spentOutput.purpose}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-serif font-bold text-base text-saffron-700">
                    {formatCurrency(transaction.spentOutput.amount)}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 group-hover:underline mt-1 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    <Receipt className="w-3 h-3" />
                    <span>{t('transparency.inspectBill')}</span>
                  </div>
                </div>
              </div>
            </button>

            {/* UNSPENT CHANGE OUTPUT */}
            <div className="bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                      {t('transparency.unspentChange') || 'UNSPENT CHANGE'}
                    </span>
                  </div>
                  <span className="font-medium text-stone-700 block mt-0.5 text-[11px]">
                    {t('transparency.retainedInTreasury') || 'Retained in Treasury'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif font-bold text-stone-800 text-sm">
                  {formatCurrency(transaction.changeOutput.amount)}
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {t('transparency.toTreasuryReserve')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invariant Verification Footer */}
      <div className="bg-stone-100 px-4 py-2 border-t border-stone-200 text-[11px] flex items-center justify-between text-stone-600">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            {isBalanced ? (
              <span className="font-medium text-emerald-800">
                {t('transparency.invariantVerified')}
              </span>
            ) : (
              <span className="font-medium text-red-600">{t('transparency.balanceUnaligned')}</span>
            )}
          </span>
        </div>
        <span className="font-mono text-[10px] text-stone-500">
          {formatCurrency(totalInputs)} = {formatCurrency(transaction.spentOutput.amount)} + {formatCurrency(transaction.changeOutput.amount)}
        </span>
      </div>
    </div>
  );
};

export default UTXOFlowCard;
