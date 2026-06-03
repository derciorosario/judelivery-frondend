import Icon from "../common/Icon";

const MotoristaProfile = ({ user }) => (
  <div className="space-y-4">
    {/* Profile Header */}
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-3">
        {user?.name?.split(" ").map(n => n[0]).join("") || "JM"}
      </div>
      <p className="text-base font-bold text-slate-800">{user?.name || "João Motorista"}</p>
      <p className="text-sm text-slate-400">Motorista · ID #MZ-003</p>
      <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
        {[1, 2, 3, 4].map(i => <Icon key={i} name="star" size={16} className="fill-amber-400" />)}
        <Icon name="star" size={16} />
        <span className="text-sm text-slate-600 ml-1">4.8</span>
      </div>
    </div>

    {/* Personal Information */}
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {[
        { label: "Telefone", value: "+258 84 111 2233", icon: "phone" },
        { label: "Email", value: user?.email || "motorista@judelivery.mz", icon: "mail" },
        { label: "Zona", value: "Maputo — Polana", icon: "location" },
        { label: "Veículo", value: "Mota · MC-1234-MZ", icon: "truck" },
        { label: "Estado", value: "Activo", icon: "check" },
        { label: "Data de Admissão", value: "15/03/2024", icon: "calendar" },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
          <div className="flex items-center gap-2">
            <Icon name={item.icon} size={14} className="text-slate-400" />
            <span className="text-sm text-slate-500">{item.label}</span>
          </div>
          <span className="text-sm font-medium text-slate-700">{item.value}</span>
        </div>
      ))}
    </div>

    {/* Documents */}
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">Documentos</p>
      {[
        { name: "Carta de Condução", status: "Válido", expiry: "12/2026" },
        { name: "BI / Passaporte", status: "Válido", expiry: "05/2030" },
        { name: "Seguro Veículo", status: "Válido", expiry: "08/2025" },
        { name: "Certificado de Formação", status: "Válido", expiry: "N/A" },
      ].map((doc, i) => (
        <div key={i} className="flex items-center gap-2 py-2.5 border-b border-slate-50 last:border-0">
          <Icon name="checkCircle" size={16} className="text-green-500" />
          <div className="flex-1">
            <span className="text-sm text-slate-700">{doc.name}</span>
            <p className="text-xs text-slate-400">Expira: {doc.expiry}</p>
          </div>
          <span className="text-xs text-green-500 font-medium">{doc.status}</span>
        </div>
      ))}
    </div>

    {/* Performance Stats */}
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">Desempenho</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-800">98%</p>
          <p className="text-[10px] text-slate-400">Taxa de Aceitação</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-800">0</p>
          <p className="text-[10px] text-slate-400">Atrasos</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-800">342</p>
          <p className="text-[10px] text-slate-400">Total Entregas</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-slate-800">4.8</p>
          <p className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
            <Icon name="star" size={10} className="text-amber-400" /> Avaliação
          </p>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 pb-4">
      <button className="flex-1 bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl">
        Contactar Suporte
      </button>
      <button className="flex-1 bg-slate-100 text-slate-600 text-sm font-semibold py-3 rounded-xl">
        Ver Relatório
      </button>
    </div>
  </div>
);

export default MotoristaProfile;