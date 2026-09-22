import React from 'react';
import { ShoppingBag, Camera, Shield, User } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export type TabId = 'market' | 'proof' | 'steward' | 'profile';

export interface BottomNavProps {
  activeTab: TabId;
  onTabSelect: (tab: TabId) => void;
  isStewardUnlocked?: boolean;
}

interface NavItem {
  id: TabId;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabSelect,
  isStewardUnlocked = false,
}) => {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    {
      id: 'market',
      labelKey: 'common.tabs.market',
      icon: ShoppingBag,
    },
    {
      id: 'proof',
      labelKey: 'common.tabs.proof',
      icon: Camera,
    },
    isStewardUnlocked
      ? {
          id: 'steward',
          labelKey: 'common.tabs.steward',
          icon: Shield,
        }
      : {
          id: 'profile',
          labelKey: 'common.tabs.profile',
          icon: User,
        },
  ];

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-parchment-300 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] shadow-md grid grid-cols-3 gap-1"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const label = t(item.labelKey);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabSelect(item.id)}
            aria-selected={isActive}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all w-full min-w-0 ${
              isActive
                ? 'text-saffron-700 font-semibold bg-amber-50/80 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 shrink-0 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px] leading-tight tracking-tight truncate max-w-full text-center">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
