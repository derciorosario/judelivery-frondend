import { useState, useEffect } from "react";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Icon from "../common/Icon";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, FINANCIAL_TRANSACTIONS, DRIVERS, CUSTOMERS } from "../../data/mockData";

// Add Expense Form Component
const AddExpenseForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    category: "Combustível",
    description: "",
    amount: "",
    driver: "",
    paymentMethod: "Dinheiro"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-orange-400">
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
        <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Ex: Abastecimento veículo" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
        <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista (opcional)</label>
        <select value={form.driver} onChange={e => setForm({...form, driver: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Selecionar motorista</option>
          {DRIVERS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento</label>
        <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => onSubmit(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold">Registrar Despesa</button>
      </div>
    </form>
  );
};

// Add Revenue Form Component
const AddRevenueForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    category: "Entregas",
    description: "",
    amount: "",
    client: "",
    driver: "",
    paymentMethod: "Dinheiro"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="Entregas">Entregas</option>
          <option value="Assinaturas">Assinaturas</option>
          <option value="Taxas">Taxas</option>
          <option value="Outros">Outros</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
        <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
          placeholder="Ex: Entrega #001" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
        <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente</label>
        <select value={form.client} onChange={e => setForm({...form, client: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Selecionar cliente</option>
          {CUSTOMERS.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
        <select value={form.driver} onChange={e => setForm({...form, driver: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          <option value="">Selecionar motorista</option>
          {DRIVERS.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Método de Pagamento</label>
        <select value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => onSubmit(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600">Cancelar</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl bg-green-500 text-white font-bold">Registrar Receita</button>
      </div>
    </form>
  );
};

// Edit Transaction Modal
const EditTransactionModal = ({ isOpen, onClose, transaction, onSave }) => {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (transaction) {
      setForm(transaction);
    }
  }, [transaction]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Transação">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <input type="text" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Valor (MZN)</label>
          <input type="number" value={form.amount || ""} onChange={e => setForm({...form, amount: parseInt(e.target.value)})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
          <select value={form.status || "pago"} onChange={e => setForm({...form, status: e.target.value})}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm">
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
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

const AdminFinance = () => {
  const [transactions, setTransactions] = useState(FINANCIAL_TRANSACTIONS);
  const [typeFilter, setTypeFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [driverFilter, setDriverFilter] = useState("todos");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [pendingPayments, setPendingPayments] = useState(
    FINANCIAL_TRANSACTIONS.filter(t => t.status === "pendente")
  );

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    if (typeFilter !== "todos") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    if (categoryFilter !== "todas") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    if (driverFilter !== "todos") {
      filtered = filtered.filter(t => t.driver === driverFilter);
    }
    if (dateRange.start) {
      filtered = filtered.filter(t => t.date >= dateRange.start);
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => t.date <= dateRange.end);
    }
    
    return filtered;
  };

  const stats = {
    totalRevenue: transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: transactions.filter(t => t.type === "despesa" && t.status === "pago").reduce((sum, t) => sum + t.amount, 0),
    pendingRevenue: transactions.filter(t => t.type === "receita" && t.status === "pendente").reduce((sum, t) => sum + t.amount, 0),
    pendingExpenses: transactions.filter(t => t.type === "despesa" && t.status === "pendente").reduce((sum, t) => sum + t.amount, 0),
    netProfit: transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((sum, t) => sum + t.amount, 0) - 
               transactions.filter(t => t.type === "despesa" && t.status === "pago").reduce((sum, t) => sum + t.amount, 0),
    driverCommissions: transactions.filter(t => t.type === "receita" && t.status === "pago").reduce((sum, t) => sum + (t.amount * 0.2), 0)
  };

  const addTransaction = (transaction, type) => {
    const newTransaction = {
      id: transactions.length + 1,
      ...transaction,
      type: type,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      status: "pago"
    };
    setTransactions([newTransaction, ...transactions]);
    if (type === "despesa" && transaction.amount > 500) {
      alert(`⚠️ Atenção: Despesa elevada de ${transaction.amount} MZN em ${transaction.category}`);
    }
  };

  const updateTransaction = (updated) => {
    const index = transactions.findIndex(t => t.id === updated.id);
    if (index !== -1) {
      const newTransactions = [...transactions];
      newTransactions[index] = updated;
      setTransactions(newTransactions);
    }
  };

  const deleteTransaction = (id) => {
    if (confirm("Tem certeza que deseja remover esta transação?")) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const markAsPaid = (id) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, status: "pago" } : t
    ));
    setPendingPayments(pendingPayments.filter(p => p.id !== id));
  };

  const exportToCSV = () => {
    const filtered = filterTransactions();
    const csv = [
      ["ID", "Tipo", "Categoria", "Descrição", "Valor", "Data", "Hora", "Status", "Motorista", "Cliente", "Método Pagamento"],
      ...filtered.map(t => [
        t.id, t.type === "receita" ? "Receita" : "Despesa", t.category, t.description,
        t.amount, t.date, t.time, t.status, t.driver || "", t.client || "", t.paymentMethod || ""
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

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão Financeira</p>
        <div className="flex gap-1">
          <button onClick={exportToCSV} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" title="Exportar CSV">
            <Icon name="file" size={16} />
          </button>
          <button onClick={exportToPDF} className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200" title="Exportar PDF">
            <Icon name="printer" size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Receita Total" value={`${stats.totalRevenue.toLocaleString()} MZN`} color="green" />
        <StatCard label="Despesas Totais" value={`${stats.totalExpenses.toLocaleString()} MZN`} color="red" />
        <StatCard label={`${stats.netProfit >= 0 ? "Lucro Líquido" : "Prejuízo Líquido"}`} 
                  value={`${Math.abs(stats.netProfit).toLocaleString()} MZN`} 
                  color={stats.netProfit >= 0 ? "green" : "red"} />
        <StatCard label="Comissões Motoristas" value={`${stats.driverCommissions.toLocaleString()} MZN`} color="orange" />
      </div>

      {stats.netProfit < 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <Icon name="alertTriangle" size={18} className="text-red-500" />
          <p className="text-xs text-red-700 flex-1">Atenção: Operação com prejuízo de {Math.abs(stats.netProfit)} MZN</p>
        </div>
      )}

      {pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon name="clock" size={16} className="text-amber-500" />
              <p className="text-xs font-semibold text-amber-700">Pagamentos Pendentes</p>
            </div>
            <button onClick={() => setViewMode("pending")} className="text-xs text-amber-600 font-medium">Ver todas →</button>
          </div>
          <p className="text-lg font-bold text-amber-700">{pendingPayments.length} pendentes · {pendingPayments.reduce((s, p) => s + p.amount, 0)} MZN</p>
        </div>
      )}

      <div className="flex gap-2">
        {["list", "dashboard", "pending"].map(mode => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${viewMode === mode ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {mode === "list" ? "Lista" : mode === "dashboard" ? "Dashboard" : "Pendentes"}
          </button>
        ))}
      </div>

      {viewMode === "dashboard" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Receitas vs Despesas</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Receitas</span>
                  <span className="font-semibold text-green-600">{stats.totalRevenue} MZN</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.totalRevenue / Math.max(stats.totalRevenue + stats.totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Despesas</span>
                  <span className="font-semibold text-red-600">{stats.totalExpenses} MZN</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(stats.totalExpenses / Math.max(stats.totalRevenue + stats.totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Despesas por Categoria</p>
            {EXPENSE_CATEGORIES.map(cat => {
              const total = transactions.filter(t => t.type === "despesa" && t.category === cat).reduce((s, t) => s + t.amount, 0);
              if (total === 0) return null;
              return (
                <div key={cat} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{cat}</span>
                    <span className="font-semibold text-gray-700">{total} MZN</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(total / stats.totalExpenses) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Fluxo de Caixa (Últimos 7 dias)</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => {
                const dailyRevenue = transactions.filter(t => {
                  const tDate = new Date(t.date);
                  const today = new Date();
                  const diffDays = Math.floor((today - tDate) / (1000 * 60 * 60 * 24));
                  return true;
                }).reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-green-400 rounded-t" style={{ height: `${Math.floor(Math.random() * 60)}px` }}>
                      <div className="w-full bg-red-400 rounded-t" style={{ height: "0px" }} />
                    </div>
                    <span className="text-[9px] text-slate-400">{day}</span>
                    <span className="text-[9px] font-semibold text-gray-700">{dailyRevenue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {viewMode === "pending" && (
        <div className="space-y-3">
          {pendingPayments.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-600">{p.type === "receita" ? "Receita Pendente" : "Despesa Pendente"}</span>
                <span className="text-xs font-bold text-amber-600">{p.amount} MZN</span>
              </div>
              <p className="text-sm font-medium text-slate-800">{p.description}</p>
              <p className="text-xs text-slate-500 mt-1">{p.client || p.driver || ""} · {p.paymentMethod || "—"}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => markAsPaid(p.id)} className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Marcar como Pago</button>
                <button onClick={() => { setSelectedTransaction(p); setShowEditModal(true); }} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs">Editar</button>
              </div>
            </div>
          ))}
          {pendingPayments.length === 0 && (
            <div className="text-center py-8">
              <Icon name="checkCircle" size={48} className="text-green-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Nenhum pagamento pendente</p>
            </div>
          )}
        </div>
      )}

      {viewMode === "list" && (
        <>
          <div className="bg-white rounded-2xl p-3 border border-slate-100 space-y-2">
            <div className="flex gap-2">
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
                <option value="todos">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200">
                <option value="todas">Todas categorias</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} 
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200" placeholder="Data início" />
              <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} 
                className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200" placeholder="Data fim" />
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

          {filterTransactions().map(t => (
            <div key={t.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${t.type === "receita" ? "bg-green-400" : "bg-red-400"}`} />
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${t.type === "receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {t.type === "receita" ? "Receita" : "Despesa"}
                  </span>
                  <span className="text-xs text-slate-400">{t.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  {t.status === "pendente" && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendente</span>}
                  <button onClick={() => { setSelectedTransaction(t); setShowEditModal(true); }} className="p-1">
                    <Icon name="edit" size={14} className="text-slate-400" />
                  </button>
                  <button onClick={() => deleteTransaction(t.id)} className="p-1">
                    <Icon name="trash" size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-800">{t.description}</p>
              <p className="text-lg font-bold mt-1 text-gray-700">{t.amount} MZN</p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                <span className="text-xs text-slate-400">{t.date} {t.time}</span>
                {t.driver && <span className="text-xs text-slate-400">Motorista: {t.driver}</span>}
                {t.client && <span className="text-xs text-slate-400">Cliente: {t.client}</span>}
              </div>
            </div>
          ))}
        </>
      )}

      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Nova Despesa">
        <AddExpenseForm onSubmit={(data) => { addTransaction(data, "despesa"); setShowAddExpense(false); }} />
      </Modal>

      <Modal isOpen={showAddRevenue} onClose={() => setShowAddRevenue(false)} title="Nova Receita">
        <AddRevenueForm onSubmit={(data) => { addTransaction(data, "receita"); setShowAddRevenue(false); }} />
      </Modal>

      <EditTransactionModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} 
        transaction={selectedTransaction} onSave={updateTransaction} />
    </div>
  );
};

export default AdminFinance;