import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import { getDriverOrders, updateOrder, getOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import Modal from "../common/Modal";

const BACKEND_STATUS_LABELS = {
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

const MotoristaOrders = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await getDriverOrders();
      setMyOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toShortId = (id) => {
    if (!id) return "---";
    return "#" + id.replace(/-/g, "").toUpperCase().slice(-6);
  };

  const backendToFrontend = (status) => BACKEND_STATUS_LABELS[status] || status || "Pendente";

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getDriverOrders();
      setMyOrders(res.data || []);
      toast.success("Pedidos atualizados");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar pedidos");
    } finally {
      setRefreshing(false);
    }
  };

  const openDetails = async (order) => {
    try {
      const res = await getOrder(order.id);
      setSelectedOrder(res.data || order);
    } catch (err) {
      setSelectedOrder(order);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const payload = { status: newStatus };
      const res = await updateOrder(selectedOrder.id, payload);
      setSelectedOrder(res.data || selectedOrder);
      setMyOrders((prev) =>
        prev.map((o) => (o.id === (res.data?.id || selectedOrder.id) ? res.data || selectedOrder : o))
      );
      toast.success("Pedido atualizado com sucesso");
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao atualizar pedido";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-500">A carregar pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Os Meus Pedidos</p>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
        >
          <Icon name="refreshCw" size={14} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido atribuído</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map((o) => {
            const displayStatus = backendToFrontend(o.status);
            const isDelivery = o.serviceType !== "taxi";
            const statusBadge =
              displayStatus === "Em entrega"
                ? "bg-blue-100 text-blue-700"
                : displayStatus === "Concluído"
                  ? "bg-green-100 text-green-700"
                  : displayStatus === "Cancelado"
                    ? "bg-red-100 text-red-700"
                    : displayStatus === "Aprovado"
                      ? "bg-teal-100 text-teal-700"
                      : displayStatus === "Agendado"
                        ? "bg-purple-100 text-purple-700"
                        : displayStatus === "Atribuído"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-amber-100 text-amber-700";

            return (
              <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-800">{toShortId(o.id)}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>{displayStatus}</span>
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
                  <span className="text-sm font-bold text-orange-500"> {o.total} MZN</span>
                </div>

                <p className="text-sm font-medium text-slate-700">
                  {o.client?.name || o.client || "Cliente"}
                </p>

                <p className="text-xs text-slate-500">
                  {isDelivery
                    ? `${o.origin || ""} → ${o.dest || ""}`
                    : `${o.pickupLocation || ""} → ${o.dropoffLocation || ""}`}
                </p>

                <p className="text-xs text-slate-400">
                  {o.time || new Date(o.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openDetails(o)}
                    className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700"
                  >
                    Detalhes / ações
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <MotoristaOrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          onUpdate={(updated) => {
            setMyOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOrder(updated);
          }}
          onStatusChange={updateStatus}
          updating={updating}
        />
      )}
    </div>
  );
};

const MotoristaOrderDetailModal = ({ isOpen, onClose, order, onUpdate, onStatusChange, updating }) => {
  const [activeTab, setActiveTab] = useState("details");

  const backendToFrontend = (status) => {
    if (status === "in_transit") return "Em entrega";
    if (status === "assigned") return "Atribuído";
    if (status === "pending_approval") return "Aguardando";
    if (status === "approved") return "Aprovado";
    if (status === "completed") return "Concluído";
    if (status === "cancelled") return "Cancelado";
    return status || "Processando";
  };

  const renderStatus = (s) => {
    const map = {
      in_transit: { text: "Em entrega", cls: "bg-blue-100 text-blue-700" },
      pending_approval: { text: "Aguardando", cls: "bg-amber-100 text-amber-700" },
      approved: { text: "Aprovado", cls: "bg-teal-100 text-teal-700" },
      assigned: { text: "Atribuído", cls: "bg-indigo-100 text-indigo-700" },
      completed: { text: "Concluído", cls: "bg-green-100 text-green-700" },
      cancelled: { text: "Cancelado", cls: "bg-red-100 text-red-700" }
    };
    return map[s] || { text: s || "Processando", cls: "bg-slate-100 text-slate-700" };
  };

  const showStatusConfig = (status) => {
    const s = status || order.status || "";
    if (s === "in_transit") {
      return { text: "Em entrega", cls: "bg-blue-100 text-blue-700" };
    }
    if (s === "pending_approval") {
      return { text: "Aguardando", cls: "bg-amber-100 text-amber-700" };
    }
    if (s === "completed") {
      return { text: "Concluído", cls: "bg-green-100 text-green-700" };
    }
    if (s === "cancelled") {
      return { text: "Cancelado", cls: "bg-red-100 text-red-700" };
    }
    if (s === "approved") {
      return { text: "Aprovado", cls: "bg-teal-100 text-teal-700" };
    }
    if (s === "assigned") {
      return { text: "Atribuído", cls: "bg-indigo-100 text-indigo-700" };
    }
    return { text: status, cls: "bg-slate-100 text-slate-700" };
  };

  if (!order) return null;

  const displayLabel = backendToFrontend(order.status);
  const statusConf = showStatusConfig(order.status);
  const isDelivery = order.serviceType !== "taxi";
  const dist = order.dist || order.distance || "—";
  const dest = order.dest || order.dropoffLocation || "";
  const origin = isDelivery ? order.origin : order.pickupLocation;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pedido #${order.id ? order.id.slice(-8).toUpperCase() : "PEDIDO"}`}
    >
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              activeTab === "details" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon name="eye" size={12} /> Detalhes
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
              activeTab === "actions" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon name="edit" size={12} /> Ações
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusConf.cls}`}>
                <span className="text-xs font-semibold">{statusConf.text}</span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                <Icon name={isDelivery ? "package" : "car"} size={12} />
                <span className="text-xs font-semibold">{isDelivery ? "Entrega" : "Táxi"}</span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-xs text-orange-100 mb-1">Valor total</p>
              <p className="text-2xl font-bold">{order.total} MZN</p>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <Icon name="clock" size={12} className="text-orange-200" />
                  <p className="text-xs text-orange-100">
                    {order.orderDate || new Date(order.createdAt).toLocaleDateString()} às{" "}
                    {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {dist && (
                  <div className="flex items-center gap-2">
                    <Icon name="navigation" size={12} className="text-orange-200" />
                    <p className="text-xs text-orange-100">{dist}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="location" size={14} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Partida</p>
                  <p className="text-sm text-slate-800 font-medium">{origin}</p>
                  {order.contactOrigin && (
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="phone" size={10} className="text-slate-400" />
                      <p className="text-xs text-slate-500">{order.contactOrigin}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Icon name="flag" size={14} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Chegada</p>
                  <p className="text-sm text-slate-800 font-medium">{dest}</p>
                  {order.contactDest && (
                    <div className="flex items-center gap-1 mt-1">
                      <Icon name="phone" size={10} className="text-slate-400" />
                      <p className="text-xs text-slate-500">{order.contactDest}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <h3 className="text-xs font-semibold text-slate-400 mb-3">Detalhes do Pedido</h3>
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
                      <Icon name="users" size={14} className="text-slate-400" />
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
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        order.urgencyLevel === "urgent"
                          ? "bg-amber-100 text-amber-700"
                          : order.urgencyLevel === "very_urgent"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {order.urgencyLevel === "urgent"
                        ? "Urgente"
                        : order.urgencyLevel === "very_urgent"
                          ? "Muito Urgente"
                          : "Normal"}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Icon name="creditCard" size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-600">Pagamento</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-700">{order.paymentMethod || "—"}</p>
                    <p
                      className={`text-xs font-semibold ${
                        order.paymentStatus === "paid"
                          ? "text-green-600"
                          : order.paymentStatus === "pending"
                            ? "text-amber-600"
                            : "text-slate-500"
                      }`}
                    >
                      {order.paymentStatus === "paid"
                        ? "Pago"
                        : order.paymentStatus === "pending"
                          ? "Pendente"
                          : order.paymentStatus || "Pendente"}
                    </p>
                  </div>
                </div>

                {order.client && (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon name="user" size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">Cliente</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">
                        {typeof order.client === "string" ? order.client : order.client?.name}
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
                      <Icon name="truck" size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">Motorista</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {typeof order.driver === "string" ? order.driver : order.driver?.name}
                    </span>
                  </div>
                )}

                {order.company && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Icon name="store" size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-600">Empresa</span>
                    </div>
                    <span className="text-sm text-slate-700">
                      {typeof order.company === "string" ? order.company : order.company?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {order.instructions && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="messageSquare" size={14} className="text-slate-400" />
                  <h3 className="text-xs font-semibold text-slate-400 tracking-wide">Instruções Especiais</h3>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg italic">
                  "{order.instructions}"
                </p>
              </div>
            )}

            {order.observations && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="messageSquare" size={14} className="text-slate-400" />
                  <h3 className="text-xs font-semibold text-slate-400 tracking-wide">Observações</h3>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{order.observations}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Alterar Status</label>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value)}
                disabled={updating}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 disabled:opacity-50"
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

export default MotoristaOrders;