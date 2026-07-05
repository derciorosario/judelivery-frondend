import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const BottomNav = ({ tabs, active, setActive }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const visibleTabs = tabs.slice(0, 4);
  const hiddenTabs = tabs.slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex z-30 safe-area-pb">
      {visibleTabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active === t.id ? "text-orange-500" : "text-slate-400"}`}>
          <Icon name={t.icon} size={22} />
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