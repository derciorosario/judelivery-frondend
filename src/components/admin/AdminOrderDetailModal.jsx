import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { updateOrder, getDrivers } from "../../api/client";
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
  MessageSquare,
  Truck,
  Navigation,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Edit2,
  Save,
  UserCheck,
  UserX,
  Send,
  Eye,
  EyeOff
} from "lucide-react";

const AdminOrderDetailModal = ({ isOpen, onClose, order, onUpdate }) => {
  const [form, setForm] = useState({
    status: order?.status || "pending_approval",
    total: "",
    driverId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [showDriverInfo, setShowDriverInfo] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        status: order.status || "pending_approval",
        total: String(order.total || ""),
        driverId: order.driverId || ""
      });
    }
  }, [order]);

  useEffect(() => {
    if (activeTab === "actions") {
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
  }, [activeTab]);

  const handleStatusChange = async (newStatus) => {
    if (!order) return;
    setIsSubmitting(true);
    try {
      const payload = { status: newStatus, driverId: form.driverId || null };
      const response = await updateOrder(order.id, payload);
      if (onUpdate) onUpdate(response.data);
      
      const statusMessages = {
        approved: "Pedido aprovado com sucesso",
        cancelled: "Pedido cancelado com sucesso",
        assigned: "Pedido atribuído com sucesso",
        in_transit: "Pedido em trânsito",
        completed: "Pedido concluído com sucesso"
      };
      
      toast.success(statusMessages[newStatus] || "Pedido atualizado com sucesso");
      onClose();
    } catch (error) {
      let errorMessage = "Erro ao atualizar pedido";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!order || !form.driverId) return;
    setIsSubmitting(true);
    try {
      const payload = { driverId: form.driverId };
      if (order.status === "pending_approval" || order.status === "approved") {
        payload.status = "assigned";
      }
      const response = await updateOrder(order.id, payload);
      if (onUpdate) onUpdate(response.data);
      toast.success("Motorista atribuído com sucesso");
      onClose();
    } catch (error) {
      let errorMessage = "Erro ao atribuir motorista";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    return { text: status || "Processando", icon: AlertCircle, color: "slate", bgClass: "bg-slate-100 text-slate-700" };
  };

  const displayStatus = getStatusConfig(order?.status || order?.statusCode);
  const StatusIcon = displayStatus.icon;
  const isDelivery = order?.serviceType !== "taxi";

  if (!order) return null;

  const selectedDriver = drivers.find(d => d.id === form.driverId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pedido #${order.id ? order.id.slice(-8).toUpperCase() : "PEDIDO"}`}>
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              activeTab === "details" 
                ? "bg-slate-800 text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Eye size={12} />
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              activeTab === "actions" 
                ? "bg-slate-800 text-white" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Edit2 size={12} />
            Ações
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Header Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${displayStatus.bgClass}`}>
                <StatusIcon size={12} />
                <span className="text-xs font-semibold">{displayStatus.text}</span>
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

            {/* Addresses */}
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
                {order.productName && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Produto</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {order.productName} {order.quantity > 1 && `x${order.quantity}`}
                    </span>
                  </div>
                )}

                {!isDelivery && order.passengerCount && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">Passageiros</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {order.passengerCount} pessoa(s)
                      {order.hasLuggage && <span className="ml-2 text-xs text-slate-500">(com bagagem)</span>}
                    </span>
                  </div>
                )}

                {order.urgencyLevel && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Urgência</span>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.urgencyLevel === "urgent" ? "bg-amber-100 text-amber-700" :
                      order.urgencyLevel === "very_urgent" ? "bg-red-100 text-red-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      <AlertCircle size={10} />
                      <span>{order.urgencyLevel === "urgent" ? "Urgente" : order.urgencyLevel === "very_urgent" ? "Muito Urgente" : "Normal"}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600">Pagamento</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-700">{order.paymentMethod || "—"}</p>
                    <p className={`text-xs font-semibold ${
                      order.paymentStatus === "paid" ? "text-green-600" : 
                      order.paymentStatus === "pending" ? "text-amber-600" : "text-slate-500"
                    }`}>
                      {order.paymentStatus === "paid" ? "Pago" : 
                       order.paymentStatus === "pending" ? "Pendente" : 
                       order.paymentStatus || "Pendente"}
                    </p>
                  </div>
                </div>

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

                {order.driver && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">Motorista</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {typeof order.driver === 'string' ? order.driver : order.driver?.name}
                    </span>
                  </div>
                )}

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
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            {/* Status Change */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Clock size={12} />
                Alterar Status
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
              </select>
            </div>

            {/* Price Update */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <DollarSign size={12} />
                Valor Total (MZN)
              </label>
              <input
                type="number"
                value={form.total}
                onChange={e => setForm({ ...form, total: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                placeholder="0.00"
              />
            </div>

            {/* Driver Assignment */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                <Truck size={12} />
                Motorista
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
                      const statusText = d.status === "online" ? "Online" : d.status === "working" ? "Em viagem" : "Offline";
                      return (
                        <option key={d.id} value={d.id}>
                          {statusIcon} {d.name} {d.phone ? `(${d.phone})` : ""} — {statusText}
                        </option>
                      );
                    })}
                  </select>
                  
                  {/* Driver Info Card */}
                  {showDriverInfo && selectedDriver && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-slate-600">Informações do Motorista</h4>
                        <button 
                          onClick={() => setShowDriverInfo(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <EyeOff size={12} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs">
                          <span className="text-slate-500">Nome:</span> 
                          <span className="ml-1 font-semibold text-slate-700">{selectedDriver.name}</span>
                        </p>
                        {selectedDriver.phone && (
                          <p className="text-xs">
                            <span className="text-slate-500">Telefone:</span> 
                            <span className="ml-1 text-slate-700">{selectedDriver.phone}</span>
                          </p>
                        )}
                        {selectedDriver.vehicle && (
                          <p className="text-xs">
                            <span className="text-slate-500">Veículo:</span> 
                            <span className="ml-1 text-slate-700">{selectedDriver.vehicle}</span>
                          </p>
                        )}
                        {selectedDriver.licensePlate && (
                          <p className="text-xs">
                            <span className="text-slate-500">Matrícula:</span> 
                            <span className="ml-1 font-mono text-slate-700">{selectedDriver.licensePlate}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleAssignDriver}
                    disabled={isSubmitting || !form.driverId}
                    className="w-full mt-2 py-2.5 rounded-xl bg-indigo-500 text-white font-semibold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck size={16} />
                    {order.driverId ? "Atualizar Motorista" : "Atribuir Motorista"}
                  </button>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {displayStatus.text === "Aguardando" && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  Aprovar
                </button>
              )}
              {(displayStatus.text === "Aprovado" || displayStatus.text === "Aguardando") && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={14} />
                  Rejeitar
                </button>
              )}
              <button
                onClick={() => handleStatusChange("in_transit")}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Truck size={14} />
                Em entrega
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={14} />
                Concluir
              </button>
            </div>

            <button
              onClick={() => onClose()}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AdminOrderDetailModal;