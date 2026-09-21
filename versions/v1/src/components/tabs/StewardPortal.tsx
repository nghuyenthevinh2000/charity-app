import React, { useState } from 'react';
import {
  Wallet,
  AlertTriangle,
  PlusCircle,
  Receipt,
  Calendar,
  Lock,
} from 'lucide-react';
import { useMonasteryStore } from '../../context/MonasteryStore';
import { useTranslation } from '../../context/LanguageContext';
import { getFundName, getFundDescription } from '../../utils/localization';
import { ExpenseEntryModal } from '../steward/ExpenseEntryModal';
import { NewFundModal } from '../steward/NewFundModal';
import { ChantingQueue } from '../steward/ChantingQueue';

export interface StewardPortalProps {
  onLock?: () => void;
}

export const StewardPortal: React.FC<StewardPortalProps> = ({ onLock }) => {
  const { funds, lockSteward } = useMonasteryStore();
  const { t, language } = useTranslation();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isNewFundModalOpen, setIsNewFundModalOpen] = useState(false);

  // Total reserves calculation
  const totalReserves = funds.reduce((sum, f) => sum + f.currentBalance, 0);
  const totalTarget = funds.reduce((sum, f) => sum + f.targetAmount, 0);

  // Identify funds with low reserves (active funds with positive balance < 1000 or < 25% of target)
  const lowFundAlerts = funds.filter(
    (f) => f.currentBalance > 0 && (f.currentBalance < 1000 || (f.targetAmount > 0 && f.currentBalance / f.targetAmount < 0.25))
  );

  const handleLock = () => {
    lockSteward();
    if (onLock) onLock();
  };

  return (
    <section className="p-4 sm:p-5 space-y-5" aria-label="Steward Portal">
      {/* Steward Portal Header */}
      <section className="flex items-center justify-between border-b border-parchment-300 pb-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-serif font-bold text-stone-900">
              {t('steward.title') || 'Steward Portal'}
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            {t('steward.authenticated') || 'Authenticated as Abbot / Steward'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLock}
          className="p-1.5 rounded-lg border border-stone-300 hover:bg-parchment-200 text-stone-600 hover:text-stone-900 text-xs flex items-center gap-1 transition-colors"
          title={t('steward.lockPortal') || 'Lock Steward Portal'}
          aria-label={t('steward.lockPortal') || 'Lock Steward Portal'}
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">{language === 'vi' ? 'Khóa' : 'Lock'}</span>
        </button>
      </section>

      {/* Treasury Overview Card */}
      <section
        className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-md relative overflow-hidden space-y-4"
        aria-label="Treasury Overview"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-saffron-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-amber-200/80 font-medium">
                {t('steward.treasuryTotal') || 'Total Available Reserves'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                ${totalReserves.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-400 block">{t('steward.totalTarget')}</span>
            <span className="text-xs text-amber-400 font-semibold">
              ${totalTarget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Low Fund Alerts */}
        {lowFundAlerts.length > 0 && (
          <div className="bg-amber-950/70 border border-amber-500/40 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('steward.lowFundAlert') || 'Low Reserve Warning'}</span>
            </div>
            <div className="space-y-1">
              {lowFundAlerts.map((fund) => (
                <div key={fund.id} className="text-[11px] text-amber-200/90 flex justify-between">
                  <span className="truncate pr-2">• {getFundName(fund, t)}</span>
                  <span className="font-mono text-amber-300 shrink-0">
                    {t('steward.remainingBalance', { amount: fund.currentBalance.toLocaleString() })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions inside / under Treasury Card */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] shadow-xs"
            aria-label="Log New Expense"
          >
            <Receipt className="w-4 h-4" />
            <span>+ {t('steward.logExpense') || 'Log Expense'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewFundModalOpen(true)}
            className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            aria-label="Launch New Cause Fund"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ {t('steward.launchFund') || 'Launch New Cause Fund'}</span>
          </button>
        </div>
      </section>

      {/* Reserves & Active Funds List */}
      <section className="space-y-3" aria-label="Reserves & Active Funds">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-900">
            {t('steward.reservesAndFunds') || 'Reserves & Active Funds'}
          </h3>
          <span className="text-xs text-stone-500">{t('steward.campaignsCount', { count: funds.length })}</span>
        </div>

        <div className="space-y-2.5">
          {funds.map((fund) => {
            const pct = fund.targetAmount > 0 ? Math.min(100, Math.round((fund.currentBalance / fund.targetAmount) * 100)) : 100;
            const isLow = fund.currentBalance < 1000;

            return (
              <div
                key={fund.id}
                className="bg-white rounded-xl p-3 border border-parchment-300 shadow-2xs hover:border-amber-300 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                      {getFundName(fund, t)}
                    </h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">
                      {getFundDescription(fund, t)}
                    </p>
                  </div>
                  {isLow && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      {t('steward.lowReserve')}
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium text-stone-600">
                    <span>
                      ${fund.currentBalance.toLocaleString()} / ${fund.targetAmount.toLocaleString()}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-parchment-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-saffron-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    <span>{t('steward.daysRemaining', { days: fund.daysRemaining ?? 30 })}</span>
                  </span>
                  <span className="text-amber-800 font-medium">
                    {t('steward.devoteesCount', { count: fund.supportersCount })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Morning Chanting & Prayer Intentions Queue */}
      <ChantingQueue />

      {/* Modals */}
      <ExpenseEntryModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />

      <NewFundModal
        isOpen={isNewFundModalOpen}
        onClose={() => setIsNewFundModalOpen(false)}
      />
    </section>
  );
};

export default StewardPortal;
