import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../common/Icon';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();
  const registerMessage = location.state?.message;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(registerMessage || "");
  const [loading, setLoading] = useState(false);

  const credentials = [
    { role: "Super Admin", email: "superadmin@judelivery.mz", pass: "superadmin123", color: "bg-red-50 border-red-200", dot: "bg-red-400" },
    { role: "Admin", email: "admin@judelivery.mz", pass: "admin123", color: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
    { role: "Manager", email: "manager@judelivery.mz", pass: "manager123", color: "bg-teal-50 border-teal-200", dot: "bg-teal-400" },
    { role: "Driver", email: "driver@judelivery.mz", pass: "driver123", color: "bg-blue-50 border-blue-200", dot: "bg-blue-400" },
    { role: "Customer", email: "customer@judelivery.mz", pass: "customer123", color: "bg-purple-50 border-purple-200", dot: "bg-purple-400" },
  ];

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });


      if (response.ok) {
        const data = await response.json();
        if (data.token && data.refreshToken) {
          setToken(data.token, data.refreshToken);
        }
        navigate('/');
      } else {
        const data = await response.json();
        setError(data.error || data.message || "Email ou senha incorretos.");
      }
    } catch (err) {
      console.log({err})
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
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
        if (data.token && data.refreshToken) {
          setToken(data.token, data.refreshToken);
        }
        navigate('/');
      } catch (err) {
        setError("Erro no login com Google");
      }
    },
    onError: () => setError("Erro no login com Google")
  });

  const fillCred = (c) => { setEmail(c.email); setPassword(c.pass); setError(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          <Icon name="truck" size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">JuDelivery</h1>
        <p className="text-slate-400 text-sm mt-1">O seu parceiro de entregas.</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Entrar na plataforma</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 pr-10"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400">
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm flex items-center gap-1"><Icon name="alert" size={16} />{error}</p>}
          {success && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-xl">{success}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Esqueceu a palavra-passe?</Link>
          </div>
          <button
            onClick={() => googleLogin()}
            className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"></path><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"></path><path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"></path><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"></path></svg>
            Entrar com Google
          </button>
          <div className="text-center">
            <Link to="/register" className="text-sm text-slate-500 hover:text-slate-700 font-medium">Não tem conta? Registe-se</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="mt-6">
          <p className="text-xs text-slate-400 text-center mb-3 font-medium">── CREDENCIAIS DE DEMONSTRAÇÃO ──</p>
          <div className="space-y-2">
            {credentials.map(c => (
              <button key={c.role} onClick={() => fillCred(c)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${c.color}`}>
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{c.role}</p>
                  <p className="text-xs text-slate-500 truncate">{c.email} · {c.pass}</p>
                </div>
                <span className="text-xs text-slate-400">usar →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;