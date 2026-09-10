import { Link } from 'react-router-dom';
import {
  FaFacebook, FaInstagram, FaWhatsapp, FaMotorcycle,
  FaShieldAlt, FaClock, FaMapMarkerAlt, FaUsers,
  FaBox, FaTruck, FaStar, FaUser,
  FaCheckCircle, FaArrowRight,
  FaPhone, FaEnvelope, FaChevronDown, FaRocket,
  FaCreditCard, FaHeadset, FaMobileAlt, FaGooglePlay,
  FaApple, FaPlay, FaInfoCircle, FaSmile, FaGift,
  FaBars, FaTimes
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import GuestOrderBar from '../components/common/GuestOrderBar';
import Footer from '../components/common/Footer';
import Logo from '../assets/logo.png'
import { getPublicSettings } from '../api/client';

const SupportPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const heroRef = useRef(null);

  useEffect(() => {
    document.body.scrollIntoView({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const contactMethods = [
    {
      icon: FaPhone,
      title: 'Telefone',
      description: 'Ligue-nos diretamente e fale com um consultor',
      value: appSettings.supportPhone || '+258 82 333 4455',
      action: `tel:${(appSettings.supportPhone || '+258 82 333 4455').replace(/\s/g, '')}`
    },
    {
      icon: FaEnvelope,
      title: 'Email',
      description: 'Envie-nos uma mensagem e responderemos o quanto antes',
      value: appSettings.supportEmail || 'suporte@jrmultiservicos.co.mz',
      action: `mailto:${appSettings.supportEmail || 'suporte@jrmultiservicos.co.mz'}`
    },
    {
      icon: FaWhatsapp,
      title: 'WhatsApp',
      description: 'Suporte rápido via WhatsApp 24/7',
      value: appSettings.supportPhone || '+258 82 333 4455',
      action: `https://wa.me/${(appSettings.supportPhone || '+258 82 333 4455').replace(/\D/g, '')}`
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Localização',
      description: 'Visite-nos na nossa sede em Maputo',
      value: 'Maputo, Moçambique',
      action: 'https://maps.google.com/?q=Maputo,Mozambique'
    }
  ];

  const supportTopics = [
    {
      icon: FaBox,
      title: 'Problemas com encomendas',
      description: 'Rastreio, alterações, cancelamentos e atrasos.'
    },
    {
      icon: FaCreditCard,
      title: 'Pagamentos e facturas',
      description: 'Questões relacionadas com pagamentos e comprovativos.'
    },
    {
      icon: FaUsers,
      title: 'Conta e perfil',
      description: 'Gestão da sua conta, credenciais e dados pessoais.'
    },
    {
      icon: FaTruck,
      title: 'Motoristas e veículos',
      description: 'Denúncias, reclamações e sugestões sobre motoristas.'
    },
    {
      icon: FaStar,
      title: 'Avaliações e serviços',
      description: 'Feedback sobre a qualidade do nosso serviço.'
    },
    {
      icon: FaUser,
      title: 'Eliminação de Conta',
      description: 'Solicite a eliminação da sua conta e de todos os dados associados.',
      action: '/privacy'
    },
    {
      icon: FaInfoCircle,
      title: 'Outras questões',
      description: 'Qualquer assunto não contemplado acima.'
    }
  ];

  const hours = appSettings.supportHours ? appSettings.supportHours.split('|') : [
    'Segunda - Sexta: 24h',
    'Sábado: 24h',
    'Domingo: 24h'
  ];

  return (
    <div className="">
      <GuestOrderBar />

      <div className="min-h-screen bg-white overflow-x-hidden relative">

        <motion.header
          className={`fixed w-full z-50 transition-all duration-500 ${
            scrolled ? 'bg-white/95 backdrop-blur-xl shadow-2xl' : 'bg-transparent'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              <motion.div
                className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className="flex items-center justify-center"
                  whileHover={{ rotate: -10 }}
                >
                  <img src={Logo} className="w-[60px]" alt="Logo" />
                </motion.div>
                <div className="hidden xs:block">
                  <h1 className={`text-base sm:text-xl font-bold tracking-tight leading-tight ${
                    scrolled ? 'text-secondary-900' : 'text-white'
                  }`}>
                    J. RIBEIRO
                  </h1>
                  <p className={`text-[10px] sm:text-xs font-semibold tracking-wider ${
                    scrolled ? 'text-primary-600' : 'text-white/90'
                  }`}>
                    ENTREGAS & TRANSPORTE
                  </p>
                </div>
              </motion.div>

              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/"
                  className={`transition font-medium ${
                    scrolled ? 'text-secondary-600 hover:text-primary-600' : '!text-white hover:text-white/80'
                  }`}
                >
                  Início
                </Link>
                <Link
                  to="/faq"
                  className={`transition font-medium ${
                    scrolled ? 'text-secondary-600 hover:text-primary-600' : '!text-white hover:text-white/80'
                  }`}
                >
                  FAQ
                </Link>
                <Link
                  to="/support"
                  className={`transition font-medium ${
                    scrolled ? 'text-primary-600 hover:text-primary-700' : '!text-white hover:text-white/80'
                  }`}
                >
                  Suporte
                </Link>
                <Link
                  to="/login"
                  className={`px-6 py-2.5 font-semibold transition ${
                    scrolled ? 'text-secondary-700 hover:text-primary-600' : '!text-white hover:text-white/80'
                  }`}
                >
                  Entrar
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/start"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 !text-white font-semibold rounded-full hover:shadow-xl transition-all duration-300 inline-flex items-center"
                  >
                    Começar
                    <FaArrowRight className="ml-2 text-sm !text-white" />
                  </Link>
                </motion.div>
              </div>

              <div className="flex items-center space-x-3 md:hidden">
                <Link
                  to="/login"
                  className={`font-semibold text-sm transition ${
                    scrolled ? 'text-secondary-700 hover:text-primary-600' : '!text-white hover:text-white/80'
                  }`}
                >
                  Entrar
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`transition p-2 ${
                    scrolled ? 'text-secondary-700 hover:text-primary-600' : '!text-white hover:text-white/80'
                  }`}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden overflow-hidden"
                >
                  <div className={`py-4 border-t ${scrolled ? 'border-gray-200' : 'border-white/20'}`}>
                    <div className="flex flex-col space-y-1">
                      <Link
                        to="/"
                        className={`transition font-medium py-2 px-4 rounded-lg ${
                          scrolled ? 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Início
                      </Link>
                      <Link
                        to="/faq"
                        className={`transition font-medium py-2 px-4 rounded-lg ${
                          scrolled ? 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        FAQ
                      </Link>
                      <Link
                        to="/support"
                        className={`transition font-medium py-2 px-4 rounded-lg ${
                          scrolled ? 'text-primary-600 hover:text-primary-700 bg-primary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Suporte
                      </Link>
                      <Link
                        to="/start"
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 !text-white font-semibold rounded-full text-center hover:shadow-xl transition-all duration-300 mx-4 mt-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Começar Agora
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        <section
          ref={heroRef}
          className="relative pt-24 sm:pt-28 lg:pt-36 pb-16 sm:pb-20 lg:pb-24 bg-secondary-900 overflow-hidden"
        >
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
              <div className="absolute top-10 left-10 w-48 sm:w-96 h-48 sm:h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-20"></div>
              <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 opacity-20"></div>
            </div>
          </div>

          <motion.div
            className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
            >
              <FaHeadset className="text-primary-400 text-sm" />
              <span className="text-white text-xs sm:text-sm font-medium">Suporte ao Cliente</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-6"
            >
              Centro de Suporte
              <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent">
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Estamos aqui para ajudar. Encontre a informação de contacto e resolva as suas questões rapidamente.
            </motion.p>
          </motion.div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-8 sm:mb-12 lg:mb-20"
            >
              <motion.div
                variants={fadeInUp}
                className="inline-block bg-secondary-100 text-secondary-600 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4"
                whileHover={{ scale: 1.05 }}
              >
                FALE CONOSCO
              </motion.div>
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 mb-3 sm:mb-4"
              >
                Contactos de Suporte
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-secondary-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4"
              >
                Vários canais disponíveis para lhe atender 24 horas por dia.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16"
            >
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="group bg-secondary-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-secondary-200 hover:shadow-xl transition-all duration-300 text-center"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform"
                  >
                    <method.icon className="text-white text-2xl sm:text-3xl" />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold text-secondary-900 mb-2">{method.title}</h3>
                  <p className="text-xs sm:text-sm text-secondary-600 mb-4 leading-relaxed">{method.description}</p>
                  <a
                    href={method.action}
                    target={method.action.startsWith('http') && method.action !== '#' ? '_blank' : undefined}
                    rel={method.action.startsWith('http') && method.action !== '#' ? 'noopener noreferrer' : undefined}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-xs sm:text-sm underline break-all"
                  >
                    {method.value}
                  </a>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-12 sm:mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4"
              >
                Horário de Suporte
              </motion.h2>
              <p className="text-secondary-600 text-sm sm:text-base mb-6">
                Estamos disponíveis 24 horas por dia, 7 dias por semana.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 lg:gap-12 max-w-3xl mx-auto">
                {hours.map((hour, index) => (
                  <motion.div key={index} className="text-center">
                    <p className="text-white font-semibold bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 rounded-lg">{hour.trim()}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-12 sm:mb-16"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4"
              >
                Temas de Suporte
              </motion.h2>
              <motion.p
                variants={fadeInUp}
                className="text-secondary-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4 mb-8"
              >
                Selecione um tema abaixo para obter ajuda sobre a questão específica.
              </motion.p>
              <motion.div
                variants={staggerContainer}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
              >
                {supportTopics.map((topic, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="group bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-secondary-200 hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
                    whileHover={{ y: -3 }}
                  >
                    {topic.action ? (
                      <Link to={topic.action} className="block">
                        <div className="flex items-start space-x-3 sm:space-x-4">
                          <motion.div
                            className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
                          >
                            <topic.icon className="text-white text-xl sm:text-2xl" />
                          </motion.div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-1 sm:mb-2 group-hover:text-primary-600 transition">{topic.title}</h3>
                            <p className="text-xs sm:text-sm text-secondary-600">{topic.description}</p>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
                        >
                          <topic.icon className="text-white text-xl sm:text-2xl" />
                        </motion.div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-1 sm:mb-2">{topic.title}</h3>
                          <p className="text-xs sm:text-sm text-secondary-600">{topic.description}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoNHY0aC00em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
            </div>
          </div>

          <motion.div
            className="relative max-w-4xl mx-auto text-center px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              Ainda precisa de ajuda?
            </motion.h2>
            <motion.p
              className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-6 sm:mb-8 lg:mb-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Contacte-nos e nossa equipa de suporte estará encantada em ajudar.
            </motion.p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href={`https://wa.me/${(appSettings.supportPhone || '+258 82 333 4455').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gold-500 hover:bg-gold-400 text-secondary-900 font-bold text-base sm:text-lg rounded-full hover:shadow-2xl transition-all duration-300 group"
                >
                  <FaWhatsapp className="mr-2 text-lg sm:text-xl" />
                  Chat via WhatsApp
                </a>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/start"
                  className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white text-primary-600 font-bold text-base sm:text-lg rounded-full hover:shadow-2xl transition-all duration-300 group"
                >
                  Voltar para Início
                  <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default SupportPage;
