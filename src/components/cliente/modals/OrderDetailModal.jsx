import { useState, useEffect } from "react";
import TrackOrderModal from "./TrackOrderModal";
import {
  X,
  Package,
  Car,
  Clock,
  MapPin,
  Flag,
  User,
  Phone,
  CreditCard,
  Building2,
  MessageSquare,
  Star,
  Headphones,
  Truck,
  Navigation,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  XCircle
} from "lucide-react";
import { getOrder } from "../../../api/client";

const OrderDetailModal = ({ isOpen, onClose, order, orderId, onGiveFeedback }) => {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [localOrder, setLocalOrder] = useState(order);

  useEffect(() => {
    if (!order && orderId && isOpen) {
      const fetchOrder = async () => {
        setLoadingOrder(true);
        try {
          const response = await getOrder(orderId);
          setLocalOrder(response.data);
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    } else if (order) {
      setLocalOrder(order);
    }
  }, [order, orderId, isOpen]);

  if (!isOpen || (!localOrder && !loadingOrder)) return null;

  if (loadingOrder) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3" />
          <p className="text-sm text-slate-500">A carregar pedido...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "in_transit" || s === "in_transit" || s === "em entrega") {
      return { 
        text: "Em entrega", 
        icon: Truck, 
        color: "blue",
        bgClass: "bg-blue-50",
        badgeClass: "bg-blue-100 text-blue-700",
        borderClass: "border-blue-200"
      };
    }
    if (s === "pending_approval" || s === "pendente" || s === "pending") {
      return { 
        text: "Aguardando aprovação", 
        icon: Clock, 
        color: "amber",
        bgClass: "bg-amber-50",
        badgeClass: "bg-amber-100 text-amber-700",
        borderClass: "border-amber-200"
      };
    }
    if (s === "completed" || s === "concluído" || s === "concluido") {
      return { 
        text: "Concluído", 
        icon: CheckCircle, 
        color: "green",
        bgClass: "bg-green-50",
        badgeClass: "bg-green-100 text-green-700",
        borderClass: "border-green-200"
      };
    }
    if (s === "cancelled" || s === "cancelado") {
      return { 
        text: "Cancelado", 
        icon: XCircle, 
        color: "red",
        bgClass: "bg-red-50",
        badgeClass: "bg-red-100 text-red-700",
        borderClass: "border-red-200"
      };
    }
    if (s === "approved" || s === "aprovado") {
      return { 
        text: "Aprovado", 
        icon: CheckCircle, 
        color: "teal",
        bgClass: "bg-teal-50",
        badgeClass: "bg-teal-100 text-teal-700",
        borderClass: "border-teal-200"
      };
    }
    if (s === "scheduled" || s === "agendado") {
      return { 
        text: "Agendado", 
        icon: Calendar, 
        color: "purple",
        bgClass: "bg-purple-50",
        badgeClass: "bg-purple-100 text-purple-700",
        borderClass: "border-purple-200"
      };
    }
    return { 
      text: status || "Processando", 
      icon: AlertCircle, 
      color: "slate",
      bgClass: "bg-slate-50",
      badgeClass: "bg-slate-100 text-slate-700",
      borderClass: "border-slate-200"
    };
  };

  const getUrgencyConfig = (urgency) => {
    switch(urgency) {
      case "urgent":
        return { text: "Urgente", icon: AlertCircle, color: "amber", bgClass: "bg-amber-100 text-amber-700" };
      case "very_urgent":
        return { text: "Muito Urgente", icon: AlertCircle, color: "red", bgClass: "bg-red-100 text-red-700" };
      default:
        return { text: "Normal", icon: CheckCircle, color: "green", bgClass: "bg-green-100 text-green-700" };
    }
  };

  const getPaymentStatusConfig = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "paid" || s === "pago") {
      return { text: "Pago", icon: CheckCircle, bgClass: "bg-green-100 text-green-700" };
    }
    if (s === "pending" || s === "pendente") {
      return { text: "Pendente", icon: Clock, bgClass: "bg-amber-100 text-amber-700" };
    }
    if (s === "cancelled" || s === "cancelado") {
      return { text: "Cancelado", icon: XCircle, bgClass: "bg-red-100 text-red-700" };
    }
    return { text: status || "—", icon: CreditCard, bgClass: "bg-slate-100 text-slate-700" };
  };

  const statusConfig = getStatusConfig(localOrder.status || localOrder.statusCode);
  const StatusIcon = statusConfig.icon;
  const isDelivery = localOrder.serviceType !== "taxi";
  const isCompleted = localOrder.status === "completed" || localOrder.statusCode === "completed";
  const isActive = localOrder.status === "in_transit" || localOrder.statusCode === "in_progress" || localOrder.status === "in_transit";
  const urgencyConfig = isDelivery && localOrder.urgencyLevel ? getUrgencyConfig(localOrder.urgencyLevel) : null;
  const paymentStatusConfig = getPaymentStatusConfig(localOrder.paymentStatus);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">
                Pedido #{localOrder.id ? localOrder.id.slice(-8).toUpperCase() : "PEDIDO"}
              </h2>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${statusConfig.badgeClass}`}>
                <StatusIcon size={10} />
                <span className="text-[10px] font-semibold">{statusConfig.text}</span>
              </div>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${
                isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
              }`}>
                {isDelivery ? <Package size={10} /> : <Car size={10} />}
                <span className="text-[10px] font-semibold">
                  {isDelivery ? "Entrega" : "Táxi"}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Status Card */}
              <div className={`rounded-xl p-4 ${statusConfig.bgClass} border ${statusConfig.borderClass}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${statusConfig.badgeClass} flex items-center justify-center`}>
                      <StatusIcon size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Status atual</p>
                      <p className="text-sm font-bold text-slate-800">{statusConfig.text}</p>
                    </div>
                  </div>
                  {localOrder.scheduledTime && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Agendado para</p>
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(localOrder.scheduledTime).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <p className="text-xs text-orange-100 mb-1">Valor total</p>
                <p className="text-2xl font-bold">{localOrder.total} MZN</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-orange-200" />
                    <p className="text-xs text-orange-100">
                      {localOrder.orderDate || new Date(localOrder.createdAt).toLocaleDateString()} às {localOrder.time || new Date(localOrder.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {localOrder.dist && (
                    <div className="flex items-center gap-2">
                      <Navigation size={12} className="text-orange-200" />
                      <p className="text-xs text-orange-100">{localOrder.dist}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Route Info */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={14} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Partida</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {isDelivery ? localOrder.origin : localOrder.pickupLocation}
                    </p>
                    {localOrder.contactOrigin && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{localOrder.contactOrigin}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Flag size={14} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Chegada</p>
                    <p className="text-sm text-slate-800 font-medium">
                      {isDelivery ? localOrder.dest : localOrder.dropoffLocation}
                    </p>
                    {localOrder.contactDest && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{localOrder.contactDest}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="border-t border-slate-100 pt-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Detalhes do Pedido
                </h3>
                <div className="space-y-3">
                  {/* Product Info for Delivery */}
                  {isDelivery && localOrder.productName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Produto</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {localOrder.productName} {localOrder.quantity > 1 && `x${localOrder.quantity}`}
                      </span>
                    </div>
                  )}

                  {/* Passenger Info for Taxi */}
                  {!isDelivery && localOrder.passengerCount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Passageiros</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {localOrder.passengerCount} pessoa(s)
                        {localOrder.hasLuggage && <span className="ml-2 text-xs text-slate-500">(com bagagem)</span>}
                      </span>
                    </div>
                  )}

                  {/* Urgency Level */}
                  {urgencyConfig && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Urgência</span>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyConfig.bgClass}`}>
                        <urgencyConfig.icon size={10} />
                        <span>{urgencyConfig.text}</span>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Pagamento</span>
                    <div className="flex items-center gap-2">
                      <CreditCard size={12} className="text-slate-400" />
                      <span className="text-sm text-slate-700">{localOrder.paymentMethod || "—"}</span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status do Pagamento</span>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusConfig.bgClass}`}>
                      <paymentStatusConfig.icon size={10} />
                      <span>{paymentStatusConfig.text}</span>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {localOrder.driver && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Motorista</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {typeof localOrder.driver === 'string' ? localOrder.driver : localOrder.driver?.name}
                      </span>
                    </div>
                  )}

                  {/* Client Info */}
                  {localOrder.client && (
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Cliente</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          {typeof localOrder.client === 'string' ? localOrder.client : localOrder.client?.name}
                        </p>
                        {localOrder.client?.phone && (
                          <p className="text-xs text-slate-500">{localOrder.client.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  {localOrder.company && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Empresa</span>
                      </div>
                      <span className="text-sm text-slate-700">
                        {typeof localOrder.company === 'string' ? localOrder.company : localOrder.company?.name}
                      </span>
                    </div>
                  )}

                  {/* Coordinates (if available) */}
                  {localOrder.pickupCoords && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[10px] text-slate-400 mb-1">Coordenadas</p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        Origem: {localOrder.pickupCoords.lat?.toFixed(5)}, {localOrder.pickupCoords.lng?.toFixed(5)}
                      </p>
                      {localOrder.dropoffCoords && (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                          Destino: {localOrder.dropoffCoords.lat?.toFixed(5)}, {localOrder.dropoffCoords.lng?.toFixed(5)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {localOrder.instructions && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Instruções Especiais
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                    "{localOrder.instructions}"
                  </p>
                </div>
              )}

              {localOrder.observations && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Observações
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {localOrder.observations}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              {isCompleted && onGiveFeedback && (
                <button 
                   onClick={() => onGiveFeedback(localOrder)} 
                  className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Star size={16} />
                  Avaliar Pedido
                </button>
              )}
              {isActive && (
                <button 
                  onClick={() => setShowTrackModal(true)} 
                  className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation size={16} />
                  Acompanhar
                </button>
              )}
              {!isCompleted && !isActive && (
                <button 
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Headphones size={16} />
                  Contactar Suporte
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showTrackModal && (
        <TrackOrderModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          order={localOrder}
        />
      )}
    </>
  );
};

export default OrderDetailModal;