import { useState } from "react";
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

const OrderDetailModal = ({ isOpen, onClose, order, onGiveFeedback }) => {
  const [showTrackModal, setShowTrackModal] = useState(false);

  if (!isOpen || !order) return null;

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

  const statusConfig = getStatusConfig(order.status || order.statusCode);
  const StatusIcon = statusConfig.icon;
  const isDelivery = order.serviceType !== "taxi";
  const isCompleted = order.status === "completed" || order.statusCode === "completed";
  const isActive = order.status === "in_transit" || order.statusCode === "in_progress" || order.status === "in_transit";
  const urgencyConfig = isDelivery && order.urgencyLevel ? getUrgencyConfig(order.urgencyLevel) : null;
  const paymentStatusConfig = getPaymentStatusConfig(order.paymentStatus);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between rounded-t-2xl z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">
                Pedido #{order.id ? order.id.slice(-8).toUpperCase() : "PEDIDO"}
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
                  {order.scheduledTime && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Agendado para</p>
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(order.scheduledTime).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Card */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                <p className="text-xs text-orange-100 mb-1">Valor total</p>
                <p className="text-2xl font-bold">{order.total} MZN</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-orange-200" />
                    <p className="text-xs text-orange-100">
                      {order.orderDate || new Date(order.createdAt).toLocaleDateString()} às {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {order.dist && (
                    <div className="flex items-center gap-2">
                      <Navigation size={12} className="text-orange-200" />
                      <p className="text-xs text-orange-100">{order.dist}</p>
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
                      {isDelivery ? order.origin : order.pickupLocation}
                    </p>
                    {order.contactOrigin && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{order.contactOrigin}</p>
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
                      {isDelivery ? order.dest : order.dropoffLocation}
                    </p>
                    {order.contactDest && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={10} className="text-slate-400" />
                        <p className="text-xs text-slate-500">{order.contactDest}</p>
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
                  {isDelivery && order.productName && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Produto</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {order.productName} {order.quantity > 1 && `x${order.quantity}`}
                      </span>
                    </div>
                  )}

                  {/* Passenger Info for Taxi */}
                  {!isDelivery && order.passengerCount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Passageiros</span>
                      <span className="text-sm font-semibold text-slate-800">
                        {order.passengerCount} pessoa(s)
                        {order.hasLuggage && <span className="ml-2 text-xs text-slate-500">(com bagagem)</span>}
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
                      <span className="text-sm text-slate-700">{order.paymentMethod || "—"}</span>
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
                  {order.driver && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Motorista</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">
                        {typeof order.driver === 'string' ? order.driver : order.driver?.name}
                      </span>
                    </div>
                  )}

                  {/* Client Info */}
                  {order.client && (
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Cliente</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          {typeof order.client === 'string' ? order.client : order.client?.name}
                        </p>
                        {order.client?.phone && (
                          <p className="text-xs text-slate-500">{order.client.phone}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  {order.company && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        <span className="text-sm text-slate-600">Empresa</span>
                      </div>
                      <span className="text-sm text-slate-700">
                        {typeof order.company === 'string' ? order.company : order.company?.name}
                      </span>
                    </div>
                  )}

                  {/* Coordinates (if available) */}
                  {order.pickupCoords && (
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-[10px] text-slate-400 mb-1">Coordenadas</p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        Origem: {order.pickupCoords.lat?.toFixed(5)}, {order.pickupCoords.lng?.toFixed(5)}
                      </p>
                      {order.dropoffCoords && (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                          Destino: {order.dropoffCoords.lat?.toFixed(5)}, {order.dropoffCoords.lng?.toFixed(5)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              {order.instructions && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Instruções Especiais
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                    "{order.instructions}"
                  </p>
                </div>
              )}

              {order.observations && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      Observações
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    {order.observations}
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
                  onClick={() => onGiveFeedback(order)} 
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
          order={order}
        />
      )}
    </>
  );
};

export default OrderDetailModal;