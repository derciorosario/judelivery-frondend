import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import { getAvailableDriversForReassignment, rejectOrder } from "../../api/client";
import { toast } from "../../lib/toast";
import {
  X,
  UserX,
  UserCheck,
  MapPin,
  Navigation,
  Star,
  AlertCircle,
  Search,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const ReassignOrderModal = ({ isOpen, onClose, order, onReassigned, role }) => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const {user} = useAuth()

  useEffect(() => {
    if (isOpen && order) {
      fetchAvailableDrivers();
    }
  }, [isOpen, order]);

  const fetchAvailableDrivers = async () => {
    setLoading(true);
    setDrivers([]);
    setSelectedDriver(null);
    try {
      const params = {};
      if (order.pickupCoords) {
        params.pickupCoords = `${order.pickupCoords.lat},${order.pickupCoords.lng}`;
      }
      if (order.dropoffCoords) {
        params.dropoffCoords = `${order.dropoffCoords.lat},${order.dropoffCoords.lng}`;
      }
      if (order.originCoords) {
        params.originCoords = `${order.originCoords.lat},${order.originCoords.lng}`;
      }
      if (order.destCoords) {
        params.destCoords = `${order.destCoords.lat},${order.destCoords.lng}`;
      }
      if (order.scheduledTime) {
        params.scheduledTime = order.scheduledTime;
        params.isScheduled = true;
      }
      if (order.urgencyLevel) {
        params.urgencyLevel = order.urgencyLevel;
      }
if (order.serviceType) {
         params.serviceType = order.serviceType;
       }
if (order.driverId) {
          params.currentDriverId = order.driverId;
        }
        if (order.scheduledTime || order.createdAt) {
          params.currentDriverOrderTime = order.scheduledTime || order.createdAt;
        }

        const response = await getAvailableDriversForReassignment(order.id, params);
       const driversList = response.data.drivers || [];
       setDrivers(driversList);
       if (driversList.length > 0) {
         const currentDriver = driversList.find(d => d.id === order.driverId) || driversList[0];
         setSelectedDriver(currentDriver);
       }
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      toast.error(error.response?.data?.message || "Erro ao procurar motoristas disponíveis");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectWithoutAssign = async () => {
    setSubmitting(true);
    try {
      const payload = {
        reason: "driver_rejected",
        comment: rejectionReason || "Motorista rejeitou o pedido"
      };

      const response = await rejectOrder(order.id, payload);
      toast.success("Pedido rejeitado com sucesso");
      if (onReassigned) {
        onReassigned(response.data);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao rejeitar pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedDriver) {
      toast.error("Selecione um motorista primeiro");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        driverId: selectedDriver.id,
        reason: "driver_rejected",
        comment: rejectionReason || "Motorista rejeitou o pedido"
      };

      const response = await rejectOrder(order.id, payload);
      toast.success("Pedido rejeitado e motorista atribuído com sucesso");
      if (onReassigned) {
        onReassigned(response.data);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao rejeitar e atribuir motorista");
    } finally {
      setSubmitting(false);
    }
  };

  const getDistanceLabel = (driver) => {
    if (driver.distance !== null && driver.distance !== undefined) {
      return `${driver.distance} km`;
    }
    return "Distância desconhecida";
  };

  const getEtaLabel = (driver) => {
    if (driver.eta) {
      return `~${driver.eta} min`;
    }
    return null;
  };

  const getStatusColor = (driver) => {
    return driver.status === "online" ? "text-green-600" :
           driver.status === "working" ? "text-blue-600" :
           "text-slate-400";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rejeitar e Reatribuir Pedido">
      <div className="space-y-4">
        <div className="bg-red-50 rounded-xl p-3 border border-red-100">
          <div className="flex items-center gap-2">
            <UserX size={18} className="text-red-500" />
            <p className="text-sm font-semibold text-red-700">
              Rejeição de Pedido
            </p>
          </div>
          <p className="text-xs text-red-600 mt-1">
            O motorista atual será marcado como rejeição e não poderá receber este pedido novamente. Selecione um novo motorista abaixo.
          </p>
        </div>

        {order?.driver && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-1">Motorista Atual</p>
            <p className="text-sm font-semibold text-slate-800">
              {typeof order.driver === "string" ? order.driver : order.driver?.name}
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Motivo da Rejeição (opcional)
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Ex: Motorista indisponível, cliente solicitou cancelamento..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-500">
              Motoristas Disponíveis
            </label>
            <button
              onClick={fetchAvailableDrivers}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Search size={12} />
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="text-xs text-slate-500 ml-2">A procurar motoristas...</span>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
              <AlertCircle size={24} className="text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Nenhum motorista disponível</p>
              <p className="text-xs text-slate-500 mt-1">
                Não há motoristas disponíveis no momento para este pedido.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedDriver?.id === driver.id
                      ? "border-orange-500 bg-orange-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDriver?.id === driver.id ? "bg-orange-100" : "bg-slate-100"}`}>
                        <UserCheck size={18} className={selectedDriver?.id === driver.id ? "text-orange-600" : "text-slate-500"} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{driver.name}</p>
                        <p className="text-xs text-slate-500">
                          {driver.vehicle} • {driver.licensePlate}
                        </p>
                        {driver.rating && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            <span className="text-[10px] text-slate-600">{driver.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {driver.distance !== null && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <p className="text-xs font-semibold text-slate-700">{getDistanceLabel(driver)}</p>
                        </div>
                      )}
                      {getEtaLabel(driver) && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Navigation size={10} className="text-slate-400" />
                          <p className="text-[10px] text-slate-500">{getEtaLabel(driver)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedDriver?.id === driver.id && (
                    <div className="mt-2 flex items-center gap-1 text-orange-600">
                      <CheckCircle size={12} />
                      <span className="text-[10px] font-semibold">Selecionado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          {/***
           *  leeave this button hidden
           *  {role !== 'driver' && (
            <button
              onClick={handleRejectWithoutAssign}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "A processar..." : "Só Rejeitar"}
            </button>
          )}
           */}
          <button
            onClick={handleReassign}
            disabled={submitting || !selectedDriver}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                A processar...
              </>
            ) : (
              <>
                <UserCheck size={16} />
                Rejeitar e Atribuir
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ReassignOrderModal;
