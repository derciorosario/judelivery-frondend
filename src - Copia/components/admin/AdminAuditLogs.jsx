import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import {
  getAuditLogs,
  getAuditStats,
  getAuditFilterOptions,
  getEntityAuditLogs,
  getUserAuditLogs
} from "../../api/client";
import { toast } from "../../lib/toast";

const ACTION_LABELS = {
  login: "Login",
  logout: "Logout",
  create: "Criar",
  update: "Atualizar",
  delete: "Remover",
  view: "Visualizar",
  assign: "Atribuir",
  cancel: "Cancelar",
  complete: "Concluir",
  approve: "Aprovar",
  reject: "Rejeitar",
  payment: "Pagamento",
  status_change: "Mudança de Estado",
  export: "Exportar",
  import: "Importar",
  settings_change: "Alterar Configurações",
  password_change: "Alterar Senha",
  verification: "Verificação",
  other: "Outro"
};

const ENTITY_LABELS = {
  user: "Utilizador",
  order: "Pedido",
  driver: "Motorista",
  customer: "Cliente",
  product: "Produto",
  company: "Empresa",
  incident: "Incidente",
  feedback: "Avaliação",
  payment: "Pagamento",
  notification: "Notificação",
  settings: "Configurações",
  financial: "Financeiro",
  report: "Relatório",
  auth: "Autenticação",
  other: "Outro"
};

const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Admin",
  manager: "Gestor",
  driver: "Motorista",
  customer: "Cliente"
};

const ROLE_COLORS = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-red-100 text-red-700",
  manager: "bg-blue-100 text-blue-700",
  driver: "bg-green-100 text-green-700",
  customer: "bg-gray-100 text-gray-700"
};

const ACTION_COLORS = {
  login: "bg-green-100 text-green-700",
  logout: "bg-gray-100 text-gray-700",
  create: "bg-blue-100 text-blue-700",
  update: "bg-yellow-100 text-yellow-700",
  delete: "bg-red-100 text-red-700",
  view: "bg-gray-100 text-gray-700",
  assign: "bg-purple-100 text-purple-700",
  cancel: "bg-red-100 text-red-700",
  complete: "bg-green-100 text-green-700",
  approve: "bg-green-100 text-green-700",
  reject: "bg-red-100 text-red-700",
  payment: "bg-emerald-100 text-emerald-700",
  status_change: "bg-orange-100 text-orange-700",
  export: "bg-cyan-100 text-cyan-700",
  import: "bg-cyan-100 text-cyan-700",
  settings_change: "bg-pink-100 text-pink-700",
  password_change: "bg-yellow-100 text-yellow-700",
  verification: "bg-teal-100 text-teal-700",
  other: "bg-gray-100 text-gray-700"
};

// Simple debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const AdminAuditLogs = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const debouncedUserSearch = useDebounce(userSearch, 500);
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  useEffect(() => {
    fetchFilterOptions();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, selectedAction, selectedEntityType, selectedUserRole, startDate, endDate, debouncedUserSearch]);

  const fetchFilterOptions = async () => {
    try {
      const response = await getAuditFilterOptions();
      setFilterOptions(response.data);
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await getAuditStats(params);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        includeUser: "true"
      };

      if (search) params.search = search;
      if (debouncedUserSearch) params.userSearch = debouncedUserSearch;
      if (selectedAction) params.action = selectedAction;
      if (selectedEntityType) params.entityType = selectedEntityType;
      if (selectedUserRole) params.userRole = selectedUserRole;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await getAuditLogs(params);
      setLogs(response.data.logs || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalLogs(response.data.pagination?.total || 0);
    } catch (error) {
      const msg = error.response?.data?.message || "Erro ao carregar registos";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setSearch("");
    setUserSearch("");
    setSelectedAction("");
    setSelectedEntityType("");
    setSelectedUserRole("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const formatJson = (json) => {
    if (!json) return null;
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (userSearch) count++;
    if (selectedAction) count++;
    if (selectedEntityType) count++;
    if (selectedUserRole) count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [search, userSearch, selectedAction, selectedEntityType, selectedUserRole, startDate, endDate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Registos de Auditoria</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Histórico de ações de todos os utilizadores
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
        >
          <Icon name="filter" size={14} />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Total de Registos</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalLogs || 0}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Últimas 24h</p>
            <p className="text-xl font-bold text-orange-600 mt-1">{stats.recentLogs || 0}</p>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Pesquisar em descrições
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar em descrições..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Pesquisar por nome/email do utilizador
              </label>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Ex: João, maria@email.com, gestor..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Pesquisa por nome ou email de motoristas, clientes, gestores, etc.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Ação
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas</option>
                  {filterOptions?.actions?.map((action) => (
                    <option key={action} value={action}>
                      {ACTION_LABELS[action] || action}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Tipo de Entidade
                </label>
                <select
                  value={selectedEntityType}
                  onChange={(e) => setSelectedEntityType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos</option>
                  {filterOptions?.entityTypes?.map((type) => (
                    <option key={type} value={type}>
                      {ENTITY_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Função
                </label>
                <select
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas</option>
                  {filterOptions?.userRoles?.map((role) => (
                    <option key={role} value={role}>
                      {ROLE_LABELS[role] || role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Data Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Limpar
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">A carregar registos...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
          <Icon name="fileText" size={40} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum registo encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-orange-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                      ACTION_COLORS[log.action] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                    {ENTITY_LABELS[log.entityType] || log.entityType}
                  </span>
                  {log.userRole && (
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        ROLE_COLORS[log.userRole] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ROLE_LABELS[log.userRole] || log.userRole}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </span>
              </div>

              <p className="text-sm text-slate-700 mb-2">{log.description}</p>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                {log.userName && (
                  <span className="flex items-center gap-1">
                    <Icon name="user" size={12} />
                    {log.userName}
                  </span>
                )}
                {log.entityId && (
                  <span className="flex items-center gap-1">
                    <Icon name="hash" size={12} />
                    {log.entityId.substring(0, 8)}
                  </span>
                )}
                {log.ipAddress && (
                  <span className="flex items-center gap-1">
                    <Icon name="globe" size={12} />
                    {log.ipAddress}
                  </span>
                )}
              </div>

              {/* Expandable details */}
              {(log.oldValues || log.newValues || log.metadata) && (
                <details className="mt-3">
                  <summary className="text-xs text-orange-600 cursor-pointer font-medium hover:text-orange-700">
                    Ver detalhes
                  </summary>
                  <div className="mt-2 space-y-2">
                    {log.oldValues && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                          Valores Anteriores
                        </p>
                        <pre className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                          {formatJson(log.oldValues)}
                        </pre>
                      </div>
                    )}
                    {log.newValues && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                          Novos Valores
                        </p>
                        <pre className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                          {formatJson(log.newValues)}
                        </pre>
                      </div>
                    )}
                    {log.metadata && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1">
                          Metadados
                        </p>
                        <pre className="bg-slate-50 rounded-lg p-2 text-[10px] text-slate-600 overflow-x-auto whitespace-pre-wrap">
                          {formatJson(log.metadata)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Mostrando {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, totalLogs)} de {totalLogs} registos
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold disabled:opacity-50 hover:bg-slate-200"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-xs text-slate-600">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold disabled:opacity-50 hover:bg-slate-200"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
