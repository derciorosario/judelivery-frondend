import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { getIncidents, createIncident, updateIncidentWithFiles, deleteIncident } from "../../api/client";
import { toast } from "../../lib/toast";
import client, { API_URL } from "../../api/client";

// Add Incident Modal
const INCIDENT_TYPE_MAP = {
  "Acidente": "accident",
  "Avaria": "breakdown",
  "Problema Entrega": "delivery_issue"
};

const INCIDENT_TYPE_LABELS = {
  "accident": "Acidente",
  "breakdown": "Avaria",
  "delivery_issue": "Problema Entrega"
};

const AddIncidentModal = ({ isOpen, onClose, onAdd, drivers = [], orderId = null }) => {
  const [form, setForm] = useState({
    type: "accident",
    title: "",
    description: "",
    driverId: "",
    status: "pending"
  });
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("status", form.status);
      if (orderId) formData.append("orderId", orderId);
      if (form.driverId) formData.append("driverId", form.driverId);
      formData.append("date", new Date().toISOString().split('T')[0]);
      formData.append("time", new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }));
      
      photos.forEach(photo => formData.append("photos", photo));
      documents.forEach(doc => formData.append("documents", doc));
      
      const res = await createIncident(formData);
      onAdd(res.data);
      onClose();
      setForm({ type: "accident", title: "", description: "", driverId: "", status: "pending" });
      setPhotos([]);
      setDocuments([]);
      toast.success("Incidente registado com sucesso");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao registar incidente");
    } finally {
      setSubmitting(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
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
            <option value="accident">Acidente</option>
            <option value="breakdown">Avaria</option>
            <option value="delivery_issue">Problema Entrega</option>
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
            value={form.driverId}
            onChange={e => setForm({ ...form, driverId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">Selecionar motorista</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Fotos</label>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {photos.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
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
              onChange={(e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Documentos</label>
          <div className="space-y-2 mb-2">
            {documents.map((doc, index) => (
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
                  onClick={() => removeDocument(index)}
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
              onChange={(e) => setDocuments(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? "A registar..." : "Registar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Incident Modal
const EditIncidentModal = ({ isOpen, onClose, onUpdate, incident, drivers = [] }) => {
  const [form, setForm] = useState({
    type: "accident",
    title: "",
    description: "",
    driverId: "",
    status: "pending"
  });
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  useEffect(() => {
    if (incident) {
      setForm({
        type: incident.type || "accident",
        title: incident.title || "",
        description: incident.description || "",
        driverId: incident.driverId || "",
        status: incident.status || "pending"
      });
      // Store existing files
      setExistingPhotos(incident.photos || []);
      setExistingDocuments(incident.documents || []);
      setPhotos([]);
      setDocuments([]);
    }
  }, [incident]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("status", form.status);
      if (form.driverId) formData.append("driverId", form.driverId);
      formData.append("date", incident.date || new Date().toISOString().split('T')[0]);
      formData.append("time", incident.time || new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }));
      
      // Append existing files that should be kept (as JSON string for reliable parsing)
      formData.append("existingPhotos", JSON.stringify(existingPhotos));
      formData.append("existingDocuments", JSON.stringify(existingDocuments));
      
      // Append new files
      photos.forEach(photo => formData.append("photos", photo));
      documents.forEach(doc => formData.append("documents", doc));
      
      const res = await updateIncidentWithFiles(incident.id, formData);
      onUpdate(res.data);
      onClose();
      toast.success("Incidente atualizado com sucesso");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar incidente");
    } finally {
      setSubmitting(false);
    }
  };

  const removeExistingPhoto = (photoToRemove) => {
    setExistingPhotos(prev => prev.filter(p => p !== photoToRemove));
  };

  const removeExistingDocument = (docToRemove) => {
    setExistingDocuments(prev => prev.filter(d => d !== docToRemove));
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getFileUrl = (filename) => {
    return `${API_URL}/uploads/incidents/${filename}`.replace(`/api/`,'/');
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Incidente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Incidente</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
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
            value={form.driverId}
            onChange={e => setForm({ ...form, driverId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">Selecionar motorista</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="pending">Em análise</option>
            <option value="resolved">Resolvido</option>
            <option value="completed">Concluído</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Fotos</label>
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-slate-400 mb-1">Fotos existentes:</p>
              <div className="grid grid-cols-3 gap-2">
                {existingPhotos.map((photo, index) => (
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
                        removeExistingPhoto(photo);
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
          {photos.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] text-slate-400 mb-1">Novas fotos:</p>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
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
              onChange={(e) => setPhotos(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Documentos</label>
          {/* Existing Documents */}
          {existingDocuments.length > 0 && (
            <div className="space-y-2 mb-2">
              <p className="text-[10px] text-slate-400 mb-1">Documentos existentes:</p>
              {existingDocuments.map((doc, index) => (
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
                    onClick={() => removeExistingDocument(doc)}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shrink-0"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New Documents */}
          {documents.length > 0 && (
            <div className="space-y-2 mb-2">
              <p className="text-[10px] text-slate-400 mb-1">Novos documentos:</p>
              {documents.map((doc, index) => (
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
                    onClick={() => removeDocument(index)}
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
              onChange={(e) => setDocuments(prev => [...prev, ...Array.from(e.target.files)])}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? "A atualizar..." : "Atualizar"}
          </button>
        </div>
      </form>

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
    </Modal>
  );
};

// Delete Confirmation Modal
const DeleteIncidentModal = ({ isOpen, onClose, onConfirm, incident }) => {
  if (!incident) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Remover Incidente">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="alertTriangle" size={24} className="text-red-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Remover Incidente</h3>
          <p className="text-sm text-slate-500 mt-1">
            Tem certeza que deseja remover <strong>{incident.title}</strong>? Esta ação não pode ser revertida.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">
            Remover
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Incident Detail Modal
const IncidentDetailModal = ({ isOpen, onClose, incident }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  if (!incident) return null;

  const getIncidentColor = (type) => {
    switch(type) {
      case "accident": return "bg-red-100 text-red-700";
      case "breakdown": return "bg-orange-100 text-orange-700";
      case "delivery_issue": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "pending": return "Em análise";
      case "resolved": return "Resolvido";
      case "completed": return "Concluído";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-700";
      case "resolved": return "bg-green-100 text-green-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  const getFileUrl = (filename) => {
    return `${API_URL}/uploads/incidents/${filename}`.replace(`/api/`,'/');
  };

  const openPhotoViewer = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoViewer(true);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={incident.title}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(incident.type)}`}>
              {INCIDENT_TYPE_LABELS[incident.type] || incident.type}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(incident.status)}`}>
              {getStatusLabel(incident.status)}
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
              <span className="text-xs text-slate-600">
                {typeof incident.driver === 'string' ? incident.driver : incident.driver?.name || incident.driverId || "Motorista"}
              </span>
            </div>
          </div>
          
          {(incident.photos && incident.photos.length > 0) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Fotos Anexadas ({incident.photos.length})</p>
              <div className="grid grid-cols-3 gap-2">
                {incident.photos.map((photo, i) => (
                  <div 
                    key={i} 
                    className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 cursor-pointer group"
                    onClick={() => openPhotoViewer(photo)}
                  >
                    <img
                      src={getFileUrl(photo)}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="eye" size={24} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(incident.documents && incident.documents.length > 0) && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Documentos ({incident.documents.length})</p>
              <div className="space-y-2">
                {incident.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={getFileUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <Icon name="file" size={18} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc}</p>
                    </div>
                    <Icon name="externalLink" size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Photo Viewer Modal */}
      {showPhotoViewer && selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowPhotoViewer(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowPhotoViewer(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <Icon name="x" size={28} />
            </button>
            <img
              src={getFileUrl(selectedPhoto)}
              alt="Visualização da foto"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

const AdminIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilterState] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const sentinelRef = useRef(null);
  
  const filters = ["Todos", "Acidente", "Avaria", "Problema Entrega"];
  const typeFilter = filter === "Todos" ? null : INCIDENT_TYPE_MAP[filter];
  const filtered = filter === "Todos" ? incidents : incidents.filter(i => i.type === typeFilter);

  const fetchIncidents = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const params = { page: pageNum, limit: 20 };
      if (typeFilter) {
        params.type = typeFilter;
      }
      
      const response = await getIncidents(params);
      const newIncidents = response.data?.incidents || response.data || [];
      
      if (append) {
        setIncidents(prev => [...prev, ...newIncidents]);
      } else {
        setIncidents(newIncidents);
      }
      setHasMore(response.data?.pagination?.currentPage < response.data?.pagination?.pages);
    } catch (error) {
      toast.error("Erro ao carregar incidentes");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setIncidents([]);
    fetchIncidents(1, false);
  }, [typeFilter, fetchIncidents]);

  const fetchNextPage = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchIncidents(nextPage, true);
  }, [hasMore, loadingMore, loading, page, fetchIncidents]);

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

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversRes = await client.get('/drivers');
        setDrivers(driversRes.data);
      } catch (error) {
        // Drivers fetch error - silent fail
      }
    };
    fetchDrivers();
  }, []);

  const handleAddIncident = (newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const handleUpdateIncident = (updatedIncident) => {
    setIncidents(prev => prev.map(i => i.id === updatedIncident.id ? updatedIncident : i));
  };

  const handleDeleteIncident = async () => {
    if (!selectedIncident) return;
    try {
      await deleteIncident(selectedIncident.id);
      setIncidents(prev => prev.filter(i => i.id !== selectedIncident.id));
      toast.success("Incidente removido com sucesso");
      setShowDeleteModal(false);
      setSelectedIncident(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover incidente");
    }
  };

  const handleEditClick = (incident) => {
    setSelectedIncident(incident);
    setShowEditModal(true);
  };

  const handleDeleteClick = (incident) => {
    setSelectedIncident(incident);
    setShowDeleteModal(true);
  };

  const setFilter = (label) => {
    setFilterState(label);
  };

  const getIncidentColor = (type) => {
    switch(type) {
      case "accident": return "bg-red-100 text-red-700";
      case "breakdown": return "bg-orange-100 text-orange-700";
      case "delivery_issue": return "bg-blue-100 text-blue-700";
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
      <AddIncidentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddIncident} drivers={drivers} />
      <EditIncidentModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} onUpdate={handleUpdateIncident} incident={selectedIncident} drivers={drivers} />
      <IncidentDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} incident={selectedIncident} />
      <DeleteIncidentModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteIncident} incident={selectedIncident} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar incidentes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10">
          <Icon name="alertTriangle" size={32} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum incidente registado</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map(i => (
              <div key={i.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(i.type)}`}>
                      {INCIDENT_TYPE_LABELS[i.type] || i.type}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i.status === "pending" ? "bg-amber-100 text-amber-700" : i.status === "resolved" ? "bg-green-100 text-green-700" : i.status === "completed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                      {i.status === "pending" ? "Em análise" : i.status === "resolved" ? "Resolvido" : i.status === "completed" ? "Concluído" : i.status === "cancelled" ? "Cancelado" : i.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{i.date} {i.time}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">{i.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{i.description}</p>
                {(i.photos && i.photos.length > 0) && (
                  <div className="flex gap-1 mt-2">
                    <Icon name="image" size={14} className="text-slate-400" />
                    <span className="text-[10px] text-slate-400">{i.photos.length} foto(s)</span>
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400">
                    {typeof i.driver === 'string' ? i.driver : i.driver?.name || i.driverId || "Motorista"}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEditClick(i)} className="text-xs text-blue-500 font-medium flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <Icon name="edit" size={12} /> Editar
                    </button>
                    <button onClick={() => handleDeleteClick(i)} className="text-xs text-red-500 font-medium flex items-center gap-1 hover:text-red-600 transition-colors">
                      <Icon name="trash" size={12} /> Remover
                    </button>
                    <button onClick={() => { setSelectedIncident(i); setShowDetailModal(true); }} className="text-xs text-orange-500 font-medium hover:text-orange-600 transition-colors">
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {loadingMore && (
            <div className="text-center py-4">
              <Icon name="refreshCw" size={20} className="text-slate-400 mx-auto animate-spin" />
            </div>
          )}
          <div ref={sentinelRef} className="h-1" />
        </>
      )}
    </div>
  );
};

export default AdminIncidents;