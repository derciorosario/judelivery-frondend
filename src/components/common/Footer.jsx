import { useState, useEffect } from 'react';
import { FaFacebook, FaInstagram, FaWhatsapp, FaMotorcycle, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { getPublicSettings } from '../../api/client';

const Footer = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await getPublicSettings();
        setSettings(response.data?.settings || null);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const appSettings = settings?.app || {};

  return (
    <footer className="bg-secondary-900 text-white pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FaMotorcycle className="text-white text-base sm:text-xl" />
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-bold">{appSettings.appName || 'J. RIBEIRO'}</h4>
                <p className="text-xs sm:text-sm text-primary-400">ENTREGAS &amp; TRANSPORTE</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6">Sua entrega, nossa missão!</p>
            <div className="flex justify-center sm:justify-start space-x-3 sm:space-x-4">
              {[FaFacebook, FaInstagram, FaWhatsapp].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition"
                >
                  <Icon className="text-base sm:text-xl" />
                </a>
              ))}
            </div>
          </div>
          
          <div className="text-center sm:text-left">
            <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Serviços</h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li className="hover:text-white transition">Entregas Rápidas</li>
              <li className="hover:text-white transition">Transporte de Mercadorias</li>
              <li className="hover:text-white transition">Transporte de Pessoas</li>
              <li className="hover:text-white transition">Entregas Expressas</li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left">
            <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Contato</h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center justify-center sm:justify-start hover:text-white transition">
                <FaPhone className="mr-2 sm:mr-3 text-primary-400 text-xs sm:text-sm" /> {appSettings.supportPhone || '+258 82 333 4455'}
              </li>
              <li className="flex items-center justify-center sm:justify-start hover:text-white transition">
                <FaEnvelope className="mr-2 sm:mr-3 text-primary-400 text-xs sm:text-sm" /> {appSettings.supportEmail || 'suporte@judelivery.co.mz'}
              </li>
              <li className="flex items-center justify-center sm:justify-start hover:text-white transition">
                <FaMapMarkerAlt className="mr-2 sm:mr-3 text-primary-400 text-xs sm:text-sm" /> Maputo, Moçambique
              </li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left">
            <h5 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">Horário</h5>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-gray-400">
              {appSettings.supportHours ? (
                appSettings.supportHours.split('|').map((part, i) => {
                  const idx = part.indexOf(':');
                  if (idx === -1) {
                    return (
                      <li key={i} className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                        <span>{part.trim()}</span>
                      </li>
                    );
                  }
                  const day = part.slice(0, idx).trim();
                  const time = part.slice(idx + 1).trim();
                  return (
                    <li key={i} className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                      <span>{day}</span>
                      <span className="text-white font-semibold">{time}</span>
                    </li>
                  );
                })
              ) : (
                <>
                  <li className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                    <span>Segunda - Sexta</span>
                    <span className="text-white font-semibold">24h</span>
                  </li>
                  <li className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                    <span>Sábado</span>
                    <span className="text-white font-semibold">24h</span>
                  </li>
                  <li className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                    <span>Domingo</span>
                    <span className="text-white font-semibold">24h</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {appSettings.appName || 'J. RIBEIRO SERVIÇOS E.I'}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;