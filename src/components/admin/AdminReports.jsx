// frontend/src/components/admin/AdminReports.js
import { useState, useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Browser } from "@capacitor/browser";
import StatCard from "../common/StatCard";
import Icon from "../common/Icon";
import PrintReport from "./PrintReport";
import { toast } from "../../lib/toast";
import {
  getOperationalReport,
  getPerformanceReport,
  getFinancialStats,
  getOrders,
  getDrivers,
  getCustomers
} from "../../api/client";

const AdminReports = () => {
  const [reportType, setReportType] = useState("operacional");
  const [period, setPeriod] = useState("semanal");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [operationalData, setOperationalData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Set default dates on mount
  useEffect(() => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    setDateFrom(weekAgo.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  const fetchOrders = useCallback(async () => {
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
  }, [dateFrom, dateTo]);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await getDrivers();
      setDrivers(response.data || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Erro ao carregar motoristas");
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Erro ao carregar clientes");
    }
  }, []);

  const fetchOperationalData = useCallback(async () => {
    try {
      const response = await getOperationalReport({
        startDate: dateFrom,
        endDate: dateTo
      });
      setOperationalData(response.data);
    } catch (error) {
      console.error("Error fetching operational data:", error);
      toast.error("Erro ao carregar dados operacionais");
      throw error;
    }
  }, [dateFrom, dateTo]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      const response = await getPerformanceReport({
        startDate: dateFrom,
        endDate: dateTo
      });
      setPerformanceData(response.data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("Erro ao carregar dados de desempenho");
      throw error;
    }
  }, [dateFrom, dateTo]);

  const fetchFinancialData = useCallback(async () => {
    try {
      const response = await getFinancialStats({
        startDate: dateFrom,
        endDate: dateTo
      });
      setFinancialData(response.data);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Erro ao carregar dados financeiros");
      throw error;
    }
  }, [dateFrom, dateTo]);

  const loadAllData = useCallback(async () => {
    if (!dateFrom || !dateTo) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchDrivers(),
        fetchCustomers(),
        fetchOperationalData(),
        fetchPerformanceData(),
        fetchFinancialData()
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, fetchOrders, fetchDrivers, fetchCustomers, fetchOperationalData, fetchPerformanceData, fetchFinancialData]);

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Reload when dates change
  useEffect(() => {
    if (dateFrom && dateTo) {
      loadAllData();
    }
  }, [dateFrom, dateTo, loadAllData]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    let from = new Date(today);
    
    if (newPeriod === "semanal") {
      from.setDate(from.getDate() - 7);
    } else if (newPeriod === "mensal") {
      from.setMonth(from.getMonth() - 1);
    } else if (newPeriod === "trimestral") {
      from.setMonth(from.getMonth() - 3);
    }
    
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const generateExcelData = () => {
    let reportData = [];
    
    if (reportType === "operacional" && operationalData) {
      reportData = [
        ["RELATÓRIO OPERACIONAL"],
        [`Período: ${dateFrom} a ${dateTo}`],
        [],
        ["Métrica", "Valor"],
        ["Total de Pedidos", operationalData.totalOrders || 0],
        ["Pedidos Concluídos", operationalData.completedOrders || 0],
        ["Pedidos em Andamento", operationalData.inProgressOrders || 0],
        ["Pedidos Pendentes", operationalData.pendingOrders || 0],
        ["Pedidos Cancelados", operationalData.cancelledOrders || 0],
        ["Taxa de Cancelamento", `${(operationalData.cancellationRate || 0).toFixed(1)}%`],
        ["Tempo Médio de Entrega", `${operationalData.avgDeliveryTime || 0} min`],
        ["Distância Total", `${(operationalData.totalDistance || 0).toFixed(1)} km`],
        ["Consumo Estimado", `${(operationalData.estimatedFuelConsumption || 0).toFixed(1)} L`],
        ["Receita Total", `${(operationalData.totalRevenue || 0).toFixed(2)} MZN`]
      ];
    } else if (reportType === "financeiro" && financialData) {
      reportData = [
        ["RELATÓRIO FINANCEIRO"],
        [`Período: ${dateFrom} a ${dateTo}`],
        [],
        ["Métrica", "Valor"],
        ["Receita Total", `${(financialData.totalRevenue || 0).toFixed(2)} MZN`],
        ["Despesas Totais", `${(financialData.totalExpenses || 0).toFixed(2)} MZN`],
        ["Lucro Líquido", `${(financialData.netProfit || 0).toFixed(2)} MZN`],
        ["Receitas Pendentes", `${(financialData.pendingRevenue || 0).toFixed(2)} MZN`],
        ["Despesas Pendentes", `${(financialData.pendingExpenses || 0).toFixed(2)} MZN`]
      ];
    } else if (reportType === "desempenho" && performanceData) {
      reportData = [
        ["RELATÓRIO DE DESEMPENHO"],
        [`Período: ${dateFrom} a ${dateTo}`],
        [],
        ["Métrica", "Valor"],
        ["Total Pedidos", performanceData.overall?.totalOrders || 0],
        ["Pedidos Concluídos", performanceData.overall?.completedOrders || 0],
        ["Taxa de Conclusão", `${(performanceData.overall?.completionRate || 0).toFixed(1)}%`],
        ["Avaliação Média", `${(performanceData.overall?.avgRating || 0).toFixed(1)}`],
        ["Tempo Médio Entrega", `${performanceData.overall?.avgDeliveryTime || 0} min`],
        [],
        ["🏆 TOP MOTORISTAS"],
        ["Posição", "Nome", "Entregas", "Avaliação", "Taxa Conclusão"],
        ...(performanceData.drivers || []).map((d, i) => [
          i + 1,
          d.name,
          d.completedOrders || 0,
          (d.avgRating || 0).toFixed(1),
          `${(d.completionRate || 0).toFixed(1)}%`
        ]),
        [],
        ["👥 TOP CLIENTES"],
        ["Posição", "Nome", "Pedidos", "Avaliação"],
        ...(performanceData.customers || []).map((c, i) => [
          i + 1,
          c.name,
          c.totalOrders || 0,
          (c.avgRating || 0).toFixed(1)
        ])
      ];
    }

    return reportData;
  };

  const exportToExcel = async () => {
    if (exporting) return;
    setExporting(true);
    
    try {
      const reportData = generateExcelData();
      
      const worksheet = XLSX.utils.aoa_to_sheet(reportData);
      worksheet["!cols"] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

      const workbook = XLSX.utils.book_new();
      const sheetName = reportType === "operacional" ? "Operacional" : reportType === "financeiro" ? "Financeiro" : "Desempenho";
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const fileName = `relatorio_${reportType}_${dateFrom}_${dateTo}.xlsx`;

      // Check if running on Capacitor
      if (Capacitor.isNativePlatform()) {
        // Save file using Capacitor Filesystem
        const result = await Filesystem.writeFile({
          path: fileName,
          data: btoa(String.fromCharCode(...new Uint8Array(excelBuffer))),
          directory: Directory.Documents,
          recursive: true,
        });

        // Share the file
        await Share.share({
          title: 'Relatório',
          text: `Relatório ${reportType} - ${dateFrom} a ${dateTo}`,
          url: result.uri,
          dialogTitle: 'Compartilhar relatório',
        });
      } else {
        // Web download
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }

      toast.success("Relatório exportado com sucesso");
    } catch (error) {
      console.error("Error exporting:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setExporting(false);
    }
  };

  const generateHTMLContent = () => {
    const { title, subtitle, tables } = buildReportTables();
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px 20px; 
            max-width: 1200px; 
            margin: 0 auto;
            color: #1e293b;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f97316;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            color: #64748b;
          }
          .table-section {
            margin-bottom: 30px;
          }
          .table-title {
            font-size: 16px;
            font-weight: 600;
            color: #334155;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f8fafc;
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 8px 12px;
            font-size: 13px;
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          .badge-success { background: #dcfce7; color: #166534; }
          .badge-warning { background: #fef3c7; color: #92400e; }
          .badge-danger { background: #fee2e2; color: #991b1b; }
          .badge-info { background: #dbeafe; color: #1e40af; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${title}</div>
          <div class="subtitle">${subtitle}</div>
        </div>
    `;

    tables.forEach((table, index) => {
      html += `
        <div class="table-section">
          <div class="table-title">${table.title}</div>
          <table>
            <thead>
              <tr>
      `;
      
      table.headers.forEach(header => {
        html += `<th>${header}</th>`;
      });
      
      html += `
              </tr>
            </thead>
            <tbody>
      `;
      
      table.rows.forEach(row => {
        html += `<tr>`;
        row.forEach(cell => {
          html += `<td>${cell}</td>`;
        });
        html += `</tr>`;
      });
      
      html += `
            </tbody>
          </table>
        </div>
      `;
    });

    html += `
        <div class="footer">
          Relatório gerado em ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const exportToPDF = async () => {
    if (printing) return;
    setPrinting(true);

    try {
      const htmlContent = generateHTMLContent();
      const fileName = `relatorio_${reportType}_${dateFrom}_${dateTo}.html`;

      if (Capacitor.isNativePlatform()) {
        // Save HTML file
        const result = await Filesystem.writeFile({
          path: fileName,
          data: htmlContent,
          directory: Directory.Documents,
          recursive: true,
        });

        // Open in browser for printing
        await Browser.open({ url: result.uri });
        
        toast.info("Arquivo aberto no navegador para impressão");
      } else {
        // Web - open in new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      }
    } catch (error) {
      console.error("Error printing:", error);
      toast.error("Erro ao imprimir relatório");
    } finally {
      setPrinting(false);
    }
  };

  const buildReportTables = () => {
    const title = reportType === "operacional"
      ? "Relatório Operacional"
      : reportType === "financeiro"
        ? "Relatório Financeiro"
        : "Relatório de Desempenho";
    const subtitle = `Período: ${dateFrom} a ${dateTo}`;
    const tables = [];

    if (reportType === "operacional" && operationalData) {
      tables.push({
        title: "Métricas Operacionais",
        headers: ["Métrica", "Valor"],
        rows: [
          ["Total de Pedidos", operationalData.totalOrders || 0],
          ["Pedidos Concluídos", operationalData.completedOrders || 0],
          ["Pedidos em Andamento", operationalData.inProgressOrders || 0],
          ["Pedidos Pendentes", operationalData.pendingOrders || 0],
          ["Pedidos Cancelados", operationalData.cancelledOrders || 0],
          ["Taxa de Cancelamento", `${(operationalData.cancellationRate || 0).toFixed(1)}%`],
          ["Tempo Médio de Entrega", `${operationalData.avgDeliveryTime || 0} min`],
          ["Distância Total", `${(operationalData.totalDistance || 0).toFixed(1)} km`],
          ["Consumo Estimado", `${(operationalData.estimatedFuelConsumption || 0).toFixed(1)} L`],
          ["Receita Total", `${(operationalData.totalRevenue || 0).toFixed(2)} MZN`]
        ]
      });
    } else if (reportType === "financeiro" && financialData) {
      tables.push({
        title: "Métricas Financeiras",
        headers: ["Métrica", "Valor"],
        rows: [
          ["Receita Total", `${(financialData.totalRevenue || 0).toFixed(2)} MZN`],
          ["Despesas Totais", `${(financialData.totalExpenses || 0).toFixed(2)} MZN`],
          ["Lucro Líquido", `${(financialData.netProfit || 0).toFixed(2)} MZN`],
          ["Receitas Pendentes", `${(financialData.pendingRevenue || 0).toFixed(2)} MZN`],
          ["Despesas Pendentes", `${(financialData.pendingExpenses || 0).toFixed(2)} MZN`]
        ]
      });
    } else if (reportType === "desempenho" && performanceData) {
      tables.push({
        title: "Métricas de Desempenho",
        headers: ["Métrica", "Valor"],
        rows: [
          ["Total Pedidos", performanceData.overall?.totalOrders || 0],
          ["Pedidos Concluídos", performanceData.overall?.completedOrders || 0],
          ["Taxa de Conclusão", `${(performanceData.overall?.completionRate || 0).toFixed(1)}%`],
          ["Avaliação Média", `${(performanceData.overall?.avgRating || 0).toFixed(1)}`],
          ["Tempo Médio Entrega", `${performanceData.overall?.avgDeliveryTime || 0} min`]
        ]
      });

      if (performanceData.drivers?.length) {
        tables.push({
          title: "Top Motoristas",
          headers: ["Posição", "Nome", "Entregas", "Avaliação", "Taxa Conclusão"],
          rows: performanceData.drivers.map((d, i) => [
            i + 1,
            d.name,
            d.completedOrders || 0,
            (d.avgRating || 0).toFixed(1),
            `${(d.completionRate || 0).toFixed(1)}%`
          ])
        });
      }

      if (performanceData.customers?.length) {
        tables.push({
          title: "Top Clientes",
          headers: ["Posição", "Nome", "Pedidos", "Avaliação"],
          rows: performanceData.customers.map((c, i) => [
            i + 1,
            c.name,
            c.totalOrders || 0,
            (c.avgRating || 0).toFixed(1)
          ])
        });
      }
    }

    return { title, subtitle, tables };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const printData = buildReportTables();

  return (
    <div className="space-y-4">
      <PrintReport title={printData.title} subtitle={printData.subtitle} tables={printData.tables} />

      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Relatórios & Estatísticas</p>
        <div className="flex gap-1">
          <button 
            onClick={refreshData}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
            title="Atualizar"
          >
            <Icon name="refreshCw" size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={exportToExcel} 
            disabled={exporting}
            className={`p-2 rounded-xl transition-all ${
              exporting 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={Capacitor.isNativePlatform() ? "Compartilhar Excel" : "Exportar Excel"}
          >
            <Icon name="file" size={16} />
            {exporting && <span className="ml-1 text-xs">...</span>}
          </button>
          {!Capacitor.isNativePlatform() && <button 
            onClick={exportToPDF} 
            disabled={printing}
            className={`p-2 rounded-xl transition-all ${
              printing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
            title={Capacitor.isNativePlatform() ? "Abrir para impressão" : "Exportar PDF"}
          >
            <Icon name="printer" size={16} />
            {printing && <span className="ml-1 text-xs">...</span>}
          </button>}
        </div>
      </div>

      <div className="flex gap-2">
        {["operacional", "financeiro", "desempenho"].map(type => (
          <button 
            key={type} 
            onClick={() => setReportType(type)}
            className={`flex-1 text-xs font-semibold py-2 rounded-xl transition-all ${
              reportType === type 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-100" 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {type === "operacional" ? "📊 Operacional" : type === "financeiro" ? "💰 Financeiro" : "⭐ Desempenho"}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-3 border border-slate-100">
        <div className="flex gap-2">
          <input 
            type="date" 
            value={dateFrom} 
            onChange={e => setDateFrom(e.target.value)} 
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input 
            type="date" 
            value={dateTo} 
            onChange={e => setDateTo(e.target.value)} 
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <select 
            value={period} 
            onChange={e => handlePeriodChange(e.target.value)} 
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="semanal">Última semana</option>
            <option value="mensal">Último mês</option>
            <option value="trimestral">Último trimestre</option>
            <option value="personalizado">Personalizado</option>
          </select>
        </div>
      </div>

      {reportType === "operacional" && operationalData && (
        <>
          {/* FIRST ROW - Replace the Tempo Médio card with Pedidos/Motorista */}
          <div className="grid grid-cols-2 gap-3">

            <StatCard 
              label="Receita Total" 
              value={`${(operationalData.totalRevenue || 0).toFixed(0)} MZN`} 
              color="emerald" 
            />

            <StatCard 
              label="Total Pedidos" 
              value={operationalData.totalOrders?.toString() || "0"} 
              sub={`${operationalData.completedOrders || 0} concluídos`} 
              color="blue" 
            />
            <StatCard 
              label="Taxa Cancelamento" 
              value={`${(operationalData.cancellationRate || 0).toFixed(1)}%`} 
              color="red" 
            />
           
            <StatCard 
              label="Distância Total" 
              value={`${(operationalData.totalDistance || 0).toFixed(0)} km`} 
              color="orange" 
            />
          </div>
          
        



          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Status</p>
            <div className="space-y-2">
              {[
                { label: "Concluídos", value: operationalData.completedOrders || 0, color: "bg-green-500" },
                { label: "Em entrega", value: operationalData.inProgressOrders || 0, color: "bg-blue-500" },
                { label: "Pendentes", value: operationalData.pendingOrders || 0, color: "bg-amber-500" },
                { label: "Cancelados", value: operationalData.cancelledOrders || 0, color: "bg-red-500" },
              ].filter(s => s.value > 0).map(s => {
                const pct = (s.value / Math.max(operationalData.totalOrders || 1, 1)) * 100;
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700">{s.label}</span>
                      <span className="font-semibold text-gray-700">{s.value}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {operationalData.ordersByWeekday && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Dia da Semana</p>
              <div className="flex items-end justify-between gap-2 h-32">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day, i) => {
                  const maxValue = Math.max(...operationalData.ordersByWeekday, 1);
                  const height = (operationalData.ordersByWeekday[i] / maxValue) * 80;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div 
                        className="w-full bg-orange-400 rounded-t-md transition-all" 
                        style={{ height: `${Math.max(height, 4)}px` }} 
                      />
                      <span className="text-[9px] text-slate-400">{day}</span>
                      <span className="text-[9px] font-semibold">{operationalData.ordersByWeekday[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {operationalData.ordersByHour && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Hora do Dia</p>
              <div className="flex items-end justify-between gap-1 h-32 overflow-x-auto">
                {operationalData.ordersByHour.map((count, i) => {
                  const maxValue = Math.max(...operationalData.ordersByHour, 1);
                  const height = (count / maxValue) * 70;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 min-w-[24px]">
                      <div 
                        className="w-full bg-indigo-400 rounded-t" 
                        style={{ height: `${Math.max(height, 2)}px` }} 
                      />
                      <span className="text-[8px] text-slate-400">{i}h</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {reportType === "financeiro" && financialData && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Receita Total" 
              value={`${(financialData.totalRevenue || 0).toFixed(0)} MZN`} 
              color="green" 
            />
            <StatCard 
              label="Despesas" 
              value={`${(financialData.totalExpenses || 0).toFixed(0)} MZN`} 
              color="red" 
            />
            <StatCard 
              label={(financialData.netProfit || 0) >= 0 ? "Lucro" : "Prejuízo"} 
              value={`${Math.abs(financialData.netProfit || 0).toFixed(0)} MZN`} 
              color={(financialData.netProfit || 0) >= 0 ? "green" : "red"} 
            />
            <StatCard 
              label="Pendentes" 
              value={`${((financialData.pendingRevenue || 0) + (financialData.pendingExpenses || 0)).toFixed(0)} MZN`} 
              color="blue" 
            />
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-3">Receitas vs Despesas</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Receitas</span>
                  <span className="font-semibold text-green-600">{(financialData.totalRevenue || 0).toFixed(0)} MZN</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ 
                      width: `${((financialData.totalRevenue || 0) / Math.max((financialData.totalRevenue || 0) + (financialData.totalExpenses || 0), 1)) * 100}%` 
                    }} 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-700">Despesas</span>
                  <span className="font-semibold text-red-600">{(financialData.totalExpenses || 0).toFixed(0)} MZN</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ 
                      width: `${((financialData.totalExpenses || 0) / Math.max((financialData.totalRevenue || 0) + (financialData.totalExpenses || 0), 1)) * 100}%` 
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          {financialData.expensesByCategory && financialData.expensesByCategory.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">Despesas por Categoria</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-800">
                        {financialData.totalExpenses > 0 
                          ? Math.round(((financialData.expensesByCategory[0]?.total || 0) / financialData.totalExpenses) * 100)
                          : 0}%
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {financialData.expensesByCategory[0]?.categoryName || 'Sem categoria'}
                      </p>
                    </div>
                  </div>
                  <div className="w-32 h-32 rounded-full border-8 border-orange-400" style={{ clipPath: "inset(0 0 0 0)" }} />
                </div>
                <div className="space-y-1">
                  {financialData.expensesByCategory.slice(0, 4).map(cat => (
                    <div key={cat.categoryId} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-gray-700">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.categoryColor || '#f97316' }} />
                        {cat.categoryName || 'Sem categoria'}
                      </div>
                      <span className="font-semibold text-gray-700">{cat.total.toFixed(0)} MZN</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {financialData.dailyData && financialData.dailyData.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">Últimos 7 Dias</p>
              <div className="flex items-end justify-between gap-3 h-40">
                {financialData.dailyData.map((day, i) => {
                  const maxValue = Math.max(
                    ...financialData.dailyData.map(d => Math.max(d.revenue || 0, d.expenses || 0)),
                    1
                  );
                  const revenueHeight = ((day.revenue || 0) / maxValue) * 60;
                  const expenseHeight = ((day.expenses || 0) / maxValue) * 60;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-green-400 rounded-t" style={{ height: `${Math.max(revenueHeight, 2)}px` }} />
                      <div className="w-full bg-red-400 rounded-t mt-1" style={{ height: `${Math.max(expenseHeight, 2)}px` }} />
                      <span className="text-[9px] text-slate-400 mt-1">{day.day || day.date}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-4 mt-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-[10px] text-slate-500">Receita</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[10px] text-slate-500">Despesa</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {reportType === "desempenho" && performanceData && (
        <>
         
         
          {/* FIRST ROW - Replace Tempo Médio with Pedidos/Motorista */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Total Pedidos" 
              value={performanceData.overall?.totalOrders?.toString() || "0"} 
              color="blue" 
            />
            <StatCard 
              label="Taxa Conclusão" 
              value={`${(performanceData.overall?.completionRate || 0).toFixed(1)}%`} 
              color="green" 
            />
            <StatCard 
              label="Pedidos/Motorista"  // NEW
              value={performanceData.overall?.avgOrdersPerDriver?.toString() || "0"} 
              sub="média" 
              color="purple" 
            />
            <StatCard 
              label="Avaliação Média" 
              value={(performanceData.overall?.avgRating || 0).toFixed(1)} 
              color="amber" 
            />
          </div>
          
     
          {/* SECOND ROW - Add new metrics */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              label="Pedidos/Hora"
              value={performanceData.overall?.avgOrdersPerHour || "0"} 
              sub="média" 
              color="indigo" 
            />
            <StatCard 
              label="Eficiência"
              value={`${performanceData.overall?.deliveryEfficiency || 0}%`} 
              sub="taxa de sucesso" 
              color="green" 
            />
            
            {/* This card will span 2 columns (full width) */}
            <div className="col-span-2">
              <StatCard 
                label="Cancelados" 
                value={performanceData.overall?.cancelledOrders?.toString() || "0"} 
                sub="pedidos cancelados no período"
                color="red" 
              />
            </div>
          </div>


          {performanceData.drivers && performanceData.drivers.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">🏆 Ranking Motoristas</p>
              {performanceData.drivers.slice(0, 5).map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-amber-400 text-white" : 
                    i === 1 ? "bg-slate-300 text-slate-700" : 
                    i === 2 ? "bg-orange-300 text-white" : 
                    "bg-slate-100 text-slate-500"
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.completedOrders || 0} entregas</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-sm font-bold text-gray-700">{(d.avgRating || 0).toFixed(1)}</span>
                    <Icon name="star" size={12} className="text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {performanceData.customers && performanceData.customers.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">👥 Clientes Mais Frequentes</p>
              {performanceData.customers.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{c.name}</span>
                    <span className="text-xs text-slate-400">{c.totalOrders || 0} pedidos</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-gray-700">{(c.avgRating || 0).toFixed(1)}</span>
                    <Icon name="star" size={10} className="text-amber-400" />
                  </div>
                </div>
              ))}
            </div>
          )}

         {/**** Leave it hidden here
          * 
          *  {performanceData.deliveryTimeDistribution && (
            <div className="bg-white rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3">Distribuição Tempo de Entrega</p>
              <div className="space-y-2">
                {performanceData.deliveryTimeDistribution.labels.map((label, i) => {
                  const pct = performanceData.deliveryTimeDistribution.values[i] || 0;
                  const colors = ['bg-green-400', 'bg-blue-400', 'bg-orange-400', 'bg-red-400'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700">{label}</span>
                        <span className="font-semibold text-gray-700">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${colors[i]}`} 
                          style={{ width: `${Math.min(pct, 100)}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          * 
          * 
          */}
        </>
      )}
    </div>
  );
};

export default AdminReports;