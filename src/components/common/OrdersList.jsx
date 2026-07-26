// src/components/common/OrdersList.jsx
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { MoreHorizontal } from "lucide-react";
import Icon from "./Icon";
import { getOrders, getCustomerOrders, getDriverOrders, getOrder, updateOrder, cancelOrder, deleteOrder, createIncident, getOrderIncidents, updateIncidentWithFiles, deleteIncident } from "../../api/client";
import { toast } from "../../lib/toast";
import TrackOrderModal from "../cliente/modals/TrackOrderModal";
import CreateOrderModal from "../cliente/modals/CreateOrderModal";
import CancelOrderDialog from "./CancelOrderDialog";
import ContactSupportModal from "./modals/ContactSupportModal";
import Modal from "./Modal";
import { useAuth } from "../../contexts/AuthContext";
import AdminClientSelectModal from "../admin/AdminClientSelectModal";
import NavigationModal from "../motorista/modals/NavigationModal";
import OrderDetailModal from "../modals/OrderDetailModal";
import { API_URL } from "../../api/client";

const STATUS_LABELS = {
  pending_approval: "Pendente",
  approved: "Aprovado",
  assigned: "Atribuído",
  in_transit: "Em entrega",
  completed: "Concluído",
  cancelled: "Cancelado",
  scheduled: "Agendado"
};

const STATUS_BADGE = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Concluído": "bg-green-100 text-green-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Aprovado": "bg-teal-100 text-teal-700",
  "Agendado": "bg-purple-100 text-purple-700",
  "Atribuído": "bg-indigo-100 text-indigo-700",
  "Pendente": "bg-amber-100 text-amber-700"
};

const INCIDENT_TYPE_LABELS = {
  "accident": "Acidente",
  "breakdown": "Avaria",
  "delivery_issue": "Problema Entrega"
};

const toShortId = (id) => {
  if (!id) return "---";
  const hex = id.replace(/-/g, "").toUpperCase();
  return `#${hex.slice(-6)}`;
};

