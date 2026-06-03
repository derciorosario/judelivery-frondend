import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Icon from '../common/Icon';

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialUserId = location.state?.userId || '';
  const [userId, setUserId] = useState(initialUserId);
  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(900);

  useEffect(() => {
    if (!initialUserId && !email) return;
    setCountdown(900);
  }, [initialUserId, email]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!userId || !code || code.length !== 6) {
      setError('Introduza o código de 6 dígitos.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/verify-registration-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
        window.location.href = '/';
      } else {
        setError(data.message || 'Código inválido.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setCode('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/resend-verification-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        setCountdown(900);
      } else {
        setError(data.message || 'Erro ao reenviar código.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Icon name="mailCheck" size={30} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Verificar Email</h2>
          <p className="text-sm text-slate-500 mt-1">Introduza o código enviado para o seu email.</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Código de Verificação</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A verificar...' : 'Verificar Código'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {countdown > 0 ? (
            <p className="text-xs text-slate-400">Reenviar em {formatTime(countdown)}</p>
          ) : (
            <button type="button" onClick={handleResend} disabled={loading} className="text-sm text-orange-500 hover:text-orange-600 font-medium">Reenviar código</button>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
