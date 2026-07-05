import { useState, useEffect } from "react";
import {
  Package,
  Map,
  Users,
  ChartNoAxesColumn,
  DollarSign,
  Bell,
  Home,
  Truck,
  Check,
  X,
  Plus,
  Eye,
  LogOut,
  AlertCircle,
  Star,
  Settings,
  MapPin,
  Clock
} from "lucide-react";

// ─── ICONS (Lucide React) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 20, className = "" }) => {
  const icons = {
    package: Package,
    map: Map,
    users: Users,
    chart: ChartNoAxesColumn,
    dollar: DollarSign,
    bell: Bell,
    home: Home,
    truck: Truck,
    check: Check,
    x: X,
    plus: Plus,
    eye: Eye,
    logout: LogOut,
    alert: AlertCircle,
    star: Star,
    settings: Settings,
    location: MapPin,
    clock: Clock,
  };

  const LucideIcon = icons[name];
  
  if (!LucideIcon) return null;
  
  return <LucideIcon size={size} className={className} />;
};



// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, email: "admin@judelivery.mz", password: "admin123", role: "admin", name: "Carlos Admin" },
  { id: 2, email: "gestor@judelivery.mz", password: "gestor123", role: "gestor", name: "Maria Gestora" },
  { id: 3, email: "motorista@judelivery.mz", password: "moto123", role: "motorista", name: "João Motorista" },
];

const ORDERS = [
  { id: "#001", client: "Ana Sitoe", origin: "Loja Central, Maputo", dest: "Av. Eduardo Mondlane 45", status: "Em entrega", driver: "João Motorista", total: "450 MZN", time: "14:32", dist: "3.2 km" },
  { id: "#002", client: "Pedro Nhaca", origin: "Armazém Norte", dest: "Bairro Polana Cimento", status: "Pendente", driver: "—", total: "280 MZN", time: "14:48", dist: "5.1 km" },
  { id: "#003", client: "Fátima Bila", origin: "Loja Central, Maputo", dest: "Rua da Resistência 12", status: "Concluído", driver: "João Motorista", total: "620 MZN", time: "13:10", dist: "2.8 km" },
  { id: "#004", client: "Marco Simango", origin: "Loja Sul", dest: "Av. Julius Nyerere 88", status: "Atribuído", driver: "João Motorista", total: "180 MZN", time: "15:05", dist: "1.9 km" },
  { id: "#005", client: "Rosa Cossa", origin: "Armazém Norte", dest: "Matola, Zona A", status: "Cancelado", driver: "—", total: "340 MZN", time: "12:55", dist: "8.4 km" },
];

const DRIVERS = [
  { id: 1, name: "João Motorista", status: "online", orders: 12, rating: 4.8, phone: "+258 84 111 2233" },
  { id: 2, name: "Américo Cossa", status: "offline", orders: 8, rating: 4.5, phone: "+258 82 999 0011" },
  { id: 3, name: "Beatriz Mache", status: "online", orders: 15, rating: 4.9, phone: "+258 86 777 5566" },
];