const OrdersList = ({
  refreshKey,
  onOrderUpdate,
  statusFilter,
  showHeader = true,
  title = "Pedidos",
  showNewOrderButton = true,
  onNewOrderClick,
  initialOrderId,
  onGiveFeedback
}) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("Todos");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
   const [showEditOrder, setShowEditOrder] = useState(false);
   const [repeatOrderData, setRepeatOrderData] = useState(null);
  const [showClientSelect, setShowClientSelect] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showIncidentList, setShowIncidentList] = useState(false);
  const [showEditIncidentModal, setShowEditIncidentModal] = useState(false);
  const [showDeleteIncidentModal, setShowDeleteIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [incidentForm, setIncidentForm] = useState({ type: "breakdown", title: "", description: "" });
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const [orderIncidents, setOrderIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClientForEdit, setSelectedClientForEdit] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [incidentPhotos, setIncidentPhotos] = useState([]);
  const [incidentDocuments, setIncidentDocuments] = useState([]);
  const [existingIncidentPhotos, setExistingIncidentPhotos] = useState([]);
  const [existingIncidentDocuments, setExistingIncidentDocuments] = useState([]);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const sentinelRef = useRef(null);
  const initialProcessed = useRef(false);
  const orderRefs = useRef({});
  const menuRef = useRef(null);

  const role = user?.role;
  const isAdmin = role === "admin" || role === "superadmin";
  const isManager = role === "manager";
  const isDriver = role === "driver";
  const isCustomer = role === "customer";
  const isStaff = isAdmin || isManager;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      let clickedOutside = true;
      Object.values(orderRefs.current).forEach(ref => {
        if (ref && ref.contains(e.target)) {
          clickedOutside = false;
        }
      });
      if (clickedOutside && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatScheduledTime = (scheduledTime) => {
    if (!scheduledTime) return null;
    try {
      const date = new Date(scheduledTime);
      return date.toLocaleString("pt-MZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return scheduledTime;
    }
  };

  const getUrgencyBadge = (urgencyLevel) => {
    switch(urgencyLevel) {
      case 'very_urgent':
        return 'bg-red-100 text-red-700';
      case 'urgent':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyLabel = (urgencyLevel) => {
    switch(urgencyLevel) {
      case 'very_urgent':
        return 'Muito Urgente';
      case 'urgent':
        return 'Urgente';
      default:
        return 'Normal';
    }
  };

  const urgentOrdersCount = orders.filter(
    (o) => o.urgencyLevel === "urgent" || o.urgencyLevel === "very_urgent"
  ).length;

  const filterMap = useMemo(() => ({
    "Todos": null,
    "Em andamento": "in_transit,assigned,scheduled",
    "Aguardando": "pending_approval,approved",
    "Concluídos": "completed",
    "Cancelados": "cancelled"
  }), []);

  const baseFilters = useMemo(() => ["Todos", "Em andamento", "Aguardando", "Concluídos", "Cancelados"], []);

  const getFilterStatus = useCallback((label) => {
    return filterMap[label] || null;
  }, [filterMap]);

  const setFilter = (label) => {
    setFilterState(label);
    setPage(1);
    setHasMore(true);
    setOrders([]);
  };

  const backendToFrontend = (status) => STATUS_LABELS[status] || status || "Pendente";

  const getStatusBadge = (order) => {
    const displayStatus = backendToFrontend(order.status);
    return STATUS_BADGE[displayStatus] || "bg-slate-100 text-slate-700";
  };

  const getFileUrl = (filename) => {
    return `${API_URL}/uploads/incidents/${filename}`.replace(`/api/`,'/');
  };

  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      let statusParam = getFilterStatus(filter);
      if (statusFilter === "in_transit") {
        statusParam = "in_transit";
      }
      const params = { page: pageNum, limit: 20 };
      if (statusParam) {
        params.status = statusParam;
      }

      let response;
      if (isCustomer) {
        response = await getCustomerOrders(params);
      } else if (isDriver) {
        response = await getDriverOrders(params);
      } else {
        response = await getOrders(params);
      }

      const newOrders = response.data?.orders || response.data || [];
      if (append) {
        setOrders(prev => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      setHasMore(response.data?.pagination?.currentPage < response.data?.pagination?.pages);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao carregar pedidos";
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, statusFilter, isCustomer, isDriver, getFilterStatus]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setOrders([]);
    fetchOrders(1, false);
  }, [user, filter, statusFilter, fetchOrders]);

  useEffect(() => {
    if (refreshKey) {
      setPage(1);
      setHasMore(true);
      setOrders([]);
      fetchOrders(1, false);
    }
  }, [refreshKey, fetchOrders]);

  useEffect(() => {
    if (initialOrderId && orders.length > 0 && !initialProcessed.current && !loading) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        setSelectedOrder(order);
        setShowOrderDetails(true);
        initialProcessed.current = true;
      }
    }
  }, [initialOrderId, orders, loading]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  }, [hasMore, loadingMore, loading, page, fetchOrders]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, fetchNextPage]);

  const handleViewDetails = async (order) => {
    try {
      const response = await getOrder(order.id);
      setSelectedOrder(response.data);
      setShowOrderDetails(true);
    } catch (err) {
      console.error(err);
      setSelectedOrder(order);
      setShowOrderDetails(true);
    }
    setMenuOpenId(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      const response = await updateOrder(selectedOrder.id, payload);
      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (onOrderUpdate) onOrderUpdate(updatedOrder);
      toast.success("Pedido atualizado com sucesso");
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao atualizar pedido";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (cancelData) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const response = await cancelOrder(selectedOrder.id, cancelData);
      const updatedOrder = response.data;
      setSelectedOrder(updatedOrder);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      if (onOrderUpdate) onOrderUpdate(updatedOrder);
      toast.success("Pedido cancelado com sucesso");
      setShowCancelDialog(false);
      setShowOrderDetails(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao cancelar pedido";
      toast.error(msg);
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id);
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      toast.success("Pedido removido com sucesso");
      setShowDeleteDialog(false);
      setShowOrderDetails(false);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao remover pedido";
      toast.error(msg);
    }
  };

  const handleGiveFeedback = (order,feedback=null) => {
    if (onGiveFeedback) {
      onGiveFeedback(order,feedback);
    }
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

   const handleRepeatOrder = (order) => {
     setRepeatOrderData(order);
     setShowEditOrder(true);
     setShowOrderDetails(false);
     setMenuOpenId(null);
   };

   const handleEditOrder = (order) => {
     setRepeatOrderData(null);
     setSelectedOrder(order);
     setShowEditOrder(true);
     setMenuOpenId(null);
   };

  const handleTrackOrder = () => {
    setShowTrackOrder(true);
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleNavigateOrder = (order) => {
    setSelectedOrder(order);
    setShowNavigation(true);
    setShowOrderDetails(false);
    setMenuOpenId(null);
  };

  const handleCancelClick = (order) => {
    setSelectedOrder(order);
    setShowCancelDialog(true);
    setMenuOpenId(null);
  };

  const handleContactClick = (order) => {
    setSelectedOrder(order);
    setShowContactModal(true);
    setMenuOpenId(null);
  };

  const handleReportIncident = async (order) => {
    setSelectedOrder(order);
    setLoadingIncidents(true);
    setShowIncidentList(true);
    try {
      const res = await getOrderIncidents(order.id);
      setOrderIncidents(res.data);
    } catch (error) {
      toast.error("Erro ao carregar incidentes");
      setOrderIncidents([]);
    } finally {
      setLoadingIncidents(false);
    }
    setMenuOpenId(null);
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!incidentForm.title || !incidentForm.description || !selectedOrder) return;
    setSubmittingIncident(true);
    try {
      const formData = new FormData();
      formData.append("type", incidentForm.type);
      formData.append("title", incidentForm.title);
      formData.append("description", incidentForm.description);
      formData.append("status", "pending");
      formData.append("orderId", selectedOrder.id);
      formData.append("driverId", selectedOrder.driverId || selectedOrder.driver?.id || "");
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
      
      // Refresh incidents list
      const res = await getOrderIncidents(selectedOrder.id);
      setOrderIncidents(res.data);
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
    setShowIncidentList(false);
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
      if (selectedOrder) {
        formData.append("orderId", selectedOrder.id);
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
      
      // Refresh incidents list
      if (selectedOrder) {
        const res = await getOrderIncidents(selectedOrder.id);
        setOrderIncidents(res.data);
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
      
      // Refresh incidents list
      if (selectedOrder) {
        const res = await getOrderIncidents(selectedOrder.id);
        setOrderIncidents(res.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover incidente");
    }
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
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

  const visibleOrders = orders;
  const isTrackingView = statusFilter === "in_transit";

  // Render the appropriate detail modal based on user role
  const renderDetailModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    if (isStaff) {
      return (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={(refresh) => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
            if(refresh==true){
              fetchOrders(1, false)
            }
          }}
          order={selectedOrder}
          onUpdate={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setSelectedOrder(updatedOrder);
          }}
          role="manager"
        />
      );
    } else if (isDriver) {
      return (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={() => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onUpdate={(updatedOrder) => {
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            if (onOrderUpdate) onOrderUpdate(updatedOrder);
            setSelectedOrder(updatedOrder);
          }}
          onStatusChange={handleUpdateStatus}
          updating={updating}
          role="driver"
        />
      );
    } else if (isCustomer) {
      return (
        <OrderDetailModal
          isOpen={showOrderDetails}
          onClose={(refresh) => {
            setShowOrderDetails(false);
            setSelectedOrder(null);
            if(refresh==true){
                fetchOrders(1, false)
            }
          }}
          order={selectedOrder}
          orderId={selectedOrder.id}
          onGiveFeedback={() => handleGiveFeedback(selectedOrder, selectedOrder.feedbacks[0] || null)}
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">{title}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(1, false)}
              disabled={loading}
              className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
            >
              <Icon name="refreshCw" size={14} className={loading ? "animate-spin" : ""} />
            </button>
            {showNewOrderButton && (isStaff || isCustomer) && (
              <button
                onClick={onNewOrderClick}
                className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300"
              >
                <Icon name="plus" size={14} /> Novo Pedido
              </button>
            )}
          </div>
        </div>
      )}

      {!isTrackingView && (isStaff || isCustomer || isDriver) && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {baseFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {urgentOrdersCount > 0 && !isTrackingView && (
        <div className="bg-red-50 rounded-xl p-3 border border-red-200 flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Icon name="alertTriangle" size={16} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-red-800">
              {urgentOrdersCount} {urgentOrdersCount === 1 ? "pedido urgente" : "pedidos urgentes"}
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Atenção: estes pedidos requerem prioridade elevada. Por favor, trate-os com urgência.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar pedidos...</p>
        </div>
      ) : visibleOrders.length > 0 ? (
        <>
          <div className="space-y-3">
            {visibleOrders.map((order) => {
              const displayStatus = backendToFrontend(order.status);
              const isDelivery = order.serviceType !== "taxi";
              const statusBadge = getStatusBadge(order);
              const isPending = displayStatus === "Pendente";
              const canEdit = (isStaff || (isCustomer && isPending)) && displayStatus !== "Concluído" && displayStatus !== "Cancelado" && displayStatus !== "Em entrega";
              const canCancel = displayStatus !== "Concluído" && displayStatus !== "Cancelado";
              const canTrack = displayStatus === "Em entrega";
              const canGiveFeedback = displayStatus === "Concluído" && isCustomer && !(order.feedbacks && order.feedbacks.length > 0);
              const canRepeat = displayStatus === "Concluído" && isCustomer;
              const canDelete = isStaff;
              const isMenuOpen = menuOpenId === order.id;

               // Determine which buttons to show as primary (always visible)
               const primaryButtons = [];
               if (canTrack && isDriver) {
                 primaryButtons.push({ action: "navigate", label: "Navegar", color: "bg-green-100 text-green-600 hover:bg-green-200" });
               } else if (canTrack) {
                 primaryButtons.push({ action: "track", label: "Acompanhar", color: "bg-blue-100 text-blue-600 hover:bg-blue-200" });
               }
               if (canGiveFeedback) primaryButtons.push({ action: "feedback", label: "Avaliar", color: "bg-amber-100 text-amber-600 hover:bg-amber-200" });
               if (canRepeat) primaryButtons.push({ action: "repeat", label: "Repetir", color: "bg-orange-50 text-orange-600 hover:bg-orange-100" });
              
              // Limit to 2 primary buttons
              const visibleButtons = primaryButtons.slice(0, 2);
              const hasMoreButtons = primaryButtons.length > 2 || canCancel || canEdit || canDelete;

              return (
                <div 
                  key={order.id} 
                  ref={el => orderRefs.current[order.id] = el}
                  className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
                >

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-800">{toShortId(order.id)}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>
                    {displayStatus}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      <Icon name={isDelivery ? "package" : "car"} size={10} />
                      {isDelivery ? "Entrega" : "Táxi"}
                    </span>
                  </span>
                  
                  {/* Urgency Badge - show for all orders */}
                  {order.urgencyLevel && order.urgencyLevel !== 'normal' && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${getUrgencyBadge(order.urgencyLevel)}`}>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="alertCircle" size={10} />
                        {getUrgencyLabel(order.urgencyLevel)}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-orange-500">{order.total} MZN</span>
              </div>

              <p className="text-sm font-medium text-slate-700">
                {order.client?.name || order.client || "Cliente"}
              </p>

              {order.productName && (
                <p className="text-xs text-slate-500">
                  <Icon name="package" size={10} className="inline mr-1" />
                  {order.productName}
                </p>
              )}

              <p className="text-xs text-slate-500">
                {isDelivery
                  ? `${order.origin || ""} → ${order.dest || ""}`
                  : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`}
              </p>

              {/* Scheduled Date & Time - show only for scheduled orders */}
              {order.status === 'scheduled' && order.scheduledTime && (
                <p className="text-xs text-purple-600 font-medium mt-1">
                  <Icon name="calendar" size={10} className="inline mr-1" />
                  Agendado para: {formatScheduledTime(order.scheduledTime)}
                </p>
              )}

              {/* Urgency level text for normal urgency (to keep consistency) */}
              {order.urgencyLevel && order.urgencyLevel !== 'normal' && order.status !== 'scheduled' && (
                <p className="text-xs text-orange-600 mt-0.5">
                  <Icon name="alertCircle" size={10} className="inline mr-1" />
                  Nível: {getUrgencyLabel(order.urgencyLevel)}
                </p>
              )}

              {order.driver && (
                <p className="text-xs text-slate-500 mt-0.5">
                  <Icon name="users" size={10} className="inline mr-1" />
                  {typeof order.driver === "string" ? order.driver : order.driver?.name || "Motorista atribuído"}
                </p>
              )}

              <p className="text-xs text-slate-400">
                {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
              </p>

              {order.feedbacks && order.feedbacks.length > 0 && (
                <p className="text-xs text-amber-600 mt-0.5 font-semibold">
                  ⭐ {order.feedbacks[0].rating}/5
                </p>
              )}

                  <div className="flex gap-2 mt-3">

                     {/* Contact button - always visible */}
                    <button
                      onClick={() => handleContactClick(order)}
                      className="flex items-center justify-center p-2 bg-green-100 text-green-600 font-semibold rounded-lg hover:bg-green-200"
                      title="Contactos"
                    >
                      <Icon name="phone" size={16} />
                    </button>

                    {/* Report Incident button - for drivers */}
                    {isDriver && (
                      <button
                        onClick={() => handleReportIncident(order)}
                        className="flex items-center justify-center p-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200"
                        title="Incidentes"
                      >
                        <Icon name="alertTriangle" size={16} />
                      </button>
                    )}


                    {/* Details button - always visible */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700"
                    >
                      Detalhes
                    </button>

                   
                    {/* Primary action buttons (max 2) */}
                    {visibleButtons.map((btn) => (
                      <button
                        key={btn.action}
                        onClick={() => {
                          if (btn.action === "navigate") {
                            handleNavigateOrder(order);
                          } else if (btn.action === "track") {
                            setSelectedOrder(order);
                            handleTrackOrder();
                          } else if (btn.action === "feedback") {
                            handleGiveFeedback(order);
                           } else if (btn.action === "repeat") {
                             setSelectedOrder(order);
                             handleRepeatOrder(order);
                           }
                        }}
                        className={`flex-1 text-xs font-semibold py-2 rounded-lg ${btn.color}`}
                      >
                        {btn.label}
                      </button>
                    ))}

                    {/* 3-dots menu for additional actions */}
                    {(hasMoreButtons || canCancel || canEdit || canDelete) && (
                      <div className="relative">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMenuOpenId(isMenuOpen ? null : order.id);
                          }}
                          className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        {isMenuOpen && (
                          <div 
                            ref={menuRef}
                            className="absolute bottom-full right-0 mb-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]"
                          >
                            {/* Additional primary buttons that didn't fit */}
                            {primaryButtons.slice(2).map((btn) => (
                              <button
                                key={btn.action}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (btn.action === "navigate") {
                                    handleNavigateOrder(order);
                                  } else if (btn.action === "track") {
                                    setSelectedOrder(order);
                                    handleTrackOrder();
                                  } else if (btn.action === "feedback") {
                                    handleGiveFeedback(order);
                                   } else if (btn.action === "repeat") {
                                     setSelectedOrder(order);
                                     handleRepeatOrder(order);
                                   }
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <Icon name={btn.action === "navigate" || btn.action === "track" ? "map" : btn.action === "feedback" ? "star" : "repeat"} size={12} />
                                {btn.label}
                              </button>
                            ))}
                            
                            {canEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOrder(order);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-green-600 hover:bg-green-50 flex items-center gap-2"
                              >
                                <Icon name="edit" size={12} />
                                Editar
                              </button>
                            )}
                            
                            {canCancel && (isStaff || isCustomer || isDriver) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelClick(order);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Icon name="xCircle" size={12} />
                                Cancelar
                              </button>
                            )}
                            
                            {canDelete && isStaff && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setShowDeleteDialog(true);
                                  setMenuOpenId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Icon name="trash" size={12} />
                                Remover
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {loadingMore && (
            <div className="text-center py-4">
              <Icon name="refreshCw" size={20} className="text-slate-400 mx-auto animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </>
      ) : (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          {isTrackingView ? (
            <>
              <p className="text-sm font-semibold text-slate-700 mb-1">Nenhum pedido em trânsito</p>
              <p className="text-xs text-slate-400 mb-4">Você ainda não tem pedidos em andamento</p>
              {showNewOrderButton && (isStaff || isCustomer) && (
                <button
                  onClick={onNewOrderClick}
                  className="inline-flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-orange-300"
                >
                  <Icon name="plus" size={14} /> Fazer um pedido
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
          )}
        </div>
      )}

      {/* Render the appropriate detail modal based on role */}
      {renderDetailModal()}

      {/* Track Order Modal */}
      {showTrackOrder && selectedOrder && (
        <TrackOrderModal
          isOpen={showTrackOrder}
          onClose={() => {
            setShowTrackOrder(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      {/* Cancel Order Dialog */}
      {showCancelDialog && selectedOrder && (
        <CancelOrderDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleCancelOrder}
          role={role}
          orderStatus={selectedOrder?.status}
        />
      )}

      {/* Delete Order Dialog */}
      {showDeleteDialog && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Pedido</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover <strong>{toShortId(selectedOrder.id)}</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteDialog(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={handleDeleteOrder} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Edit/Repeat Order Modal */}
       {showEditOrder && selectedOrder && (
         <CreateOrderModal
           isOpen={showEditOrder}
           onClose={() => {
             setShowEditOrder(false);
             setSelectedOrder(null);
             setSelectedClientForEdit(null);
             setRepeatOrderData(null);
           }}
           repeatOrder={repeatOrderData}
           editOrder={!repeatOrderData ? selectedOrder : undefined}
           serviceType={selectedOrder.serviceType || "delivery"}
           clientId={selectedClientForEdit?.userId || selectedClientForEdit?.id || selectedOrder.clientId}
           selectedClient={selectedClientForEdit || (selectedOrder.client && {
             id: selectedOrder.clientId,
             userId: selectedOrder.clientId,
             name: typeof selectedOrder.client === 'string' ? selectedOrder.client : selectedOrder.client?.name,
             phone: selectedOrder.client?.phone
           })}
           onClientSelectClick={() => {
             setShowEditOrder(false);
             setShowClientSelect(true);
           }}
            onOrderCreated={(newOrder) => {
              setOrders(prev => [newOrder, ...prev]);
              if (onOrderUpdate) onOrderUpdate(newOrder);
            }}
           onOrderUpdated={(updatedOrder) => {
             setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
             if (onOrderUpdate) onOrderUpdate(updatedOrder);
             setShowEditOrder(false);
             setSelectedOrder(null);
             setRepeatOrderData(null);
           }}
         />
       )}

      {/* Client Select Modal for Admin/Manager editing */}
      {showClientSelect && (
        <AdminClientSelectModal
          isOpen={showClientSelect}
          onClose={() => setShowClientSelect(false)}
          onSelect={(client) => {
            setSelectedClientForEdit(client);
            setShowClientSelect(false);
            setShowEditOrder(true);
          }}
          selectedClient={selectedClientForEdit}
        />
      )}

      {/* Navigation Modal for Driver */}
      {showNavigation && selectedOrder && (
        <NavigationModal
          isOpen={showNavigation}
          onClose={() => {
            setShowNavigation(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      {/* Contact Support Modal */}
      {showContactModal && selectedOrder && (
        <ContactSupportModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
        />
      )}

      {/* Incident List Modal for Driver */}
      {showIncidentList && (
        <Modal isOpen={showIncidentList} onClose={() => { setShowIncidentList(false); setSelectedOrder(null); setOrderIncidents([]); }} title="Incidentes do Pedido">
          <div className="space-y-4">
            {loadingIncidents ? (
              <div className="text-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">A carregar...</p>
              </div>
            ) : orderIncidents.length === 0 ? (
              <div className="text-center py-6">
                <Icon name="alertTriangle" size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum incidente registado para este pedido</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {orderIncidents.map(inc => (
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
                        <Icon name="image" size={12} className="text-slate-400" />
                        <span className="text-[10px] text-slate-400">{inc.photos.length} foto(s)</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditIncident(inc)}
                        className="text-xs text-blue-500 font-medium hover:text-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setShowDeleteIncidentModal(true);
                        }}
                        className="text-xs text-red-500 font-medium hover:text-red-600"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setShowIncidentList(false); setShowIncidentModal(true); }} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 flex items-center justify-center gap-2">
                <Icon name="plus" size={14} /> Novo Incidente
              </button>
              <button type="button" onClick={() => { setShowIncidentList(false); setSelectedOrder(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Report Incident Modal for Driver */}
      {showIncidentModal && (
        <Modal isOpen={showIncidentModal} onClose={() => { setShowIncidentModal(false); setSelectedOrder(null); setIncidentPhotos([]); setIncidentDocuments([]); setIncidentForm({ type: "breakdown", title: "", description: "" }); }} title="Reportar Incidente">
          <form onSubmit={handleSubmitIncident} className="space-y-4">
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
              <div className="grid grid-cols-3 gap-2 mb-2">
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
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-semibold cursor-pointer hover:border-orange-300 hover:text-orange-600 transition-colors">
                <Icon name="camera" size={16} />
                Adicionar Fotos
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
              <div className="space-y-2 mb-2">
                {incidentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <Icon name="file" size={18} className="text-red-500" />
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
              <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-semibold cursor-pointer hover:border-orange-300 hover:text-orange-600 transition-colors">
                <Icon name="upload" size={16} />
                Adicionar Documentos
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => setIncidentDocuments(prev => [...prev, ...Array.from(e.target.files)])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setShowIncidentModal(false); setSelectedOrder(null); setIncidentPhotos([]); setIncidentDocuments([]); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
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
        <Modal isOpen={showEditIncidentModal} onClose={() => { setShowEditIncidentModal(false); setSelectedIncident(null); setIncidentPhotos([]); setIncidentDocuments([]); setExistingIncidentPhotos([]); setExistingIncidentDocuments([]); }} title="Editar Incidente">
          <form onSubmit={handleUpdateIncident} className="space-y-4">
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
              
              {/* Existing Photos */}
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
                          <Icon name="eye" size={20} className="text-white" />
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
                <Icon name="camera" size={16} />
                Adicionar Fotos
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
              
              {/* Existing Documents */}
              {existingIncidentDocuments.length > 0 && (
                <div className="space-y-2 mb-2">
                  <p className="text-[10px] text-slate-400 mb-1">Documentos existentes:</p>
                  {existingIncidentDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                        <Icon name="file" size={18} className="text-red-500" />
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
                        <Icon name="eye" size={16} />
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
                        <Icon name="file" size={18} className="text-red-500" />
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
                <Icon name="upload" size={16} />
                Adicionar Documentos
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => setIncidentDocuments(prev => [...prev, ...Array.from(e.target.files)])}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => { setShowEditIncidentModal(false); setSelectedIncident(null); setIncidentPhotos([]); setIncidentDocuments([]); setExistingIncidentPhotos([]); setExistingIncidentDocuments([]); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
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
                <Icon name="alertTriangle" size={24} className="text-red-600" />
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
              <Icon name="x" size={24} />
            </button>
            <img
              src={getFileUrl(selectedPhoto)}
              alt="Visualização"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;