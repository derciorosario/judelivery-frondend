import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginPage from './components/auth/LoginPage';
import AdminApp from './components/admin/AdminApp';
import GestorApp from './components/gestor/GestorApp';
import MotoristaApp from './components/motorista/MotoristaApp';
import CustomerApp from './components/cliente/CustomerApp';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin">
                <AdminApp />
              </ProtectedRoute>
            } />
            <Route path="/gestor/*" element={
              <ProtectedRoute role="gestor">
                <GestorApp />
              </ProtectedRoute>
            } />
            <Route path="/motorista/*" element={
              <ProtectedRoute role="motorista">
                <MotoristaApp />
              </ProtectedRoute>
            } />
            <Route path="/cliente/*" element={
              <ProtectedRoute role="cliente">
                <CustomerApp />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;