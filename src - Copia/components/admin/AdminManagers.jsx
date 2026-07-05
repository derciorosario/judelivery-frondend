import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { createManager, updateManager, deleteManager, getManagers } from "../../api/client";
import { toast } from "../../lib/toast";

const AddManagerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", password: "" });
      setAutoGeneratePassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    // If not auto-generating, password is required
    if (!autoGeneratePassword && !form.password) return;
    
    setIsSubmitting(true);
    
    // Prepare data to send: exclude password if auto-generating
    const requestData = {
      name: form.name,
      phone: form.phone,
      email: form.email
    };
    if (!autoGeneratePassword) {
      requestData.password = form.password;
    }
    
    try {
      const response = await createManager(requestData);
      onAdd(response.data);
      onClose();
      setForm({ name: "", phone: "", email: "", password: "" });
      setAutoGeneratePassword(false);
      toast.success("Gestor criado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao criar gestor";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error creating manager:", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Gestor">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {!autoGeneratePassword && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Palavra-passe</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Ex: password123"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="auto-gen-pass"
            checked={autoGeneratePassword}
            onChange={(e) => setAutoGeneratePassword(e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
          />
          <label for="auto-gen-pass" className="text-sm font-semibold text-slate-500">
            Gerar palavra-passe automaticamente
          </label>
        </div>
<div className="flex gap-2 pt-2">
           <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
             Cancelar
           </button>
           <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
             {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : null}
             {isSubmitting ? "Criando..." : "Criar Gestor"}
           </button>
         </div>
      </form>
    </Modal>
  );
};

const EditManagerModal = ({ isOpen, onClose, onEdit, manager }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (manager) {
      setForm({
        name: manager.name || "",
        phone: manager.phone || "",
        email: manager.email || "",
        password: ""
      });
    }
  }, [manager]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", password: "" });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    
    setIsSubmitting(true);

    // Prepare data to send
    const requestData = {
      name: form.name,
      phone: form.phone,
      email: form.email
    };
    // Only include password if provided (to avoid overwriting with empty string)
    if (form.password) {
      requestData.password = form.password;
    }

    try {
      const response = await updateManager(manager.id, requestData);
      onEdit(response.data, manager.id);
      onClose();
      setForm({ name: "", phone: "", email: "", password: "" });
      toast.success("Gestor atualizado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao atualizar gestor";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error updating manager:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Gestor">
      <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nova Palavra-passe (deixe em branco para manter)</label>
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Ex: password123"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
<div className="flex gap-2 pt-2">
           <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
             Cancelar
           </button>
           <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
             {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : null}
             {isSubmitting ? "Atualizando..." : "Atualizar Gestor"}
           </button>
         </div>
      </form>
    </Modal>
  );
};

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editManager, setEditManager] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => {
      const fetchManagers = async () => {
        try {
          const response = await getManagers();
          setManagers(response.data);
        } catch (error) {
          let errorMessage = "Erro ao carregar gestores";
          if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
          toast.error(errorMessage);
          console.error("Error fetching managers:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchManagers();
    }, []);

  const handleAddManager = (newManager) => {
    setManagers([...managers, newManager]);
  };

    const handleToggleStatus = async (manager) => {
    try {
      const updatedManager = { ...manager, status: manager.status === "active" ? "inactive" : "active" };
      await updateManager(manager.id, updatedManager);
      setManagers(managers.map(m => m.id === manager.id ? { ...m, status: updatedManager.status } : m));
      toast.success("Status atualizado com sucesso");
    } catch (error) {
      let errorMessage = "Erro ao atualizar status";
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      console.error("Error updating manager:", error);
    }
    };

    const handleDelete = async (manager) => {
      setDeleteTarget(manager);
    };

    const confirmDelete = async () => {
      if (!deleteTarget) return;
      try {
        await deleteManager(deleteTarget.id);
        setManagers(managers.filter(m => m.id !== deleteTarget.id));
        toast.success("Gestor removido com sucesso");
      } catch (error) {
        let errorMessage = "Erro ao remover gestor";
        if (error.response && error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
        toast.error(errorMessage);
        console.error("Error deleting manager:", error);
      } finally {
        setDeleteTarget(null);
      }
    };

    const handleEditManager = (updatedManager, originalId) => {
      setManagers(prev => {
        // If the original manager was deleted (merged with existing user)
        const filtered = originalId !== updatedManager.id ? prev.filter(m => m.id !== originalId) : prev;
        const exists = filtered.some(m => m.id === updatedManager.id);
        if (exists) {
          return filtered.map(m => m.id === updatedManager.id ? updatedManager : m);
        }
        return [...filtered, updatedManager];
      });
    };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestores</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
         <AddManagerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddManager} />
         <EditManagerModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditManager(null); }} onEdit={handleEditManager} manager={editManager} />

         {loading ? (
           <div className="text-center py-10">
             <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
             <p className="text-sm text-slate-500">A carregar gestores...</p>
           </div>
         ) : deleteTarget ? (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
             <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
               <div className="text-center mb-4">
                 <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Icon name="alertTriangle" size={24} className="text-red-600" />
                 </div>
                 <h3 className="text-base font-bold text-slate-800">Remover Gestor</h3>
                 <p className="text-sm text-slate-500 mt-1">Tem certeza que deseja remover <strong>{deleteTarget.name}</strong>? Esta ação não pode ser revertida.</p>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Cancelar</button>
                 <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600">Remover</button>
               </div>
             </div>
           </div>
         ) : managers.length === 0 ? (
           <div className="text-center py-10">
             <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
               <Icon name="users" size={28} className="text-slate-400" />
             </div>
             <p className="text-sm font-semibold text-slate-500">Nenhum gestor registado</p>
             <p className="text-xs text-slate-400 mt-1">Comece por adicionar um novo gestor.</p>
           </div>
         ) : (
         managers.map(m => (
           <div key={m.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
             <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                   <Icon name="users" size={20} className="text-orange-600" />
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                   <p className="text-xs text-slate-400">{m.email}</p>
                 </div>
               </div>
               <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                 {m.status === "active" ? "Ativo" : "Inativo"}
               </span>
             </div>
             <div className="flex items-center justify-between pt-2 border-t border-slate-50">
               <div className="flex items-center gap-3">
                 <div className="text-center">
                   <p className="text-sm font-bold text-slate-800">{m.phone || "—"}</p>
                   <p className="text-[11px] text-slate-400">Telefone</p>
                 </div>
               </div>
               <div className="flex gap-1">
                 <button
                   onClick={() => {
                     setEditManager(m);
                     setShowEditModal(true);
                   }}
                   className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700"
                   title="Editar"
                 >
                   <Icon name="edit" size={14} />
                 </button>

                 <button
                   onClick={() => handleToggleStatus(m)}
                   className={`p-1.5 rounded-lg text-xs font-semibold ${m.status === "active" ? "bg-red-100 text-red-700 hover-bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                   title={m.status === "active" ? "Desativar" : "Ativar"}
                 >
                   {m.status === "active" ? "Desativar" : "Ativar"}
                 </button>

                  <button
                    onClick={() => handleDelete(m)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-700"
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

export default AdminManagers;