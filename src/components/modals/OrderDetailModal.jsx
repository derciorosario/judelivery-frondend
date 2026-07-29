// src/components/common/OrderDetailModal.jsx
import { useState, useEffect } from "react";
import { updateOrder, getDrivers, getOrder, cancelOrder, getOrderIncidents, createIncident, updateIncidentWithFiles, deleteIncident, deleteFeedback, getAvailableDriversForReassignment, rejectOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import { usePlatformSettings } from "../../contexts/SettingsContext";
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
  UserX,
  Trash2
} from "lucide-react";
import Modal from "../common/Modal";
import CancelOrderDialog from "../common/CancelOrderDialog";
import TrackOrderModal from "../cliente/modals/TrackOrderModal";
import NavigationModal from "../motorista/modals/NavigationModal";
import ConfirmDialog from "../common/ConfirmDialog";
import PaymentDialog from "../common/PaymentDialog";
import ReassignOrderModal from "./ReassignOrderModal";
import { uploadClient, API_URL } from "../../api/client";

const INCIDENT_TYPE_LABELS = {
  "accident": "Acidente",
  "breakdown": "Avaria",
  "delivery_issue": "Problema Entrega"
};

const OrderDetailModal = ({
  
  isOpen,
  onClose,
  order,
  orderId,
  onUpdate,
  onGiveFeedback,
  role = "customer", // "customer", "admin", "manager", "driver"
  onStatusChange, // For driver role
  updating, // For driver role loading state
  initialTab = "details" // Initial tab to show when modal opens

}) => {


  const { settings: platformSettings } = usePlatformSettings();
  const [activeTab, setActiveTab] = useState(initialTab);
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
  const [showDeleteFeedbackDialog, setShowDeleteFeedbackDialog] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [pendingRejection, setPendingRejection] = useState(null);

  
   // Incidents state
   const [incidents, setIncidents] = useState([]);
   const [loadingIncidents, setLoadingIncidents] = useState(false);
   const [showIncidentModal, setShowIncidentModal] = useState(false);
   const [showEditIncidentModal, setShowEditIncidentModal] = useState(false);
   const [showDeleteIncidentModal, setShowDeleteIncidentModal] = useState(false);
   const [selectedIncident, setSelectedIncident] = useState(null);
   const [incidentForm, setIncidentForm] = useState({ type: "breakdown", title: "", description: "" });
   const [submittingIncident, setSubmittingIncident] = useState(false);
   const [incidentPhotos, setIncidentPhotos] = useState([]);
   const [incidentDocuments, setIncidentDocuments] = useState([]);
   const [existingIncidentPhotos, setExistingIncidentPhotos] = useState([]);
   const [existingIncidentDocuments, setExistingIncidentDocuments] = useState([]);
   const [showPhotoViewer, setShowPhotoViewer] = useState(false);
   const [selectedPhoto, setSelectedPhoto] = useState(null);

   // Admin/Manager specific states
    const [form, setForm] = useState({
      status: order?.status || "pending_approval",
      total: "",
      driverId: ""
    });
    
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
   const [driverAmount, setDriverAmount] = useState(String(localOrder?.total || ""));
   const [isDriverUpdatingPrice, setIsDriverUpdatingPrice] = useState(false);
   const [drivers, setDrivers] = useState([]);
   const [loadingDrivers, setLoadingDrivers] = useState(false);
   const [showDriverInfo, setShowDriverInfo] = useState(false);
   const [pendingAdminAction, setPendingAdminAction] = useState(null);

  const isAdmin = role === "admin" || role === "manager" || role === "superadmin";
  const isDriver = role === "driver";
  const isCustomer = role === "customer";

  // Helper function to get file URL
  const getFileUrl = (filename) => {
    return `${API_URL}/uploads/incidents/${filename}`.replace(`/api/`,'/');
  };

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
      setLoadingOrder(false);
    }

    console.log({order})
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

   // Sync driverAmount with order total
   useEffect(() => {
     if (localOrder) {
       setDriverAmount(String(localOrder.total || ""));
     }
   }, [localOrder]);

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

  // Fetch incidents when incidents tab is opened
  useEffect(() => {
    if (activeTab === "incidents" && localOrder?.id) {
      const fetchIncidents = async () => {
        setLoadingIncidents(true);
        try {
          const response = await getOrderIncidents(localOrder.id);
          setIncidents(response.data || []);
        } catch (error) {
          console.error("Error fetching incidents:", error);
        } finally {
          setLoadingIncidents(false);
        }
      };
      fetchIncidents();
    }
  }, [activeTab, localOrder?.id]);

  // Set active tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Listen for notification:openOrder event to switch to specific tab
  useEffect(() => {
    const handleOpenOrderNotification = (event) => {
      const { orderId: eventOrderId, tab } = event.detail;
      if (eventOrderId && localOrder?.id && String(eventOrderId) === String(localOrder.id) && tab) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('notification:openOrder', handleOpenOrderNotification);
    return () => window.removeEventListener('notification:openOrder', handleOpenOrderNotification);
  }, [localOrder?.id]);

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

  // Photo viewer handler
  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  // Incident handlers
  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.title || !incidentForm.description || !localOrder?.id) return;
    setSubmittingIncident(true);
    try {
      const formData = new FormData();
      formData.append("type", incidentForm.type);
      formData.append("title", incidentForm.title);
      formData.append("description", incidentForm.description);
      formData.append("status", "pending");
      formData.append("orderId", localOrder.id);
      formData.append("driverId", localOrder.driverId || localOrder.driver?.id || "");
      formData.append("date", new Date().toISOString().split('T')[0]);
      formData.append("time", new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }));
      
      // Add photos and documents
      incidentPhotos.forEach(photo => formData.append("photos", photo));
      incidentDocuments.forEach(doc => formData.append("documents", doc));
      
      await createIncident(formData);
      toast.success("Incidente reportado com sucesso");
      setShowIncidentModal(false);
      setIncidentPhotos([]);
      setIncidentDocuments([]);
      setIncidentForm({ type: "breakdown", title: "", description: "" });
      // Refresh incidents
      const response = await getOrderIncidents(localOrder.id);
      setIncidents(response.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao reportar incidente");
    } finally {
      setSubmittingIncident(false);
    }
  };

  const handleEditIncident = (incident) => {
    setSelectedIncident(incident);
    setIncidentForm({
      type: incident.type || "breakdown",
      title: incident.title || "",
      description: incident.description || ""
    });
    setExistingIncidentPhotos(incident.photos || []);
    setExistingIncidentDocuments(incident.documents || []);
    setIncidentPhotos([]);
    setIncidentDocuments([]);
    setShowEditIncidentModal(true);
  };

  const handleUpdateIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.title || !incidentForm.description || !selectedIncident) return;
    setSubmittingIncident(true);
    try {
      const formData = new FormData();
      formData.append("type", incidentForm.type);
      formData.append("title", incidentForm.title);
      formData.append("description", incidentForm.description);
      formData.append("status", selectedIncident.status || "pending");
      if (localOrder) {
        formData.append("orderId", localOrder.id);
      }
      if (selectedIncident.driverId) {
        formData.append("driverId", selectedIncident.driverId);
      }
      formData.append("date", selectedIncident.date || new Date().toISOString().split('T')[0]);
      formData.append("time", selectedIncident.time || new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }));
      
      // Append existing files
      formData.append("existingPhotos", JSON.stringify(existingIncidentPhotos));
      formData.append("existingDocuments", JSON.stringify(existingIncidentDocuments));
      
      // Append new files
      incidentPhotos.forEach(photo => formData.append("photos", photo));
      incidentDocuments.forEach(doc => formData.append("documents", doc));
      
      await updateIncidentWithFiles(selectedIncident.id, formData);
      toast.success("Incidente atualizado com sucesso");
      setShowEditIncidentModal(false);
      setSelectedIncident(null);
      setIncidentPhotos([]);
      setIncidentDocuments([]);
      setExistingIncidentPhotos([]);
      setExistingIncidentDocuments([]);
      setIncidentForm({ type: "breakdown", title: "", description: "" });
      
      // Refresh incidents
      if (localOrder) {
        const response = await getOrderIncidents(localOrder.id);
        setIncidents(response.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar incidente");
    } finally {
      setSubmittingIncident(false);
    }
  };

  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    try {
      await deleteIncident(selectedIncident.id);
      toast.success("Incidente removido com sucesso");
      setShowDeleteIncidentModal(false);
      setSelectedIncident(null);
      
      // Refresh incidents
      if (localOrder) {
        const response = await getOrderIncidents(localOrder.id);
        setIncidents(response.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover incidente");
    }
  };

  const removeIncidentPhoto = (index) => {
    setIncidentPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeIncidentDocument = (index) => {
    setIncidentDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingIncidentPhoto = (photoToRemove) => {
    setExistingIncidentPhotos(prev => prev.filter(p => p !== photoToRemove));
  };

  const removeExistingIncidentDocument = (docToRemove) => {
    setExistingIncidentDocuments(prev => prev.filter(d => d !== docToRemove));
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
      if (pendingAdminAction.value === "rejected") {
        setPendingRejection(pendingAdminAction.value);
        setShowReassignDialog(true);
        setPendingAdminAction(null);
        setShowConfirmDialog(false);
        return;
      }
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

  const handleReassignComplete = async (updatedOrder) => {
    setLocalOrder(updatedOrder);
    if (onUpdate) onUpdate(updatedOrder);
    setShowReassignDialog(false);
    setPendingRejection(null);
    onClose();
  };

  const handleAssignDriverWithConfirm = () => {
    if (!form.driverId) {
      toast.error("Selecione um motorista primeiro");
      return;
    }
    setPendingAdminAction({ type: "assign" });
    setShowConfirmDialog(true);
  };

   const handleUpdatePrice = async () => {
     if (!localOrder) return;
     const newTotal = parseFloat(form.total);
     if (isNaN(newTotal) || newTotal < 0) {
       toast.error("Insira um valor válido");
       return;
     }
     if (newTotal === localOrder.total) {
       toast.error("O valor é igual ao atual");
       return;
     }
     setIsUpdatingPrice(true);
     try {
       const response = await updateOrder(localOrder.id, { total: newTotal });
       setLocalOrder(response.data);
       if (onUpdate) onUpdate(response.data);
       toast.success("Valor atualizado com sucesso");
     } catch (error) {
       toast.error(error.response?.data?.message || "Erro ao atualizar valor");
     } finally {
       setIsUpdatingPrice(false);
     }
   };

   const handleDriverUpdatePrice = async () => {
     if (!localOrder) return;
     const newTotal = parseFloat(driverAmount);
     if (isNaN(newTotal) || newTotal < 0) {
       toast.error("Insira um valor válido");
       return;
     }
     if (newTotal === localOrder.total) {
       toast.error("O valor é igual ao atual");
       return;
     }
     setIsDriverUpdatingPrice(true);
     try {
       const response = await updateOrder(localOrder.id, { total: newTotal });
       setLocalOrder(response.data);
       if (onUpdate) onUpdate(response.data);
       toast.success("Valor atualizado com sucesso");
       setDriverAmount("");
     } catch (error) {
       toast.error(error.response?.data?.message || "Erro ao atualizar valor");
     } finally {
       setIsDriverUpdatingPrice(false);
     }
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

   const handleDriverConfirm = async () => {
     if (!localOrder) return;
     setIsSubmitting(true);
     try {
       const response = await updateOrder(localOrder.id, { confirmed: true });
       setLocalOrder(response.data);
       if (onUpdate) onUpdate(response.data);
       toast.success("Pedido confirmado com sucesso");
     } catch (error) {
       toast.error(error.response?.data?.message || "Erro ao confirmar pedido");
     } finally {
       setIsSubmitting(false);
     }
   };

  const confirmDriverStatusChange = async () => {
    if (!pendingDriverStatus) return;

    if (pendingDriverStatus === "rejected") {
      setShowConfirmDialog(false);
      setShowReassignDialog(true);
      setPendingDriverStatus(null);
      return;
    }

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
      
      if (pendingDriverStatus === "cancelled") {
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

 
  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteFeedback(feedbackToDelete.id);
      toast.success("Avaliação removida com sucesso!");
      setShowDeleteFeedbackDialog(false);
      setFeedbackToDelete(null);
      setLocalOrder(prev => ({
        ...prev,
        feedbacks: (prev.feedbacks || []).filter(f => f.id !== feedbackToDelete.id)
      }));
      if (onUpdate) {
        onUpdate({
          ...localOrder,
          feedbacks: (localOrder.feedbacks || []).filter(f => f.id !== feedbackToDelete.id)
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteFeedback = (feedback) => {
    setFeedbackToDelete(feedback);
    setShowDeleteFeedbackDialog(true);
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
  const customerFeedback = localOrder?.feedbacks?.find(f => f.client?.id === localOrder.clientId);

  // Selected driver for admin
  const selectedDriver = drivers.find(d => d.id === form.driverId);


   const handleEditFeedback = () => {
    if (!localOrder || !customerFeedback) return;
    if (onGiveFeedback) {
      onGiveFeedback(localOrder, customerFeedback);
    }
  };



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
         {localOrder?.confirmed && !isCustomer && (
           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">
             <CheckCircle size={12} />
             <span className="text-xs font-semibold">Confirmado</span>
           </div>
         )}
        </div>


      {isDriver && !localOrder?.confirmed && !isCompleted && !isCancelled && !isRejected && (
        <button
          onClick={handleDriverConfirm}
          disabled={updating}
          className="w-full py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          Confirmar Pedido
        </button>
      )}

   

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

          {localOrder.paymentStatus === 'pending' && localOrder.payments && localOrder.payments.some(p => p.checkoutUrl) && (
            <div className="mt-2 space-y-2">
              {(() => {
                const pendingPayment = localOrder.payments.find(p => p.checkoutUrl);
                return (
                  <>
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      O pagamento está pendente. Complete o pagamento para confirmar o pedido.
                    </p>
                    <a
                      href={pendingPayment.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
                    >
                      <CreditCard size={16} />
                      Ir para Checkout
                    </a>
                  </>
                );
              })()}
            </div>
          )}

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
        <div className="flex gap-2">
          <input
            type="number"
            value={form.total}
            onChange={e => setForm({ ...form, total: e.target.value })}
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
            placeholder="0.00"
          />
          <button
            onClick={handleUpdatePrice}
            disabled={isUpdatingPrice || !form.total || parseFloat(form.total) === localOrder?.total}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            {isUpdatingPrice ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <DollarSign size={14} />
            )}
            {isUpdatingPrice ? "A atualizar..." : "Atualizar"}
          </button>
        </div>
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
            {!isDelivery ? 'Iniciar Corrida' : 'Iniciar Entrega'}
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
            onClick={() =>{
              setShowCancelDialog(true);
            }}
            disabled={updating || isCompleted || isCancelled || isRejected || !platformSettings?.order?.driverCanCancel}
            className="py-3 rounded-xl  bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={16} />
            Cancelar
          </button>


        

            <button
              onClick={() => handleDriverStatusChange("rejected")}
              disabled={updating || isCompleted || isCancelled || isRejected || !platformSettings?.order?.driverCanReject}
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

       {platformSettings?.order?.driverCanUpdateAmount && !isCompleted && !isCancelled && !isRejected && (
         <div className="mt-3">
           <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
             <DollarSign size={12} /> Atualizar Valor (MZN)
           </label>
           <div className="flex gap-2">
             <input
               type="number"
               value={driverAmount}
               onChange={e => setDriverAmount(e.target.value)}
               className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
               placeholder="0.00"
             />
             <button
               onClick={handleDriverUpdatePrice}
               disabled={isDriverUpdatingPrice || !driverAmount || parseFloat(driverAmount) === localOrder?.total}
               className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
             >
               {isDriverUpdatingPrice ? (
                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
               ) : (
                 <DollarSign size={14} />
               )}
               {isDriverUpdatingPrice ? "A atualizar..." : "Atualizar"}
             </button>
           </div>
         </div>
       )}
     </div>
   );

  // Render Footer Actions for Customer
  const renderCustomerFooter = () => (
    <div className="flex gap-2">
      {isCompleted && onGiveFeedback && !customerFeedback && (
        <button onClick={() => onGiveFeedback(localOrder)} className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">
          <Star size={16} /> Avaliar Pedido
        </button>
      )}
      {isCompleted && customerFeedback && (
        <>
          <button onClick={handleEditFeedback} className="flex-1 py-2.5 rounded-xl bg-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-200 transition-colors flex items-center justify-center gap-2">
            <Edit2 size={16} /> Editar Avaliação
          </button>
          <button onClick={() => confirmDeleteFeedback(customerFeedback)} className="flex-1 py-2.5 rounded-xl bg-red-100 text-red-700 font-semibold text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
            <Trash2 size={16} /> Eliminar
          </button>
        </>
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
  const showIncidentsTab = (isAdmin || isDriver || isCustomer) && localOrder?.id;
  const incidentsCount = incidents.length;

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

  // Render edit incident form fields (shared between create and edit)
  const renderIncidentFormFields = () => (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Incidente</label>
        <select
          value={incidentForm.type}
          onChange={e => setIncidentForm({ ...incidentForm, type: e.target.value })}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="accident">Acidente</option>
          <option value="breakdown">Avaria</option>
          <option value="delivery_issue">Problema Entrega</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Título</label>
        <input
          type="text"
          value={incidentForm.title}
          onChange={e => setIncidentForm({ ...incidentForm, title: e.target.value })}
          placeholder="Ex: Pneu furado na EN1"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
        <textarea
          value={incidentForm.description}
          onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })}
          placeholder="Descreva o incidente..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          required
        />
      </div>

      {/* Photos */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Fotos</label>
        
        {/* Existing Photos - only for edit mode */}
        {existingIncidentPhotos.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 mb-1">Fotos existentes:</p>
            <div className="grid grid-cols-3 gap-2">
              {existingIncidentPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img
                    src={getFileUrl(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => openPhotoViewer(photo)}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => openPhotoViewer(photo)}>
                    <Eye size={20} className="text-white" />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeExistingIncidentPhoto(photo);
                    }}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Photos */}
        {incidentPhotos.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 mb-1">Novas fotos:</p>
            <div className="grid grid-cols-3 gap-2">
              {incidentPhotos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeIncidentPhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors shadow-lg z-10"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-semibold cursor-pointer hover:border-orange-300 hover:text-orange-600 transition-colors">
          <Camera size={16} />
          {existingIncidentPhotos.length > 0 || incidentPhotos.length > 0 ? "Adicionar mais fotos" : "Adicionar Fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setIncidentPhotos(prev => [...prev, ...Array.from(e.target.files)])}
            className="hidden"
          />
        </label>
      </div>

      {/* Documents */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Documentos</label>
        
        {/* Existing Documents - only for edit mode */}
        {existingIncidentDocuments.length > 0 && (
          <div className="space-y-2 mb-2">
            <p className="text-[10px] text-slate-400 mb-1">Documentos existentes:</p>
            {existingIncidentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <File size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{doc}</p>
                </div>
                <a
                  href={getFileUrl(doc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 p-1"
                >
                  <Eye size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => removeExistingIncidentDocument(doc)}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Documents */}
        {incidentDocuments.length > 0 && (
          <div className="space-y-2 mb-2">
            <p className="text-[10px] text-slate-400 mb-1">Novos documentos:</p>
            {incidentDocuments.map((doc, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <File size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{doc.name}</p>
                  <p className="text-[10px] text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeIncidentDocument(index)}
                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-semibold cursor-pointer hover:border-orange-300 hover:text-orange-600 transition-colors">
          <Upload size={16} />
          {existingIncidentDocuments.length > 0 || incidentDocuments.length > 0 ? "Adicionar mais documentos" : "Adicionar Documentos"}
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => setIncidentDocuments(prev => [...prev, ...Array.from(e.target.files)])}
            className="hidden"
          />
        </label>
      </div>
    </>
  );

  // Import icons needed for incident form
  const Camera = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
  const Upload = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
  const File = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;

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
            {showIncidentsTab && (
              <button
                onClick={() => setActiveTab("incidents")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  activeTab === "incidents" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <AlertCircle size={12} /> Incidentes
                {incidentsCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === "incidents" ? "bg-white text-slate-800" : "bg-red-100 text-red-700"}`}>
                    {incidentsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "details" && renderDetailsTab()}
          
          {activeTab === "actions" && isAdmin && renderAdminActionsTab()}
          {activeTab === "actions" && isDriver && renderDriverActionsTab()}
          
          {activeTab === "incidents" && (
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <p className="text-sm font-bold text-slate-700">Incidentes do Pedido</p>
                 {(isAdmin || isDriver) && (
                   <button onClick={() => setShowIncidentModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
                     <AlertCircle size={14} /> Reportar
                   </button>
                 )}
               </div>
              
              {loadingIncidents ? (
                <div className="text-center py-6">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-xs text-slate-500">A carregar...</p>
                </div>
              ) : incidents.length === 0 ? (
                <div className="text-center py-6">
                  <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Nenhum incidente registado</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {incidents.map(inc => (
                    <div key={inc.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inc.type === 'accident' ? 'bg-red-100 text-red-700' : inc.type === 'breakdown' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {INCIDENT_TYPE_LABELS[inc.type] || inc.type}
                        </span>
                        <span className="text-xs text-slate-400">{inc.date} {inc.time}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{inc.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-2">{inc.description}</p>
                      {inc.photos && inc.photos.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          <Eye size={12} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400">{inc.photos.length} foto(s)</span>
                        </div>
                      )}
                      {(isAdmin || isDriver) && (
                         <div className="flex gap-3 mt-2">
                           <button
                             onClick={() => handleEditIncident(inc)}
                             className="text-xs text-blue-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                           >
                             <Edit2 size={12} /> Editar
                           </button>
                           <button
                             onClick={() => {
                               setSelectedIncident(inc);
                               setShowDeleteIncidentModal(true);
                             }}
                             className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors flex items-center gap-1"
                           >
                             <XCircle size={12} /> Remover
                           </button>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {/* Delete Feedback Confirmation Dialog */}
      {showDeleteFeedbackDialog && feedbackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Eliminar Avaliação</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja eliminar esta avaliação? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteFeedbackDialog(false); setFeedbackToDelete(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleDeleteFeedback} disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? "A eliminar..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Incident Modal */}
      {showIncidentModal && (
        <Modal isOpen={showIncidentModal} onClose={() => { 
          setShowIncidentModal(false); 
          setIncidentForm({ type: "breakdown", title: "", description: "" }); 
          setIncidentPhotos([]);
          setIncidentDocuments([]);
          setExistingIncidentPhotos([]);
          setExistingIncidentDocuments([]);
        }} title="Reportar Incidente">
          <form onSubmit={handleSubmitIncident} className="space-y-4">
            {renderIncidentFormFields()}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { 
                setShowIncidentModal(false); 
                setIncidentForm({ type: "breakdown", title: "", description: "" });
                setIncidentPhotos([]);
                setIncidentDocuments([]);
              }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={submittingIncident} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submittingIncident ? "A enviar..." : "Reportar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Incident Modal */}
      {showEditIncidentModal && selectedIncident && (
        <Modal isOpen={showEditIncidentModal} onClose={() => { 
          setShowEditIncidentModal(false); 
          setSelectedIncident(null);
          setIncidentPhotos([]);
          setIncidentDocuments([]);
          setExistingIncidentPhotos([]);
          setExistingIncidentDocuments([]);
          setIncidentForm({ type: "breakdown", title: "", description: "" });
        }} title="Editar Incidente">
          <form onSubmit={handleUpdateIncident} className="space-y-4">
            {renderIncidentFormFields()}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { 
                setShowEditIncidentModal(false); 
                setSelectedIncident(null);
                setIncidentPhotos([]);
                setIncidentDocuments([]);
                setExistingIncidentPhotos([]);
                setExistingIncidentDocuments([]);
                setIncidentForm({ type: "breakdown", title: "", description: "" });
              }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={submittingIncident} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {submittingIncident ? "A atualizar..." : "Atualizar"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Incident Confirmation Modal */}
      {showDeleteIncidentModal && selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Incidente</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover este incidente? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteIncidentModal(false); setSelectedIncident(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleDeleteIncident} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
                Remover
              </button>
            </div>
          </div>
        </div>
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
          orderId={localOrder.id}
          isSubmitting={isSubmitting}
          role={role}
          defaultPaymentType={defaultPaymentData.paymentType}
          defaultPaymentMethod={defaultPaymentData.paymentMethodId}
          existingPaymentMethod={existingPaymentMethod}
          settings={platformSettings}
          onPaymentSuccess={(paymentData) => {
            // Payment was successfully recorded in backend
            console.log("Payment successful:", paymentData);
          }}
        />
      )}

      {/* Reassign Order Modal */}
      {showReassignDialog && localOrder && (
        <ReassignOrderModal
          isOpen={showReassignDialog}
          onClose={() => {
            setShowReassignDialog(false);
            setPendingRejection(null);
          }}
          order={localOrder}
          onReassigned={handleReassignComplete}
          role={role}
        />
      )}

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPhotoViewer(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
            <img
              src={getFileUrl(selectedPhoto)}
              alt="Visualização"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModal;