import { Link } from 'react-router-dom';
import {
  FaFacebook, FaInstagram, FaWhatsapp, FaMotorcycle,
  FaShieldAlt, FaClock, FaMapMarkerAlt, FaUsers,
  FaBox, FaTruck, FaStar, FaCheckCircle, FaArrowRight,
  FaPhone, FaEnvelope, FaChevronDown, FaRocket,
  FaCreditCard, FaHeadset, FaMobileAlt, FaGooglePlay,
  FaApple, FaPlay, FaInfoCircle, FaSmile, FaGift,
  FaBars, FaTimes
} from 'react-icons/fa';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import GuestOrderBar from '../components/common/GuestOrderBar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const [hasOrder,setHasOrder] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

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

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Cliente Regular",
      text: "O serviço é incrível! Minhas entregas chegam sempre no prazo e os motoristas são muito profissionais.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Empresário",
      text: "Uso os serviços da J. Ribeiro para minha empresa há 6 meses. Recomendo a todos!",
      rating: 5
    },
    {
      name: "Ana Pereira",
      role: "Cliente",
      text: "Atendimento excelente e preços justos. Nunca tive problemas com minhas encomendas.",
      rating: 5
    }
  ];

  return (
    <div className="">

         <GuestOrderBar setHasOrder={setHasOrder} />


      <div className="min-h-screen bg-white overflow-x-hidden relative">
   
      {/* Enhanced Mobile-First Header */}
   <motion.header 
  className={`fixed ${hasOrder ? 'top-[60px]' : 'top-0'} w-full z-50 transition-all duration-500 ${
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
          className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl"
          whileHover={{ rotate: -10 }}
        >
          <FaMotorcycle className="text-white text-lg sm:text-2xl" />
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
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <motion.a 
          href="#services" 
          className={`transition font-medium ${
            scrolled ? 'text-secondary-600 hover:text-primary-600' : '!text-white hover:text-white/80'
          }`}
          whileHover={{ y: -2 }}
        >
          Serviços
        </motion.a>
        <motion.a 
          href="#about" 
          className={`transition font-medium ${
            scrolled ? 'text-secondary-600 hover:text-primary-600' : '!text-white hover:text-white/80'
          }`}
          whileHover={{ y: -2 }}
        >
          Sobre
        </motion.a>
        <motion.a 
          href="#contact" 
          className={`transition font-medium ${
            scrolled ? 'text-secondary-600 hover:text-primary-600' : '!text-white hover:text-white/80'
          }`}
          whileHover={{ y: -2 }}
        >
          Contato
        </motion.a>
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

      {/* Mobile Menu Button */}
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

    {/* Mobile Menu */}
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
            <div className="flex flex-col space-y-3">
              <a 
                href="#services" 
                className={`transition font-medium py-2 px-4 rounded-lg ${
                  scrolled ? 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Serviços
              </a>
              <a 
                href="#about" 
                className={`transition font-medium py-2 px-4 rounded-lg ${
                  scrolled ? 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre
              </a>
              <a 
                href="#contact" 
                className={`transition font-medium py-2 px-4 rounded-lg ${
                  scrolled ? 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50' : '!text-white hover:text-white/80 hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contato
              </a>
              <Link
                to="/start"
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 !text-white font-semibold rounded-full text-center hover:shadow-xl transition-all duration-300 mx-4"
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



      {/* Hero Section - Mobile Optimized */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden bg-secondary-900">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
            <div className="absolute top-10 left-10 w-48 sm:w-96 h-48 sm:h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-30"></div>
            <div className="absolute bottom-10 right-10 w-48 sm:w-96 h-48 sm:h-96 bg-gold-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 opacity-30"></div>
          </div>
        </div>

        {/* Floating Particles - Hidden on Mobile */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight 
              }}
              animate={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </div>

        <motion.div 
          className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32"
          style={{ y }}
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20"
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                <span className="text-white text-xs sm:text-sm font-medium">Atendimento 24/7</span>
              </motion.div>
              
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-white leading-[1.1] mb-4 sm:mb-6"
              >
                Faça já a sua{' '}
                <span className="bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Entrega!
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-10 max-w-lg leading-relaxed"
              >
                Rápido, seguro e confiável. Entregas e transporte de pessoas em toda a província de Maputo.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-wrap gap-3 sm:gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Link
                    to="/start"
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-gradient-to-r from-gold-500 to-gold-400 text-secondary-900 font-bold rounded-full hover:shadow-2xl transition-all duration-300 flex items-center justify-center group text-sm sm:text-base lg:text-lg"
                  >
                    Começar Agora
                    <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 sm:flex-none"
                >
                  <Link 
                    to="/services" 
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border-2 border-white/30 !text-white font-semibold rounded-full hover:bg-white/10 transition backdrop-blur-sm flex items-center justify-center group text-sm sm:text-base lg:text-lg"
                  >
                    <FaPlay className="mr-2 text-xs sm:text-sm !text-white" />
                    Ver Serviços
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats - Mobile Optimized */}
              <motion.div 
                variants={fadeInUp}
                className="grid grid-cols-3 gap-4 sm:gap-8 mt-8 sm:mt-12 lg:mt-16"
              >
                {[
                  { value: '500+', label: 'Entregas', icon: FaBox },
                  { value: '98%', label: 'Satisfação', icon: FaSmile },
                  { value: '24/7', label: 'Disponível', icon: FaClock }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="text-white text-center"
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <stat.icon className="text-gold-400 text-base sm:text-lg" />
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stat.value}</p>
                    </div>
                    <p className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Card - Now Visible on All Screens */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full mt-8 lg:mt-0"
            >
              <div className="relative">
                <motion.div 
                  className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-primary-500/20 to-gold-500/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl">
                  <div className="text-center">
                    {/* Discount Badge */}
                    <motion.div 
                      className="inline-block bg-gradient-to-r from-gold-500 to-gold-400 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl mb-4 sm:mb-6 md:mb-8 w-full sm:w-auto"
                      whileHover={{ scale: 1.03 }}
                    >
                      <p className="text-[10px] sm:text-xs font-bold text-secondary-900 tracking-wider">PROMOÇÃO DE LANÇAMENTO</p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-secondary-900">40% OFF</p>
                      <p className="text-[10px] sm:text-xs font-bold text-secondary-900">EM TODOS OS PEDIDOS</p>
                      <motion.div 
                        className="mt-1 sm:mt-2 text-[8px] sm:text-[10px] text-secondary-800 bg-white/20 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 inline-block"
                        animate={{ 
                          scale: [1, 1.05, 1],
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        VÁLIDO DURANTE OS PRIMEIROS 15 DIAS
                      </motion.div>
                    </motion.div>
                    
                    {/* Features List - Responsive */}
                    <div className="space-y-2 sm:space-y-3 md:space-y-4 text-left">
                      {[
                        { icon: FaClock, text: 'Entregas em até 30 min', color: 'text-gold-400' },
                        { icon: FaShieldAlt, text: '100% seguro e rastreável', color: 'text-primary-400' },
                        { icon: FaUsers, text: 'Motoristas profissionais', color: 'text-blue-400' }
                      ].map((item, index) => (
                        <motion.div 
                          key={index}
                          className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 text-white bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-3 backdrop-blur-sm text-sm sm:text-base"
                          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <item.icon className={`${item.color} text-base sm:text-lg md:text-xl`} />
                          </div>
                          <span className="font-medium text-xs sm:text-sm md:text-base">{item.text}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Download buttons - Responsive */}
                    <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 md:gap-4">
                      <motion.a 
                        href="#" 
                        className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition w-full sm:w-auto"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaApple className="text-white text-lg sm:text-xl" />
                        <span className="text-xs text-white">
                          <span className="block text-[8px] sm:text-[10px] opacity-60">Download on</span>
                          <span className="font-semibold text-xs sm:text-sm">App Store</span>
                        </span>
                      </motion.a>
                      <motion.a 
                        href="#" 
                        className="flex items-center justify-center space-x-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition w-full sm:w-auto"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaGooglePlay className="text-white text-lg sm:text-xl" />
                        <span className="text-xs text-white">
                          <span className="block text-[8px] sm:text-[10px] opacity-60">Get it on</span>
                          <span className="font-semibold text-xs sm:text-sm">Google Play</span>
                        </span>
                      </motion.a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/40 hidden sm:block"
          animate={{ 
            y: [0, 10, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <FaChevronDown className="text-2xl" />
        </motion.div>
      </section>

      {/* Services Section - Mobile Optimized */}
      <section id="services" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-12 lg:mb-20"
          >
            <motion.div 
              className="inline-block bg-primary-100 text-primary-600 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4"
              whileHover={{ scale: 1.05 }}
            >
              NOSSOS SERVIÇOS
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 mb-3 sm:mb-4">
              Soluções completas para{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                você
              </span>
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg px-4">
              Oferecemos soluções completas para suas necessidades de transporte e entrega
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {[
              {
                icon: FaMotorcycle,
                title: 'Entregas Rápidas',
                description: 'Documentos, encomendas e pequenos pacotes com agilidade e segurança.',
                features: ['📄 Documentos', '📦 Encomendas', '📬 Pequenos pacotes'],
                color: 'from-blue-500 to-blue-600',
                gradient: 'from-blue-50 to-blue-100'
              },
              {
                icon: FaBox,
                title: 'Mercadorias',
                description: 'Transporte de mercadorias para empresas e particulares com eficiência.',
                features: ['🏢 Para empresas', '👤 Para particulares', '📦 Cargas leves'],
                color: 'from-green-500 to-green-600',
                gradient: 'from-green-50 to-green-100'
              },
              {
                icon: FaTruck,
                title: 'Transporte de Pessoas',
                description: 'Conforto e segurança para seus deslocamentos diários.',
                features: ['💺 Conforto', '🛡️ Segurança', '⏰ Pontualidade'],
                color: 'from-purple-500 to-purple-600',
                gradient: 'from-purple-50 to-purple-100'
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative"
                whileHover={{ y: -5 }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
                  <div className={`h-1 sm:h-1.5 bg-gradient-to-r ${service.color}`}></div>
                  <div className="p-6 sm:p-8">
                    <motion.div 
                      className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}
                      whileHover={{ rotate: 5 }}
                    >
                      <service.icon className="text-white text-2xl sm:text-3xl" />
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-2 sm:mb-3">{service.title}</h3>
                    <p className="text-sm sm:text-base text-secondary-600 mb-4 sm:mb-6 leading-relaxed">{service.description}</p>
                    <ul className="space-y-2 sm:space-y-3">
                      {service.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center text-secondary-700 bg-secondary-50 rounded-xl px-3 sm:px-4 py-2 group-hover:bg-primary-50 transition text-sm sm:text-base"
                          whileHover={{ x: 5 }}
                        >
                          <span className="text-base sm:text-lg">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us - Mobile Optimized */}
      <section id="about" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-12 lg:mb-20"
          >
            <motion.div 
              className="inline-block bg-secondary-100 text-secondary-600 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4"
              whileHover={{ scale: 1.05 }}
            >
              POR QUE ESCOLHER NOS
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900 mb-3 sm:mb-4">
              Por que somos a{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                melhor escolha
              </span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          >
            {[
              { 
                icon: FaRocket, 
                title: 'Entregas Rápidas', 
                desc: 'Agilidade que você pode contar',
                color: 'from-blue-500 to-blue-600'
              },
              { 
                icon: FaShieldAlt, 
                title: 'Transporte Seguro', 
                desc: 'Sua encomenda em boas mãos',
                color: 'from-green-500 to-green-600'
              },
              { 
                icon: FaHeadset, 
                title: 'Atendimento 24/7', 
                desc: 'Suporte sempre disponível',
                color: 'from-purple-500 to-purple-600'
              },
              { 
                icon: FaStar, 
                title: 'Qualidade Garantida', 
                desc: 'Compromisso com excelência',
                color: 'from-gold-500 to-gold-600'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group text-center"
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r ${benefit.color} rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-6 shadow-xl group-hover:shadow-2xl transition-all`}
                  whileHover={{ rotate: 10, scale: 1.05 }}
                >
                  <benefit.icon className="text-white text-2xl sm:text-3xl lg:text-4xl" />
                </motion.div>
                <h3 className="text-sm sm:text-base lg:text-xl font-bold text-secondary-900 mb-1 sm:mb-2">{benefit.title}</h3>
                <p className="text-xs sm:text-sm text-secondary-600">{benefit.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary-900 to-secondary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <motion.div 
              className="inline-block bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4"
              whileHover={{ scale: 1.05 }}
            >
              DEPOIMENTOS
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              O que nossos{' '}
              <span className="bg-gradient-to-r from-gold-400 to-gold-300 bg-clip-text text-transparent">
                clientes dizem
              </span>
            </h2>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto text-center px-4"
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-gold-400 text-lg sm:text-2xl" />
                  ))}
                </div>
                <p className="text-base sm:text-xl lg:text-2xl leading-relaxed mb-6 sm:mb-8">"{testimonials[activeTestimonial].text}"</p>
                <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gold-400 to-gold-300 rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold text-secondary-900">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-base sm:text-lg">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-white/60 text-xs sm:text-sm">{testimonials[activeTestimonial].role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots indicator */}
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-gold-400 w-6 sm:w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Mobile Optimized */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-900">
              Recursos{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                exclusivos
              </span>
            </h2>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
          >
            {[
              {
                icon: FaClock,
                title: 'Entregas em 30 min',
                desc: 'Garantimos entregas rápidas e eficientes'
              },
              {
                icon: FaShieldAlt,
                title: '100% Rastreável',
                desc: 'Acompanhe sua entrega em tempo real'
              },
              {
                icon: FaCreditCard,
                title: 'Pagamento Seguro',
                desc: 'Múltiplas opções com total segurança'
              },
              {
                icon: FaUsers,
                title: 'Motoristas Verificados',
                desc: 'Todos passam por rigorosa verificação'
              },
              {
                icon: FaMobileAlt,
                title: 'App Intuitivo',
                desc: 'Interface simples e fácil de usar'
              },
              {
                icon: FaGift,
                title: 'Programa de Fidelidade',
                desc: 'Ganhe pontos e descontos a cada entrega'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-secondary-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:bg-primary-50 transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
              >
                <motion.div 
                  className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 5 }}
                >
                  <feature.icon className="text-white text-lg sm:text-2xl" />
                </motion.div>
                <h3 className="text-base sm:text-xl font-bold text-secondary-900 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-secondary-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Mobile Optimized */}
      <section className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
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
            Vamos Juntos, Com Segurança, Ao Seu Destino!
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-white/80 mb-6 sm:mb-8 lg:mb-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Sua entrega, nossa missão!
          </motion.p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/start"
              className="inline-flex items-center  px-8 sm:px-10 lg:px-12 py-4 sm:py-5 bg-white text-primary-600 font-bold text-base sm:text-lg rounded-full hover:shadow-2xl transition-all duration-300 group"
            >
              Começar Agora
              <FaArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

 {/* Footer - Mobile Optimized */}
       <Footer />
    </div>


    </div>
  );
};

export default LandingPage;