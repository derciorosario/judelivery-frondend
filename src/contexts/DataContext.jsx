import { createContext, useContext,useState,useEffect} from 'react';
const DataContext = createContext();

export const DataProvider = ({ children }) => {

    let initial_popups={
      profile:false,
      login_prompt:false,
      restricted_dialog_dismissed:false
    }

     let not_closing_popups=[
      'support_messages'
    ]
    const [_openPopUps, _setOpenPopUps] = useState(initial_popups);

    // State for partner login status
    const [isPartner, setIsPartner] = useState(() => {
      return localStorage.getItem('isPartner') === 'true';
    });

    // Update isPartner when localStorage changes
    useEffect(() => {
      const handleStorageChange = () => {
        setIsPartner(localStorage.getItem('isPartner') === 'true');
      };
      
      // Listen for storage events (when localStorage changes in other tabs/windows)
      window.addEventListener('storage', handleStorageChange);
      
      // Also check on mount and when component re-renders
      handleStorageChange();
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }, []);

    function _closeAllPopUps(){
          _setOpenPopUps(initial_popups)
          document.removeEventListener('click', handleOutsideClick)
    }
    function _closeThisPopUp(option){
      _setOpenPopUps({..._openPopUps,[option]:false})
    }

  const _scrollToSection = (to,instant) => {
      const Section = document.getElementById(to);
      if (Section) {
        Section.scrollIntoView({ behavior:instant ? 'instant' :  (to=="home" || to=="about" || to=="move_after_pagination" || to=="contact") ? 'smooth':'instant' });
      }else{
        setTimeout(()=>_scrollToSection(to),2000)
      }
   }

    const handleOutsideClick = (event) => {
      
      let close=true
      Object.keys(initial_popups).forEach(f=>{
          if(event?.target?.closest(`._${f}`))  {
            close=false
          }
      })
      Object.keys(initial_popups).forEach(k=>{
          if(not_closing_popups.includes(k) && _openPopUps[k]){
             close=false
          }
      })
      if(close){
        document.removeEventListener('click', handleOutsideClick); 
        _closeAllPopUps()
      }

    };

 
    const  _showPopUp = (option,value) => {
        setTimeout(()=>document.addEventListener('click', handleOutsideClick),200)
        _setOpenPopUps({...initial_popups,[option]:value || true})
    }

     const [postDialogOpen, setPostDialogOpen] = useState(false);

    const env="test" //test || pro
    
    const value = {
      postDialogOpen, setPostDialogOpen,
      env,
      isPartner,
      setIsPartner,
      _openPopUps,
      _scrollToSection,
      _closeAllPopUps,
      _showPopUp,
      _closeThisPopUp,
      initial_popups,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
   return useContext(DataContext);
};