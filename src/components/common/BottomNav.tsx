import React from 'react';
import { Home, Eye, BookOpen, Shield } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

export type TabId = 'sanctuary' | 'transparency' | 'prayerWall' | 'steward';

export interface BottomNavProps {
  activeTab: TabId;
  onTabSelect: (tab: TabId) => void;
}

interface NavItem {
  id: TabId;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    id: 'sanctuary',
    labelKey: 'common.tabs.sanctuary',
    icon: Home,
  },
  {
    id: 'transparency',
    labelKey: 'common.tabs.transparency',
    icon: Eye,
  },
  {
    id: 'prayerWall',
    labelKey: 'common.tabs.prayerWall',
    icon: BookOpen,
  },
  {
    id: 'steward',
    labelKey: 'common.tabs.steward',
    icon: Shield,
  },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabSelect }) => {
  const { t } = useTranslation();

  return (
    <nav
      className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-parchment-300 px-2 py-1.5 shadow-md flex items-center justify-around"
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
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[64px] ${
              isActive
                ? 'text-saffron-700 font-medium bg-amber-50/80 shadow-2xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px] leading-tight tracking-tight">{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
