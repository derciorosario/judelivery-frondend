// src/components/common/OrderDetailModal.jsx
import { useState, useEffect } from "react";
import { updateOrder, getDrivers, getOrder, cancelOrder } from "../../api/client";
import { toast } from "../../lib/toast";
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
  Truck,
  Navigation,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from "lucide-react";
import Modal from "../common/Modal";
import CancelOrderDialog from "../common/CancelOrderDialog";
import TrackOrderModal from "../cliente/modals/TrackOrderModal";
import NavigationModal from "../motorista/modals/NavigationModal";
import ConfirmDialog from "../common/ConfirmDialog";
import PaymentDialog from "../common/PaymentDialog";


const OrderDetailModal = ({ 
  isOpen, 
  onClose, 
  order, 
  orderId, 
  onUpdate, 
  onGiveFeedback,
  role = "customer", // "customer", "admin", "manager", "driver"
  onStatusChange, // For driver role
  updating // For driver role loading state
}) => {
   const [activeTab, setActiveTab] = useState("details");
   const [loadingOrder, setLoadingOrder] = useState(false);
   const [localOrder, setLocalOrder] = useState(order);
   const [showTrackModal, setShowTrackModal] = useState(false);
   const [showNavigation, setShowNavigation] = useState(false);
   const [showCancelDialog, setShowCancelDialog] = useState(false);
   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
   const [pendingStatus, setPendingStatus] = useState(null);
   const [showPaymentDialog, setShowPaymentDialog] = useState(false);
   const [pendingDriverStatus, setPendingDriverStatus] = useState(null);
   const [pendingAdminCompletion, setPendingAdminCompletion] = useState(false);

   // Admin/Manager specific states
   const [form, setForm] = useState({
     status: order?.status || "pending_approval",
     total: "",
     driverId: ""
   });
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [drivers, setDrivers] = useState([]);
   const [loadingDrivers, setLoadingDrivers] = useState(false);
   const [showDriverInfo, setShowDriverInfo] = useState(false);
   const [pendingAdminAction, setPendingAdminAction] = useState(null);

  const isAdmin = role === "admin" || role === "manager" || role === "superadmin";
  const isDriver = role === "driver";
  const isCustomer = role === "customer";

  // Fetch order if only orderId is provided
  useEffect(() => {
    if (!order && orderId && isOpen) {
      const fetchOrder = async () => {
        setLoadingOrder(true);
        try {
          const response = await getOrder(orderId);
          setLocalOrder(response.data);
          if (onUpdate) onUpdate(response.data);
        } catch (error) {
          console.error("Error fetching order:", error);
          toast.error("Erro ao carregar pedido");
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    } else if (order) {
      setLocalOrder(order);
    }
  }, [order, orderId, isOpen, onUpdate]);

  // Initialize form when order changes
  useEffect(() => {
    if (localOrder && isAdmin) {
      setForm({
        status: localOrder.status || "pending_approval",
        total: String(localOrder.total || ""),
        driverId: localOrder.driverId || ""
      });
    }
  }, [localOrder, isAdmin]);

  // Fetch drivers for admin when actions tab is opened
  useEffect(() => {
    if (activeTab === "actions" && isAdmin && drivers.length === 0) {
      const fetchDrivers = async () => {
        setLoadingDrivers(true);
        try {
          const response = await getDrivers();
          setDrivers(response.data || []);
        } catch (error) {
          console.error("Error fetching drivers:", error);
        } finally {
          setLoadingDrivers(false);
        }
      };
      fetchDrivers();
    }
  }, [activeTab, isAdmin, drivers.length]);

  // Helper functions

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
    if (s === "in_transit") {
      return { text: "Em entrega", icon: Truck, color: "blue", bgClass: "bg-blue-100 text-blue-700" };
    }
    if (s === "pending_approval") {
      return { text: "Aguardando", icon: Clock, color: "amber", bgClass: "bg-amber-100 text-amber-700" };
    }
    if (s === "completed") {
      return { text: "Concluído", icon: CheckCircle, color: "green", bgClass: "bg-green-100 text-green-700" };
    }
    if (s === "cancelled") {
      return { text: "Cancelado", icon: XCircle, color: "red", bgClass: "bg-red-100 text-red-700" };
    }
    if (s === "approved") {
      return { text: "Aprovado", icon: CheckCircle, color: "teal", bgClass: "bg-teal-100 text-teal-700" };
    }
    if (s === "scheduled") {
      return { text: "Agendado", icon: Calendar, color: "purple", bgClass: "bg-purple-100 text-purple-700" };
    }
    if (s === "assigned") {
      return { text: "Atribuído", icon: UserCheck, color: "indigo", bgClass: "bg-indigo-100 text-indigo-700" };
    }
    if (s === "rejected") {
      return { text: "Rejeitado", icon: UserX, color: "red", bgClass: "bg-red-100 text-red-700" };
    }
    return { text: status || "Processando", icon: AlertCircle, color: "slate", bgClass: "bg-slate-100 text-slate-700" };
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

  const getCancelReasonLabel = (reason) => {
    const labels = {
      changed_my_mind: "Mudei de ideia",
      found_better_price: "Encontrei melhor preço",
      ordered_by_mistake: "Pedido errado",
      delivery_too_slow: "Entrega muito lenta",
      vehicle_issue: "Problema no veículo",
      emergency: "Emergência pessoal",
      route_issue: "Problema na rota",
      customer_unresponsive: "Cliente não responde",
      customer_request: "Pedido do cliente",
      driver_request: "Pedido do motorista",
      fraud_suspected: "Fraude suspeita",
      service_unavailable: "Serviço indisponível",
      duplicate_order: "Pedido duplicado",
      other: "Outro"
    };
    return labels[reason] || reason;
  };

  // Helper to map payment method to payment type and method
  const getPaymentTypeAndMethodFromOrder = (paymentMethod) => {
    if (!paymentMethod) return { paymentType: null, paymentMethodId: null };
    
    const directMethods = ['bank_transfer'];
    const onlineMethods = ['mpesa', 'emola', 'card'];
    
    if (directMethods.includes(paymentMethod)) {
      return { paymentType: 'direct', paymentMethodId: paymentMethod === 'bank_transfer' ? 'bic' : paymentMethod };
    }
    if (onlineMethods.includes(paymentMethod)) {
      return { paymentType: 'online', paymentMethodId: paymentMethod };
    }
    if (paymentMethod === 'cash') {
      return { paymentType: 'direct', paymentMethodId: 'cash' };
    }
    
    return { paymentType: null, paymentMethodId: null };
  };

  // Action handlers
  const handleStatusChange = async (newStatus, skipPaymentDialog = false, paymentData = null) => {
    if (!localOrder) return;
    
    // If trying to complete order, show payment dialog first
    if (newStatus === "completed" && !skipPaymentDialog && (isAdmin || isDriver)) {
      if (isAdmin) {
        setPendingAdminCompletion(true);
        setShowPaymentDialog(true);
      } else {
        setPendingDriverStatus("completed");
        setShowPaymentDialog(true);
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = { 
        status: newStatus, 
        driverId: form.driverId || null,
        ...(paymentData && { 
          paymentMethod: paymentData.paymentMethod,
          paymentType: paymentData.paymentType,
          totalWithFees: paymentData.totalWithFees 
        })
      };
      const response = await updateOrder(localOrder.id, payload);
      setLocalOrder(response.data);
      if (onUpdate) onUpdate(response.data);
      toast.success(`Pedido ${getStatusConfig(newStatus).text.toLowerCase()} com sucesso`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminStatusChange = (newStatus) => {
    // If trying to complete, we'll handle through payment dialog
    if (newStatus === "completed") {
      setPendingAdminCompletion(true);
      setShowPaymentDialog(true);
      return;
    }
    
    setPendingAdminAction({ type: "status", value: newStatus });
    setShowConfirmDialog(true);
  };

  const handleAdminComplete = async () => {
    if (!pendingAdminAction) return;
    
    if (pendingAdminAction.type === "status") {
      await handleStatusChange(pendingAdminAction.value, true);
    } else if (pendingAdminAction.type === "assign") {
      await handleAssignDriver();
    }
    
    setPendingAdminAction(null);
    setShowConfirmDialog(false);
  };

  const handleAssignDriver = async () => {
    if (!localOrder || !form.driverId) return;
    setIsSubmitting(true);
    try {
      const payload = { driverId: form.driverId };
      if (localOrder.status === "pending_approval" || localOrder.status === "approved") {
        payload.status = "assigned";
      }
      const response = await updateOrder(localOrder.id, payload);
      setLocalOrder(response.data);
      if (onUpdate) onUpdate(response.data);
      toast.success("Motorista atribuído com sucesso");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atribuir motorista");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDriverWithConfirm = () => {
    if (!form.driverId) {
      toast.error("Selecione um motorista primeiro");
      return;
    }
    setPendingAdminAction({ type: "assign" });
    setShowConfirmDialog(true);
  };

  const handleCancelOrder = async (cancelData) => {
    if (!localOrder) return;
    setIsSubmitting(true);
    try {
      const response = await cancelOrder(localOrder.id, cancelData);
      setLocalOrder(response.data);
      if (onUpdate) onUpdate(response.data);
      toast.success("Pedido cancelado com sucesso");
      setShowCancelDialog(false);
      onClose(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao cancelar pedido");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverStatusChange = (newStatus) => {
    if (newStatus === "completed") {
      setPendingDriverStatus("completed");
      setShowPaymentDialog(true);
    } else {
      setPendingDriverStatus(newStatus);
      setShowConfirmDialog(true);
    }
  };

  const confirmDriverStatusChange = async () => {
    if (!pendingDriverStatus) return;
    
    setIsSubmitting(true);
    try {
      const payload = { status: pendingDriverStatus };
      const response = await updateOrder(localOrder.id, payload);
      setLocalOrder(response.data);
      if (onUpdate) onUpdate(response.data);
      
      const statusText = getStatusConfig(pendingDriverStatus).text;
      toast.success(`Pedido ${statusText.toLowerCase()} com sucesso`);
      
      setShowConfirmDialog(false);
      setPendingDriverStatus(null);
      
      if (pendingDriverStatus === "cancelled" || pendingDriverStatus === "rejected") {
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const payload = { 
        status: "completed",
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        totalWithFees: paymentData.totalWithFees,
        originalTotal: localOrder.total
      };
      
      const response = await updateOrder(localOrder.id, payload);
      setLocalOrder(response.data);
      if (onUpdate) onUpdate(response.data);
      toast.success("Pedido concluído com sucesso!");
      setShowPaymentDialog(false);
      setPendingDriverStatus(null);
      setPendingAdminCompletion(false);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao concluir pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerCancel = () => {
    setShowCancelDialog(true);
  };

  // Status checks
  const statusConfig = getStatusConfig(localOrder?.status);
  const StatusIcon = statusConfig.icon;
  const isDelivery = localOrder?.serviceType !== "taxi";
  const isCompleted = localOrder?.status === "completed";
  const isActive = localOrder?.status === "in_transit";
  const isCancelled = localOrder?.status === "cancelled";
  const isRejected = localOrder?.status === "rejected";
  const canCancel = !isCompleted && !isCancelled && !isRejected;
  const urgencyConfig = isDelivery && localOrder?.urgencyLevel ? getUrgencyConfig(localOrder.urgencyLevel) : null;
  const paymentStatusConfig = getPaymentStatusConfig(localOrder?.paymentStatus);

  // Selected driver for admin
  const selectedDriver = drivers.find(d => d.id === form.driverId);

  // Get existing payment method from order
  const existingPaymentMethod = localOrder?.paymentMethod;
  const defaultPaymentData = getPaymentTypeAndMethodFromOrder(existingPaymentMethod);

  if (loadingOrder) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Pedido">
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      </Modal>
    );
  }

  if (!localOrder) return null;

  // Render Details Tab (common for all roles)
  const renderDetailsTab = () => (
    <div className="space-y-4">
      {/* Header Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConfig.bgClass}`}>
          <StatusIcon size={12} />
          <span className="text-xs font-semibold">{statusConfig.text}</span>
        </div>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
          isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
        }`}>
          {isDelivery ? <Package size={12} /> : <Car size={12} />}
          <span className="text-xs font-semibold">
            {isDelivery ? "Entrega" : "Táxi"}
          </span>
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
              {localOrder.orderDate || new Date(localOrder.createdAt).toLocaleDateString()} às{" "}
              {localOrder.time || new Date(localOrder.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
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

      {/* Addresses */}
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
          {localOrder.productName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Produto</span>
              <span className="text-sm font-semibold text-slate-800">
                {localOrder.productName} {localOrder.quantity > 1 && `x${localOrder.quantity}`}
              </span>
            </div>
          )}

          {!isDelivery && localOrder.passengerCount && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">Passageiros</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {localOrder.passengerCount} pessoa(s)
                {localOrder.hasLuggage && <span className="ml-2 text-xs text-slate-500">(com bagagem)</span>}
              </span>
            </div>
          )}

          {urgencyConfig && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Urgência</span>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyConfig.bgClass}`}>
                <urgencyConfig.icon size={10} />
                <span>{urgencyConfig.text}</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-slate-400" />
              <span className="text-sm text-slate-600">Pagamento</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-700">{getPaymentMethodLabel(localOrder.paymentMethod)}</p>
              <p className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${paymentStatusConfig.bgClass}`}>
                {paymentStatusConfig.text}
              </p>
            </div>
          </div>

          {localOrder.client && (
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">Cliente</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">
                  {typeof localOrder.client === "string" ? localOrder.client : localOrder.client?.name}
                </p>
                {localOrder.client?.phone && (
                  <p className="text-xs text-slate-500">{localOrder.client.phone}</p>
                )}
              </div>
            </div>
          )}

          {localOrder.driver && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Truck size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">Motorista</span>
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {typeof localOrder.driver === "string" ? localOrder.driver : localOrder.driver?.name}
              </span>
            </div>
          )}

          {localOrder.company && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 size={14} className="text-slate-400" />
                <span className="text-sm text-slate-600">Empresa</span>
              </div>
              <span className="text-sm text-slate-700">
                {typeof localOrder.company === "string" ? localOrder.company : localOrder.company?.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      {localOrder.instructions && (
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Instruções Especiais</h3>
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
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Observações</h3>
          </div>
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{localOrder.observations}</p>
        </div>
      )}

      {/* Cancellation Details */}
      {(isCancelled || isRejected) && (localOrder.cancelledBy || localOrder.cancellationReason) && (
        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={14} className="text-red-500" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {isRejected ? "Detalhes da Rejeição" : "Detalhes do Cancelamento"}
            </h3>
          </div>
          <div className="bg-red-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {isRejected ? "Rejeitado por" : "Cancelado por"}
              </span>
              <span className="text-xs font-semibold text-slate-800 capitalize">
                {localOrder.cancelledBy === "customer" ? "Cliente" :
                 localOrder.cancelledBy === "driver" ? "Motorista" : "Admin/Gestor"}
              </span>
            </div>
            {localOrder.cancellationReason && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Motivo</span>
                <span className="text-xs font-semibold text-slate-800">
                  {getCancelReasonLabel(localOrder.cancellationReason)}
                </span>
              </div>
            )}
            {localOrder.cancellationComment && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Comentário</span>
                <p className="text-xs text-slate-700 bg-white p-2 rounded">{localOrder.cancellationComment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedbacks */}
      {localOrder.feedbacks && localOrder.feedbacks.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Avaliações</h3>
          <div className="space-y-3">
            {localOrder.feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">
                    {typeof feedback.client === 'string' ? feedback.client : feedback.client?.name || 'Cliente'}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-700">{feedback.rating}/5</span>
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-xs text-slate-600 italic">"{feedback.comment}"</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-400">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Actions Tab for Admin/Manager
  const renderAdminActionsTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          <Clock size={12} /> Alterar Status
        </label>
        <select
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
        >
          <option value="pending_approval">⏳ Pendente</option>
          <option value="approved">✅ Aprovado</option>
          <option value="scheduled">📅 Agendado</option>
          <option value="assigned">👤 Atribuído</option>
          <option value="in_transit">🚚 Em entrega</option>
          <option value="completed">🎉 Concluído</option>
          <option value="cancelled">❌ Cancelado</option>
          <option value="rejected">⛔ Rejeitado</option>
        </select>
        
        <button
          onClick={() => handleAdminStatusChange(form.status)}
          disabled={isSubmitting || form.status === localOrder?.status}
          className="w-full mt-2 py-2 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          Aplicar Mudança de Status
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          <DollarSign size={12} /> Valor Total (MZN)
        </label>
        <input
          type="number"
          value={form.total}
          onChange={e => setForm({ ...form, total: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
          <Truck size={12} /> Motorista
        </label>
        {loadingDrivers ? (
          <div className="flex items-center gap-2 py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="text-xs text-slate-500">A carregar motoristas...</span>
          </div>
        ) : (
          <>
            <select
              value={form.driverId}
              onChange={e => {
                setForm({ ...form, driverId: e.target.value });
                setShowDriverInfo(true);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            >
              <option value="">Selecione um motorista</option>
              {drivers.map(d => {
                const statusIcon = d.status === "online" ? "🟢" : d.status === "working" ? "🔵" : "⚪";
                return (
                  <option key={d.id} value={d.id}>
                    {statusIcon} {d.name} {d.phone ? `(${d.phone})` : ""}
                  </option>
                );
              })}
            </select>
            
            {showDriverInfo && selectedDriver && (
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-600">Informações do Motorista</h4>
                  <button onClick={() => setShowDriverInfo(false)} className="text-slate-400 hover:text-slate-600">
                    <EyeOff size={12} />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-xs"><span className="text-slate-500">Nome:</span> <span className="ml-1 font-semibold text-slate-700">{selectedDriver.name}</span></p>
                  {selectedDriver.phone && <p className="text-xs"><span className="text-slate-500">Telefone:</span> <span className="ml-1 text-slate-700">{selectedDriver.phone}</span></p>}
                  {selectedDriver.vehicle && <p className="text-xs"><span className="text-slate-500">Veículo:</span> <span className="ml-1 text-slate-700">{selectedDriver.vehicle}</span></p>}
                  {selectedDriver.licensePlate && <p className="text-xs"><span className="text-slate-500">Matrícula:</span> <span className="ml-1 font-mono text-slate-700">{selectedDriver.licensePlate}</span></p>}
                </div>
              </div>
            )}
            
            <button
              onClick={handleAssignDriverWithConfirm}
              disabled={isSubmitting || !form.driverId || form.driverId === localOrder.driverId}
              className="w-full mt-2 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              {localOrder.driverId ? "Atualizar Motorista" : "Atribuir Motorista"}
            </button>
          </>
        )}
      </div>

      {canCancel && (
        <button onClick={() => setShowCancelDialog(true)} disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2">
          <XCircle size={16} /> Cancelar Pedido
        </button>
      )}
    </div>
  );

  // Render Actions Tab for Driver - Now with buttons instead of selector
  const renderDriverActionsTab = () => (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 text-center">
          Ações do Pedido
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleDriverStatusChange("in_transit")}
            disabled={updating || isCompleted || isCancelled || isRejected || localOrder.status === "in_transit"}
            className="py-3 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Truck size={16} />
            Iniciar Entrega
          </button>
          
          <button
            onClick={() => handleDriverStatusChange("completed")}
            disabled={updating || isCompleted || isCancelled || isRejected}
            className="py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle size={16} />
            Concluir
          </button>
          
          <button
            onClick={() => handleDriverStatusChange("cancelled")}
            disabled={updating || isCompleted || isCancelled || isRejected}
            className="py-3 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Cancelar
          </button>
          
          <button
            onClick={() => handleDriverStatusChange("rejected")}
            disabled={updating || isCompleted || isCancelled || isRejected}
            className="py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <UserX size={16} />
            Rejeitar
          </button>
        </div>
      </div>

      {isActive && (
        <button 
          onClick={() => setShowNavigation(true)} 
          disabled={updating} 
          className="w-full py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Navigation size={16} /> Navegar para o Destino
        </button>
      )}
    </div>
  );

  // Render Footer Actions for Customer
  const renderCustomerFooter = () => (
    <div className="flex gap-2">
      {isCompleted && onGiveFeedback && (
        <button onClick={() => onGiveFeedback(localOrder)} className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">
          <Star size={16} /> Avaliar Pedido
        </button>
      )}
      {isActive && (
        <button onClick={() => setShowTrackModal(true)} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Navigation size={16} /> Acompanhar
        </button>
      )}
      {canCancel && (
        <button onClick={handleCustomerCancel} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
          <XCircle size={16} /> Cancelar Pedido
        </button>
      )}
      {!isCompleted && !isActive && !canCancel && (
        <button onClick={() => setShowTrackModal(true)} className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Navigation size={16} /> Acompanhar
        </button>
      )}
    </div>
  );

  // Render Footer for Admin/Driver
  const renderAdminDriverFooter = () => {
    if (isDriver && isActive) {
      return (
        <div className="flex gap-2">
          <button onClick={() => setShowNavigation(true)} disabled={updating} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2">
            <Navigation size={16} /> Navegar
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Fechar
          </button>
        </div>
      );
    }
    return (
      <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
        Fechar
      </button>
    );
  };

  const showActionsTab = (isAdmin || isDriver) && !isCompleted && !isCancelled && !isRejected;

  // Get confirmation message based on action
  const getConfirmationMessage = () => {
    if (pendingAdminAction?.type === "status") {
      const newStatus = pendingAdminAction.value;
      const statusText = getStatusConfig(newStatus).text;
      return `Tem certeza que deseja alterar o status do pedido para "${statusText.toLowerCase()}"?`;
    }
    if (pendingAdminAction?.type === "assign") {
      const driverName = selectedDriver?.name || "este motorista";
      return `Tem certeza que deseja atribuir o pedido a ${driverName}?`;
    }
    if (pendingDriverStatus === "cancelled") {
      return "Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.";
    }
    if (pendingDriverStatus === "rejected") {
      return "Tem certeza que deseja rejeitar este pedido? Esta ação não pode ser desfeita.";
    }
    return "Tem certeza que deseja realizar esta ação?";
  };

  const getConfirmationTitle = () => {
    if (pendingAdminAction?.type === "status") return "Confirmar Mudança de Status";
    if (pendingAdminAction?.type === "assign") return "Confirmar Atribuição";
    if (pendingDriverStatus === "cancelled") return "Confirmar Cancelamento";
    if (pendingDriverStatus === "rejected") return "Confirmar Rejeição";
    return "Confirmar Ação";
  };

  const getConfirmText = () => {
    if (pendingDriverStatus === "cancelled") return "Sim, Cancelar";
    if (pendingDriverStatus === "rejected") return "Sim, Rejeitar";
    return "Confirmar";
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Pedido #${localOrder.id ? localOrder.id.slice(-8).toUpperCase() : "PEDIDO"}`}
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                activeTab === "details" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Eye size={12} /> Detalhes
            </button>
            {showActionsTab && (
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  activeTab === "actions" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Edit2 size={12} /> Ações
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "details" && renderDetailsTab()}
          
          {activeTab === "actions" && isAdmin && renderAdminActionsTab()}
          {activeTab === "actions" && isDriver && renderDriverActionsTab()}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          {isCustomer && renderCustomerFooter()}
          {(isAdmin || isDriver) && renderAdminDriverFooter()}
        </div>
      </Modal>

      {/* Track Order Modal */}
      {showTrackModal && (
        <TrackOrderModal
          isOpen={showTrackModal}
          onClose={() => setShowTrackModal(false)}
          order={localOrder}
        />
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && localOrder && (
        <CancelOrderDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false)
          }}
          onConfirm={handleCancelOrder}
          role={role}
          orderStatus={localOrder?.status}
        />
      )}

      {/* Navigation Modal for Driver */}
      {showNavigation && localOrder && isDriver && (
        <NavigationModal
          isOpen={showNavigation}
          onClose={() => setShowNavigation(false)}
          order={localOrder}
        />
      )}

      {/* Confirm Dialog for All Status Changes */}
      {(showConfirmDialog || pendingAdminAction || pendingDriverStatus) && !showPaymentDialog && (
        <ConfirmDialog
          isOpen={showConfirmDialog}
          onClose={() => {
            setShowConfirmDialog(false);
            setPendingAdminAction(null);
            setPendingDriverStatus(null);
          }}
          onConfirm={pendingAdminAction ? handleAdminComplete : confirmDriverStatusChange}
          title={getConfirmationTitle()}
          message={getConfirmationMessage()}
          confirmText={getConfirmText()}
          cancelText="Cancelar"
          variant={pendingDriverStatus === "cancelled" || pendingDriverStatus === "rejected" ? "danger" : "warning"}
        />
      )}

      {/* Payment Dialog for Driver and Admin Completion */}
      {showPaymentDialog && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setPendingDriverStatus(null);
            setPendingAdminCompletion(false);
          }}
          onConfirm={handlePaymentComplete}
          orderTotal={localOrder.total}
          isSubmitting={isSubmitting}
          role={role}
          defaultPaymentType={defaultPaymentData.paymentType}
          defaultPaymentMethod={defaultPaymentData.paymentMethodId}
          existingPaymentMethod={existingPaymentMethod}
        />
      )}
    </>
  );
};

export default OrderDetailModal;