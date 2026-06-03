import StatCard from "../common/StatCard";
import Icon from "../common/Icon";

const MotoristaHistory = () => (
  <div className="space-y-4">
    <p className="text-sm font-bold text-slate-700">Histórico de Entregas</p>
    
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-3">Esta Semana</p>
      {[
        { date: "Hoje", count: 5, earn: "620 MZN" },
        { date: "Ontem", count: 8, earn: "1,040 MZN" },
        { date: "Seg", count: 6, earn: "780 MZN" },
        { date: "Dom", count: 4, earn: "520 MZN" },
      ].map(d => (
        <div key={d.date} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
          <div>
            <p className="text-sm font-medium text-slate-700">{d.date}</p>
            <p className="text-xs text-slate-400">{d.count} entregas</p>
          </div>
          <p className="text-sm font-bold text-green-600">{d.earn}</p>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Total Semana" value="23" color="orange" />
      <StatCard label="Ganhos Semana" value="3.0K MZN" color="green" />
    </div>

    {/* Monthly Summary */}
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-3">Resumo Mensal</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Total Entregas</p>
          <p className="text-xl font-bold text-slate-800">87</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Ganhos Totais</p>
          <p className="text-xl font-bold text-green-600">11,240 MZN</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Avaliação Média</p>
          <p className="text-xl font-bold text-slate-800 flex items-center gap-0.5">
            4.9 <Icon name="star" size={14} className="text-amber-400" />
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default MotoristaHistory;