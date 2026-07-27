import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useSocket } from '../../contexts/SocketContext';
import client from '../../api/client';
import { useNavigate } from 'react-router-dom';

// Import sound file
import notificationSound from '../../assets/sound/notification-1.mp3';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ user, onLogout, title, onNotificationClick, urgentOrdersCount }) => {
  const navigate = useNavigate();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const timeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const { socket } = useSocket();
  const {pathname} = useAuth()



  useEffect(()=>{
       document.body.scrollIntoView({ behavior:'instant' })
  },[pathname])

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
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    setIsAnimating(true);
    animationTimeoutRef.current = setTimeout(() => setIsAnimating(false), 2000);
  };

  const stopAnimation = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    setIsAnimating(false);
  };

  const showNewMessageToast = (message) => {
    setLastMessage(message);
    setShowToast(true);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleNotificationClick = () => {
    // Stop the animation when notification button is clicked
    stopAnimation();
    
    // Call the original onNotificationClick prop
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  useEffect(() => {
    const handler = (e) => {
      const newCount = e.detail.count;
      const wasZero = unseenCount === 0;
      setUnseenCount(newCount);
      
      // Only animate if there are notifications (newCount > 0)
      if (newCount > 0) {
        triggerAnimation();
      } else {
        // Stop animation if count becomes 0
        stopAnimation();
      }
      
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
        // If initial count is 0, ensure no animation
        if (data.count === 0 || !data.count) {
          stopAnimation();
        } else if (data.count > 0) {
          triggerAnimation();
        }
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
      
      // Only animate if there are notifications (count > 0)
      if (count > 0) {
        triggerAnimation();
      } else {
        // Stop animation if count becomes 0
        stopAnimation();
      }
      
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="sticky top-0 z-30">
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Olá, {user.name?.split(" ")[0]}</p>
            <h1 className="text-base font-bold text-slate-800">{title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              {/* Animated border container */}
              <div className={`relative ${isAnimating ? 'animated-border' : ''}`}>
                <button 
                  onClick={handleNotificationClick} 
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 relative z-10"
                >
                  <Icon name="bell" size={18} />
                </button>
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
           {/* Urgent Orders Banner */}
        {urgentOrdersCount > 0  && (
          <div
            className="bg-red-500/80 text-white text-center py-2 px-4 flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => navigate('/orders')}
          >
            <Icon name="alert" size={16} className="animate-pulse" />
            <span className="text-sm font-medium">{urgentOrdersCount} pedido(s) urgente(s) aguardando</span>
          </div>
        )}

     
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

     
      <style>{`
        /* Animated border that moves around */
        .animated-border {
          position: relative;
          border-radius: 12px;
        }
        
        .animated-border::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            90deg,
            #ff6b6b,
            #ffd93d,
            #6bcb77,
            #4d96ff,
            #ff6b6b
          );
          background-size: 300% 300%;
          border-radius: 12px;
          animation: borderRotate 2s linear infinite;
          z-index: 0;
        }
        
        .animated-border::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          border-radius: 11px;
          z-index: 0;
        }
        
        button {
          /*position: relative*/;
          z-index: 1;
        }
        
        @keyframes borderRotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </>
  );
};

export default Header;