const STATUSCOLOR = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Pendente": "bg-amber-100 text-amber-700",
  "Concluído": "bg-green-100 text-green-700",
  "Atribuído": "bg-purple-100 text-purple-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em coleta": "bg-orange-100 text-orange-700",
};

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const credentials = [
    { role: "Admin", email: "admin@judelivery.mz", pass: "admin123", color: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
    { role: "Gestor", email: "gestor@judelivery.mz", pass: "gestor123", color: "bg-teal-50 border-teal-200", dot: "bg-teal-400" },
    { role: "Motorista", email: "motorista@judelivery.mz", pass: "moto123", color: "bg-blue-50 border-blue-200", dot: "bg-blue-400" },
  ];

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) onLogin(user);
    else { setError("Email ou senha incorretos."); setLoading(false); }
  };

  const fillCred = (c) => { setEmail(c.email); setPassword(c.pass); setError(""); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/30">
          <Icon name="truck" size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">DeliveryMZ</h1>
        <p className="text-slate-400 text-sm mt-1">Plataforma de Gestão Logística</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Entrar na plataforma</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-slate-50 pr-10"
              />
              <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-slate-400">
                <Icon name="eye" size={18} />
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm flex items-center gap-1"><Icon name="alert" size={16} />{error}</p>}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </div>

        {/* Demo credentials */}
        <div className="mt-6">
          <p className="text-xs text-slate-400 text-center mb-3 font-medium">── CREDENCIAIS DE DEMONSTRAÇÃO ──</p>
          <div className="space-y-2">
            {credentials.map(c => (
              <button key={c.role} onClick={() => fillCred(c)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all hover:scale-[1.01] ${c.color}`}>
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">{c.role}</p>
                  <p className="text-xs text-slate-500 truncate">{c.email} · {c.pass}</p>
                </div>
                <span className="text-xs text-slate-400">usar →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
const Header = ({ user, onLogout, title, notifs = 3 }) => (
  <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
    <div>
      <p className="text-xs text-slate-400">Olá, {user.name.split(" ")[0]}</p>
      <h1 className="text-base font-bold text-slate-800">{title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative">
        <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon name="bell" size={18} />
        </button>
        {notifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{notifs}</span>}
      </div>
      <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
        <Icon name="logout" size={18} />
      </button>
    </div>
  </div>
);

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const BottomNav = ({ tabs, active, setActive }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex z-30 safe-area-pb">
    {tabs.map(t => (
      <button key={t.id} onClick={() => setActive(t.id)}
        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active === t.id ? "text-orange-500" : "text-slate-400"}`}>
        <Icon name={t.icon} size={22} />
        <span className="text-[10px] font-medium">{t.label}</span>
      </button>
    ))}
  </div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "orange" }) => {
  const colors = { orange: "bg-orange-500", blue: "bg-blue-500", green: "bg-green-500", purple: "bg-purple-500" };
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className={`w-8 h-1 rounded-full mb-3 ${colors[color]}`} />
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-green-500 mt-1 font-medium">{sub}</p>}
    </div>
  );
};

// ─── ORDER CARD ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, showAssign }) => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-slate-800">{order.id}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[order.status]}`}>{order.status}</span>
      </div>
      <span className="text-sm font-bold text-orange-500">{order.total}</span>
    </div>
    <p className="text-sm font-medium text-slate-700">{order.client}</p>
    <div className="mt-2 space-y-1">
      <div className="flex items-start gap-1.5 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-orange-400 mt-0.5 shrink-0" />
        <span className="line-clamp-1">{order.origin}</span>
      </div>
      <div className="flex items-start gap-1.5 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-slate-400 mt-0.5 shrink-0" />
        <span className="line-clamp-1">{order.dest}</span>
      </div>
    </div>
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1"><Icon name="clock" size={12} />{order.time}</span>
        <span className="flex items-center gap-1"><Icon name="location" size={12} />{order.dist}</span>
      </div>
      {showAssign && order.status === "Pendente" && (
        <button className="text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors">
          Atribuir →
        </button>
      )}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN APP ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const AdminApp = ({ user, onLogout }) => {
  const [tab, setTab] = useState("home");
  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "orders", label: "Pedidos", icon: "package" },
    { id: "drivers", label: "Motoristas", icon: "users" },
    { id: "finance", label: "Finanças", icon: "dollar" },
    { id: "reports", label: "Relatórios", icon: "chart" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Painel Admin" />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <AdminHome />}
        {tab === "orders" && <AdminOrders />}
        {tab === "drivers" && <AdminDrivers />}
        {tab === "finance" && <AdminFinance />}
        {tab === "reports" && <AdminReports />}
      </div>
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
    </div>
  );
};

const AdminHome = () => (
  <div className="space-y-4">
    {/* Role badge */}
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white">
      <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Visão Geral — Hoje</p>
      <p className="text-2xl font-bold mt-1">Boa tarde 👋</p>
      <p className="text-sm opacity-80 mt-0.5">Quinta, 8 de Maio · Maputo</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Pedidos Ativos" value="18" sub="↑ 3 vs ontem" color="orange" />
      <StatCard label="Receita Hoje" value="12.4K" sub="MZN" color="green" />
      <StatCard label="Motoristas Online" value="5/8" color="blue" />
      <StatCard label="Taxa Conclusão" value="94%" sub="↑ 2%" color="purple" />
    </div>
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-700">Pedidos Recentes</p>
        <span className="text-xs text-orange-500 font-medium">ver todos →</span>
      </div>
      {ORDERS.slice(0, 3).map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign /></div>)}
    </div>
  </div>
);

const AdminOrders = () => {
  const [filter, setFilter] = useState("Todos");
  const statuses = ["Todos", "Pendente", "Em entrega", "Concluído", "Cancelado"];
  const filtered = filter === "Todos" ? ORDERS : ORDERS.filter(o => o.status === filter);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Pedidos</p>
        <button className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>
      {filtered.map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign /></div>)}
    </div>
  );
};

