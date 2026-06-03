import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { updateOrder, getDrivers } from "../../api/client";
import { toast } from "../../lib/toast";

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
      toast.success(`Pedido ${newStatus === "approved" ? "aprovado" : newStatus === "cancelled" ? "cancelado" : newStatus === "assigned" ? "atribuído" : "atualizado"} com sucesso`);
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

  const displayStatus = order?.status
    ? (() => {
        const s = order.status;
        if (s === "in_transit") return "Em entrega";
        if (s === "pending_approval") return "Aguardando";
        if (s === "completed") return "Concluído";
        if (s === "cancelled") return "Cancelado";
        if (s === "approved") return "Aprovado";
        if (s === "scheduled") return "Agendado";
        if (s === "assigned") return "Atribuído";
        return s;
      })()
    : order?.statusCode;

  const isDelivery = order?.serviceType !== "taxi";

  const statusBadge =
    displayStatus === "Em entrega" ? "bg-blue-100 text-blue-700" :
    displayStatus === "Concluído" ? "bg-green-100 text-green-700" :
    displayStatus === "Cancelado" ? "bg-red-100 text-red-700" :
    displayStatus === "Aprovado" ? "bg-teal-100 text-teal-700" :
    displayStatus === "Agendado" ? "bg-purple-100 text-purple-700" :
    displayStatus === "Atribuído" ? "bg-indigo-100 text-indigo-700" :
    "bg-amber-100 text-amber-700";

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pedido #${order.id ? order.id.slice(-6).toUpperCase() : order.id}`}>
      <div className="space-y-4">
        <div className="flex gap-2 border-b border-slate-100 pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${activeTab === "details" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${activeTab === "actions" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            Ações
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadge}`}>{displayStatus}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isDelivery ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
              }`}>
                {isDelivery ? "Entrega" : "Táxi"}
              </span>
            </div>

            {order.productName && (
              <div>
                <p className="text-xs text-slate-400">Produto / Serviço</p>
                <p className="text-sm font-semibold text-slate-800">{order.productName}</p>
                {order.quantity > 1 && <p className="text-xs text-slate-500">Quantidade: {order.quantity}</p>}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400">Valor</p>
              <p className="text-lg font-bold text-orange-500"> {order.total} MZN</p>
            </div>

            {isDelivery ? (
              <>
                <div>
                  <p className="text-xs text-slate-400">Origem</p>
                  <p className="text-sm text-slate-700">{order.origin}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Destino</p>
                  <p className="text-sm text-slate-700">{order.dest}</p>
                </div>
                {order.urgencyLevel && (
                  <div>
                    <p className="text-xs text-slate-400">Urgência</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.urgencyLevel === "urgent" ? "bg-amber-100 text-amber-700" :
                      order.urgencyLevel === "very_urgent" ? "bg-red-100 text-red-700" :
                      "bg-green-100 text-green-700"
                    }`}>{order.urgencyLevel}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs text-slate-400">Embarque</p>
                  <p className="text-sm text-slate-700">{order.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Desembarque</p>
                  <p className="text-sm text-slate-700">{order.dropoffLocation}</p>
                </div>
                {order.passengerCount && (
                  <div>
                    <p className="text-xs text-slate-400">Passageiros</p>
                    <p className="text-sm font-semibold text-slate-800">{order.passengerCount}</p>
                  </div>
                )}
              </>
            )}

            {order.contactOrigin && (
              <div>
                <p className="text-xs text-slate-400"> Contato (Origem)</p>
                <p className="text-sm text-slate-700">{order.contactOrigin}</p>
              </div>
            )}
            {order.contactDest && (
              <div>
                <p className="text-xs text-slate-400"> Contato (Destino)</p>
                <p className="text-sm text-slate-700">{order.contactDest}</p>
              </div>
            )}

            {order.instructions && (
              <div>
                <p className="text-xs text-slate-400">Instruções</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{order.instructions}</p>
              </div>
            )}
            {order.observations && (
              <div>
                <p className="text-xs text-slate-400">Observações</p>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded-lg">{order.observations}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-400">Pagamento</p>
              <p className="text-sm text-slate-700">{order.paymentMethod || "—"} • {order.paymentStatus === "paid" ? "Pago" : order.paymentStatus === "pending" ? "Pendente" : order.paymentStatus || "Pendente"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Data</p>
              <p className="text-sm text-slate-700">{order.orderDate || new Date(order.createdAt).toLocaleDateString()} • {order.time || new Date(order.createdAt).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Alterar Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
              >
                <option value="pending_approval">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="scheduled">Agendado</option>
                <option value="assigned">Atribuído</option>
                <option value="in_transit">Em entrega</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Valor Total (MZN)</label>
              <input
                type="number"
                value={form.total}
                onChange={e => setForm({ ...form, total: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
              {loadingDrivers ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span className="text-xs text-slate-500">A carregar motoristas...</span>
                </div>
              ) : (
                <select
                  value={form.driverId}
                  onChange={e => setForm({ ...form, driverId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                >
                   <option value="">Selecione um motorista</option>
                   {drivers.map(d => {
                     const statusLabel = d.status === "online" ? "(Online)" : d.status === "working" ? "(Em viagem)" : "(Offline)";
                     const statusColor = d.status === "online" ? "text-green-600" : d.status === "working" ? "text-blue-600" : "text-slate-400";
                     return (
                       <option key={d.id} value={d.id}>
                         {d.name} {d.phone ? `(${d.phone})` : ""} — <span className={statusColor}>{statusLabel}</span>
                       </option>
                     );
                   })}
                </select>
              )}
              <button
                onClick={handleAssignDriver}
                disabled={isSubmitting || !form.driverId}
                className="w-full mt-2 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-sm hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {order.driverId ? "Atualizar Motorista" : "Atribuir Motorista"}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {displayStatus === "Aguardando" && (
                <button
                  onClick={() => handleStatusChange("approved")}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl bg-teal-500 text-white font-bold text-sm hover:bg-teal-600 disabled:opacity-50"
                >
                  Aprovar
                </button>
              )}
              {(displayStatus === "Aprovado" || displayStatus === "Aguardando") && (
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={isSubmitting}
                  className="py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-50"
                >
                  Rejeitar
                </button>
              )}
              <button
                onClick={() => handleStatusChange("in_transit")}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 disabled:opacity-50"
              >
                Em entrega
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 disabled:opacity-50"
              >
                Concluir
              </button>
            </div>

            <button
              onClick={() => onClose()}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
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
