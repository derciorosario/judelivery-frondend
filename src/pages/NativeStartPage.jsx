import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { isNative } from '../api/client';
import Logo from '../assets/logo.png';
import { useEffect } from 'react';

const NATIVE_STORAGE_KEY = 'native_start_seen';

const NativeStartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem(NATIVE_STORAGE_KEY);
    if (seen) {
      navigate('/start', { replace: true });
    }
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem(NATIVE_STORAGE_KEY, 'true');
    navigate('/start');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-900 flex flex-col items-center justify-center px-6 overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10 w-full max-w-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <img src={Logo} className="w-[120px]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight"
        >
          Bem-vindo à{' '}
          <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent">
            J. RIBEIRO
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-sm sm:text-base text-white/80 mb-8 leading-relaxed"
        >
          Entregas e transporte rápidos, seguros e confiáveis em toda a província de Maputo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <button
            onClick={handleStart}
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-secondary-900 font-bold rounded-full hover:shadow-2xl transition-all duration-300 group text-base sm:text-lg"
          >
            Começar
            <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex items-center justify-center space-x-6 text-white/50 text-xs"
        >
          <span className="flex items-center">
            <FaArrowRight className="mr-1 text-[8px]" />
            Seguro
          </span>
          <span className="flex items-center">
            <FaArrowRight className="mr-1 text-[8px]" />
            Rápido
          </span>
          <span className="flex items-center">
            <FaArrowRight className="mr-1 text-[8px]" />
            Rastreável
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NativeStartPage;
