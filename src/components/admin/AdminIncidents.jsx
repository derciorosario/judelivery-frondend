import { useState } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { INCIDENTS, DRIVERS, INCIDENT_TYPES } from "../../data/mockData";

// Add Incident Modal
const AddIncidentModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    type: "Acidente",
    title: "",
    description: "",
    driver: "João Motorista",
    status: "Em análise"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    const newIncident = {
      id: INCIDENTS.length + 1,
      type: form.type,
      title: form.title,
      description: form.description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      driver: form.driver,
      status: form.status,
      photos: [],
      documents: []
    };
    
    onAdd(newIncident);
    onClose();
    setForm({ type: "Acidente", title: "", description: "", driver: "João Motorista", status: "Em análise" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Incidente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Incidente</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {INCIDENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Ex: Colisão na Av. Julius Nyerere"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Descreva o incidente..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
          <select
            value={form.driver}
            onChange={e => setForm({ ...form, driver: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {DRIVERS.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600">
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Incident Detail Modal
const IncidentDetailModal = ({ isOpen, onClose, incident }) => {
  if (!incident) return null;

  const getIncidentColor = (type) => {
    switch(type) {
      case "Acidente": return "bg-red-100 text-red-700";
      case "Avaria": return "bg-orange-100 text-orange-700";
      case "Problema Entrega": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={incident.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(incident.type)}`}>{incident.type}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${incident.status === "Em análise" ? "bg-amber-100 text-amber-700" : incident.status === "Resolvido" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
            {incident.status}
          </span>
        </div>
        
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Descrição</p>
          <p className="text-sm text-slate-700">{incident.description}</p>
        </div>
        
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="calendar" size={14} className="text-slate-500" />
            <span className="text-xs text-slate-600">{incident.date} às {incident.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="users" size={14} className="text-slate-500" />
            <span className="text-xs text-slate-600">{incident.driver}</span>
          </div>
        </div>
        
        {incident.photos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Fotos Anexadas</p>
            <div className="flex gap-2">
              {incident.photos.map((p, i) => (
                <div key={i} className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Icon name="image" size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {incident.documents.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Documentos</p>
            {incident.documents.map((d, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Icon name="file" size={14} className="text-slate-400" />
                <span className="text-xs text-slate-600">{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

const AdminIncidents = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const filters = ["Todos", ...INCIDENT_TYPES];
  const filtered = filter === "Todos" ? INCIDENTS : INCIDENTS.filter(i => i.type === filter);

  const handleAddIncident = (newIncident) => {
    INCIDENTS.push(newIncident);
  };

  const getIncidentColor = (type) => {
    switch(type) {
      case "Acidente": return "bg-red-100 text-red-700";
      case "Avaria": return "bg-orange-100 text-orange-700";
      case "Problema Entrega": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Incidentes</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
          <Icon name="plus" size={14} /> Registrar
        </button>
      </div>
      <AddIncidentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddIncident} />
      <IncidentDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} incident={selectedIncident} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filtered.map(i => (
        <div key={i.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(i.type)}`}>{i.type}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i.status === "Em análise" ? "bg-amber-100 text-amber-700" : i.status === "Resolvido" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                {i.status}
              </span>
            </div>
            <span className="text-xs text-slate-400">{i.date} {i.time}</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{i.title}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{i.description}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">{i.driver}</span>
            <button onClick={() => { setSelectedIncident(i); setShowDetailModal(true); }} className="text-xs text-orange-500 font-medium">
              Ver detalhes →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminIncidents;