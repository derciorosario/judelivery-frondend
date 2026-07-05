import { useState, useEffect } from "react";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Icon from "../common/Icon";
import { toast } from "../../lib/toast";
import {
  getFinancialCategories,
  createFinancialCategory,
  updateFinancialCategory,
  deleteFinancialCategory,
  getFinancialTransactions,
  createFinancialTransaction,
  updateFinancialTransaction,
  deleteFinancialTransaction,
  markTransactionAsPaid,
  getFinancialStats
} from "../../api/client";

const AddCategoryForm = ({ onSubmit, onClose, editingCategory }) => {
  const [form, setForm] = useState({
    name: "",
    type: "receita",
    description: "",
    color: "#f97316"
  });

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        type: editingCategory.type,
        description: editingCategory.description || "",
        color: editingCategory.color || "#f97316"
      });
    }
  }, [editingCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Nome da Categoria</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          placeholder="Ex: Combustível"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
        <select
          value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição (opcional)</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Descrição da categoria"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Cor</label>
        <input
          type="color"
          value={form.color}
          onChange={e => setForm({...form, color: e.target.value})}
          className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold">
          {editingCategory ? 'Atualizar Categoria' : 'Criar Categoria'}
        </button>
      </div>
    </form>
  );
};

const AddExpenseForm = ({ categories, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    categoryId: categories.find(c => c.type === 'despesa')?.id || "",
    description: "",
    amount: "",
    paymentMethod: "Dinheiro",
    driverId: null,
    clientId: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.categoryId) return;
    onSubmit({ ...form, type: "despesa" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
        <select
          value={form.categoryId}
          onChange={e => setForm({...form, categoryId: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        >
          <option value="">Selecionar categoria</option>
          {categories.filter(c => c.type === 'despesa').map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Ex: Abastecimento veículo"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
        <input
          type="number"
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento</label>
        <select
          value={form.paymentMethod}
          onChange={e => setForm({...form, paymentMethod: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        >
          <option value="Dinheiro">Dinheiro</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="E-Mola">E-Mola</option>
          <option value="Cartão">Cartão</option>
          <option value="Transferência Bancária">Transferência Bancária</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({...form, date: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Observações (opcional)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
          placeholder="Notas adicionais..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold">Registrar Despesa</button>
      </div>
    </form>
  );
};

const AddRevenueForm = ({ categories, onSubmit, onClose }) => {
  const [form, setForm] = useState({
    categoryId: categories.find(c => c.type === 'receita')?.id || "",
    description: "",
    amount: "",
    paymentMethod: "Dinheiro",
    driverId: null,
    clientId: null,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.categoryId) return;
    onSubmit({ ...form, type: "receita" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
        <select
          value={form.categoryId}
          onChange={e => setForm({...form, categoryId: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        >
          <option value="">Selecionar categoria</option>
          {categories.filter(c => c.type === 'receita').map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
        <input
          type="text"
          value={form.description}
          onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Ex: Entrega #001"
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
        <input
          type="number"
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento</label>
        <select
          value={form.paymentMethod}
          onChange={e => setForm({...form, paymentMethod: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        >
          <option value="Dinheiro">Dinheiro</option>
          <option value="M-Pesa">M-Pesa</option>
          <option value="E-Mola">E-Mola</option>
          <option value="Cartão">Cartão</option>
          <option value="Transferência Bancária">Transferência Bancária</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Data</label>
        <input
          type="date"
          value={form.date}
          onChange={e => setForm({...form, date: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Observações (opcional)</label>
        <textarea
          value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
          placeholder="Notas adicionais..."
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none"
        />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-bold">Registrar Receita</button>
      </div>
    </form>
  );
};

const EditTransactionModal = ({ isOpen, onClose, transaction, categories, onSave }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (transaction) {
      setForm({
        ...transaction,
        categoryId: transaction.categoryId || categories.find(c => c.type === transaction.type)?.id || ""
      });
    }
  }, [transaction, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Transação">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
          <select
            value={form.type || "receita"}
            onChange={e => setForm({...form, type: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
          <select
            value={form.categoryId || ""}
            onChange={e => setForm({...form, categoryId: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            required
          >
            <option value="">Selecionar categoria</option>
            {categories.filter(c => c.type === form.type).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <input
            type="text"
            value={form.description || ""}
            onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
          <input
            type="number"
            value={form.amount || ""}
            onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
          <select
            value={form.status || "pago"}
            onChange={e => setForm({...form, status: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento</label>
          <select
            value={form.paymentMethod || "Dinheiro"}
            onChange={e => setForm({...form, paymentMethod: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          >
            <option value="Dinheiro">Dinheiro</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="E-Mola">E-Mola</option>
            <option value="Cartão">Cartão</option>
            <option value="Transferência Bancária">Transferência Bancária</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold">Salvar</button>
        </div>
      </form>
    </Modal>
  );
};

// Category Management Component
const CategoryManagement = ({ categories, onAddCategory, onEditCategory, onDeleteCategory }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todas");
  const [editingCategory, setEditingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cat.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesType = filterType === "todas" || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  const revenueCategories = filteredCategories.filter(c => c.type === 'receita');
  const expenseCategories = filteredCategories.filter(c => c.type === 'despesa');

  const handleDelete = (category) => {
    setDeleteTarget(category);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteCategory(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowAddModal(true);
  };

  const handleAddSubmit = (formData) => {
    if (editingCategory) {
      onEditCategory(editingCategory.id, formData);
    } else {
      onAddCategory(formData);
    }
    setShowAddModal(false);
    setEditingCategory(null);
  };

  return (
    <>
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500">Gerenciar Categorias</p>
            <p className="text-sm text-slate-700 mt-1">
              {categories.length} categorias · {categories.filter(c => c.type === 'receita').length} receitas · {categories.filter(c => c.type === 'despesa').length} despesas
            </p>
          </div>
          <button 
            onClick={() => {
              setEditingCategory(null);
              setShowAddModal(true);
            }} 
            className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors flex items-center gap-1"
          >
            <Icon name="plus" size={14} />
            Nova Categoria
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar categorias..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            <option value="todas">Todas</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        {/* Category Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="folder" size={48} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhuma categoria encontrada</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-xs text-orange-500 mt-1">
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Revenue Categories */}
            {filterType === "todas" || filterType === "receita" ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="arrowUp" size={14} className="text-green-500" />
                  <span className="text-xs font-semibold text-slate-500">Receitas ({revenueCategories.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {revenueCategories.map(cat => (
                    <CategoryCard 
                      key={cat.id} 
                      category={cat} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Expense Categories */}
            {filterType === "todas" || filterType === "despesa" ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="arrowDown" size={14} className="text-red-500" />
                  <span className="text-xs font-semibold text-slate-500">Despesas ({expenseCategories.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {expenseCategories.map(cat => (
                    <CategoryCard 
                      key={cat.id} 
                      category={cat} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          setEditingCategory(null);
        }} 
        title={editingCategory ? "Editar Categoria" : "Nova Categoria"}
      >
        <AddCategoryForm
          onSubmit={handleAddSubmit}
          onClose={() => {
            setShowAddModal(false);
            setEditingCategory(null);
          }}
          editingCategory={editingCategory}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Categoria</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover a categoria <strong>"{deleteTarget.name}"</strong>?
                {deleteTarget.transactionsCount > 0 && (
                  <span className="block mt-1 text-amber-600">
                    ⚠️ Esta categoria tem {deleteTarget.transactionsCount} transações associadas.
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Category Card Component
const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="relative p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: category.color || '#f97316' }}
          />
          <span className="text-sm font-medium text-slate-700 truncate" title={category.name}>
            {category.name}
          </span>
        </div>
        <div className={`flex items-center gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => onEdit(category)} 
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Icon name="edit" size={12} className="text-slate-500" />
          </button>
          <button 
            onClick={() => onDelete(category)} 
            className="p-1 hover:bg-red-50 rounded-lg transition-colors"
            title="Remover"
          >
            <Icon name="trash" size={12} className="text-red-400" />
          </button>
        </div>
      </div>
      {category.description && (
        <p className="text-xs text-slate-400 mt-1 truncate">{category.description}</p>
      )}
      <div className="mt-1">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
          category.type === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {category.type === 'receita' ? 'Receita' : 'Despesa'}
        </span>
      </div>
    </div>
  );
};

const AdminFinance = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await getFinancialCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params = {};
      if (typeFilter !== "todos") params.type = typeFilter;
      if (statusFilter !== "todos") params.status = statusFilter;
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      const response = await getFinancialTransactions(params);
      setTransactions(response.data?.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Erro ao carregar transações");
    }
  };

  const fetchStats = async () => {
    try {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      const response = await getFinancialStats(params);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchTransactions(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [typeFilter, statusFilter, dateRange]);

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (typeFilter !== "todos") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    if (categoryFilter !== "todas") {
      filtered = filtered.filter(t => t.category?.name === categoryFilter);
    }
    if (statusFilter !== "todos") {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (dateRange.start) {
      filtered = filtered.filter(t => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => t.date <= dateRange.end);
    }
    
    return filtered;
  };

  const handleAddCategory = async (formData) => {
    setSubmitting(true);
    try {
      await createFinancialCategory(formData);
      toast.success("Categoria criada com sucesso!");
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao criar categoria");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (id, formData) => {
    setSubmitting(true);
    try {
      await updateFinancialCategory(id, formData);
      toast.success("Categoria atualizada com sucesso!");
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar categoria");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await deleteFinancialCategory(category.id);
      toast.success("Categoria removida com sucesso!");
      await fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover categoria");
    }
  };

  const handleAddTransaction = async (formData) => {
    setSubmitting(true);
    try {
      await createFinancialTransaction(formData);
      toast.success("Transação registada com sucesso!");
      setShowAddExpense(false);
      setShowAddRevenue(false);
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao registar transação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (formData) => {
    setSubmitting(true);
    try {
      await updateFinancialTransaction(selectedTransaction.id, formData);
      toast.success("Transação actualizada com sucesso!");
      setShowEditModal(false);
      setSelectedTransaction(null);
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao actualizar transação");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (transaction) => {
    setDeleteTarget(transaction);
  };

  const confirmDeleteTransaction = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFinancialTransaction(deleteTarget.id);
      toast.success("Transação removida com sucesso!");
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao remover transação");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await markTransactionAsPaid(id);
      toast.success("Transação marcada como paga!");
      await Promise.all([fetchTransactions(), fetchStats()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao actualizar transação");
    }
  };

  const exportToCSV = () => {
    const filtered = filterTransactions();
    const csv = [
      ["ID", "Tipo", "Categoria", "Descrição", "Valor", "Data", "Hora", "Status", "Método Pagamento"],
      ...filtered.map(t => [
        t.id.slice(0, 8),
        t.type === "receita" ? "Receita" : "Despesa",
        t.category?.name || "Sem categoria",
        t.description,
        t.amount,
        t.date,
        t.time || "",
        t.status,
        t.paymentMethod || "—"
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingTransactions = transactions.filter(t => t.status === "pendente");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão Financeira</p>
        <div className="flex gap-1">
          <button onClick={exportToCSV} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" title="Exportar CSV">
            <Icon name="file" size={16} />
          </button>
          <button onClick={() => window.print()} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" title="Exportar PDF">
            <Icon name="printer" size={16} />
          </button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Receita Total" value={`${(stats.totalRevenue || 0).toLocaleString()} MZN`} color="green" />
          <StatCard label="Despesas Totais" value={`${(stats.totalExpenses || 0).toLocaleString()} MZN`} color="red" />
          <StatCard label={`${(stats.netProfit || 0) >= 0 ? "Lucro Líquido" : "Prejuízo Líquido"}`} 
                    value={`${Math.abs(stats.netProfit || 0).toLocaleString()} MZN`} 
                    color={(stats.netProfit || 0) >= 0 ? "green" : "red"} />
          <StatCard label="Pendente Receber" value={`${(stats.pendingRevenue || 0).toLocaleString()} MZN`} color="amber" />
        </div>
      )}

      {(stats?.netProfit || 0) < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <Icon name="alertTriangle" size={18} className="text-red-500" />
          <p className="text-xs text-red-700 flex-1">Atenção: Operação com prejuízo de {Math.abs(stats?.netProfit || 0)} MZN</p>
        </div>
      )}

      {pendingTransactions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={16} className="text-amber-500" />
              <p className="text-xs font-semibold text-amber-700">Pagamentos Pendentes</p>
            </div>
            <button onClick={() => setActiveTab("pending")} className="text-xs text-amber-600 font-medium">Ver todas →</button>
          </div>
          <p className="text-lg font-bold text-amber-700">{pendingTransactions.length} pendentes · {pendingTransactions.reduce((s, p) => s + parseFloat(p.amount), 0).toLocaleString()} MZN</p>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab("list")}
          className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${activeTab === "list" ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Transações
        </button>
        <button 
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${activeTab === "dashboard" ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => setActiveTab("pending")}
          className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${activeTab === "pending" ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Pendentes
          {pendingTransactions.length > 0 && (
            <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {pendingTransactions.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab("categories")}
          className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${activeTab === "categories" ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}
        >
          Categorias
          <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-full">
            {categories.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "categories" && (
        <CategoryManagement 
          categories={categories}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      )}

      {activeTab === "dashboard" && stats && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Receitas vs Despesas</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Receitas</span>
                  <span className="font-semibold text-green-600">{stats.totalRevenue?.toLocaleString()} MZN</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.totalRevenue / Math.max(stats.totalRevenue + stats.totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Despesas</span>
                  <span className="font-semibold text-red-600">{stats.totalExpenses?.toLocaleString()} MZN</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.totalExpenses / Math.max(stats.totalRevenue + stats.totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Despesas por Categoria</p>
            {categories.filter(c => c.type === 'despesa').map(cat => {
              const catData = stats.expensesByCategory?.find(e => e.categoryId === cat.id);
              const total = catData?.total || 0;
              if (total === 0) return null;
              return (
                <div key={cat.id} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{cat.name}</span>
                    <span className="font-semibold text-gray-700">{total.toLocaleString()} MZN</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(total / (stats.totalExpenses || 1)) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Fluxo de Caixa (Últimos 7 dias)</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {stats.dailyData?.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5">
                    <div className="w-full bg-green-400 rounded-t" style={{ height: `${Math.max((day.revenue / Math.max(stats.totalRevenue, 1)) * 100, 2)}px` }} />
                    <div className="w-full bg-red-400 rounded-t" style={{ height: `${Math.max((day.expenses / Math.max(stats.totalExpenses, 1)) * 100, 2)}px` }} />
                  </div>
                  <span className="text-[9px] text-slate-400">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "pending" && (
        <div className="space-y-3">
          {pendingTransactions.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600">{p.type === "receita" ? "Receita Pendente" : "Despesa Pendente"}</span>
                <span className="text-xs font-bold text-amber-600">{parseFloat(p.amount).toLocaleString()} MZN</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{p.description}</p>
              <p className="text-xs text-slate-500 mt-1">{p.category?.name || "Sem categoria"} · {p.paymentMethod || "—"}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleMarkAsPaid(p.id)} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Marcar como Pago</button>
                <button onClick={() => { setSelectedTransaction(p); setShowEditModal(true); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs">Editar</button>
              </div>
            </div>
          ))}
          {pendingTransactions.length === 0 && (
            <div className="text-center py-8">
              <Icon name="checkCircle" size={48} className="text-green-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum pagamento pendente</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "list" && (
        <>
          <div className="bg-white rounded-2xl p-3 border border-slate-100 space-y-2">
            <div className="flex gap-2">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
                <option value="todos">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
                <option value="todos">Todos os status</option>
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200"
                placeholder="Data início"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200"
                placeholder="Data fim"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowAddRevenue(true)} className="flex-1 bg-green-500 text-white text-xs font-semibold py-2.5 rounded-xl">
              + Nova Receita
            </button>
            <button onClick={() => setShowAddExpense(true)} className="flex-1 bg-red-500 text-white text-xs font-semibold py-2.5 rounded-xl">
              + Nova Despesa
            </button>
          </div>

          <div className="space-y-2">
            {filterTransactions().map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${t.type === "receita" ? "bg-green-400" : "bg-red-400"}`} />
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.type === "receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {t.type === "receita" ? "Receita" : "Despesa"}
                    </span>
                    <span className="text-xs text-slate-400">{t.category?.name || "Sem categoria"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {t.status === "pendente" && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendente</span>}
                    <button onClick={() => { setSelectedTransaction(t); setShowEditModal(true); }} className="p-1">
                      <Icon name="edit" size={14} className="text-slate-400" />
                    </button>
                    <button onClick={() => handleDeleteClick(t)} className="p-1">
                      <Icon name="trash" size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800">{t.description}</p>
                <p className="text-lg font-bold mt-1 text-gray-700">{parseFloat(t.amount).toLocaleString()} MZN</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                  <span className="text-xs text-slate-400">{t.date} {t.time || ""}</span>
                  {t.paymentMethod && <span className="text-xs text-slate-400">{t.paymentMethod}</span>}
                </div>
              </div>
            ))}
            {filterTransactions().length === 0 && (
              <div className="text-center py-8">
                <Icon name="file" size={48} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhuma transação encontrada</p>
              </div>
            )}
          </div>
        </>
      )}

      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Nova Despesa">
        <AddExpenseForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onClose={() => setShowAddExpense(false)}
        />
      </Modal>

      <Modal isOpen={showAddRevenue} onClose={() => setShowAddRevenue(false)} title="Nova Receita">
        <AddRevenueForm
          categories={categories}
          onSubmit={handleAddTransaction}
          onClose={() => setShowAddRevenue(false)}
        />
      </Modal>

      {/* Delete Transaction Confirmation */}
      {deleteTarget && deleteTarget.type !== 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Transação</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover a transação <strong>"{deleteTarget.description}"</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTransaction}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      <EditTransactionModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedTransaction(null); }}
        transaction={selectedTransaction}
        categories={categories}
        onSave={handleUpdateTransaction}
      />
    </div>
  );
};

export default AdminFinance;
