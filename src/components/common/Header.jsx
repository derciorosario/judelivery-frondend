import React from 'react';
import Icon from './Icon';

const Header = ({ user, onLogout, title, notifs = 3, onNotificationClick }) => (
  
  <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
    <div>
      <p className="text-xs text-slate-400">Olá, {user.name.split(" ")[0]}</p>
      <h1 className="text-base font-bold text-slate-800">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative">
        <button onClick={onNotificationClick} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon name="bell" size={18} />
        </button>
        {notifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{notifs}</span>}
      </div>
      <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
        <Icon name="logout" size={18} />
      </button>
    </div>
  </div>
);



export default Header;