const AdminDrivers = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-slate-700">Motoristas</p>
      <button className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
        <Icon name="plus" size={14} /> Adicionar
      </button>
    </div>
    {DRIVERS.map(d => (
      <div key={d.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500">
            {d.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{d.name}</p>
              <span className={`w-2 h-2 rounded-full ${d.status === "online" ? "bg-green-400" : "bg-slate-300"}`} />
            </div>
            <p className="text-xs text-slate-400">{d.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800">{d.orders}</p>
            <p className="text-[11px] text-slate-400">Entregas</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-0.5">{d.rating}<Icon name="star" size={12} className="text-amber-400" /></p>
            <p className="text-[11px] text-slate-400">Avaliação</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${d.status === "online" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
              {d.status === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const AdminFinance = () => (
  <div className="space-y-4">
    <p className="text-sm font-bold text-slate-700">Controlo Financeiro</p>
    <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-5 text-white">
      <p className="text-xs opacity-80 font-medium uppercase tracking-wider">Receita Total — Maio</p>
      <p className="text-3xl font-bold mt-1">89,400 MZN</p>
      <p className="text-sm opacity-75 mt-1">↑ 12% vs Abril</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Lucro Líquido" value="42.1K" color="green" />
      <StatCard label="Custos Op." value="47.3K" color="orange" />
      <StatCard label="Combustível" value="12.8K" color="blue" />
      <StatCard label="Salários" value="28.5K" color="purple" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-700 mb-3">Métodos de Pagamento</p>
      {[
        { name: "Dinheiro", pct: 45, color: "bg-orange-400" },
        { name: "M-Pesa", pct: 35, color: "bg-green-400" },
        { name: "E-Mola", pct: 15, color: "bg-blue-400" },
        { name: "Visa / PayPal", pct: 5, color: "bg-purple-400" },
      ].map(p => (
        <div key={p.name} className="mb-3">
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span>{p.name}</span><span className="font-semibold">{p.pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminReports = () => (
  <div className="space-y-4">
    <p className="text-sm font-bold text-slate-700">Relatórios & Estatísticas</p>
    {/* mini bar chart */}
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Dia (última semana)</p>
      <div className="flex items-end justify-between gap-2 h-24">
        {[22, 18, 30, 25, 28, 35, 20].map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-slate-400">{v}</span>
            <div className="w-full bg-orange-400 rounded-t-md" style={{ height: `${(v / 35) * 80}px` }} />
            <span className="text-[9px] text-slate-400">{["S","T","Q","Q","S","S","D"][i]}</span>
          </div>
        ))}
      </div>
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-2">Ranking Motoristas</p>
      {DRIVERS.sort((a, b) => b.rating - a.rating).map((d, i) => (
        <div key={d.id} className="bg-white rounded-xl p-3 border border-slate-100 mb-2 flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-amber-400 text-white" : "bg-slate-100 text-slate-500"}`}>{i + 1}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700">{d.name}</p>
            <p className="text-xs text-slate-400">{d.orders} entregas</p>
          </div>
          <div className="flex items-center gap-0.5 text-sm font-bold text-slate-700">
            {d.rating}<Icon name="star" size={13} className="text-amber-400" />
          </div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Taxa Satisfação" value="96%" color="green" />
      <StatCard label="Tempo Médio" value="28min" color="blue" />
      <StatCard label="Cancelamentos" value="4.2%" color="orange" />
      <StatCard label="Clientes Activos" value="214" color="purple" />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── GESTOR APP ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const GestorApp = ({ user, onLogout }) => {
  const [tab, setTab] = useState("home");
  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "orders", label: "Pedidos", icon: "package" },
    { id: "map", label: "Mapa", icon: "map" },
    { id: "drivers", label: "Equipa", icon: "users" },
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Gestão Operacional" />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <GestorHome />}
        {tab === "orders" && <AdminOrders />}
        {tab === "map" && <GestorMap />}
        {tab === "drivers" && <AdminDrivers />}
      </div>
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
    </div>
  );
};

const GestorHome = () => (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 text-white">
      <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Operações de Hoje</p>
      <p className="text-2xl font-bold mt-1">Em curso 🚚</p>
      <p className="text-sm opacity-80 mt-0.5">5 motoristas activos</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Pedidos Hoje" value="24" color="orange" />
      <StatCard label="Em Entrega" value="6" color="blue" />
      <StatCard label="Concluídos" value="14" color="green" />
      <StatCard label="Pendentes" value="4" color="purple" />
    </div>
    <div className="flex items-center justify-between">
      <p className="text-sm font-bold text-slate-700">Pedidos Activos</p>
      <button className="flex items-center gap-1 bg-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
        <Icon name="plus" size={14} /> Criar Pedido
      </button>
    </div>
    {ORDERS.filter(o => ["Em entrega", "Atribuído", "Pendente"].includes(o.status)).map(o => (
      <div key={o.id}><OrderCard order={o} showAssign /></div>
    ))}
  </div>
);

const GestorMap = () => (
  <div className="space-y-4">
    <p className="text-sm font-bold text-slate-700">Monitorização em Tempo Real</p>
    {/* Fake map */}
    <div className="relative bg-slate-200 rounded-2xl overflow-hidden" style={{ height: 280 }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 320 280">
        {[0,1,2,3,4].map(i => <line key={i} x1={i*80} y1="0" x2={i*80} y2="280" stroke="#64748b" strokeWidth="1" />)}
        {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*70} x2="320" y2={i*70} stroke="#64748b" strokeWidth="1" />)}
        <rect x="40" y="20" width="60" height="30" rx="4" fill="#94a3b8" />
        <rect x="160" y="80" width="80" height="40" rx="4" fill="#94a3b8" />
        <rect x="220" y="160" width="60" height="50" rx="4" fill="#94a3b8" />
        <rect x="20" y="150" width="80" height="60" rx="4" fill="#94a3b8" />
      </svg>
      {/* Road lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 280">
        <path d="M0 140 Q160 120 320 140" stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <path d="M160 0 Q150 140 160 280" stroke="#e2e8f0" strokeWidth="8" fill="none" />
      </svg>
      {/* Driver pins */}
      {[
        { x: 90, y: 100, name: "João", color: "bg-green-500" },
        { x: 200, y: 60, name: "Beatriz", color: "bg-green-500" },
        { x: 130, y: 190, name: "Américo", color: "bg-slate-400" },
      ].map(d => (
        <div key={d.name} className="absolute" style={{ left: d.x, top: d.y, transform: "translate(-50%,-100%)" }}>
          <div className={`${d.color} text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md`}>{d.name}</div>
          <div className={`${d.color} w-2 h-2 rounded-full mx-auto -mt-0.5`} />
        </div>
      ))}
      {/* Order pin */}
      <div className="absolute" style={{ left: 170, top: 140, transform: "translate(-50%,-100%)" }}>
        <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">#001</div>
        <div className="bg-orange-500 w-2 h-2 rounded-full mx-auto -mt-0.5" />
      </div>
      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/90 rounded-xl px-3 py-2 text-xs space-y-1 shadow">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /><span>Online</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /><span>Offline</span></div>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /><span>Pedido</span></div>
      </div>
    </div>
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">Estado Motoristas</p>
      {DRIVERS.map(d => (
        <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
          <div className={`w-2 h-2 rounded-full ${d.status === "online" ? "bg-green-400" : "bg-slate-300"}`} />
          <span className="text-sm text-slate-700 flex-1">{d.name}</span>
          <span className="text-xs text-slate-400">{d.status === "online" ? "Em rota" : "Inactivo"}</span>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MOTORISTA APP ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const MotoristaApp = ({ user, onLogout }) => {
  const [tab, setTab] = useState("home");
  const [online, setOnline] = useState(true);
  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "orders", label: "Pedidos", icon: "package" },
    { id: "history", label: "Histórico", icon: "clock" },
    { id: "profile", label: "Perfil", icon: "settings" },
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Painel Motorista" notifs={1} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <MotoristaHome online={online} setOnline={setOnline} />}
        {tab === "orders" && <MotoristaOrders />}
        {tab === "history" && <MotoristaHistory />}
        {tab === "profile" && <MotoristaProfile user={user} />}
      </div>
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
    </div>
  );
};

const MotoristaHome = ({ online, setOnline }) => {
  const myOrders = ORDERS.filter(o => o.driver === "João Motorista");
  const activeOrder = myOrders.find(o => o.status === "Em entrega");

  return (
    <div className="space-y-4">
      {/* Status toggle */}
      <div className={`rounded-2xl p-4 flex items-center justify-between ${online ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-slate-500 to-slate-600"} text-white`}>
        <div>
          <p className="text-xs font-semibold opacity-80">Estado Actual</p>
          <p className="text-xl font-bold mt-0.5">{online ? "Online 🟢" : "Offline 🔴"}</p>
          <p className="text-xs opacity-75">Toque para alterar</p>
        </div>
        <button
          onClick={() => setOnline(!online)}
          className={`w-14 h-7 rounded-full relative transition-all ${online ? "bg-white/30" : "bg-white/20"}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all ${online ? "left-7" : "left-0.5"}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">12</p>
          <p className="text-[10px] text-slate-400">Hoje</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">4.8⭐</p>
          <p className="text-[10px] text-slate-400">Avaliação</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100 shadow-sm">
          <p className="text-lg font-bold text-slate-800">1,240</p>
          <p className="text-[10px] text-slate-400">MZN Hoje</p>
        </div>
      </div>

      {/* Active order */}
      {activeOrder && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Entrega Activa</p>
          <div className="bg-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold">{activeOrder.id}</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{activeOrder.status}</span>
            </div>
            <p className="text-base font-semibold">{activeOrder.client}</p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 text-sm opacity-90">
                <div className="w-2 h-2 rounded-full bg-orange-300 mt-1 shrink-0" />
                <span>{activeOrder.origin}</span>
              </div>
              <div className="flex items-start gap-2 text-sm opacity-90">
                <div className="w-2 h-2 rounded-full bg-white mt-1 shrink-0" />
                <span>{activeOrder.dest}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-white text-blue-700 font-bold text-sm py-2.5 rounded-xl">Navegar</button>
              <button className="flex-1 bg-green-400 text-white font-bold text-sm py-2.5 rounded-xl">Concluir ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* New order notification */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="bell" size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Novo Pedido Disponível</p>
            <p className="text-xs text-slate-500 mt-0.5">Marco Simango · Av. Julius Nyerere · 1.9 km</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-orange-500 text-white text-xs font-bold py-2 rounded-xl">Aceitar</button>
              <button className="flex-1 bg-slate-100 text-slate-600 text-xs font-semibold py-2 rounded-xl">Recusar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MotoristaOrders = () => {
  const myOrders = ORDERS.filter(o => o.driver === "João Motorista");
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-700">Os Meus Pedidos</p>
      {myOrders.map(o => (
        <div key={o.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-800">{o.id}</span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[o.status]}`}>{o.status}</span>
          </div>
          <p className="text-sm text-slate-700">{o.client}</p>
          <p className="text-xs text-slate-400 mt-1">{o.dest}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-400 flex items-center gap-1"><Icon name="location" size={12} />{o.dist}</span>
            <span className="text-sm font-bold text-orange-500">{o.total}</span>
          </div>
          {o.status === "Em entrega" && (
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-blue-50 text-blue-600 text-xs font-semibold py-2 rounded-xl">Navegar</button>
              <button className="flex-1 bg-green-500 text-white text-xs font-bold py-2 rounded-xl">Concluir</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

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
  </div>
);

const MotoristaProfile = ({ user }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-3">JM</div>
      <p className="text-base font-bold text-slate-800">{user.name}</p>
      <p className="text-sm text-slate-400">Motorista · ID #MZ-003</p>
      <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
        {[1,2,3,4].map(i => <Icon key={i} name="star" size={16} className="fill-amber-400" />)}
        <Icon name="star" size={16} />
        <span className="text-sm text-slate-600 ml-1">4.8</span>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {[
        { label: "Telefone", value: "+258 84 111 2233", icon: "bell" },
        { label: "Email", value: "motorista@judelivery.mz", icon: "bell" },
        { label: "Zona", value: "Maputo — Polana", icon: "location" },
        { label: "Veículo", value: "Mota · MC-1234-MZ", icon: "truck" },
        { label: "Estado", value: "Activo", icon: "check" },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
          <span className="text-sm text-slate-500">{item.label}</span>
          <span className="text-sm font-medium text-slate-700">{item.value}</span>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl p-4 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 mb-2">Documentos</p>
      {["Carta de Condução", "BI / Passaporte", "Seguro Veículo"].map(d => (
        <div key={d} className="flex items-center gap-2 py-2 border-b border-slate-50 last:border-0">
          <Icon name="check" size={16} className="text-green-500" />
          <span className="text-sm text-slate-700">{d}</span>
          <span className="ml-auto text-xs text-green-500 font-medium">Válido</span>
        </div>
      ))}
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.role === "admin") return <AdminApp user={user} onLogout={() => setUser(null)} />;
  if (user.role === "gestor") return <GestorApp user={user} onLogout={() => setUser(null)} />;
  if (user.role === "motorista") return <MotoristaApp user={user} onLogout={() => setUser(null)} />;
  return null;
}
