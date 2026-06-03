import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import Icon from '../common/Icon';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { name, email, phone, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Nome, email e palavra-passe são obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }
    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data.userId);
        setShowVerifyModal(true);
        setCountdown(120);
      } else {
        setError(data.message || 'Erro ao criar conta.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showVerifyModal || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showVerifyModal, countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!code || code.length !== 6) {
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
        setCountdown(120);
      } else {
        setError(data.message || 'Erro ao reenviar código.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await userInfoRes.json();
        const googleEmail = userInfo.email || 'google-user@example.com';
        const googleName = userInfo.name || 'Google User';
        const response = await fetch('http://localhost:5001/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: googleEmail, name: googleName })
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('refresh_token', data.refreshToken);
          window.location.href = '/';
        } else {
          setError(data.message || 'Erro no login com Google');
        }
      } catch (err) {
        setError('Erro no login com Google');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Erro no login com Google')
  });

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center mb-5">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Criar Conta</h2>
          <p className="text-sm text-slate-500 mt-1">Registe-se como cliente.</p>
        </div>

        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Completo</label>
            <input type="text" name="name" value={name} onChange={handleChange} placeholder="Seu nome" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <input type="email" name="email" value={email} onChange={handleChange} placeholder="seu@email.com" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone (opcional)</label>
            <input type="tel" name="phone" value={phone} onChange={handleChange} placeholder="+258 8XX XXX XXX" className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Palavra-passe</label>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"}
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 pr-10"
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400">
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confirmar Palavra-passe</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPass ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Repita a palavra-passe"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 pr-10"
                required
              />
              <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-3.5 text-slate-400">
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'A criar...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-4">
          <button onClick={() => googleLogin()} disabled={loading} className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"></path><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"></path><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"></path><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"></path></svg>
            Registar com Google
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">Já tem conta? <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">Inicie sessão</Link></p>
        </div>
      </div>

      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="mailCheck" size={24} className="text-green-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Verificar Email</h3>
              <p className="text-xs text-slate-500 mt-1">Enviamos um código de 6 dígitos para <strong>{email}</strong></p>
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

            <form onSubmit={handleVerify} className="space-y-3">
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
                  autoFocus
                />
              </div>
              <button type="submit" disabled={loading || code.length !== 6} className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'A verificar...' : 'Verificar Código'}
              </button>
            </form>

            <div className="mt-3 text-center">
              {countdown > 0 ? (
                <p className="text-xs text-slate-400">Reenviar em {formatTime(countdown)}</p>
              ) : (
                <button type="button" onClick={handleResend} disabled={loading} className="text-sm text-orange-500 hover:text-orange-600 font-medium">Reenviar código</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
