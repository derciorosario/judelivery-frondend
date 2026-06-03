import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('http://localhost:5001/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Se o email existir, enviámos um link de recuperação.');
      } else {
        setError(data.message || 'Erro ao solicitar recuperação.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Recuperar Palavra-passe</h2>
          <p className="text-sm text-slate-500 mt-1">Introduza o seu email para receber o link de recuperação.</p>
        </div>

        {message && <p className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-xl mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'A enviar...' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
