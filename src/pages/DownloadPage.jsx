import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGooglePlay, FaApple, FaMobileAlt, FaShieldAlt, FaClock,
  FaUsers, FaBox, FaTruck, FaStar, FaArrowRight
} from 'react-icons/fa';
import { getPublicSettings, API_URL } from '../api/client';
import Footer from '../components/common/Footer';
import Logo from '../assets/logo.png';

const DownloadPage = () => {
  const [promotion, setPromotion] = useState(null);
  const [promotionLoading, setPromotionLoading] = useState(true);

  useEffect(() => {
    const fetchPromotion = async () => {
      setPromotionLoading(true);
      try {
        const { data } = await getPublicSettings();
        setPromotion(data?.settings?.promotion || null);
      } catch {
        setPromotion(null);
      } finally {
        setPromotionLoading(false);
      }
    };
    fetchPromotion();
  }, []);

  const androidDownloadUrl = `${API_URL.replace(/\/api$/, '')}/download/android/app-debug.apk`;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <Link to="/" className="inline-block mb-6">
            <img src={Logo} alt="J. Ribeiro" className="w-[80px] sm:w-[100px] mx-auto" />
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 mb-3 sm:mb-4">
            Baixe o nosso app
          </h1>
          <p className="text-base sm:text-lg text-secondary-600 max-w-2xl mx-auto">
            Faça pedidos, acompanhe entregas e muito mais diretamente no seu telemóvel.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-secondary-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
          {/****  {!promotionLoading && promotion?.enabled && (
              <div className="inline-block bg-gradient-to-r from-gold-500 to-gold-400 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg mb-4 sm:mb-6 w-full text-center">
                <p className="text-xs font-bold text-secondary-900 tracking-wider">{promotion.title || "PROMOÇÃO"}</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-secondary-900">{promotion.discountPercentage ?? 0}% OFF</p>
                <p className="text-xs font-bold text-secondary-900">{promotion.subtitle || ""}</p>
              </div>
            )}

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {[
                { icon: FaClock, text: 'Entregas em até 30 min', color: 'text-gold-500' },
                { icon: FaShieldAlt, text: '100% seguro e rastreável', color: 'text-primary-600' },
                { icon: FaUsers, text: 'Motoristas profissionais', color: 'text-blue-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-sm">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <item.icon className={`${item.color} text-lg`} />
                  </div>
                  <span className="font-medium text-sm sm:text-base text-secondary-800">{item.text}</span>
                </div>
              ))}
            </div> */}

            <div className="flex flex-col gap-3">
              <a
                href={androidDownloadUrl}
                download
                className="flex items-center justify-center space-x-3 bg-primary-600 !text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl hover:bg-primary-700 transition shadow-lg hover:shadow-xl"
              >
                <FaGooglePlay className="text-xl sm:text-2xl" />
                <div className="text-left">
                  <span className="block text-[10px] opacity-80">Baixar para</span>
                  <span className="font-bold text-sm sm:text-base">Android</span>
                </div>
              </a>

              <div className="flex items-center justify-center space-x-3 bg-secondary-200 text-secondary-500 px-4 sm:px-6 py-3 sm:py-4 rounded-xl cursor-not-allowed opacity-70">
                <FaApple className="text-xl sm:text-2xl" />
                <div className="text-left">
                  <span className="block text-[10px] opacity-80">Em breve, na</span>
                  <span className="font-bold text-sm sm:text-base">App Store</span>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-start space-x-3">
                <FaMobileAlt className="text-primary-600 text-lg sm:text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-secondary-900 mb-1">Como instalar no Android?</p>
                  <ol className="text-xs text-secondary-600 space-y-1 list-decimal list-inside">
                    <li>Toque no botão "Baixar para" acima</li>
                    <li>Quando o download terminar, abra o ficheiro APK</li>
                    <li>Permita a instalação de fontes desconhecidas se solicitado</li>
                    <li>Siga as instruções na tela para concluir a instalação</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
          >
            <FaArrowRight className="mr-2 transform rotate-180" />
            Voltar para a página inicial
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DownloadPage;
