import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const BottomNav = ({ tabs, active, setActive, urgentOrdersCount = 0 }) => {
  
  const [showDropdown, setShowDropdown] = useState(false);
  const visibleTabs = tabs.slice(0, 4);
  const hiddenTabs = tabs.slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex z-30 safe-area-pb">
      {visibleTabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active === t.id ? "text-orange-500" : "text-slate-400"}`}>
          <div className="relative">
            <Icon name={t.icon} size={22} />
            {t.id === "orders" && urgentOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
      {hiddenTabs.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors pr-4 ${hiddenTabs.some(t => t.id === active) ? "text-orange-500" : "text-slate-400"}`}
          >
            <Icon name="more" size={22} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 !mb-0 z-20"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute bottom-full right-2 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[140px] z-30">
                {hiddenTabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActive(t.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${active === t.id ? "text-orange-500" : "text-slate-600"}`}
                  >
                    <Icon name={t.icon} size={18} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};




export default BottomNav;