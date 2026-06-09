import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { useSocket } from '../../contexts/SocketContext';
import client from '../../api/client';

const Header = ({ user, onLogout, title, onNotificationClick }) => {
  const [unseenCount, setUnseenCount] = useState(0);
  const { socket } = useSocket();

  useEffect(() => {
    const handler = (e) => {
      setUnseenCount(e.detail.count);
    };
    window.addEventListener('notifications:unseen', handler);

    // Fetch unseen count on mount
    const fetchUnseenCount = async () => {
      try {
        const { data } = await client.get('/notifications/unseen-count');
        setUnseenCount(data.count || 0);
      } catch (err) {
        console.error('Failed to fetch unseen count:', err);
      }
    };
    fetchUnseenCount();

    return () => window.removeEventListener('notifications:unseen', handler);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleUnseenCount = (count) => {
      setUnseenCount(count);
    };

    socket.on('notification:unseen-count', handleUnseenCount);

    return () => {
      socket.off('notification:unseen-count', handleUnseenCount);
    };
  }, [socket]);

  if (!user) return null;

  return (
   <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
     <div>
       <p className="text-xs text-slate-400">Olá, {user.name?.split(" ")[0]}</p>
       <h1 className="text-base font-bold text-slate-800">{title}</h1>
     </div>
     <div className="flex items-center gap-2">
       <div className="relative">
         <button onClick={onNotificationClick} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
           <Icon name="bell" size={18} />
         </button>
         {unseenCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />}
       </div>
       <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
         <Icon name="logout" size={18} />
       </button>
     </div>
   </div>
 );
};

export default Header;