import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import StatCard from "../common/StatCard";
import { changeProfilePassword, updateDriverProfile, getDriverOperationalReport } from "../../api/client";
import { toast } from "../../lib/toast";
import { useData } from "../../contexts/DataContext";

const formatShortId = (id) => {
  if (!id) return "MZ-0000";
  return `MZ-${id.replace(/-/g, "").slice(-4).toUpperCase()}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-MZ");
};

const MotoristaProfile = ({ user, profileData, onProfileUpdated, onOrderClick }) => {

  const data=useData()

  useEffect(()=>{
      if(!data.postDialogOpen){
         setShowPasswordModal(false)
         setShowReportModal(false)
      }
  },[data.postDialogOpen])

  const driver = profileData?.driver || {};
  const documents = profileData?.documents || [
    {
      id: "bi",
      name: "BI / Passaporte",
      status: driver.bi ? "Válido" : "Pendente",
      expiry: "N/A",
      documentUrl: driver.biCopyUrl
    },
    {
      id: "driving_license",
      name: "Carta de Condução",
      status: driver.driverLicenseCopy ? "Válido" : "Pendente",
      expiry: "N/A",
      documentUrl: driver.driverLicenseCopyUrl
    },
    {
      id: "vehicle_registration",
      name: "Registo do Veículo",
      status: driver.vehicleRegistration ? "Válido" : "Pendente",
      expiry: "N/A",
      documentUrl: driver.vehicleRegistrationUrl
    },
    {
      id: "insurance",
      name: "Seguro Veículo",
      status: driver.insuranceDocument ? "Válido" : "Pendente",
      expiry: "N/A",
      documentUrl: driver.insuranceDocumentUrl
    },
    {
      id: "training_certificate",
      name: "Certificado de Formação",
      status: driver.trainingCertificateCopy ? "Válido" : "Pendente",
      expiry: "N/A",
      documentUrl: driver.trainingCertificateCopyUrl
    }
  ];
  const stats = profileData?.stats || {};
  const averageRating = Number(stats.averageRating || driver.rating || 0);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
   name: driver.name || user?.name || "",
   phone: driver.phone || user?.phone || "",
   vehicle: driver.vehicle || "",
    licensePlate: driver.licensePlate || "",
    bi: driver.bi || "",
    emergencyContact: driver.emergencyContact || "",
    zone: driver.zone || ""
  });
  const [saving, setSaving] = useState(false);
 const [showReportModal, setShowReportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportPeriod, setReportPeriod] = useState("semanal");
  const [reportOrders, setReportOrders] = useState([]);
  const [reportStatsData, setReportStatsData] = useState({});
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRefreshing, setReportRefreshing] = useState(false);

  useEffect(() => {
    setEditForm({
     name: driver.name || user?.name || "",
     phone: driver.phone || user?.phone || "",
     vehicle: driver.vehicle || "",
       licensePlate: driver.licensePlate || "",
       bi: driver.bi || "",
       emergencyContact: driver.emergencyContact || "",
       zone: driver.zone || ""
     });
  }, [driver, user]);

  // Set default dates on mount (last 7 days)
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    setDateFrom(weekAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const fetchReportData = useCallback(async () => {
    if (!dateFrom || !dateTo) return;

    setReportLoading(true);
    try {
      const response = await getDriverOperationalReport({
        startDate: dateFrom,
        endDate: dateTo
      });
      setReportOrders(response.data?.orders || []);
      setReportStatsData(response.data?.stats || {});
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Erro ao carregar relatório");
    } finally {
      setReportLoading(false);
    }
  }, [dateFrom, dateTo]);

  const refreshReportData = async () => {
    setReportRefreshing(true);
    await fetchReportData();
    setReportRefreshing(false);
  };

  // Fetch report data when modal opens or dates change
  useEffect(() => {
    if (showReportModal && dateFrom && dateTo) {
      fetchReportData();
    }
  }, [showReportModal, dateFrom, dateTo, fetchReportData]);

  const handlePeriodChange = (newPeriod) => {
    setReportPeriod(newPeriod);
    const today = new Date();
    let from = new Date(today);

    if (newPeriod === "semanal") {
      from.setDate(from.getDate() - 7);
    } else if (newPeriod === "mensal") {
      from.setMonth(from.getMonth() - 1);
    } else if (newPeriod === "trimestral") {
      from.setMonth(from.getMonth() - 3);
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const reportStats = (() => {
    const isCompleted = (status) => ['completed', 'Concluído', 'delivered'].includes(status);
    const isCancelled = (status) => ['cancelled', 'Cancelado', 'canceled'].includes(status);
    const total = reportOrders.length;
    const completed = reportOrders.filter(o => isCompleted(o.status)).length;
    const cancelled = reportOrders.filter(o => isCancelled(o.status)).length;
    const totalEarnings = reportOrders
      .filter(o => isCompleted(o.status))
      .reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalDistance = reportOrders
      .filter(o => isCompleted(o.status) && o.dist)
      .reduce((sum, o) => sum + Number(o.dist || 0), 0);
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
    const pending = reportOrders.filter(o => ['pending', 'Pendente', 'pending_approval', 'scheduled', 'approved'].includes(o.status)).length;
    return { total, completed, cancelled, pending, totalEarnings, totalDistance, cancellationRate };
  })();

  const refreshProfile = async () => {
    if (onProfileUpdated) await onProfileUpdated();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateDriverProfile(editForm);
      setEditMode(false);
      toast.success("Perfil do motorista atualizado");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

 const handlePasswordChange = async () => {
   if (passwordForm.newPassword !== passwordForm.confirmPassword) {
     toast.error("As novas senhas não coincidem");
     return;
   }
   if (passwordForm.newPassword.length < 6) {
     toast.error("A nova senha deve ter pelo menos 6 caracteres");
     return;
   }

   setSaving(true);
   try {
     await changeProfilePassword({
       currentPassword: passwordForm.currentPassword,
       newPassword: passwordForm.newPassword
     });
     setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
     setShowPasswordModal(false);
     toast.success("Senha alterada com sucesso");
   } catch (error) {
     toast.error(error?.response?.data?.message || "Erro ao alterar senha");
   } finally {
     setSaving(false);
   }
 };

 const openDocument = (doc) => {
   if (doc.documentUrl) {
     window.open(doc.documentUrl, "_blank", "noopener,noreferrer");
   } else {
     toast.error("Documento ainda não foi enviado");
   }
 };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-3">
          {(editForm.name || user?.name || "Motorista").split(" ").map(n => n[0]).join("") || "JM"}
        </div>
        <p className="text-base font-bold text-slate-800">{editForm.name}</p>
        <p className="text-sm text-slate-400">Motorista · ID #{formatShortId(driver.id || user?.id)}</p>
        <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
          {[1, 2, 3, 4].map(i => <Icon key={i} name="star" size={16} className="fill-amber-400" />)}
          <Icon name="star" size={16} className={Number(stats.averageRating || driver.rating || 0) >= 5 ? "fill-amber-400" : ""} />
          <span className="text-sm text-slate-600 ml-1">{averageRating.toFixed(1)}</span>
        </div>
        <button disabled={saving} onClick={() => setEditMode(true)} className="mt-4 w-full bg-orange-500 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50">
          Editar Perfil
        </button>
      </div>

      {editMode && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500">Nome</label>
            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Telefone</label>
            <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1" />
          </div>
         <div className="bg-slate-50 rounded-xl px-3 py-2 mt-3">
           <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Email</label>
           <p className="text-sm text-slate-700 break-words">{driver.email || user?.email || "—"}</p>
           <p className="text-[10px] text-slate-400 mt-1">O email não pode ser alterado pelo perfil.</p>
         </div>
         <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="text-xs font-semibold text-slate-500">Veículo</label>
              <input value={editForm.vehicle} onChange={e => setEditForm({ ...editForm, vehicle: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Matrícula</label>
              <input value={editForm.licensePlate} onChange={e => setEditForm({ ...editForm, licensePlate: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Zona</label>
            <input value={editForm.zone} onChange={e => setEditForm({ ...editForm, zone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1" />
          </div>
          <div className="flex gap-2">
            <button disabled={saving} onClick={handleSaveProfile} className="flex-1 bg-green-500 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50">
              {saving ? "A salvar..." : "Salvar"}
            </button>
            <button disabled={saving} onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 text-slate-600 text-sm font-semibold py-2 rounded-xl disabled:opacity-50">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {[
         { label: "Telefone", value: editForm.phone, icon: "phone" },
         { label: "Email", value: driver.email || user?.email || "—", icon: "mail" },
         { label: "Zona", value: editForm.zone || "N/A", icon: "location" },
           { label: "Veículo", value: `${editForm.vehicle || "Mota"}${editForm.licensePlate ? ` · ${editForm.licensePlate}` : ""}`, icon: "truck" },
           { label: "Data de Admissão", value: formatDate(driver.admissionDate), icon: "calendar" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-2">
              <Icon name={item.icon} size={14} className="text-slate-400" />
              <span className="text-sm text-slate-500">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-slate-700 text-right">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Documentos</p>
        {documents.map((doc) => (
          <div key={doc.id} className={`flex items-center gap-2 py-2.5 border-b border-slate-50 last:border-0 ${doc.documentUrl ? "bg-green-50/50" : "bg-amber-50/50"}`}>
            <Icon name={doc.status === "Válido" ? "checkCircle" : "alertCircle"} size={16} className={doc.status === "Válido" ? "text-green-500" : "text-amber-500"} />
            <div className="flex-1">
              <span className="text-sm text-slate-700">{doc.name}</span>
              <p className="text-xs text-slate-400 hidden">Expira: {doc.expiry || "N/A"}</p> {/**lEAVE HIDDEN */}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDocument(doc)}
                disabled={!doc.documentUrl}
                className={`text-xs px-2 py-1 rounded-lg ${
                  doc.documentUrl
                    ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {doc.documentUrl ? "Ver" : "Pendente"}
              </button>
            </div>
          </div>
        ))}
      </div>


      {/* Performace Section */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Desempenho</p>
        <div className="grid grid-cols-2 gap-3">
        
          <div className="bg-slate-50 rounded-xl p-3 text-center col-span-2">
            <p className="text-lg font-bold text-slate-800">{stats.cancelledOrders || 0}</p>
            <p className="text-[10px] text-slate-400">Cancelados</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{stats.totalDeliveries || driver.ordersCount || 0}</p>
            <p className="text-[10px] text-slate-400">Total Entregas</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{averageRating.toFixed(1)}</p>
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
              <Icon name="star" size={10} className="text-amber-400" /> Avaliação
            </p>
          </div>
        </div>
      </div>

     <div className="flex gap-2 pb-4">
       <button disabled={saving} onClick={() => {
        setShowReportModal(true)
        data.setPostDialogOpen(true)
       }} className="flex-1 bg-slate-100 text-slate-600 text-sm font-semibold py-3 rounded-xl disabled:opacity-50">
         Ver Relatório
       </button>
    </div>
     <button disabled={saving} onClick={() => {

      setShowPasswordModal(true)
      data.setPostDialogOpen(true)

     }} className="w-full bg-slate-800 text-white text-sm font-semibold py-3 rounded-xl disabled:opacity-50">
       Alterar Senha
     </button>
      <button onClick={() => navigate('/forgot-password')} className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl mt-2">
       Recuperar Senha
     </button>

      {showPasswordModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Alterar Senha</h2>
              <button disabled={saving} onClick={() => setShowPasswordModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-50">
                <Icon name="x" className={"text-black"} size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Senha Atual</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Nova Senha</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button disabled={saving} onClick={() => setShowPasswordModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50">
                Cancelar
              </button>
              <button disabled={saving} onClick={handlePasswordChange} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50">
                {saving ? "A salvar..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}


      {showReportModal && (
         <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
           <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] p-4 overflow-y-auto">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800">Relatório de Entregas</h2>
               <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                 <Icon name="x" className={"text-black"} size={16} />
               </button>
             </div>

             {/* Date filter controls */}
             <div className="flex gap-2 mb-4">
               <input
                 type="date"
                 value={dateFrom}
                 onChange={e => setDateFrom(e.target.value)}
                 className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
               />
               <input
                 type="date"
                 value={dateTo}
                 onChange={e => setDateTo(e.target.value)}
                 className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
               />
               <select
                 value={reportPeriod}
                 onChange={e => handlePeriodChange(e.target.value)}
                 className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
               >
                 <option value="semanal">Última semana</option>
                 <option value="mensal">Último mês</option>
                 <option value="trimestral">Último trimestre</option>
                 <option value="personalizado">Personalizado</option>
               </select>
               <button
                 onClick={refreshReportData}
                 disabled={reportRefreshing || reportLoading}
                 className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
                 title="Atualizar"
               >
                 <Icon name="refreshCw" size={14} className={reportRefreshing ? "animate-spin" : ""} />
               </button>
             </div>

             {/* Summary stats */}
             <div className="grid grid-cols-2 gap-3 mb-4">
               <StatCard label="Total Pedidos" value={reportStatsData.totalOrders?.toString() || "0"} color="blue" />
               <StatCard label="Concluídos" value={reportStatsData.completedOrders?.toString() || reportStats.completed.toString()} color="green" />
               <StatCard label="Cancelados" value={reportStatsData.cancelledOrders?.toString() || reportStats.cancelled.toString()} color="red" />
               <StatCard label="Receita Total" value={`${(reportStatsData.totalRevenue || reportStats.totalEarnings).toFixed(0)} MZN`} color="orange" />
                <StatCard label="Pendentes" value={reportStatsData.pendingOrders?.toString() || reportStats.pending?.toString() || "0"} color="amber" />
               <StatCard label="Distância Total" value={`${reportStatsData.totalDistance?.toFixed(0) || reportStats.totalDistance?.toFixed(0) || 0} km`} color="orange" />
             </div>

             {/* Orders list */}
             <p className="text-xs font-semibold text-slate-500 mb-2">Pedidos ({reportStats.total})</p>
             {reportLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
               </div>
             ) : reportOrders.length === 0 ? (
               <p className="text-sm text-slate-500 py-6 text-center">Nenhum pedido neste período.</p>
             ) : (
               <div className="space-y-2">
                 {reportOrders.map(order => (
                   <div 
                     key={order.id} 
                     onClick={() => onOrderClick && onOrderClick(order.id)}
                     className="rounded-xl bg-slate-50 p-3 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                   >
                     <div className="flex items-center justify-between">
                       <p className="text-sm font-semibold text-slate-800">#{order.shortId || order.id?.slice(0, 8)}</p>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'in_transit' || order.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {order.status === 'in_transit' ? 'Em entrega' :
                         order.status === 'assigned' ? 'Atribuído' :
                         order.status === 'pending_approval' ? 'Aguardando' :
                         order.status === 'approved' ? 'Aprovado' :
                         order.status}
                      </span>
                     </div>
                     <p className="text-xs text-slate-500 mt-1">
                       {formatDate(order.createdAt)} · {Number(order.total || 0).toFixed(0)} MZN
                     </p>
                     {order.pickupLocation && (
                       <p className="text-xs text-slate-400 mt-1 truncate">{order.pickupLocation} → {order.dropoffLocation || ''}</p>
                     )}
                   </div>
                 ))}
               </div>
             )}

             <div className="flex justify-end mt-4">
               <button
                 onClick={() => setShowReportModal(false)}
                 className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
               >
                 Fechar
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default MotoristaProfile;
