import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBox, FaSignInAlt, FaUserPlus, FaArrowRight, FaCheckCircle, FaClock, FaShieldAlt } from 'react-icons/fa';
import { usePlatformSettings } from '../contexts/SettingsContext';
import GuestInfoModal from '../components/cliente/modals/GuestInfoModal';
import ServiceSelectionModal from '../components/cliente/modals/ServiceSelectionModal';
import CreateOrderModal from '../components/cliente/modals/CreateOrderModal';
import GuestOrderBar from '../components/common/GuestOrderBar';

const GUEST_ORDER_KEY = 'guest_order_id';

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, loading: settingsLoading } = usePlatformSettings();
  
  const [showGuestInfo, setShowGuestInfo] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [guestInfo, setGuestInfo] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState(null);

  const options = [
     {
      id: 'register',
      icon: FaUserPlus,
      title: 'Criar Conta',
      description: 'Crie sua conta gratuita e ganhe acesso a benefícios exclusivos',
      features: ['Grátis', 'Benefícios', 'Fidelidade'],
      link: '/register',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      action: null
    },
    {
      id: 'order',
      icon: FaBox,
      title: 'Fazer Pedido Rapidamente',
      description: 'Faça seu pedido rapidamente sem precisar criar conta',
      features: ['Sem cadastro', 'Rápido', 'Rastreável'],
      link: null,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      action: () => setShowGuestInfo(true)
    },
    {
      id: 'login',
      icon: FaSignInAlt,
      title: 'Entrar',
      description: 'Faça login para acessar seu histórico de pedidos, acompanhar entregas e mais',
      features: ['Histórico', 'Acompanhe', 'Perfil'],
      link: '/login',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500',
      action: null
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
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
        delayChildren: 0.1
      }
    }
  };

  const handleGuestInfoContinue = (info) => {
    setGuestInfo(info);
    setShowGuestInfo(false);
    setShowServiceSelection(true);
  };

  const handleServiceSelect = (serviceType) => {
    setSelectedServiceType(serviceType);
    setShowServiceSelection(false);
    setShowCreateOrder(true);
  };

  const handleCloseCreateOrder = (refresh) => {
    setShowCreateOrder(false);
    setSelectedServiceType(null);
    if (refresh) {
      // Order was created - the CreateOrderModal handles saving to localStorage
      // via onOrderCreated callback
    }
    setGuestInfo(null);
  };

  const handleOrderCreated = (order) => {
    if (order?.id) {
      localStorage.setItem(GUEST_ORDER_KEY, order.id);
      navigate('/guest-order', { state: { showSuccess: true } });
    }
  };

  const buildCustomerData = () => {
    if (!guestInfo) return null;
    return {
      name: guestInfo.name,
      phone: guestInfo.contact,
      email: guestInfo.email,
      isGuest: true
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white overflow-x-hidden">
      {/* Header - Compact for mobile */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-sm sticky top-0 z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaBox className="text-white text-sm sm:text-lg" />
              </div>
              <div className="hidden xs:block">
                <h1 className="text-base sm:text-xl font-bold text-secondary-900">J. RIBEIRO</h1>
                <p className="text-[10px] sm:text-xs font-semibold text-primary-600 leading-tight">ENTREGAS & TRANSPORTE</p>
              </div>
            </Link>
            <Link
              to="/"
              className="text-secondary-600 hover:text-primary-600 font-medium transition text-xs sm:text-sm"
            >
              Voltar
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content - More compact */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-6 sm:mb-8"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-primary-100 text-primary-600 px-3 py-1.5 rounded-full text-[10px] sm:text-sm font-semibold mb-3">
            <FaCheckCircle className="text-xs sm:text-base" />
            <span>ESCOLHA COMO COMEÇAR</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-xl sm:text-3xl md:text-4xl font-extrabold text-secondary-900 mb-2"
          >
            Como você quer{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              começar?
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-sm sm:text-base text-secondary-600 max-w-2xl mx-auto hidden xs:block"
          >
            Escolha a opção que melhor se adapta às suas necessidades.
          </motion.p>
        </motion.div>

        {/* Options - Compact cards close together */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 max-w-5xl mx-auto"
        >
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              variants={fadeInUp}
              className="group"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {option.link ? (
                <Link
                  to={option.link}
                  className="block bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex items-center p-4 sm:p-5">
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <option.icon className="text-white text-lg sm:text-xl" />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0 ml-4 sm:ml-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-secondary-900 truncate">
                          {option.title}
                        </h3>
                        <FaArrowRight className={`text-sm sm:text-base text-${option.id === 'login' ? 'green' : option.id === 'register' ? 'purple' : 'blue'}-500 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2`} />
                      </div>
                      <p className="text-xs sm:text-sm text-secondary-500 truncate">
                        {option.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        {option.features.map((feature, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs text-secondary-400 flex items-center">
                            <FaCheckCircle className={`text-[8px] sm:text-[10px] ${option.id === 'login' ? 'text-green-400' : option.id === 'register' ? 'text-purple-400' : 'text-blue-400'} mr-1`} />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={option.action}
                  className="block bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 w-full text-left"
                >
                  <div className="flex items-center p-4 sm:p-5">
                    <motion.div
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <option.icon className="text-white text-lg sm:text-xl" />
                    </motion.div>
                    
                    <div className="flex-1 min-w-0 ml-4 sm:ml-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-bold text-secondary-900 truncate">
                          {option.title}
                        </h3>
                        <FaArrowRight className="text-sm sm:text-base text-blue-500 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
                      </div>
                      <p className="text-xs sm:text-sm text-secondary-500 truncate">
                        {option.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        {option.features.map((feature, idx) => (
                          <span key={idx} className="text-[10px] sm:text-xs text-secondary-400 flex items-center">
                            <FaCheckCircle className="text-[8px] sm:text-[10px] text-blue-400 mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info - Hidden on mobile, visible on larger screens */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-8 sm:mt-12 max-w-3xl mx-auto hidden sm:block"
        >
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                  <FaClock className="text-primary-600 text-base" />
                </div>
                <h4 className="font-bold text-secondary-900 text-sm mb-0.5">Rápido</h4>
                <p className="text-xs text-secondary-500">Entregas ágeis</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <FaShieldAlt className="text-green-600 text-base" />
                </div>
                <h4 className="font-bold text-secondary-900 text-sm mb-0.5">Seguro</h4>
                <p className="text-xs text-secondary-500">100% rastreável</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <FaUserPlus className="text-purple-600 text-base" />
                </div>
                <h4 className="font-bold text-secondary-900 text-sm mb-0.5">Fácil</h4>
                <p className="text-xs text-secondary-500">Intuitivo</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <GuestInfoModal
        isOpen={showGuestInfo}
        onClose={() => setShowGuestInfo(false)}
        onContinue={handleGuestInfoContinue}
      />

      <ServiceSelectionModal
        isOpen={showServiceSelection}
        onClose={() => {
          setShowServiceSelection(false);
          setGuestInfo(null);
        }}
        onSelectService={handleServiceSelect}
        settings={settings}
        settingsLoading={settingsLoading}
      />

      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={handleCloseCreateOrder}
        user={null}
        customerData={buildCustomerData()}
        serviceType={selectedServiceType}
        onOrderCreated={handleOrderCreated}
        settings={settings}
        settingsLoading={settingsLoading}
      />

      <GuestOrderBar />
    </div>
  );
};

export default StartPage;