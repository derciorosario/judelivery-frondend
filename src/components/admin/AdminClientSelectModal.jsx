import { useState, useEffect } from "react";
import Modal from "../common/Modal";
import Icon from "../common/Icon";
import { getCustomers, createCustomer } from "../../api/client";
import { toast } from "../../lib/toast";

const AdminClientSelectModal = ({ isOpen, onClose, onSelect, selectedClient }) => {

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [creating, setCreating] = useState(false);

  console.log({selectedClient, customers})

  useEffect(() => {
    if (isOpen) {
      setShowCreate(false);
      setLoading(true);
      getCustomers().then(res => {
        setCustomers(res.data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [isOpen]);

  // Filter customers excluding the selected client
  const filtered = customers.filter(c =>
    (selectedClient?.id !== c.id) && // Exclude selected client
    (c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("phone", newPhone);
      formData.append("email", newEmail || `${newPhone}@temp.local`);
      const res = await createCustomer(formData);
      onSelect(res.data);
      onClose();
      toast.success("Cliente criado com sucesso");
      setNewName("");
      setNewPhone("");
      setNewEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao criar cliente");
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = (customer) => {
    onSelect(customer);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Selecionar Cliente">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        {showCreate ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nome *</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone *</label>
              <input
                type="tel"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                placeholder="+258 84 000 0000"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={creating} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
                {creating ? <Icon name="refreshCw" size={16} className="animate-spin" /> : <Icon name="plus" size={16} />}
                {creating ? "Criando..." : "Criar e Selecionar"}
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Selected Client Display */}
            {selectedClient && (
              <div className="mb-4 p-3 rounded-xl bg-orange-50 border border-orange-200">
                <label className="block text-xs font-semibold text-orange-600 mb-2">Cliente Selecionado</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-200 flex items-center justify-center shrink-0">
                    <Icon name="user" size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{selectedClient.name}</p>
                    <p className="text-xs text-slate-500 truncate">{selectedClient.phone} {selectedClient.email ? `• ${selectedClient.email}` : ""}</p>
                  </div>
                  <button
                    onClick={() => onSelect(null)}
                    className="p-1.5 hover:bg-orange-200 rounded-lg transition-colors"
                    title="Remover cliente"
                  >
                    <Icon name="x" size={16} className="text-orange-600" />
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Pesquisar cliente</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Icon name="search" size={16} />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pesquisar por nome, telefone ou email..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-xs text-slate-500">A carregar...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-6">
                <Icon name="users" size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  {search ? "Nenhum cliente encontrado" : "Nenhum cliente disponível"}
                </p>
                {search && (
                  <p className="text-xs text-slate-400 mt-1">
                    Tente outros termos ou adicione um novo cliente
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filtered.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Icon name="user" size={20} className="text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.phone} {c.email ? `• ${c.email}` : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 font-semibold text-sm hover:border-orange-300 hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="plus" size={16} /> Novo Cliente
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default AdminClientSelectModal;