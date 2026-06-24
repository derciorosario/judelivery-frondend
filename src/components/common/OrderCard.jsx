import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from "lucide-react";
import Icon from './Icon';
import { PRODUCTS } from '../../data/mockData';

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

const toShortId = (id) => {
  if (!id) return "---";
  const hex = id.replace(/-/g, "").toUpperCase();
  return `#${hex.slice(-6)}`;
};

const OrderCard = ({
  order,
  showAssign,
  onAssign,
  role = "customer",
  onViewDetails,
  onTrack,
  onNavigate,
  onGiveFeedback,
  onRepeat,
  onEdit,
  onCancel,
  onDelete,
  onContact,
  onReportIncident,
  onOrderUpdate
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = role === "admin" || role === "superadmin";
  const isManager = role === "manager";
  const isDriver = role === "driver";
  const isCustomer = role === "customer";
  const isStaff = isAdmin || isManager;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const backendToFrontend = (status) => STATUS_LABELS[status] || status || "Pendente";
  const displayStatus = backendToFrontend(order.status);
  const statusBadge = STATUS_BADGE[displayStatus] || "bg-slate-100 text-slate-700";

  const isDelivery = order.serviceType !== "taxi";
  const isPending = displayStatus === "Pendente";
  const canEdit = (isStaff || (isCustomer && isPending)) && displayStatus !== "Concluído" && displayStatus !== "Cancelado" && displayStatus !== "Em entrega";
  const canCancel = displayStatus !== "Concluído" && displayStatus !== "Cancelado";
  const canTrack = displayStatus === "Em entrega";
  const canGiveFeedback = displayStatus === "Concluído" && isCustomer && !(order.feedbacks && order.feedbacks.length > 0);
  const canRepeat = displayStatus === "Concluído" && isCustomer;
  const canDelete = isStaff;

  // Get product name from productId
  const product = PRODUCTS.find(p => p.id.toString() === order.productId);
  const productName = product ? product.name : order.productName || "Produto não especificado";
  const clientName = order.client?.name || order.client || "Cliente";

  // Get driver name from drivers array or use the driver field directly
  const driverName = order.driver ? (order.driver?.name || order.driver) : "Não atribuído";

  // Calculate time estimate based on distance (3 minutes per km)
  const timeEstimate = order.dist ? Math.round(parseFloat(order.dist) * 3) + " min" : "15 min";

  // Determine which buttons to show as primary (always visible)
  const primaryButtons = [];
  if (canTrack && isDriver) {
    primaryButtons.push({ action: "navigate", label: "Navegar", color: "bg-green-100 text-green-600 hover:bg-green-200", icon: "navigation" });
  } else if (canTrack) {
    primaryButtons.push({ action: "track", label: "Acompanhar", color: "bg-blue-100 text-blue-600 hover:bg-blue-200", icon: "map" });
  }
  if (canGiveFeedback) primaryButtons.push({ action: "feedback", label: "Avaliar", color: "bg-amber-100 text-amber-600 hover:bg-amber-200", icon: "star" });
  if (canRepeat) primaryButtons.push({ action: "repeat", label: "Repetir", color: "bg-orange-50 text-orange-600 hover:bg-orange-100", icon: "repeat" });

  // Limit to 2 primary buttons
  const visibleButtons = primaryButtons.slice(0, 2);
  const hasMoreButtons = primaryButtons.length > 2 || canCancel || canEdit || canDelete;

  const handleButtonClick = (action, order) => {
    setMenuOpen(false);
    switch (action) {
      case "navigate":
        onNavigate && onNavigate(order);
        break;
      case "track":
        onTrack && onTrack(order);
        break;
      case "feedback":
        onGiveFeedback && onGiveFeedback(order);
        break;
      case "repeat":
        onRepeat && onRepeat(order);
        break;
      case "edit":
        onEdit && onEdit(order);
        break;
      case "cancel":
        onCancel && onCancel(order);
        break;
      case "delete":
        onDelete && onDelete(order);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
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
        </div>
        <span className="text-sm font-bold text-orange-500">{order.total} MZN</span>
      </div>

      <p className="text-sm font-medium text-slate-700">{clientName}</p>

      {order.productName && (
        <p className="text-xs text-slate-500">
          <Icon name="package" size={10} className="inline mr-1" />
          {productName}
        </p>
      )}

      <p className="text-xs text-slate-500">
        {isDelivery
          ? `${order.origin || ""} → ${order.dest || ""}`
          : `${order.pickupLocation || ""} → ${order.dropoffLocation || ""}`}
      </p>

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
          onClick={() => onContact && onContact(order)}
          className="flex items-center justify-center p-2 bg-green-100 text-green-600 font-semibold rounded-lg hover:bg-green-200"
          title="Contactos"
        >
          <Icon name="phone" size={16} />
        </button>

        {/* Report Incident button - for drivers */}
        {isDriver && (
          <button
            onClick={() => onReportIncident && onReportIncident(order)}
            className="flex items-center justify-center p-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200"
            title="Incidentes"
          >
            <Icon name="alertTriangle" size={16} />
          </button>
        )}

        {/* Details button - always visible */}
        <button
          onClick={() => onViewDetails && onViewDetails(order)}
          className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700"
        >
          Detalhes
        </button>

        {/* Primary action buttons (max 2) */}
        {visibleButtons.map((btn) => (
          <button
            key={btn.action}
            onClick={() => handleButtonClick(btn.action, order)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg ${btn.color}`}
          >
            {btn.label}
          </button>
        ))}

        {/* 3-dots menu for additional actions */}
        {(hasMoreButtons || canCancel || canEdit || canDelete) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <MoreHorizontal size={16} />
            </button>

            {menuOpen && (
              <div
                className="absolute bottom-full right-0 mb-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]"
              >
                {/* Additional primary buttons that didn't fit */}
                {primaryButtons.slice(2).map((btn) => (
                  <button
                    key={btn.action}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick(btn.action, order);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Icon name={btn.icon} size={12} />
                    {btn.label}
                  </button>
                ))}

                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleButtonClick("edit", order);
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
                      handleButtonClick("cancel", order);
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
                      handleButtonClick("delete", order);
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

      {/* Assign button - shown when showAssign is true and order is pending/approved */}
      {showAssign && (displayStatus === "Pendente" || displayStatus === "Aprovado") && (
        <div className="mt-2">
          <button
            onClick={() => onAssign && onAssign(order)}
            className="w-full text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors"
          >
            Atribuir →
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
