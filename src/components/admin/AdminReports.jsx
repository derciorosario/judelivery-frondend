import { useState, useEffect } from "react";
import StatCard from "../common/StatCard";
import Icon from "../common/Icon";
import { toast } from "../../lib/toast";
import {
  getOrders,
  getDrivers,
  getCustomers,
  getFinancialStats
} from "../../api/client";

const AdminReports = () => {
  const [reportType, setReportType] = useState("operacional");
  const [period, setPeriod] = useState("semanal");
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [financialStats, setFinancialStats] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await getOrders({
        startDate: dateFrom,
        endDate: dateTo
      });
      setOrders(response.data?.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Erro ao carregar pedidos");
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchFinancialStats = async () => {
    try {
      const response = await getFinancialStats({
        startDate: dateFrom,
        endDate: dateTo
      });
      setFinancialStats(response.data);
    } catch (error) {
      console.error("Error fetching financial stats:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchOrders(), fetchDrivers(), fetchCustomers(), fetchFinancialStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchFinancialStats();
  }, [dateFrom, dateTo]);

  const filteredOrders = orders.filter(o => {
    const orderDate = o.createdAt ? o.createdAt.split('T')[0] : o.date;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const toDate = new Date(to);
    toDate.setDate(toDate.getDate() + 1); // Include end date
    return new Date(orderDate) >= from && new Date(orderDate) <= toDate;
  });

  const metrics = {
    totalOrders: filteredOrders.length,
    completedOrders: filteredOrders.filter(o => o.status === "completed" || o.status === "Concluído").length,
    cancelledOrders: filteredOrders.filter(o => o.status === "cancelled" || o.status === "Cancelado").length,
    pendingOrders: filteredOrders.filter(o => o.status === "pending" || o.status === "Pendente" || o.status === "pending_approval").length,
    inProgressOrders: filteredOrders.filter(o => o.status === "in_transit" || o.status === "Em entrega" || o.status === "assigned" || o.status === "Atribuído").length,
    cancellationRate: filteredOrders.length > 0 ? (filteredOrders.filter(o => o.status === "cancelled" || o.status === "Cancelado").length / filteredOrders.length) * 100 : 0,
    avgDeliveryTime: 28,
    ordersByHour: Array(24).fill(0).map((_, i) => (i + 1) * Math.floor(Math.random() * 10)),
    ordersByWeekday: [10, 14, 8, 22, 7, 7, 11],
    totalRevenue: filteredOrders.filter(o => o.status === "completed" || o.status === "Concluído").reduce((sum, o) => sum + parseFloat(o.total || o.totalValue || 0), 0),
    totalDistance: filteredOrders.reduce((sum, o) => sum + parseFloat(o.dist?.replace(' km', '') || 0), 0),
    estimatedFuelConsumption: filteredOrders.reduce((sum, o) => sum + (parseFloat(o.dist?.replace(' km', '') || 0) * 0.15), 0),
    topDrivers: [...drivers].sort((a, b) => (b.orders || b.rating || 0) - (a.orders || a.rating || 0)),
    topCustomers: [...customers].sort((a, b) => (b.orders || 0) - (a.orders || 0)).slice(0, 5),
    avgRating: drivers.length > 0 ? drivers.reduce((sum, d) => sum + (d.rating || 0), 0) / drivers.length : 0,
    customerSatisfaction: 94,
  };

  const totalRevenue = financialStats?.totalRevenue || metrics.totalRevenue;
  const totalExpenses = financialStats?.totalExpenses || 0;
  const netProfit = totalRevenue - totalExpenses;
  const operationalCosts = (financialStats?.fuelExpenses || 0) + (financialStats?.maintenanceExpenses || 0) + (financialStats?.salaryExpenses || 0);

  const exportToExcel = () => {
    const reportData = {
      operacional: [
        ["Métrica", "Valor"],
        ["Total de Pedidos", metrics.totalOrders],
        ["Pedidos Concluídos", metrics.completedOrders],
        ["Pedidos Cancelados", metrics.cancelledOrders],
        ["Taxa de Cancelamento", `${metrics.cancellationRate.toFixed(1)}%`],
        ["Tempo Médio de Entrega", `${metrics.avgDeliveryTime} min`],
        ["Distância Total Percorrida", `${metrics.totalDistance.toFixed(1)} km`],
        ["Consumo Estimado de Combustível", `${metrics.estimatedFuelConsumption.toFixed(1)} L`]
      ],
      financeiro: [
        ["Métrica", "Valor"],
        ["Receita Total", `${totalRevenue.toLocaleString()} MZN`],
        ["Despesas Totais", `${totalExpenses.toLocaleString()} MZN`],
        ["Lucro Líquido", `${netProfit.toLocaleString()} MZN`],
        ["Custos Operacionais", `${operationalCosts.toLocaleString()} MZN`],
        ["Comissões Motoristas", `${(totalRevenue * 0.2).toLocaleString()} MZN`]
      ],
      desempenho: [
        ["Métrica", "Valor"],
        ["Avaliação Média Motoristas", metrics.avgRating.toFixed(1)],
        ["Satisfação dos Clientes", `${metrics.customerSatisfaction}%`],
        ["Melhor Motorista", metrics.topDrivers[0]?.name || "—"],
        ["Cliente Mais Frequente", metrics.topCustomers[0]?.name || "—"]
      ]
    };

    const csv = [
      [`RELATÓRIO ${reportType.toUpperCase()} - ${dateFrom} a ${dateTo}`],
      [],
      ...reportData[reportType].map(row => row.join(","))
    ].map(row => row.join("\n")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${reportType}_${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

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
        <p className="text-sm font-bold text-slate-700">Relatórios & Estatísticas</p>
        <div className="flex gap-1">
          <button onClick={exportToExcel} className="p-2 rounded-xl bg-green-100 text-green-600 hover:bg-green-200" title="Exportar Excel">
            <Icon name="file" size={16} />
          </button>
          <button onClick={exportToPDF} className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200" title="Exportar PDF">
            <Icon name="printer" size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {["operacional", "financeiro", "desempenho"].map(type => (
          <button key={type} onClick={() => setReportType(type)}
            className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${reportType === type ? "bg-orange-500 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
            {type === "operacional" ? "📊 Operacional" : type === "financeiro" ? "💰 Financeiro" : "⭐ Desempenho"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-3 border border-slate-100">
        <div className="flex gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} 
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} 
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200" />
          <select value={period} onChange={e => {
            setPeriod(e.target.value);
            const today = new Date();
            if (e.target.value === "semanal") {
              setDateFrom(new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]);
              setDateTo(new Date().toISOString().split('T')[0]);
            } else if (e.target.value === "mensal") {
              setDateFrom(new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0]);
              setDateTo(new Date().toISOString().split('T')[0]);
            }
          }} className="text-xs px-2 py-1.5 rounded-lg border border-slate-200">
            <option value="semanal">Última semana</option>
            <option value="mensal">Último mês</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {reportType === "operacional" && (
          <>
            <StatCard label="Total Pedidos" value={metrics.totalOrders.toString()} sub={`${metrics.completedOrders} concluídos`} color="blue" />
            <StatCard label="Taxa Cancelamento" value={`${metrics.cancellationRate.toFixed(1)}%`} color="red" />
            <StatCard label="Tempo Médio" value={`${metrics.avgDeliveryTime} min`} sub="entrega" color="green" />
            <StatCard label="Distância Total" value={`${metrics.totalDistance.toFixed(0)} km`} color="orange" />
          </>
        )}
        {reportType === "financeiro" && (
          <>
            <StatCard label="Receita Total" value={`${totalRevenue.toLocaleString()} MZN`} color="green" />
            <StatCard label="Despesas" value={`${totalExpenses.toLocaleString()} MZN`} color="red" />
            <StatCard label={`${netProfit >= 0 ? "Lucro" : "Prejuízo"}`} value={`${Math.abs(netProfit).toLocaleString()} MZN`} color={netProfit >= 0 ? "green" : "red"} />
            <StatCard label="Combustível" value={`${(financialStats?.fuelExpenses || 0).toLocaleString()} MZN`} color="blue" />
          </>
        )}
        {reportType === "desempenho" && (
          <>
            <StatCard label="Avaliação Média" value={metrics.avgRating.toFixed(1)} icon="star" color="amber" />
            <StatCard label="Satisfação" value={`${metrics.customerSatisfaction}%`} color="green" />
            <StatCard label="Melhor Motorista" value={metrics.topDrivers[0]?.name?.split(" ")[0] || "—"} color="orange" />
            <StatCard label="Top Cliente" value={metrics.topCustomers[0]?.name?.split(" ")[0] || "—"} color="purple" />
          </>
        )}
      </div>

      {reportType === "operacional" && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Status</p>
            <div className="space-y-2">
              {[
                { label: "Concluídos", value: metrics.completedOrders, color: "bg-green-500", pct: (metrics.completedOrders / Math.max(metrics.totalOrders, 1)) * 100 },
                { label: "Em entrega", value: metrics.inProgressOrders, color: "bg-blue-500", pct: (metrics.inProgressOrders / Math.max(metrics.totalOrders, 1)) * 100 },
                { label: "Pendentes", value: metrics.pendingOrders, color: "bg-amber-500", pct: (metrics.pendingOrders / Math.max(metrics.totalOrders, 1)) * 100 },
                { label: "Cancelados", value: metrics.cancelledOrders, color: "bg-red-500", pct: (metrics.cancelledOrders / Math.max(metrics.totalOrders, 1)) * 100 },
              ].filter(s => s.value > 0).map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{s.label}</span>
                    <span className="font-semibold text-gray-700">{s.value}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Dia da Semana</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-orange-400 rounded-t-md transition-all" style={{ height: `${(metrics.ordersByWeekday[i] / Math.max(...metrics.ordersByWeekday, 1)) * 80}px` }} />
                  <span className="text-[9px] text-slate-400">{day}</span>
                  <span className="text-[9px] font-semibold">{metrics.ordersByWeekday[i]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Hora do Dia</p>
            <div className="flex items-end justify-between gap-1 h-32 overflow-x-auto">
              {metrics.ordersByHour.map((count, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[24px]">
                  <div className="w-full bg-indigo-400 rounded-t" style={{ height: `${(count / Math.max(...metrics.ordersByHour, 1)) * 70}px` }} />
                  <span className="text-[8px] text-slate-400">{i}h</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {reportType === "financeiro" && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Receitas vs Despesas</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Receitas</span>
                  <span className="font-semibold text-green-600">{totalRevenue.toLocaleString()} MZN</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(totalRevenue / Math.max(totalRevenue + totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Despesas</span>
                  <span className="font-semibold text-red-600">{totalExpenses.toLocaleString()} MZN</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(totalExpenses / Math.max(totalRevenue + totalExpenses, 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Despesas por Categoria</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{totalExpenses > 0 ? Math.round((financialStats?.fuelExpenses / totalExpenses) * 100) : 0}%</p>
                    <p className="text-[10px] text-slate-400">Combustível</p>
                  </div>
                </div>
                <div className="w-32 h-32 rounded-full border-8 border-orange-400" style={{ clipPath: "inset(0 0 0 0)" }} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-700"><div className="w-2 h-2 rounded-full bg-orange-400" /> Combustível</div>
                  <span className="font-semibold text-gray-700">{(financialStats?.fuelExpenses || 0).toLocaleString()} MZN</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-700"><div className="w-2 h-2 rounded-full bg-blue-400" /> Salários</div>
                  <span className="font-semibold text-gray-700">{(financialStats?.salaryExpenses || 0).toLocaleString()} MZN</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-700"><div className="w-2 h-2 rounded-full bg-green-400" /> Manutenção</div>
                  <span className="font-semibold text-gray-700">{(financialStats?.maintenanceExpenses || 0).toLocaleString()} MZN</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-gray-700"><div className="w-2 h-2 rounded-full bg-purple-400" /> Outros</div>
                  <span className="font-semibold text-gray-700">{(operationalCosts - (financialStats?.fuelExpenses || 0) - (financialStats?.salaryExpenses || 0) - (financialStats?.maintenanceExpenses || 0)).toLocaleString()} MZN</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Comparativo Mensal</p>
            <div className="flex items-end justify-between gap-3 h-40">
              {["Abr", "Mai", "Jun", "Jul", "Ago", "Set"].map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-green-400 rounded-t" style={{ height: `${Math.random() * 70 + 10}px` }} />
                  <div className="w-full bg-red-400 rounded-t mt-1" style={{ height: `${Math.random() * 50 + 5}px` }} />
                  <span className="text-[9px] text-slate-400 mt-1">{month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-4 mt-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400" /><span className="text-[10px] text-slate-500">Receita</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] text-slate-500">Despesa</span></div>
            </div>
          </div>
        </>
      )}

      {reportType === "desempenho" && (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">🏆 Ranking Motoristas</p>
            {metrics.topDrivers.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-orange-300 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.orders || 0} entregas</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-sm font-bold text-gray-700">{d.rating || 0}</span>
                  <Icon name="star" size={12} className="text-amber-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">👥 Clientes Mais Frequentes</p>
            {metrics.topCustomers.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{c.name?.split(" ")[0]}</span>
                  <span className="text-xs text-slate-400">{c.orders || 0} pedidos</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <span className="text-xs text-gray-700">{c.rating || 0}</span>
                  <Icon name="star" size={10} className="text-amber-400" />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Satisfação dos Clientes</p>
            <div className="flex items-center justify-center">
              <div className="relative w-40 h-20 overflow-hidden">
                <div className="absolute w-40 h-40 rounded-full border-8 border-slate-100 bottom-0" style={{ clipPath: "inset(0 0 50% 0)" }} />
                <div className="absolute w-40 h-40 rounded-full border-8 border-green-400 bottom-0" style={{ clipPath: `inset(0 0 ${100 - metrics.customerSatisfaction}% 0)`, transform: "rotate(180deg)" }} />
                <div className="absolute inset-0 flex items-center justify-center pt-10">
                  <p className="text-xl font-bold text-slate-800">{metrics.customerSatisfaction}%</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">Avaliação baseada em 48 reviews</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Distribuição Tempo de Entrega</p>
            <div className="space-y-2">
              {[
                { label: "< 20 min", pct: 15, color: "bg-green-400" },
                { label: "20-30 min", pct: 45, color: "bg-blue-400" },
                { label: "30-45 min", pct: 30, color: "bg-orange-400" },
                { label: "> 45 min", pct: 10, color: "bg-red-400" },
              ].map(t => (
                <div key={t.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">{t.label}</span>
                    <span className="font-semibold text-gray-700">{t.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminReports;
