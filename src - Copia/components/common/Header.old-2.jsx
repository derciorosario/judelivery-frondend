import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useSocket } from '../../contexts/SocketContext';
import client from '../../api/client';

// Import sound file
import notificationSound from '../../assets/sound/notification-1.mp3';

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
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000); // Animation lasts 2 seconds
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
      
      if (newCount > (unseenCount || 0)) {
        playNotificationSound();
        
        if (wasZero && newCount > 0) {
          showNewMessageToast(e.detail.message || 'Nova mensagem recebida!');
        }
      }
    };
    window.addEventListener('notifications:unseen', handler);

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
            {/* Animated border container */}
            <div className={`relative ${isAnimating ? 'animate-border-run' : ''}`}>
              <button 
                onClick={onNotificationClick} 
                className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 transition-all duration-300 z-10"
              >
                <Icon name="bell" size={18} />
              </button>
              
              {/* Moving border gradient */}
              {isAnimating && (
                <div className="absolute inset-0 rounded-xl pointer-events-none">
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-border-spin" />
                </div>
              )}
            </div>
            
            {unseenCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs font-bold px-1 z-20">
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
        @keyframes borderSpin {
          0% {
            border-top-color: #3b82f6;
            border-right-color: transparent;
            border-bottom-color: transparent;
            border-left-color: transparent;
          }
          25% {
            border-top-color: #3b82f6;
            border-right-color: #8b5cf6;
            border-bottom-color: transparent;
            border-left-color: transparent;
          }
          50% {
            border-top-color: #3b82f6;
            border-right-color: #8b5cf6;
            border-bottom-color: #ec489a;
            border-left-color: transparent;
          }
          75% {
            border-top-color: #3b82f6;
            border-right-color: #8b5cf6;
            border-bottom-color: #ec489a;
            border-left-color: #f59e0b;
          }
          100% {
            border-top-color: #3b82f6;
            border-right-color: #8b5cf6;
            border-bottom-color: #ec489a;
            border-left-color: #f59e0b;
          }
        }

        @keyframes borderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash {
          to {
            stroke-dashoffset: -200;
          }
        }

        .animate-border-run {
          animation: borderRotate 2s linear infinite;
        }

        .animate-border-spin {
          animation: borderSpin 2s linear infinite;
        }

        /* Alternative: Conic gradient moving border */
        .border-moving {
          background: conic-gradient(
            from 0deg,
            #3b82f6,
            #8b5cf6,
            #ec489a,
            #f59e0b,
            #3b82f6
          );
          padding: 2px;
          border-radius: 0.75rem;
        }

        .border-moving button {
          background: white;
          border-radius: 0.7rem;
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

        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;