import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { useSocket } from '../../contexts/SocketContext';
import client from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import ContactSupportModal from './modals/ContactSupportModal';
import ConfirmDialog from './ConfirmDialog';
const isNative = Capacitor.isNativePlatform();
import { useData } from "../../contexts/DataContext";

const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const getMobileOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  if (/android/i.test(userAgent)) return 'android';
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return 'ios';
  return null;
};


// Import sound file
import notificationSound from '../../assets/sound/notification-1.mp3';
import { useAuth } from '../../contexts/AuthContext';
import { Phone } from 'lucide-react';
import { App } from '@capacitor/app'
import { Capacitor } from "@capacitor/core";

const Header = ({ user, onLogout, title, onNotificationClick, urgentOrdersCount }) => {
  const navigate = useNavigate();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const timeoutRef = useRef(null);
  const animationTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const { socket } = useSocket();
  const {pathname} = useAuth()
  const data=useData()






    useEffect(() => {



    const isNative = Capacitor.isNativePlatform();
    let backListener;

    // -------------------------
    // ANDROID HARDWARE BACK
    // -------------------------
    if (isNative) {
      backListener = App.addListener("backButton", (event) => {
        // CASE 1: Dialog open → close dialog, block navigation + app exit
        if (data.postDialogOpen) {
          event.preventDefault?.();
          data.setPostDialogOpen(false);
          return;
        }

        // CASE 2: Dialog closed → normal navigation rules
        const path = location.pathname;

        // IF in "/", "/people" → exit app
        if (path === "/" || path === "/people") {
          App.exitApp();
          return;
        }

        // Otherwise → navigate back inside the app
        if (window.history.length > 1) {
          window.history.back();
          return;
        }

        // If somehow no history → exit
        App.exitApp();
      });
    }

    // -------------------------
    // BROWSER BACK BUTTON
    // -------------------------
    const handlePopState = (e) => {
      if (data.postDialogOpen) {
        // Close dialog instead of going back
        e.preventDefault();
        data.setPostDialogOpen(false);

        // Push the state back to prevent actual navigation
        window.history.pushState(null, "", window.location.href);
      }
    };

    if (data.postDialogOpen) {
      // Trap browser back
      window.history.pushState(null, "", window.location.href);
      window.addEventListener("popstate", handlePopState);
    }

    // Cleanup
    return () => {
      if (backListener) backListener.remove();
      window.removeEventListener("popstate", handlePopState);
    };
  }, [data.postDialogOpen, location.pathname]);






  const [showMobileBanner, setShowMobileBanner] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('mobileAppBannerDismissed');
    const dismissedDate = localStorage.getItem('mobileAppBannerDismissedDate');
    const today = new Date().toDateString();

  
    if (!dismissed || dismissedDate !== today) {
      if (!isNative && isMobile() && getMobileOS()) {
        setShowMobileBanner(true);
      }
    }

  }, []);



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

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    data.setPostDialogOpen(true)
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const handleNotificationClick = () => {
    stopAnimation();
    
    // Call the original onNotificationClick prop
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleCloseMobileBanner = () => {
    setShowMobileBanner(false);
    localStorage.setItem('mobileAppBannerDismissed', 'true');
    localStorage.setItem('mobileAppBannerDismissedDate', new Date().toDateString());
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
        {/* Mobile App Download Banner */}
        {showMobileBanner && (() => {
          const os = getMobileOS();
          const isAndroid = os === 'android';
          const isIOS = os === 'ios';
          return (
            <div className="bg-slate-800 text-white py-2 px-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Icon name="smartphone" size={18} className="text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate !text-white">
                  {isAndroid && 'Baixe o nosso aplicativo para Android'}
                  {isIOS && 'Em breve, disponível na App Store!'}
                </span>
                 {isAndroid && (
                  <Link
                    to="/download"
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 !text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Baixar
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
               
                <button
                  onClick={handleCloseMobileBanner}
                  className="p-1 rounded-full hover:bg-slate-700 transition-colors"
                  aria-label="Fechar banner"
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>
          );
        })()}

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
<button onClick={handleLogoutClick} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <Icon name="logout" size={18} />
              </button>
          </div>
          
        </div>
{/* Urgent Orders Banner for Drivers */}
        {urgentOrdersCount > 0 && user?.role != 'customer' && (
          <div
            className="bg-red-500 text-white text-center py-2 px-4 flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => navigate('/orders')}
          >
            <Icon name="alert" size={16} className="animate-pulse" />
            <span className="text-sm font-medium">
              {urgentOrdersCount} {urgentOrdersCount === 1 ? 'pedido urgente' : 'pedidos urgentes'} aguardando
            </span>
          </div>
        )}

        {/* Urgent Orders Banner for Customers */}
        {urgentOrdersCount > 0 && user?.role === 'customer' && (
          <div className="bg-amber-500 text-white text-center py-2 px-4 flex items-center justify-center gap-3">
            <Icon name="alert" size={16} className="animate-pulse" />
            <span className="text-sm font-medium">
              {urgentOrdersCount === 1 ? 'Existe' : 'Existem'} {urgentOrdersCount} {urgentOrdersCount === 1 ? 'pedido urgente' : 'pedidos urgentes'}
            </span>
            <button

              onClick={() =>{
                 setShowSupportModal(true)
                 data.setPostDialogOpen(true)
                 
              }}

              className="ml-2 px-3 py-0.5 flex items-center justify-center gap-2 bg-white text-amber-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
            >
              <Phone className="w-4"/> Suporte
            </button>
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

{/* Support Modal for Customers */}
       {showSupportModal && user?.role === 'customer' && (
         <ContactSupportModal
           autoClose={true}
           isOpen={showSupportModal}
           onClose={() => setShowSupportModal(false)}
         />
       )}

       {/* Logout Confirmation Dialog */}
       {showLogoutConfirm && (
         <ConfirmDialog
           autoClose={true}
           isOpen={showLogoutConfirm}
           onClose={handleLogoutCancel}
           onConfirm={handleLogoutConfirm}
           title="Confirmar Saída"
           message="Tem certeza que deseja sair da sua conta?"
           confirmText="Sair"
           cancelText="Cancelar"
           variant="danger"
         />
       )}

     </>
  );
};

export default Header;