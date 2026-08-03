import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaArrowLeft, FaUser, FaPhone, FaMapMarkerAlt, FaFlag, FaCreditCard, FaClock, FaTruck, FaCheckCircle, FaTimes, FaStar, FaPhone as FaPhoneIcon, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import Footer from '../components/common/Footer';
import { getOrder, getPublicSettings } from '../api/client';
import { toast } from '../lib/toast';

const GUEST_ORDER_KEY = 'guest_order_id';

const GuestOrderPage = () => {
  const location = useLocation();
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(GUEST_ORDER_KEY);
    if (stored) {
      setOrderId(stored);
      fetchOrder(stored);
    } else {
      setLoading(false);
    }
    fetchSettings();
  }, []);

  useEffect(()=>{
         document.body.scrollIntoView({ behavior:'instant' })
  },[])

  const fetchSettings = async () => {
    try {
      const response = await getPublicSettings();
      setSettings(response.data?.settings || null);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchOrder = async (id) => {
    setLoading(true);
    try {
      const response = await getOrder(id);
      setOrder(response.data);
    } catch (error) {
      toast.error('Erro ao carregar pedido');
      console.error('Error fetching guest order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show success dialog only when navigated from order creation
  useEffect(() => {
    if (location.state?.showSuccess && orderId) {
      setShowSuccessDialog(true);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, orderId]);

  const handleRefresh = () => {
    if (orderId) {
      setRefreshing(true);
      fetchOrder(orderId);
      setTimeout(() => setRefreshing(false), 1000);
    }
  };

  const handleClearOrder = () => {
    localStorage.removeItem(GUEST_ORDER_KEY);
    setOrderId(null);
    setOrder(null);
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "Dinheiro",
      mpesa: "M-Pesa",
      emola: "E-Mola",
      card: "Cartão",
      bank_transfer: "Transferência Bancária"
    };
    return labels[method] || method || "—";
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "in_transit") return { text: "Em entrega", color: "bg-blue-100 text-blue-700 border-blue-200", icon: FaTruck };
    if (s === "pending_approval") return { text: "Aguardando aprovação", color: "bg-amber-100 text-amber-700 border-amber-200", icon: FaClock };
    if (s === "completed") return { text: "Concluído", color: "bg-green-100 text-green-700 border-green-200", icon: FaCheckCircle };
    if (s === "cancelled") return { text: "Cancelado", color: "bg-red-100 text-red-700 border-red-200", icon: FaTimes };
    if (s === "assigned") return { text: "Motorista atribuído", color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: FaUser };
    if (s === "scheduled") return { text: "Agendado", color: "bg-purple-100 text-purple-700 border-purple-200", icon: FaClock };
    if (s === "approved") return { text: "Aprovado", color: "bg-teal-100 text-teal-700 border-teal-200", icon: FaCheckCircle };
    return { text: "Processando", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FaClock };
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">A carregar pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox className="text-slate-400 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-secondary-900 mb-2">Nenhum pedido encontrado</h2>
          <p className="text-secondary-600 mb-6">Parece que você ainda não fez nenhum pedido.</p>
          <Link
            to="/start"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-bold hover:shadow-lg transition-all"
          >
            <FaArrowLeft size={16} />
            Fazer um pedido
          </Link>
        </div>
      </div>
    );
  }

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;
  const isDelivery = order.serviceType !== 'taxi';

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaBox className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">{settings?.app?.appName || 'J. RIBEIRO'}</h1>
                <p className="text-xs font-semibold text-primary-600">ENTREGAS & TRANSPORTE</p>
              </div>
            </Link>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-secondary-600 hover:text-primary-600 font-medium transition text-sm flex items-center gap-2"
            >
              {refreshing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
              ) : (
                <>Atualizar</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        
        {/* Register/Login Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="my-6 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl shadow-xl p-6 sm:p-8 text-white"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold mb-1">Crie uma conta gratuita</h3>
              <p className="text-sm text-white/80">
                Acesse histórico de pedidos, acompanhamento em tempo real, programa de fidelidade e mais benefícios exclusivos.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-5 py-2.5 rounded-full font-bold text-sm hover:shadow-lg transition-all"
              >
                <FaSignInAlt size={14} />
                Entrar
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/20 !text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-white/30 transition-all border border-white/30"
              >
                <FaUserPlus size={14} />
                Criar Conta
              </Link>
            </div>
          </div>
        </motion.div>


        {/* Order ID & Status */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-secondary-500 uppercase tracking-wide mb-1">Número do Pedido</p>
              <p className="text-2xl font-bold text-secondary-900">
                #{order.id ? order.id.slice(-8).toUpperCase() : "PEDIDO"}
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.color}`}>
              <StatusIcon size={16} />
              <span className="text-sm font-bold">{statusConfig.text}</span>
            </div>
          </div>

          {/* Service Type Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
            isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
          }`}>
            {isDelivery ? <FaBox size={14} /> : <FaTruck size={14} />}
            <span className="text-sm font-semibold">
              {isDelivery ? "Entrega" : "Táxi / Ride"}
            </span>
          </div>

          {/* Price Card */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 text-white mb-6">
            <p className="text-xs text-orange-100 mb-1">Valor total</p>
            <p className="text-3xl font-bold">{order.total} MZN</p>
            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center gap-2">
                <FaClock size={12} className="text-orange-200" />
                <p className="text-xs text-orange-100">
                  {order.orderDate || new Date(order.createdAt).toLocaleDateString()} às{" "}
                  {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {order.dist && (
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt size={12} className="text-orange-200" />
                  <p className="text-xs text-orange-100">{order.dist}</p>
                </div>
              )}
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt size={16} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-secondary-500 mb-1">Partida</p>
                <p className="text-sm text-secondary-800 font-medium">
                  {isDelivery ? order.origin : order.pickupLocation}
                </p>
                {order.contactOrigin && (
                  <p className="text-xs text-secondary-500 flex items-center gap-1 mt-1">
                    <FaPhone size={10} /> {order.contactOrigin}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <FaFlag size={16} className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-secondary-500 mb-1">Chegada</p>
                <p className="text-sm text-secondary-800 font-medium">
                  {isDelivery ? order.dest : order.dropoffLocation}
                </p>
                {order.contactDest && (
                  <p className="text-xs text-secondary-500 flex items-center gap-1 mt-1">
                    <FaPhone size={10} /> {order.contactDest}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Driver Info */}
          {order.driver && (
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-6">
              <h3 className="text-sm font-bold text-secondary-900 mb-3 flex items-center gap-2">
                <FaUser size={14} className="text-primary-600" />
                Motorista Atribuído
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-primary-600 text-lg" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-800">
                      {typeof order.driver === "string" ? order.driver : order.driver?.name}
                    </p>
                    {order.driver?.phone && (
                      <p className="text-xs text-secondary-500 flex items-center gap-1">
                        <FaPhone size={10} /> {order.driver.phone}
                      </p>
                    )}
                    {order.driver?.vehicle && (
                      <p className="text-xs text-secondary-500">
                        {order.driver.vehicle} {order.driver?.licensePlate && `• ${order.driver.licensePlate}`}
                      </p>
                    )}
                  </div>
                </div>
                {order.driver?.phone && (
                  <a
                    href={`tel:${order.driver.phone}`}
                    className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
                  >
                    <FaPhoneIcon className="text-white text-lg" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order Details */}
          <div className="border-t border-slate-100 pt-5 mb-6">
            <h3 className="text-sm font-bold text-secondary-900 mb-3">Detalhes do Pedido</h3>
            <div className="space-y-3">
              {order.productName && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Produto</span>
                  <span className="text-sm font-semibold text-secondary-800">
                    {order.productName} {order.quantity > 1 && `x${order.quantity}`}
                  </span>
                </div>
              )}

              {!isDelivery && order.passengerCount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Passageiros</span>
                  <span className="text-sm font-semibold text-secondary-800">
                    {order.passengerCount} pessoa(s)
                    {order.hasLuggage && <span className="ml-2 text-xs text-secondary-500">(com bagagem)</span>}
                  </span>
                </div>
              )}

              {order.urgencyLevel && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-secondary-600">Urgência</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.urgencyLevel === 'urgent' ? 'bg-amber-100 text-amber-700' :
                    order.urgencyLevel === 'very_urgent' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.urgencyLevel === 'urgent' ? 'Urgente' : order.urgencyLevel === 'very_urgent' ? 'Muito Urgente' : 'Normal'}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-sm text-secondary-600">Pagamento</span>
                <div className="text-right">
                  <p className="text-sm text-secondary-700">{getPaymentMethodLabel(order.paymentMethod)}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                    order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Pago' : order.paymentStatus === 'pending' ? 'Pendente' : order.paymentStatus || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          {order.instructions && (
            <div className="border-t border-slate-100 pt-5 mb-6">
              <h3 className="text-sm font-bold text-secondary-900 mb-2">Instruções Especiais</h3>
              <p className="text-sm text-secondary-600 bg-slate-50 p-4 rounded-lg italic">
                "{order.instructions}"
              </p>
            </div>
          )}

          {order.observations && (
            <div className="border-t border-slate-100 pt-5 mb-6">
              <h3 className="text-sm font-bold text-secondary-900 mb-2">Observações</h3>
              <p className="text-sm text-secondary-600 bg-slate-50 p-4 rounded-lg">{order.observations}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/start"
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <FaArrowLeft size={16} />
              Voltar ao Início
            </Link>

            {/** Leave this button hidden */}
            <button
              onClick={handleClearOrder}
              className="flex-1 hidden py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <FaTimes size={16} />
              Limpar Pedido
            </button>
          </div>
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-secondary-900 mb-4">Precisa de ajuda?</h3>
          <p className="text-sm text-secondary-600 mb-4">
            Se tiver alguma dúvida sobre o seu pedido, entre em contacto conosco.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
               href={`tel:${settings?.app?.supportPhone?.replace(/\s/g, '') || '+258823334455'}`}
              className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors"
            >
              <FaPhoneIcon size={14} />
              {settings?.app?.supportPhone || '+258 82 333 4455'}
            </a>
            <a
              href={`mailto:${settings?.app?.supportEmail || 'suporte@jrmultiservicos.co.mz'}`}
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-secondary-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              <FaBox size={14} />
              {settings?.app?.supportEmail || 'suporte@jrmultiservicos.co.mz'}
            </a>
          </div>
        </motion.div>

      </main>

      {/* Success Dialog */}
      <AnimatePresence>
        {showSuccessDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">
                Pedido criado com sucesso!
              </h3>
              <p className="text-sm text-secondary-600 mb-2">
                O seu pedido <span className="font-bold">#{orderId.slice(-8).toUpperCase()}</span> foi recebido e será contactado em breve. Caso precise de algo, utilize as informações de contacto fornecidas.
              </p>
              <p className="text-xs text-secondary-500 mb-6">
                {order.driver ? (
                  <>O motorista <span className="font-semibold">{typeof order.driver === "string" ? order.driver : order.driver?.name}</span> já foi atribuído. Você pode acompanhar o status aqui.</>
                ) : (
                  <>Um motorista será atribuído em breve. Você pode acompanhar o status aqui.</>
                )}
              </p>

          

              {/* Login/Register suggestion */}
              <div className="bg-orange-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm font-semibold text-secondary-900 mb-2">
                  Acesse mais benefícios:
                </p>
                <ul className="space-y-2 text-xs text-secondary-600 mb-3">
                  <li className="flex items-center gap-2">
                    <FaCheckCircle size={12} className="text-green-500" />
                    Histórico completo de pedidos
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle size={12} className="text-green-500" />
                    Acompanhamento em tempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle size={12} className="text-green-500" />
                    Programa de fidelidade e descontos
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheckCircle size={12} className="text-green-500" />
                    Perfil personalizado
                  </li>
                </ul>
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={handleCloseSuccess}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 !text-white font-bold text-xs flex items-center justify-center gap-1 hover:shadow-lg transition-all"
                  >
                    <FaSignInAlt size={12} />
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleCloseSuccess}
                    className="flex-1 py-2.5 rounded-xl border-2 border-primary-600 text-primary-600 font-bold text-xs flex items-center justify-center gap-1 hover:bg-primary-50 transition-all"
                  >
                    <FaUserPlus size={12} />
                    Criar Conta
                  </Link>
                </div>
              </div>

              <button
                onClick={handleCloseSuccess}
                className="w-full py-3 rounded-xl bg-slate-100 text-secondary-700 font-semibold text-sm hover:bg-slate-200 transition-colors"
              >
                Continuar sem conta
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default GuestOrderPage;