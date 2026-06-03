import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './contexts/DataContext.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx';
import ToastProvider from './lib/ToastProvider.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { DarkModeProvider } from './contexts/DarkModeContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import i18n from './i18n';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="910053732139-h4knnvvi1g2eac9faai6iviquak49c3e.apps.googleusercontent.com">
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <DarkModeProvider>
            <ToastProvider />
            <App />
          </DarkModeProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
)
