import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useSocket } from '../../contexts/SocketContext';
import client from '../../api/client';

// Import sound file - adjust the path based on your folder structure
import notificationSound from '../../assets/sound/notification-1.mp3';
// Or if using public folder:
// const notificationSound = '/sounds/notification.mp3';

const Header = ({ user, onLogout, title, onNotificationClick }) => {
  const [unseenCount, setUnseenCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const timeoutRef = useRef(null);
  const audioRef = useRef(null);
  const { socket } = useSocket();

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(notificationSound);
    // Optional: Preload the audio
    audioRef.current.preload = 'auto';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = async () => {
    if (!audioRef.current) return;
    
    try {
      // Reset the audio to start from beginning if it's already playing
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
      // Most browsers require user interaction first
      // The sound will work after user clicks anywhere on the page
    }
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const showNewMessageToast = (message) => {
    setLastMessage(message);
    setShowToast(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  useEffect(() => {
    const handler = (e) => {
      const newCount = e.detail.count;
      const wasZero = unseenCount === 0;
      setUnseenCount(newCount);
      triggerAnimation();
      
      // Play sound and show toast for new messages
      if (newCount > (unseenCount || 0)) {
        playNotificationSound();
        
        if (wasZero && newCount > 0) {
          showNewMessageToast(e.detail.message || 'Nova mensagem recebida!');
        }
      }
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
  }, [unseenCount]);

  useEffect(() => {
    if (!socket) return;

    const handleUnseenCount = (count, message) => {
      const wasZero = unseenCount === 0;
      setUnseenCount(count);
      triggerAnimation();
      
      // Play sound and show toast for new messages
      if (count > (unseenCount || 0)) {
        playNotificationSound();
        
        if (wasZero && count > 0) {
          showNewMessageToast(message || 'Nova mensagem recebida!');
        }
      }
    };

    socket.on('notification:unseen-count', handleUnseenCount);

    return () => {
      socket.off('notification:unseen-count', handleUnseenCount);
    };
  }, [socket, unseenCount]);

  if (!user) return null;

  return (
    <>
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div>
          <p className="text-xs text-slate-400">Olá, {user.name?.split(" ")[0]}</p>
          <h1 className="text-base font-bold text-slate-800">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={onNotificationClick} 
              className={`w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all duration-300 ${
                isAnimating ? 'animate-bell-shake' : ''
              }`}
            >
              <Icon name="bell" size={18} />
            </button>
            {unseenCount > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs font-bold px-1 ${
                isAnimating ? 'animate-pulse-scale' : ''
              }`}>
                {unseenCount > 9 ? '9+' : unseenCount}
              </span>
            )}
          </div>
          <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <Icon name="message" size={16} className="text-blue-400" />
            <span className="text-sm font-medium">{lastMessage}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }

        @keyframes pulseScale {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-bell-shake {
          animation: bellShake 0.5s ease-in-out;
        }

        .animate-pulse-scale {
          animation: pulseScale 0.5s ease-in-out;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;