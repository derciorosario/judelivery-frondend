import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBox, FaTimes, FaEye, FaUser, FaPhone, FaMapMarkerAlt, FaFlag, FaCreditCard, FaClock, FaTruck, FaCheckCircle, FaStar, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getOrder } from '../../api/client';
import { toast } from '../../lib/toast';

const GUEST_ORDER_KEY = 'guest_order_id';

const GuestOrderBar = ({setHasOrder}) => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(GUEST_ORDER_KEY);
    if (stored) {
      setOrderId(stored);
      fetchOrder(stored);
    }
  }, []);

  const fetchOrder = async (id) => {
    setLoading(true);
    try {
      const response = await getOrder(id);
      setOrder(response.data);
      setHasOrder(true)
    } catch (error) {
      console.error("Error fetching guest order:", error);
      // If order not found, clear from localStorage
      localStorage.removeItem(GUEST_ORDER_KEY);
      setOrderId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearOrder = () => {
    localStorage.removeItem(GUEST_ORDER_KEY);
    setOrderId(null);
    setOrder(null);
    setExpanded(false);
  };

  const handleViewDetails = () => {
    navigate('/guest-order');
  };

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "in_transit") return { text: "Em entrega", color: "bg-blue-100 text-blue-700", icon: FaTruck };
    if (s === "pending_approval") return { text: "Aguardando", color: "bg-amber-100 text-amber-700", icon: FaClock };
    if (s === "completed") return { text: "Concluído", color: "bg-green-100 text-green-700", icon: FaCheckCircle };
    if (s === "cancelled") return { text: "Cancelado", color: "bg-red-100 text-red-700", icon: FaTimes };
    if (s === "assigned") return { text: "Motorista atribuído", color: "bg-indigo-100 text-indigo-700", icon: FaUser };
    if (s === "scheduled") return { text: "Agendado", color: "bg-purple-100 text-purple-700", icon: FaClock };
    return { text: "Processando", color: "bg-slate-100 text-slate-700", icon: FaClock };
  };

  if (!orderId) return null;

  const statusConfig = order ? getStatusConfig(order.status) : null;
  const StatusIcon = statusConfig?.icon || FaClock;

  return (
    <div className="sticky top-0 z-[60]">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.6, -0.05, 0.01, 0.99] }}
        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Bar */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FaBox className="text-white text-sm" />
              </div>
              <div>
                <p className="text-sm font-bold">Pedido em andamento</p>
                <p className="text-xs text-white/80">
                  #{orderId.slice(-8).toUpperCase()}
                  {statusConfig && (
                    <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.color}`}>
                      <StatusIcon size={10} />
                      {statusConfig.text}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-white/80 hover:text-white font-medium px-2 py-1"
              >
                {expanded ? 'Ocultar' : 'Detalhes'}
              </button>
              <button
                onClick={handleViewDetails}
                className="inline-flex items-center space-x-1 bg-white text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold hover:shadow-lg transition-all"
              >
                <FaEye className="text-[10px]" />
                <span>Ver</span>
              </button>
              <button
                onClick={handleClearOrder}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Fechar"
              >
                <FaTimes className="text-white text-xs" />
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {expanded && order && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pb-4 pt-2 border-t border-white/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Service Type */}
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Serviço</p>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {order.serviceType === 'taxi' ? (
                          <>🚗 Táxi / Ride</>
                        ) : (
                          <>📦 Entrega</>
                        )}
                      </p>
                    </div>

                    {/* Origin */}
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Origem</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <FaMapMarkerAlt size={12} className="text-white/60" />
                        {order.serviceType === 'taxi' ? order.pickupLocation : order.origin}
                      </p>
                      {order.contactOrigin && (
                        <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                          <FaPhone size={10} /> {order.contactOrigin}
                        </p>
                      )}
                    </div>

                    {/* Destination */}
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Destino</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <FaFlag size={12} className="text-white/60" />
                        {order.serviceType === 'taxi' ? order.dropoffLocation : order.dest}
                      </p>
                      {order.contactDest && (
                        <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                          <FaPhone size={10} /> {order.contactDest}
                        </p>
                      )}
                    </div>

                    {/* Price & Payment */}
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Valor</p>
                      <p className="text-sm font-semibold">{order.total} MZN</p>
                      <p className="text-xs text-white/70 flex items-center gap-1 mt-1">
                        <FaCreditCard size={10} />
                        {order.paymentMethod || 'Transferência'}
                      </p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {order.driver && (
                    <div className="mt-3 bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] text-white/60 uppercase tracking-wide mb-2">Motorista</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <FaUser className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              {typeof order.driver === "string" ? order.driver : order.driver?.name}
                            </p>
                            {order.driver?.phone && (
                              <p className="text-xs text-white/70 flex items-center gap-1">
                                <FaPhone size={10} /> {order.driver.phone}
                              </p>
                            )}
                            {order.driver?.vehicle && (
                              <p className="text-xs text-white/60">
                                {order.driver.vehicle} {order.driver?.licensePlate && `• ${order.driver.licensePlate}`}
                              </p>
                            )}
                          </div>
                        </div>
                        {order.driver?.phone && (
                          <a
                            href={`tel:${order.driver.phone}`}
                            className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                          >
                            <FaPhone className="text-white text-sm" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Time */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                    <span className="flex items-center gap-1">
                      <FaClock size={10} />
                      {order.orderDate || new Date(order.createdAt).toLocaleDateString()} às{" "}
                      {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {order.dist && (
                      <span className="flex items-center gap-1">
                        📍 {order.dist}
                      </span>
                    )}
                  </div>

                  {/* Register Suggestion */}
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide mb-2">Acesse mais benefícios</p>
                    <div className="flex gap-2">
                      <Link
                        to="/login"
                        className="flex-1 py-2 rounded-lg bg-white/20 text-white text-xs font-semibold text-center hover:bg-white/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <FaSignInAlt size={10} />
                        Entrar
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 py-2 rounded-lg bg-white text-orange-600 text-xs font-semibold text-center hover:bg-white/90 transition-colors flex items-center justify-center gap-1"
                      >
                        <FaUserPlus size={10} />
                        Criar Conta
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default GuestOrderBar;
