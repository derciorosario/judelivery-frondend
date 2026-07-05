import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBox, FaSignInAlt, FaUserPlus, FaArrowRight, FaCheckCircle, FaClock, FaShieldAlt } from 'react-icons/fa';

const StartPage = () => {
  const options = [
    {
      id: 'order',
      icon: FaBox,
      title: 'Fazer Pedido',
      description: 'Faça seu pedido rapidamente sem precisar criar conta ou fazer login. Basta escolher o serviço e enviar!',
      features: ['Sem cadastro necessário', 'Rápido e fácil', 'Acompanhamento em tempo real'],
      link: '/services',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500'
    },
    {
      id: 'login',
      icon: FaSignInAlt,
      title: 'Entrar',
      description: 'Já tem conta? Faça login para acessar seu histórico de pedidos, acompanhar entregas e mais.',
      features: ['Acesso ao histórico', 'Acompanhe entregas', 'Perfil personalizado'],
      link: '/login',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
      iconBg: 'bg-green-500'
    },
    {
      id: 'register',
      icon: FaUserPlus,
      title: 'Criar Conta',
      description: 'Crie sua conta gratuita e ganhe acesso a benefícios exclusivos, descontos e programa de fidelidade.',
      features: ['Conta gratuita', 'Benefícios exclusivos', 'Programa de fidelidade'],
      link: '/register',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500'
    }
  ];

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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white overflow-x-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaBox className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">J. RIBEIRO</h1>
                <p className="text-xs font-semibold text-primary-600">ENTREGAS & TRANSPORTE</p>
              </div>
            </Link>
            <Link
              to="/"
              className="text-secondary-600 hover:text-primary-600 font-medium transition text-sm"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center space-x-2 bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <FaCheckCircle className="text-base" />
            <span>ESCOLHA COMO COMEÇAR</span>
          </motion.div>
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-secondary-900 mb-4"
          >
            Como você quer{' '}
            <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              começar?
            </span>
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-secondary-600 max-w-2xl mx-auto"
          >
            Escolha a opção que melhor se adapta às suas necessidades. Estamos aqui para ajudar!
          </motion.p>
        </motion.div>

        {/* Options Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto"
        >
          {options.map((option, index) => (
            <motion.div
              key={option.id}
              variants={fadeInUp}
              className="group relative"
              whileHover={{ y: -8 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${option.bgColor} rounded-3xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`}></div>
              <Link
                to={option.link}
                className="relative block bg-white rounded-3xl shadow-xl hover:shadow-3xl transition-all duration-500 overflow-hidden border border-gray-100 h-full"
              >
                <div className={`h-2 bg-gradient-to-r ${option.color}`}></div>
                <div className="p-6 sm:p-8">
                  {/* Icon */}
                  <motion.div
                    className={`w-16 max-md:hidden h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <option.icon className="text-white text-2xl sm:text-3xl" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-secondary-900 mb-3">
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-secondary-600 mb-6 leading-relaxed">
                    {option.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6 hidden"> {/***Leave hidden */}
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3 text-sm text-secondary-700">
                        <FaCheckCircle className={`text-base ${option.id === 'order' ? 'text-blue-500' : option.id === 'login' ? 'text-green-500' : 'text-purple-500'}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${option.color} text-white font-semibold px-6 py-3 rounded-full group-hover:shadow-lg transition-all duration-300`}>
                    <span>
                      {option.id === 'order' ? 'Fazer Pedido' : option.id === 'login' ? 'Entrar' : 'Criar Conta'}
                    </span>
                    <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 sm:mt-20 max-w-3xl mx-auto"
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                  <FaClock className="text-primary-600 text-xl" />
                </div>
                <h4 className="font-bold text-secondary-900 mb-1">Rápido</h4>
                <p className="text-sm text-secondary-600">Entregas em até 30 minutos</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <FaShieldAlt className="text-green-600 text-xl" />
                </div>
                <h4 className="font-bold text-secondary-900 mb-1">Seguro</h4>
                <p className="text-sm text-secondary-600">100% rastreável e confiável</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <FaUserPlus className="text-purple-600 text-xl" />
                </div>
                <h4 className="font-bold text-secondary-900 mb-1">Fácil</h4>
                <p className="text-sm text-secondary-600">Interface simples e intuitiva</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default StartPage;
