import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../../api/client";
import { toast } from "../../lib/toast";
import ImageViewer from "../common/ImageViewer";


const FileUploadInput = ({ label, setViewerOpen, setSelectedImage, fieldName, file, onFileChange, onRemove, existingUrl, accept = "image/*,.pdf", isProfile = false, isRemoved = false }) => {
  const hasFile = !!file;
  const hasExisting = !!existingUrl && !file && !isRemoved;

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i;
    return imageExtensions.test(url);
  };

  const handleOpenFile = (fileUrl) => {
    if (isImageFile(fileUrl)) {
      setSelectedImage(fileUrl);
      setViewerOpen(true);
    } else {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isProfile) {
    const previewUrl = file ? URL.createObjectURL(file) : (isRemoved ? null : existingUrl);
    
    return (
      <div className="flex flex-col items-center">
        <label className="text-xs font-semibold text-slate-500 mb-2">{label}</label>
        <div className="relative">
          <input
            type="file"
            id={fieldName}
            accept={accept}
            onChange={(e) => onFileChange(fieldName, e)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-200 bg-orange-50 flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Icon name="camera" size={32} className="text-orange-500" />
            )}
          </div>
        </div>
        {(hasFile || hasExisting) && (
          <button
            type="button"
            onClick={() => onRemove && onRemove(fieldName)}
            className="mt-2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Remover foto"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="file"
            id={fieldName}
            accept={accept}
            onChange={(e) => onFileChange(fieldName, e)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
            hasFile || hasExisting
              ? "bg-orange-50 border-orange-200"
              : "bg-white border-slate-200 hover:bg-slate-50"
          } cursor-pointer`}>
            <div className="flex items-center gap-2">
              <Icon name={hasFile || hasExisting ? "checkCircle" : "upload"} size={16} className={hasFile || hasExisting ? "text-green-500" : "text-orange-500"} />
              <span className="text-slate-600 text-xs truncate max-w-[150px]">
                {hasFile ? file.name : hasExisting ? "Documento" : "Selecionar"}
              </span>
            </div>
            <Icon name="chevronRight" size={14} className="text-slate-400" />
          </div>
        </div>
        {(hasFile || hasExisting) && (
          <button
            type="button"
            onClick={() => onRemove && onRemove(fieldName)}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Remover"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>
   
      {hasExisting && !hasFile && (
        <div 
          onClick={() => handleOpenFile(existingUrl)} 
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Icon name="externalLink" size={12} />
          Visualizar
        </div>
      )}
    </div>
  );
};

const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: ""
  });
  const [files, setFiles] = useState({
    profilePhoto: null
  });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", address: "", password: "" });
      setFiles({ profilePhoto: null });
      setAutoGeneratePassword(true);
    }
  }, [isOpen]);

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setFiles(prev => ({ ...prev, [fieldName]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('address', form.address || '');
    if (!autoGeneratePassword && form.password) {
      formData.append('password', form.password);
    }
    
    if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);

    try {
      const response = await createCustomer(formData);
      onAdd(response.data);
      onClose();
      setForm({ name: "", phone: "", email: "", address: "", password: "" });
      setFiles({ profilePhoto: null });
      toast.success("Cliente criado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao criar cliente";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error creating customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Cliente">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <FileUploadInput
          label="Foto"
          fieldName="profilePhoto"
          file={files.profilePhoto}
          onFileChange={handleFileChange}
          onRemove={handleRemoveFile}
          accept="image/*"
          isProfile={true}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: João Silva"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+258 84 000 0000"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="auto-gen-pass"
            checked={autoGeneratePassword}
            onChange={(e) => setAutoGeneratePassword(e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label htmlFor="auto-gen-pass" className="text-sm text-slate-600">
            Gerar password automaticamente
          </label>
        </div>

        {!autoGeneratePassword && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="********"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Bairro, Rua, Nº"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
            {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : <Icon name="plus" size={16} />}
            {isSubmitting ? "Criando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EditCustomerModal = ({ isOpen, onClose, onEdit, customer, setSelectedImage, setViewerOpen }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: ""
  });
  const [files, setFiles] = useState({
    profilePhoto: null
  });
  const [filesToRemove, setFilesToRemove] = useState({
    profilePhoto: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      setForm({
        name: customer.name || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
        password: ""
      });
      setFiles({ profilePhoto: null });
      setFilesToRemove({ profilePhoto: false });
    }
  }, [customer, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", address: "", password: "" });
      setFiles({ profilePhoto: null });
      setFilesToRemove({ profilePhoto: false });
    }
  }, [isOpen]);

  const handleRemoveFile = (fieldName) => {
    setFilesToRemove(prev => ({ ...prev, [fieldName]: true }));
    setFiles(prev => ({ ...prev, [fieldName]: null }));
  };

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [fieldName]: file }));
      setFilesToRemove(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('email', form.email);
    formData.append('address', form.address || '');
    if (form.password) formData.append('password', form.password);
    
    if (files.profilePhoto) {
      formData.append('profilePhoto', files.profilePhoto);
    } else if (filesToRemove.profilePhoto) {
      formData.append('removeProfilePhoto', 'true');
    }

    try {
      const response = await updateCustomer(customer.id, formData);
      onEdit(response.data);
      onClose();
      toast.success("Cliente atualizado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao atualizar cliente";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error updating customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cliente">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <FileUploadInput
          label="Foto"
          setSelectedImage={setSelectedImage} 
          setViewerOpen={setViewerOpen}
          fieldName="profilePhoto"
          file={files.profilePhoto}
          onFileChange={handleFileChange}
          onRemove={handleRemoveFile}
          existingUrl={customer.profilePhotoUrl}
          isRemoved={filesToRemove.profilePhoto}
          accept="image/*"
          isProfile={true}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: João Silva"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="+258 84 000 0000"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="email@exemplo.com"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nova Password</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Deixe em branco para manter"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Bairro, Rua, Nº"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
            {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : <Icon name="save" size={16} />}
            {isSubmitting ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getCustomers();
        setCustomers(response.data);
      } catch (error) {
        let errorMessage = "Erro ao carregar clientes";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const handleAddCustomer = (newCustomer) => {
    setCustomers([...customers, newCustomer]);
  };

  const handleEditCustomer = (updatedCustomer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const handleDeleteClick = (customer) => {
    setDeleteTarget(customer);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCustomer(deleteTarget.id);
      setCustomers(customers.filter(c => c.id !== deleteTarget.id));
      toast.success("Cliente removido com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao remover cliente";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error deleting customer:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      {viewerOpen && selectedImage && (
        <ImageViewer isOpen={viewerOpen} onClose={() => setViewerOpen(false)} imageUrl={selectedImage} />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Clientes</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300 transition-colors hover:bg-orange-600">
          <Icon name="plus" size={14} /> Adicionar
        </button>
      </div>
      
      <AddCustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCustomer} />
      <EditCustomerModal 
        setSelectedImage={setSelectedImage} 
        setViewerOpen={setViewerOpen} 
        isOpen={showEditModal} 
        onClose={() => { 
          setShowEditModal(false); 
          setEditCustomer(null); 
        }} 
        onEdit={handleEditCustomer} 
        customer={editCustomer} 
      />
      
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar clientes...</p>
        </div>
      ) : deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Cliente</h3>
              <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja remover <strong>{deleteTarget.name}</strong>? Esta ação não pode ser revertida.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="users" size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Nenhum cliente registado</p>
          <p className="text-xs text-slate-400 mt-1">Comece por adicionar um novo cliente.</p>
        </div>
      ) : (
        customers.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {c.profilePhotoUrl ? (
                  <img src={c.profilePhotoUrl} alt={c.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Icon name="user" size={20} className="text-orange-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-800">{c.ordersCount ?? 0}</p>
                  <p className="text-[11px] text-slate-400">Pedidos</p>
                </div>
                <div className="flex items-center gap-0.5 text-sm font-bold text-slate-700">
                  {c.rating ?? "—"}<Icon name="star" size={12} className="text-amber-400" />
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setEditCustomer(c); setShowEditModal(true); }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  title="Editar"
                >
                  <Icon name="edit" size={14} />
                </button>
                <button
                  onClick={() => handleDeleteClick(c)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                  title="Remover"
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminCustomers;