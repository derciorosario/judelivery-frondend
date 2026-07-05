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
  Clock,
  ShoppingBag,
  User,
  FileText,
  Image,
  Upload,
  Filter,
  Search,
  Edit,
  Trash2,
  Tag,
  Store,
  Warehouse,
  Calendar,
  MessageSquare,
  Shield,
  Wrench,
  AlertTriangle,
  MoreHorizontal,
  Phone,
  Heart,
  ShoppingCart,
  CreditCard,
  Smartphone,
  Mail,
  Lock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Navigation,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  TrendingUp,
  Award,
  Zap,
  Menu,
  Grid,
  List,
  Percent,
  Flame,
  Coffee,
  Pizza,
  Salad,
  Beer,
  Cake,
  Sofa,
  Moon,
  Sun,
  MapPin as MapPinIcon,
  PhoneCall
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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
    shopping: ShoppingBag,
    user: User,
    file: FileText,
    image: Image,
    upload: Upload,
    filter: Filter,
    search: Search,
    edit: Edit,
    trash: Trash2,
    tag: Tag,
    store: Store,
    warehouse: Warehouse,
    calendar: Calendar,
    message: MessageSquare,
    shield: Shield,
    wrench: Wrench,
    alertTriangle: AlertTriangle,
    more: MoreHorizontal,
    phone: Phone,
    heart: Heart,
    shoppingCart: ShoppingCart,
    creditCard: CreditCard,
    smartphone: Smartphone,
    mail: Mail,
    lock: Lock,
    arrowLeft: ArrowLeft,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    navigation: Navigation,
    checkCircle: CheckCircle,
    xCircle: XCircle,
    clockIcon: ClockIcon,
    trendingUp: TrendingUp,
    award: Award,
    zap: Zap,
    menu: Menu,
    grid: Grid,
    list: List,
    percent: Percent,
    flame: Flame,
    coffee: Coffee,
    pizza: Pizza,
    salad: Salad,
    beer: Beer,
    cake: Cake,
    sofa: Sofa,
    moon: Moon,
    sun: Sun,
    mapPin: MapPinIcon,
    phoneCall: PhoneCall,
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
  // Customer users
  { id: 4, email: "cliente@judelivery.mz", password: "cliente123", role: "cliente", name: "Ana Cliente", phone: "+258 84 000 0000", address: "Av. Eduardo Mondlane 45, Maputo" },
  { id: 5, email: "maria@email.com", password: "maria123", role: "cliente", name: "Maria Silva", phone: "+258 82 111 2222", address: "Rua da Resistência 12, Maputo" },
];

const ORDERS = [
  { id: "#001", client: "Ana Sitoe", clientId: 4, origin: "Loja Central, Maputo", dest: "Av. Eduardo Mondlane 45", status: "Em entrega", driver: "João Motorista", total: "450 MZN", time: "14:32", dist: "3.2 km", productId: "1", estimatedDelivery: "15:15" },
  { id: "#002", client: "Pedro Nhaca", clientId: 5, origin: "Armazém Norte", dest: "Bairro Polana Cimento", status: "Pendente", driver: "—", total: "280 MZN", time: "14:48", dist: "5.1 km", productId: "2", estimatedDelivery: "15:30" },
  { id: "#003", client: "Fátima Bila", clientId: 6, origin: "Loja Central, Maputo", dest: "Rua da Resistência 12", status: "Concluído", driver: "João Motorista", total: "620 MZN", time: "13:10", dist: "2.8 km", productId: "3", estimatedDelivery: "13:50" },
  { id: "#004", client: "Marco Simango", clientId: 7, origin: "Loja Sul", dest: "Av. Julius Nyerere 88", status: "Atribuído", driver: "João Motorista", total: "180 MZN", time: "15:05", dist: "1.9 km", productId: "5", estimatedDelivery: "15:25" },
  { id: "#005", client: "Rosa Cossa", clientId: 8, origin: "Armazém Norte", dest: "Matola, Zona A", status: "Cancelado", driver: "—", total: "340 MZN", time: "12:55", dist: "8.4 km", productId: "1", estimatedDelivery: "-" },
];

const DRIVERS = [
  { id: 1, name: "João Motorista", status: "online", orders: 12, rating: 4.8, phone: "+258 84 111 2233", email: "joao@judelivery.mz", vehicle: "Mota · MC-1234-MZ", licensePlate: "MC-1234-MZ", zone: "Maputo — Polana", position: [-25.9653, 32.5778] },
  { id: 2, name: "Américo Cossa", status: "offline", orders: 8, rating: 4.5, phone: "+258 82 999 0011", email: "americo@judelivery.mz", vehicle: "Mota · MC-5678-MZ", licensePlate: "MC-5678-MZ", zone: "Maputo — Sommerschield", position: [-25.9753, 32.5678] },
  { id: 3, name: "Beatriz Mache", status: "online", orders: 15, rating: 4.9, phone: "+258 86 777 5566", email: "beatriz@judelivery.mz", vehicle: "Mota · MC-9012-MZ", licensePlate: "MC-9012-MZ", zone: "Maputo — Polana", position: [-25.9553, 32.5878] },
];

// ─── PRODUCTS DATA ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Pizza Margherita", category: "Alimentação", price: 350, available: true, origin: "Loja Central, Maputo", stock: 50, image: "🍕", description: "Pizza italiana com molho de tomate, mussarela e manjericão", preparationTime: 25, popular: true },
  { id: 2, name: "Hambúrguer Clássico", category: "Alimentação", price: 280, available: true, origin: "Loja Central, Maputo", stock: 30, image: "🍔", description: "Hambúrguer 180g com queijo, alface, tomate e molho especial", preparationTime: 15, popular: true },
  { id: 3, name: "Refrigerante 2L", category: "Bebidas", price: 120, available: true, origin: "Armazém Norte", stock: 100, image: "🥤", description: "Refrigerante sabor cola 2 litros", preparationTime: 2, popular: false },
  { id: 4, name: "Combo Família", category: "Alimentação", price: 850, available: false, origin: "Loja Central, Maputo", stock: 0, image: "🍱", description: "Combo para 4 pessoas: 2 pizzas + 1 refrigerante + sobremesa", preparationTime: 35, popular: true },
  { id: 5, name: "Salada Caesar", category: "Alimentação", price: 220, available: true, origin: "Loja Sul", stock: 25, image: "🥗", description: "Salada com frango grelhado, alface romana, parmesão e molho Caesar", preparationTime: 10, popular: false },
  { id: 6, name: "Sushi Mix", category: "Alimentação", price: 450, available: true, origin: "Loja Central, Maputo", stock: 20, image: "🍣", description: "Mix de 20 peças de sushi variados", preparationTime: 30, popular: true },
  { id: 7, name: "Suco Natural", category: "Bebidas", price: 80, available: true, origin: "Loja Sul", stock: 60, image: "🧃", description: "Suco natural de laranja ou maracujá (500ml)", preparationTime: 5, popular: false },
  { id: 8, name: "Sorvete Especial", category: "Doces", price: 45, available: true, origin: "Armazém Norte", stock: 80, image: "🍦", description: "Sorvete artesanal de chocolate ou morango", preparationTime: 2, popular: true },
];

const PRODUCT_CATEGORIES = ["Todos", "Alimentação", "Bebidas", "Doces", "Salgados", "Outros"];
const PRODUCT_CATEGORIES_WITH_ICONS = [
  { name: "Todos", icon: "grid" },
  { name: "Alimentação", icon: "pizza" },
  { name: "Bebidas", icon: "beer" },
  { name: "Doces", icon: "cake" },
  { name: "Salgados", icon: "coffee" },
  { name: "Outros", icon: "sofa" },
];

// ─── CUSTOMERS DATA ────────────────────────────────────────────────────────────
const CUSTOMERS = [
  { id: 1, name: "Ana Sitoe", phone: "+258 84 111 2233", email: "ana@email.com", orders: 12, rating: 4.8, frequent: true, lastOrder: "2024-05-07" },
  { id: 2, name: "Pedro Nhaca", phone: "+258 82 999 0011", email: "pedro@email.com", orders: 8, rating: 4.5, frequent: true, lastOrder: "2024-05-06" },
  { id: 3, name: "Fátima Bila", phone: "+258 86 777 5566", email: "fatima@email.com", orders: 15, rating: 4.9, frequent: true, lastOrder: "2024-05-07" },
  { id: 4, name: "Marco Simango", phone: "+258 83 555 4433", email: "marco@email.com", orders: 3, rating: 4.2, frequent: false, lastOrder: "2024-05-05" },
  { id: 5, name: "Rosa Cossa", phone: "+258 84 333 2211", email: "rosa@email.com", orders: 7, rating: 4.6, frequent: false, lastOrder: "2024-05-04" },
];

// ─── INCIDENTS DATA ────────────────────────────────────────────────────────────
const INCIDENTS = [
  { 
    id: 1, 
    type: "Acidente", 
    title: "Colisão na Av. Julius Nyerere", 
    description: "Colisão com motociclista ao mudar de faixa", 
    date: "2024-05-07", 
    time: "14:30", 
    driver: "João Motorista", 
    status: "Em análise",
    photos: ["foto1.jpg", "foto2.jpg"],
    documents: ["relatorio.pdf"]
  },
  { 
    id: 2, 
    type: "Avaria", 
    title: "Quebra de amortecedor", 
    description: "Amortecedor dianteiro quebrado após passeio em estrada de terra", 
    date: "2024-05-06", 
    time: "09:15", 
    driver: "Américo Cossa", 
    status: "Resolvido",
    photos: ["avaria1.jpg"],
    documents: []
  },
  { 
    id: 3, 
    type: "Problema Entrega", 
    title: "Cliente não atende", 
    description: "Tentativas de entrega sem sucesso - cliente não atende porta", 
    date: "2024-05-05", 
    time: "16:45", 
    driver: "Beatriz Mache", 
    status: "Concluído",
    photos: [],
    documents: ["comprovante_entrega.pdf"]
  },
];

const INCIDENT_TYPES = ["Acidente", "Avaria", "Problema Entrega"];
const INCIDENT_STATUSES = ["Em análise", "Resolvido", "Concluído", "Cancelado"];

// ─── NOTIFICATIONS DATA ───────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  { id: 1, type: "order", title: "Novo Pedido #006", message: "Ana Sitoe fez um novo pedido - Pizza Margherita", time: "5 min atrás", read: false, icon: "package" },
  { id: 2, type: "driver", title: "Motorista Online", message: "Beatriz Mache ficou online e está disponível", time: "12 min atrás", read: false, icon: "users" },
  { id: 3, type: "incident", title: "Incidente Reportado", message: "Colisão na Av. Julius Nyerere - João Motorista", time: "1 hora atrás", read: true, icon: "alertTriangle" },
  { id: 4, type: "order", title: "Pedido Concluído", message: "Entrega #003 concluída com sucesso - Fátima Bila", time: "2 horas atrás", read: true, icon: "check" },
  { id: 5, type: "finance", title: "Pagamento Recebido", message: "Recebido 1.240 MZN de entregas de hoje", time: "3 horas atrás", read: true, icon: "dollar" },
  { id: 6, type: "driver", title: "Motorista Offline", message: "Américo Cossa ficou offline - Sem atividade", time: "4 horas atrás", read: true, icon: "users" },
  { id: 7, type: "order", title: "Pedido Pendente", message: "Pedido #002 aguarda atribuição de motorista", time: "5 horas atrás", read: false, icon: "package" },
  { id: 8, type: "incident", title: "Avaria Resolvida", message: "Quebra de amortecedor - Américo Cossa - Resolvido", time: "Ontem", read: true, icon: "wrench" },
];

const STATUSCOLOR = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Pendente": "bg-amber-100 text-amber-700",
  "Concluído": "bg-green-100 text-green-700",
  "Atribuído": "bg-purple-100 text-purple-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em coleta": "bg-orange-100 text-orange-700",
  "Em preparação": "bg-yellow-100 text-yellow-700",
  "Em rota de entrega": "bg-indigo-100 text-indigo-700",
  "Entregue": "bg-green-100 text-green-700",
  "Pedido recebido": "bg-gray-100 text-gray-700",
};

// ─── CUSTOMER SPECIFIC DATA ────────────────────────────────────────────────────
const PROMOTIONS = [
  { id: 1, title: "Frete Grátis", description: "Nas primeiras 5 entregas", discount: "Frete Grátis", code: "PRIMEIRAS5", validUntil: "2024-06-30", icon: "truck" },
  { id: 2, title: "10% Off", description: "Em pedidos acima de 500 MZN", discount: "10%", code: "DESCONTO10", validUntil: "2024-05-31", icon: "percent" },
  { id: 3, title: "Combo Família", description: "Pizza + Refri + Sobremesa", discount: "850 MZN", code: "COMBO", validUntil: "2024-06-15", icon: "shopping" },
];

const CUSTOMER_ADDRESSES = [
  { id: 1, label: "Casa", address: "Av. Eduardo Mondlane 45, Maputo", isDefault: true },
  { id: 2, label: "Trabalho", address: "Av. Julius Nyerere 88, Maputo", isDefault: false },
  { id: 3, label: "Casa da Avó", address: "Bairro Polana Cimento, Maputo", isDefault: false },
];

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  const credentials = [
    { role: "Admin", email: "admin@judelivery.mz", pass: "admin123", color: "bg-orange-50 border-orange-200", dot: "bg-orange-400" },
    { role: "Gestor", email: "gestor@judelivery.mz", pass: "gestor123", color: "bg-teal-50 border-teal-200", dot: "bg-teal-400" },
    { role: "Motorista", email: "motorista@judelivery.mz", pass: "moto123", color: "bg-blue-50 border-blue-200", dot: "bg-blue-400" },
    { role: "Cliente", email: "cliente@judelivery.mz", pass: "cliente123", color: "bg-purple-50 border-purple-200", dot: "bg-purple-400" },
  ];

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) onLogin(user);
    else { setError("Email ou senha incorretos."); setLoading(false); }
  };

  const handleRegister = async () => {
    if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) {
      setError("Preencha todos os campos");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (USERS.find(u => u.email === registerForm.email)) {
      setError("Email já registrado");
      return;
    }
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    
    const newUser = {
      id: USERS.length + 1,
      email: registerForm.email,
      password: registerForm.password,
      role: "cliente",
      name: registerForm.name,
      phone: registerForm.phone,
      address: "Endereço não definido"
    };
    USERS.push(newUser);
    onLogin(newUser);
  };

  const fillCred = (c) => { setEmail(c.email); setPassword(c.pass); setError(""); setIsRegistering(false); };

  if (isRegistering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex flex-col items-center justify-center px-4 py-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
            <Icon name="user" size={30} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Criar Conta</h1>
          <p className="text-slate-400 text-sm mt-1">Junte-se ao DeliveryMZ</p>
        </div>
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
          <button onClick={() => setIsRegistering(false)} className="flex items-center gap-1 text-slate-500 text-sm mb-4">
            <Icon name="arrowLeft" size={16} /> Voltar
          </button>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nome Completo</label>
              <input
                type="text" value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                placeholder="Seu nome"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
              <input
                type="email" value={registerForm.email} onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                placeholder="seu@email.com"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Telefone</label>
              <input
                type="tel" value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                placeholder="+258 84 000 0000"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Senha</label>
              <input
                type={showPass ? "text" : "password"} value={registerForm.password} onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confirmar Senha</label>
              <input
                type={showPass ? "text" : "password"} value={registerForm.confirmPassword} onChange={e => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
              />
            </div>
            {error && <p className="text-red-500 text-sm flex items-center gap-1"><Icon name="alert" size={16} />{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-all disabled:opacity-50"
            >
              {loading ? "A criar conta..." : "Criar Conta"}
            </button>
            <p className="text-center text-xs text-slate-400">
              Já tem conta? <button onClick={() => setIsRegistering(false)} className="text-purple-500 font-semibold">Entrar</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
          <Icon name="truck" size={30} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">DeliveryMZ</h1>
        <p className="text-slate-400 text-sm mt-1">Plataforma de Gestão Logística</p>
      </div>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-5">Entrar na plataforma</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-slate-50 pr-10"
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
            className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600 transition-all disabled:opacity-50"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </div>
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
        <div className="mt-4 text-center">
          <button onClick={() => setIsRegistering(true)} className="text-sm text-purple-500 font-semibold hover:underline">
            Não tem conta? Criar conta
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── SHARED HEADER ────────────────────────────────────────────────────────────
const Header = ({ user, onLogout, title, notifs = 3, onNotificationClick, showBack = false, onBack }) => (
  <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
    <div className="flex items-center gap-3">
      {showBack && (
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon name="arrowLeft" size={18} />
        </button>
      )}
      <div>
        <p className="text-xs text-slate-400">Olá, {user.name.split(" ")[0]}</p>
        <h1 className="text-base font-bold text-slate-800">{title}</h1>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative">
        <button onClick={onNotificationClick} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
          <Icon name="bell" size={18} />
        </button>
        {notifs > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{notifs}</span>}
      </div>
      <button onClick={onLogout} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
        <Icon name="logout" size={18} />
      </button>
    </div>
  </div>
);

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
const BottomNav = ({ tabs, active, setActive }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const visibleTabs = tabs.slice(0, 4);
  const hiddenTabs = tabs.slice(4);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex z-30 safe-area-pb">
      {visibleTabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors ${active === t.id ? "text-purple-500" : "text-slate-400"}`}>
          <Icon name={t.icon} size={22} />
          <span className="text-[10px] font-medium">{t.label}</span>
        </button>
      ))}
      {hiddenTabs.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors pr-4 ${hiddenTabs.some(t => t.id === active) ? "text-purple-500" : "text-slate-400"}`}
          >
            <Icon name="more" size={22} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 !mb-0 z-20"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute bottom-full right-2 mb-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 min-w-[140px] z-30">
                {hiddenTabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActive(t.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${active === t.id ? "text-purple-500" : "text-slate-600"}`}
                  >
                    <Icon name={t.icon} size={18} />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "purple" }) => {
  const colors = { purple: "bg-purple-500", orange: "bg-orange-500", blue: "bg-blue-500", green: "bg-green-500" };
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
const OrderCard = ({ order, showAssign }) => {
  const product = PRODUCTS.find(p => p.id.toString() === order.productId);
  const productName = product ? product.name : "Produto não especificado";
  const driverName = order.driver !== "—" ? order.driver : "Não atribuído";
  const timeEstimate = order.dist ? Math.round(parseFloat(order.dist) * 3) + " min" : "15 min";
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{order.id}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[order.status]}`}>{order.status}</span>
        </div>
        <span className="text-sm font-bold text-purple-500">{order.total}</span>
      </div>
      <p className="text-sm font-medium text-slate-700">{order.client}</p>
      <p className="text-xs text-slate-500 mb-1">{productName}</p>
      <p className="text-xs text-slate-500 mb-1">Motorista: {driverName}</p>
      <div className="mt-2 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-purple-400 mt-0.5 shrink-0" />
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
          <span className="flex items-center gap-1"><Icon name="clock" size={12} />{timeEstimate}</span>
        </div>
        {showAssign && order.status === "Pendente" && (
          <button className="text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors">
            Atribuir →
          </button>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ADMIN APP ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const AdminApp = ({ user, onLogout }) => {
  const [tab, setTab] = useState("home");
  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "orders", label: "Pedidos", icon: "package" },
    { id: "drivers", label: "Motoristas", icon: "users" },
    { id: "products", label: "Produtos", icon: "shopping" },
    { id: "customers", label: "Clientes", icon: "user" },
    { id: "incidents", label: "Incidentes", icon: "alertTriangle" },
    { id: "finance", label: "Finanças", icon: "dollar" },
    { id: "reports", label: "Relatórios", icon: "chart" },
    { id: "notifications", label: "Notificações", icon: "bell" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Painel Admin" notifs={NOTIFICATIONS.filter(n => !n.read).length} onNotificationClick={() => setTab("notifications")} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <AdminHome />}
        {tab === "orders" && <AdminOrders />}
        {tab === "drivers" && <AdminDrivers />}
        {tab === "products" && <AdminProducts />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "incidents" && <AdminIncidents />}
        {tab === "finance" && <AdminFinance />}
        {tab === "reports" && <AdminReports />}
        {tab === "notifications" && <NotificationsPage />}
      </div>
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
    </div>
  );
};

const AdminHome = () => (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
      <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Visão Geral — Hoje</p>
      <p className="text-2xl font-bold mt-1">Boa tarde 👋</p>
      <p className="text-sm opacity-80 mt-0.5">Quinta, 8 de Maio · Maputo</p>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <StatCard label="Pedidos Ativos" value="18" sub="↑ 3 vs ontem" color="purple" />
      <StatCard label="Receita Hoje" value="12.4K" sub="MZN" color="green" />
      <StatCard label="Motoristas Online" value="5/8" color="blue" />
      <StatCard label="Taxa Conclusão" value="94%" sub="↑ 2%" color="orange" />
    </div>
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-700">Pedidos Recentes</p>
        <span className="text-xs text-purple-500 font-medium">ver todos →</span>
      </div>
      {ORDERS.slice(0, 3).map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign /></div>)}
    </div>
  </div>
);

const AdminOrders = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const statuses = ["Todos", "Pendente", "Em entrega", "Concluído", "Cancelado"];
  const filtered = filter === "Todos" ? ORDERS : ORDERS.filter(o => o.status === filter);

  const handleAddOrder = (newOrder) => {
    ORDERS.push(newOrder);
    setFilter(filter);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Pedidos</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-purple-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <AddOrderModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddOrder} />
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === s ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {s}
          </button>
        ))}
      </div>
      {filtered.map(o => <div key={o.id} className="mb-3"><OrderCard order={o} showAssign /></div>)}
    </div>
  );
};

const AdminDrivers = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleAddDriver = (newDriver) => {
    DRIVERS.push(newDriver);
  };

  const handleViewOnMap = (driver) => {
    setSelectedDriver(driver);
    setShowMapModal(true);
  };

  const handleViewDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Motoristas</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
          <Icon name="plus" size={14} /> Adicionar
        </button>
      </div>
      <AddDriverModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDriver} />
      
      {showMapModal && selectedDriver && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Localização - {selectedDriver.name}</h2>
              <button onClick={() => setShowMapModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="p-4">
              <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 280 }}>
                <MapContainer
                  center={selectedDriver.position || [-25.9653, 32.5778]}
                  zoom={16}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {selectedDriver.position && (
                    <Marker position={selectedDriver.position}>
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold">{selectedDriver.name}</p>
                          <p className={selectedDriver.status === "online" ? "text-green-600" : "text-slate-500"}>
                            {selectedDriver.status === "online" ? "Online" : "Offline"}
                          </p>
                          <p className="text-slate-400">{selectedDriver.zone}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="phone" size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="location" size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedDriver.zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="truck" size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{selectedDriver.vehicle} · {selectedDriver.licensePlate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <DriverDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} driver={selectedDriver} />
      
      {DRIVERS.map(d => (
        <div
          key={d.id}
          className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:bg-slate-50 ${d.status === "online" ? "cursor-pointer" : ""}`}
          onClick={() => d.status === "online" && handleViewOnMap(d)}
        >
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
            <div className="ml-auto flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleViewOnMap(d); }}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Ver no mapa"
              >
                <Icon name="map" size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleViewDetails(d); }}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                title="Ver detalhes"
              >
                <Icon name="eye" size={14} />
              </button>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${d.status === "online" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                {d.status === "online" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 mb-3">Pedidos por Dia (última semana)</p>
      <div className="flex items-end justify-between gap-2 h-24">
        {[22, 18, 30, 25, 28, 35, 20].map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-slate-400">{v}</span>
            <div className="w-full bg-purple-400 rounded-t-md" style={{ height: `${(v / 35) * 80}px` }} />
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

// ─── ADMIN PRODUCTS ───────────────────────────────────────────────────────────
const AdminProducts = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const categories = ["Todos", ...PRODUCT_CATEGORIES];
  const filtered = filter === "Todos" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAddProduct = (newProduct) => {
    PRODUCTS.push(newProduct);
  };

  const handleEditProduct = (updatedProduct) => {
    const index = PRODUCTS.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) PRODUCTS[index] = updatedProduct;
  };

  const handleDeleteProduct = (id) => {
    const index = PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) PRODUCTS.splice(index, 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Produtos</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-purple-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} />
      <EditProductModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} product={selectedProduct} onEdit={handleEditProduct} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === c ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>
      
      {filtered.map(p => (
        <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.image}</span>
                <p className="text-sm font-bold text-slate-800">{p.name}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {p.available ? "Disponível" : "Indisponível"}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-purple-500">{p.price} MZN</span>
          </div>
          <p className="text-xs text-slate-500 mb-2 line-clamp-2">{p.description}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
            <Icon name="store" size={12} />
            <span>{p.origin}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <span className="text-xs text-slate-400">Stock: {p.stock}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => { setSelectedProduct(p); setShowEditModal(true); }} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">
                <Icon name="edit" size={14} />
              </button>
              <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                <Icon name="trash" size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── ADMIN CUSTOMERS ───────────────────────────────────────────────────────────
const AdminCustomers = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const filters = ["Todos", "Frequentes", "Outros"];
  const filtered = filter === "Todos" 
    ? CUSTOMERS 
    : filter === "Frequentes" 
      ? CUSTOMERS.filter(c => c.frequent) 
      : CUSTOMERS.filter(c => !c.frequent);

  const handleAddCustomer = (newCustomer) => {
    CUSTOMERS.push(newCustomer);
  };

  const customerOrders = (customerName) => {
    return ORDERS.filter(o => o.client === customerName);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Clientes</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-purple-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <AddCustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddCustomer} />
      <CustomerDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} customer={selectedCustomer} orders={selectedCustomer ? customerOrders(selectedCustomer.name) : []} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filtered.map(c => (
        <div key={c.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Icon name="user" size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400">{c.phone}</p>
              </div>
            </div>
            {c.frequent && (
              <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Frequente</span>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-sm font-bold text-slate-800">{c.orders}</p>
                <p className="text-[11px] text-slate-400">Pedidos</p>
              </div>
              <div className="flex items-center gap-0.5 text-sm font-bold text-slate-700">
                {c.rating}<Icon name="star" size={12} className="text-amber-400" />
              </div>
            </div>
            <button onClick={() => { setSelectedCustomer(c); setShowDetailModal(true); }} className="text-xs text-purple-500 font-medium">
              Ver detalhes →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── ADMIN INCIDENTS ───────────────────────────────────────────────────────────
const AdminIncidents = () => {
  const [filter, setFilter] = useState("Todos");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  const filters = ["Todos", ...INCIDENT_TYPES];
  const filtered = filter === "Todos" ? INCIDENTS : INCIDENTS.filter(i => i.type === filter);

  const handleAddIncident = (newIncident) => {
    INCIDENTS.push(newIncident);
  };

  const getIncidentColor = (type) => {
    switch(type) {
      case "Acidente": return "bg-red-100 text-red-700";
      case "Avaria": return "bg-orange-100 text-orange-700";
      case "Problema Entrega": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Gestão de Incidentes</p>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-purple-300">
          <Icon name="plus" size={14} /> Registrar
        </button>
      </div>
      <AddIncidentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddIncident} />
      <IncidentDetailModal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} incident={selectedIncident} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filtered.map(i => (
        <div key={i.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(i.type)}`}>{i.type}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i.status === "Em análise" ? "bg-amber-100 text-amber-700" : i.status === "Resolvido" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                {i.status}
              </span>
            </div>
            <span className="text-xs text-slate-400">{i.date} {i.time}</span>
          </div>
          <p className="text-sm font-bold text-slate-800">{i.title}</p>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{i.description}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">{i.driver}</span>
            <button onClick={() => { setSelectedIncident(i); setShowDetailModal(true); }} className="text-xs text-purple-500 font-medium">
              Ver detalhes →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

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
    { id: "products", label: "Produtos", icon: "shopping" },
    { id: "customers", label: "Clientes", icon: "user" },
    { id: "incidents", label: "Incidentes", icon: "alertTriangle" },
    { id: "notifications", label: "Notificações", icon: "bell" },
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Gestão Operacional" notifs={NOTIFICATIONS.filter(n => !n.read).length} onNotificationClick={() => setTab("notifications")} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <GestorHome />}
        {tab === "orders" && <AdminOrders />}
        {tab === "map" && <GestorMap />}
        {tab === "drivers" && <AdminDrivers />}
        {tab === "products" && <AdminProducts />}
        {tab === "customers" && <AdminCustomers />}
        {tab === "incidents" && <AdminIncidents />}
        {tab === "notifications" && <NotificationsPage />}
      </div>
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
    </div>
  );
};

const GestorHome = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddOrder = (newOrder) => {
    ORDERS.push(newOrder);
  };

  return (
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
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-teal-500 text-white text-xs font-semibold px-3 py-2 rounded-xl">
          <Icon name="plus" size={14} /> Criar Pedido
        </button>
      </div>
      <AddOrderModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddOrder} />
      {ORDERS.filter(o => ["Em entrega", "Atribuído", "Pendente"].includes(o.status)).map(o => (
        <div key={o.id}><OrderCard order={o} showAssign /></div>
      ))}
    </div>
  );
};

const GestorMap = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [mapCenter, setMapCenter] = useState([-25.9653, 32.5778]);
  const [mapZoom, setMapZoom] = useState(13);
  
  const createTruckIcon = (status) => {
    const color = status === "online" ? "#10b981" : "#94a3b8";
    return new L.DivIcon({
      className: "custom-truck-marker",
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(45deg);">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  const handleDriverSelect = (driver) => {
    setSelectedDriver(driver);
    if (driver.position) {
      setMapCenter(driver.position);
      setMapZoom(16);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-slate-700">Monitorização em Tempo Real</p>
      <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 280 }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {DRIVERS.map(driver => (
            driver.position && (
              <Marker
                key={driver.id}
                position={driver.position}
                icon={createTruckIcon(driver.status)}
              >
                <Popup>
                  <div className="text-xs">
                    <p className="font-bold">{driver.name}</p>
                    <p className={driver.status === "online" ? "text-green-600" : "text-slate-500"}>
                      {driver.status === "online" ? "Online" : "Offline"}
                    </p>
                    <p className="text-slate-400">{driver.zone}</p>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Estado Motoristas</p>
        {DRIVERS.map(d => (
          <button
            key={d.id}
            onClick={() => handleDriverSelect(d)}
            className={`w-full flex items-center gap-3 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-2 transition-colors ${selectedDriver?.id === d.id ? "bg-purple-50" : ""}`}
          >
            <div className={`w-2 h-2 rounded-full ${d.status === "online" ? "bg-green-400" : "bg-slate-300"}`} />
            <span className="text-sm text-slate-700 flex-1 text-left">{d.name}</span>
            <span className="text-xs text-slate-400">{d.status === "online" ? "Em rota" : "Inactivo"}</span>
            {d.status === "online" && (
              <Icon name="location" size={14} className="text-purple-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CLIENTE APP ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const ClienteApp = ({ user, onLogout }) => {
  const [tab, setTab] = useState("home");
  const [cart, setCart] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(CUSTOMER_ADDRESSES.find(a => a.isDefault) || CUSTOMER_ADDRESSES[0]);
  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);

  const unreadNotifications = NOTIFICATIONS.filter(n => !n.read).length;

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    
    const newOrderId = `#${String(ORDERS.length + 1).padStart(3, "0")}`;
    const newOrder = {
      id: newOrderId,
      client: user.name,
      clientId: user.id,
      origin: "Loja Central, Maputo",
      dest: selectedAddress.address,
      status: "Pedido recebido",
      driver: "—",
      total: getCartTotal() + " MZN",
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      dist: "3.2 km",
      productId: cart[0]?.id.toString(),
      estimatedDelivery: new Date(new Date().getTime() + 45 * 60000).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })
    };
    
    ORDERS.push(newOrder);
    setOrderPlaced(newOrder);
    setTrackingOrder(newOrder);
    setCart([]);
    setShowCheckoutModal(false);
    setShowCartModal(false);
    
    // Add notification
    NOTIFICATIONS.unshift({
      id: NOTIFICATIONS.length + 1,
      type: "order",
      title: "Pedido Confirmado",
      message: `Seu pedido ${newOrderId} foi recebido e está sendo preparado`,
      time: "agora",
      read: false,
      icon: "package"
    });
    
    setTimeout(() => {
      // Simulate status update
      if (trackingOrder?.id === newOrder.id) {
        setTrackingOrder({ ...newOrder, status: "Em preparação" });
      }
    }, 3000);
  };

  const tabs = [
    { id: "home", label: "Início", icon: "home" },
    { id: "orders", label: "Meus Pedidos", icon: "package" },
    { id: "profile", label: "Perfil", icon: "user" },
    { id: "notifications", label: "Notificações", icon: "bell" },
  ];

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header 
        user={user} 
        onLogout={onLogout} 
        title="DeliveryMZ" 
        notifs={unreadNotifications} 
        onNotificationClick={() => setTab("notifications")} 
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <ClienteHome user={user} addToCart={addToCart} cartCount={cartItemsCount} onCartClick={() => setShowCartModal(true)} />}
        {tab === "orders" && <ClienteOrders user={user} onTrackOrder={(order) => { setTrackingOrder(order); setTab("tracking"); }} />}
        {tab === "profile" && <ClienteProfile user={user} addresses={CUSTOMER_ADDRESSES} />}
        {tab === "notifications" && <NotificationsPage />}
        {tab === "tracking" && trackingOrder && <OrderTracking order={trackingOrder} onBack={() => setTab("orders")} />}
      </div>
      
      {/* Floating Cart Button */}
      {cartItemsCount > 0 && tab === "home" && (
        <button
          onClick={() => setShowCartModal(true)}
          className="fixed bottom-20 right-4 z-40 bg-purple-500 text-white rounded-full p-3 shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <Icon name="shoppingCart" size={20} />
          <span className="font-bold text-sm">{cartItemsCount}</span>
          <span className="text-xs bg-white text-purple-600 px-2 py-0.5 rounded-full">{getCartTotal()} MZN</span>
        </button>
      )}
      
      <BottomNav tabs={tabs} active={tab} setActive={setTab} />
      
      {/* Cart Modal */}
      {showCartModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Meu Carrinho</h2>
              <button onClick={() => setShowCartModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="p-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="shoppingCart" size={48} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-100">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.price} MZN</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold">{getCartTotal()} MZN</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Entrega</span>
                      <span className="font-semibold">Gratuita</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-purple-600">{getCartTotal()} MZN</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCartModal(false);
                        setShowCheckoutModal(true);
                      }}
                      className="w-full mt-4 py-3 bg-purple-500 text-white rounded-xl font-semibold"
                    >
                      Finalizar Pedido
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">Finalizar Pedido</h2>
              <button onClick={() => setShowCheckoutModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Endereço de Entrega</label>
                <div className="space-y-2">
                  {CUSTOMER_ADDRESSES.map(addr => (
                    <label key={addr.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress?.id === addr.id}
                        onChange={() => setSelectedAddress(addr)}
                        className="text-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{addr.label}</p>
                        <p className="text-xs text-slate-500">{addr.address}</p>
                      </div>
                      {addr.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Padrão</span>}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Método de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Dinheiro", "M-Pesa", "E-Mola", "Cartão"].map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`p-3 rounded-xl border text-center transition-all ${paymentMethod === method ? "border-purple-500 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-600"}`}
                    >
                      <Icon name={method === "Dinheiro" ? "dollar" : method === "M-Pesa" ? "smartphone" : "creditCard"} size={16} className="mx-auto mb-1" />
                      <span className="text-xs">{method}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">Produtos</span>
                  <span className="text-sm">{cart.length} itens</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">Subtotal</span>
                  <span className="text-sm">{getCartTotal()} MZN</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="text-purple-600">{getCartTotal()} MZN</span>
                </div>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Placed Success Modal */}
      {orderPlaced && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="check" size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pedido Confirmado!</h2>
            <p className="text-sm text-slate-500 mb-4">Seu pedido {orderPlaced.id} foi recebido</p>
            <p className="text-xs text-slate-400 mb-4">Tempo estimado de entrega: {orderPlaced.estimatedDelivery}</p>
            <button
              onClick={() => {
                setOrderPlaced(null);
                setTab("orders");
              }}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold"
            >
              Acompanhar Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CLIENTE HOME ─────────────────────────────────────────────────────────────
const ClienteHome = ({ user, addToCart, cartCount, onCartClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [showPromotions, setShowPromotions] = useState(true);
  
  const filteredProducts = PRODUCTS.filter(p => 
    p.available &&
    (selectedCategory === "Todos" || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const activeOrder = ORDERS.find(o => o.client === user.name && ["Pendente", "Atribuído", "Em preparação", "Em coleta", "Em rota de entrega", "Em entrega"].includes(o.status));
  
  return (
    <div className="space-y-4 pb-4">
      {/* Search Bar */}
      <div className="relative">
        <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
        />
      </div>
      
      {/* Active Order Tracking */}
      {activeOrder && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-white cursor-pointer" onClick={() => window.location.href = "#tracking"}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold opacity-80">Pedido em andamento</p>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{activeOrder.status}</span>
          </div>
          <p className="text-sm font-bold">{activeOrder.id}</p>
          <p className="text-xs opacity-80 mt-1">Tempo estimado: {activeOrder.estimatedDelivery}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="w-2/3 h-full bg-white rounded-full" />
            </div>
            <Icon name="navigation" size={14} />
          </div>
        </div>
      )}
      
      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {PRODUCT_CATEGORIES_WITH_ICONS.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${selectedCategory === cat.name ? "bg-purple-500 text-white" : "bg-white text-slate-600"}`}
          >
            <Icon name={cat.icon} size={20} />
            <span className="text-[10px] font-medium">{cat.name}</span>
          </button>
        ))}
      </div>
      
      {/* Promotions Banner */}
      {showPromotions && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 relative overflow-hidden">
          <button onClick={() => setShowPromotions(false)} className="absolute top-2 right-2 text-white/70">
            <Icon name="x" size={14} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="percent" size={24} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Frete Grátis!</p>
              <p className="text-xs text-white/80">Nas primeiras 5 entregas</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Populares</p>
          <span className="text-xs text-purple-500 font-medium">ver todos →</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {PRODUCTS.filter(p => p.popular && p.available).slice(0, 5).map(p => (
            <div key={p.id} className="shrink-0 w-32 bg-white rounded-xl p-2 border border-slate-100">
              <div className="w-full h-20 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">
                {p.image}
              </div>
              <p className="text-xs font-semibold text-slate-800 mt-2 truncate">{p.name}</p>
              <p className="text-[11px] text-purple-600 font-bold">{p.price} MZN</p>
              <button
                onClick={() => addToCart(p)}
                className="w-full mt-2 py-1 bg-purple-500 text-white text-[10px] font-semibold rounded-lg"
              >
                Adicionar
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* All Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Todos os Produtos</p>
        </div>
        <div className="space-y-3">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-3 border border-slate-100 flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-2xl">
                {p.image}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 line-clamp-1">{p.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-purple-600">{p.price} MZN</span>
                  <span className="text-[10px] text-slate-400">{p.preparationTime} min</span>
                </div>
              </div>
              <button
                onClick={() => addToCart(p)}
                className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center"
              >
                <Icon name="plus" size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── CLIENTE ORDERS ───────────────────────────────────────────────────────────
const ClienteOrders = ({ user, onTrackOrder }) => {
  const [filter, setFilter] = useState("Todos");
  const filters = ["Todos", "Ativos", "Concluídos", "Cancelados"];
  
  const userOrders = ORDERS.filter(o => o.client === user.name || o.clientId === user.id);
  
  const filteredOrders = filter === "Todos" 
    ? userOrders 
    : filter === "Ativos" 
      ? userOrders.filter(o => ["Pendente", "Atribuído", "Em preparação", "Em coleta", "Em rota de entrega", "Em entrega"].includes(o.status))
      : filter === "Concluídos"
        ? userOrders.filter(o => o.status === "Concluído" || o.status === "Entregue")
        : userOrders.filter(o => o.status === "Cancelado");
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}
          >
            {f}
          </button>
        ))}
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <Icon name="package" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhum pedido encontrado</p>
        </div>
      ) : (
        filteredOrders.map(order => {
          const product = PRODUCTS.find(p => p.id.toString() === order.productId);
          return (
            <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{order.id}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[order.status] || "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                </div>
                <span className="text-sm font-bold text-purple-500">{order.total}</span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Icon name="clock" size={12} /> {order.time}
              </p>
              <div className="mt-2 flex items-center gap-2">
                {product && <span className="text-xl">{product.image}</span>}
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-700">{product?.name || "Produto"}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{order.dest}</p>
                </div>
              </div>
              {["Pendente", "Atribuído", "Em preparação", "Em coleta", "Em rota de entrega", "Em entrega"].includes(order.status) && (
                <button
                  onClick={() => onTrackOrder(order)}
                  className="w-full mt-3 py-2 bg-purple-50 text-purple-600 text-xs font-semibold rounded-xl"
                >
                  Acompanhar Entrega
                </button>
              )}
              {order.status === "Concluído" && (
                <button className="w-full mt-3 py-2 bg-amber-50 text-amber-600 text-xs font-semibold rounded-xl flex items-center justify-center gap-1">
                  <Icon name="star" size={12} /> Avaliar Pedido
                </button>
              )}
              {order.status === "Pendente" && (
                <button className="w-full mt-3 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
                  Cancelar Pedido
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// ─── CLIENTE PROFILE ──────────────────────────────────────────────────────────
const ClienteProfile = ({ user, addresses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    email: user.email,
  });
  
  const handleSave = () => {
    user.name = form.name;
    user.phone = form.phone;
    setIsEditing(false);
  };
  
  const userOrders = ORDERS.filter(o => o.client === user.name || o.clientId === user.id);
  const totalSpent = userOrders.reduce((sum, o) => sum + parseInt(o.total), 0);
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center text-3xl font-bold text-purple-600 mx-auto mb-3">
          {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-2 bg-purple-500 text-white rounded-xl text-sm">Salvar</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-base font-bold text-slate-800">{user.name}</p>
            <p className="text-sm text-slate-400">{user.phone || "Não definido"}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <button onClick={() => setIsEditing(true)} className="mt-3 text-xs text-purple-500 font-semibold">
              Editar Perfil
            </button>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{userOrders.length}</p>
          <p className="text-[10px] text-slate-400">Pedidos</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{totalSpent} MZN</p>
          <p className="text-[10px] text-slate-400">Total Gasto</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">Meus Endereços</p>
          <button className="text-xs text-purple-500 font-semibold">+ Adicionar</button>
        </div>
        {addresses.map(addr => (
          <div key={addr.id} className="px-4 py-3 border-b border-slate-50 last:border-0 flex items-center gap-3">
            <Icon name="mapPin" size={16} className="text-slate-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-700">{addr.label}</p>
                {addr.isDefault && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Padrão</span>}
              </div>
              <p className="text-xs text-slate-500">{addr.address}</p>
            </div>
            <button className="text-slate-400">
              <Icon name="edit" size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-3">Configurações</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="bell" size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700">Notificações</span>
            </div>
            <div className="w-10 h-5 bg-purple-500 rounded-full relative">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="lock" size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700">Alterar Senha</span>
            </div>
            <Icon name="chevronRight" size={16} className="text-slate-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="message" size={16} className="text-slate-400" />
              <span className="text-sm text-slate-700">Suporte</span>
            </div>
            <Icon name="chevronRight" size={16} className="text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ORDER TRACKING ───────────────────────────────────────────────────────────
const OrderTracking = ({ order, onBack }) => {
  const [driverPosition, setDriverPosition] = useState([-25.9653, 32.5778]);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  
  const statusSteps = [
    { key: "Pedido recebido", label: "Pedido Recebido", icon: "package" },
    { key: "Em preparação", label: "Preparação", icon: "clock" },
    { key: "Em coleta", label: "Coleta", icon: "store" },
    { key: "Em rota de entrega", label: "Em Rota", icon: "truck" },
    { key: "Entregue", label: "Entregue", icon: "check" },
  ];
  
  // Find current step index
  let currentStepIndex = 0;
  for (let i = 0; i < statusSteps.length; i++) {
    if (statusSteps[i].key === currentStatus) {
      currentStepIndex = i;
      break;
    }
    // Also handle "Em entrega" as "Em rota de entrega"
    if (currentStatus === "Em entrega" && statusSteps[i].key === "Em rota de entrega") {
      currentStepIndex = i;
      break;
    }
  }
  
  // Simulate driver movement
  useEffect(() => {
    if (currentStatus === "Em rota de entrega" || currentStatus === "Em entrega") {
      const interval = setInterval(() => {
        setDriverPosition(prev => [prev[0] + 0.0005, prev[1] + 0.0003]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentStatus]);
  
  const product = PRODUCTS.find(p => p.id.toString() === order.productId);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
          <Icon name="arrowLeft" size={18} />
        </button>
        <p className="text-sm font-bold text-slate-700">Acompanhar Pedido {order.id}</p>
      </div>
      
      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 240 }}>
        <MapContainer
          center={driverPosition}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={driverPosition}>
            <Popup>
              <div className="text-xs">
                <p className="font-bold">Seu pedido</p>
                <p className="text-slate-500">Motorista a caminho</p>
              </div>
            </Popup>
          </Marker>
          <Marker position={order.dest === "Av. Eduardo Mondlane 45, Maputo" ? [-25.9653, 32.5778] : [-25.9753, 32.5678]}>
            <Popup>Seu endereço</Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {/* Status Timeline */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex justify-between relative">
          {statusSteps.map((step, idx) => (
            <div key={step.key} className="flex-1 text-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 z-10 relative ${idx <= currentStepIndex ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                <Icon name={step.icon} size={14} />
              </div>
              <p className={`text-[10px] font-medium ${idx <= currentStepIndex ? "text-purple-600" : "text-slate-400"}`}>{step.label}</p>
              {idx < statusSteps.length - 1 && (
                <div className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 ${idx < currentStepIndex ? "bg-purple-500" : "bg-slate-200"}`} style={{ width: "calc(100% - 32px)", left: "calc(50% + 16px)" }} />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Order Details */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-3 mb-3">
          {product && <span className="text-3xl">{product.image}</span>}
          <div>
            <p className="text-sm font-bold text-slate-800">{product?.name}</p>
            <p className="text-xs text-slate-500">{order.total}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <Icon name="mapPin" size={14} className="text-slate-400 mt-0.5" />
            <span className="text-xs text-slate-600">{order.dest}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Icon name="clock" size={14} className="text-slate-400 mt-0.5" />
            <span className="text-xs text-slate-600">Tempo estimado: {order.estimatedDelivery}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Icon name="phone" size={14} className="text-slate-400 mt-0.5" />
            <span className="text-xs text-slate-600">Motorista: {order.driver}</span>
          </div>
        </div>
      </div>
      
      {/* Contact Driver Button */}
      <button className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
        <Icon name="phoneCall" size={16} />
        Contactar Motorista
      </button>
    </div>
  );
};

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
    { id: "notifications", label: "Notificações", icon: "bell" },
  ];
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header user={user} onLogout={onLogout} title="Painel Motorista" notifs={NOTIFICATIONS.filter(n => !n.read).length} onNotificationClick={() => setTab("notifications")} />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {tab === "home" && <MotoristaHome online={online} setOnline={setOnline} />}
        {tab === "orders" && <MotoristaOrders />}
        {tab === "history" && <MotoristaHistory />}
        {tab === "profile" && <MotoristaProfile user={user} />}
        {tab === "notifications" && <NotificationsPage />}
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

      {activeOrder && (
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Entrega Activa</p>
          <div className="bg-purple-600 rounded-2xl p-4 text-white">
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
              <button className="flex-1 bg-white text-purple-700 font-bold text-sm py-2.5 rounded-xl">Navegar</button>
              <button className="flex-1 bg-green-400 text-white font-bold text-sm py-2.5 rounded-xl">Concluir ✓</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon name="bell" size={18} className="text-purple-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">Novo Pedido Disponível</p>
            <p className="text-xs text-slate-500 mt-0.5">Marco Simango · Av. Julius Nyerere · 1.9 km</p>
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-purple-500 text-white text-xs font-bold py-2 rounded-xl">Aceitar</button>
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
            <span className="text-sm font-bold text-purple-500">{o.total}</span>
          </div>
          {o.status === "Em entrega" && (
            <div className="flex gap-2 mt-3">
              <button className="flex-1 bg-purple-50 text-purple-600 text-xs font-semibold py-2 rounded-xl">Navegar</button>
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
      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-purple-600 mx-auto mb-3">JM</div>
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
// ─── MODAL COMPONENTS ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ─── SIMULATED LOCATIONS DATA ───────────────────────────────────────────────────
const SIMULATED_LOCATIONS = [
  "Loja Central, Maputo",
  "Armazém Norte, Maputo",
  "Loja Sul, Maputo",
  "Av. Eduardo Mondlane 45, Maputo",
  "Bairro Polana Cimento, Maputo",
  "Rua da Resistência 12, Maputo",
  "Av. Julius Nyerere 88, Maputo",
  "Matola, Zona A",
  "Shopping Center, Maputo",
  "Aeroporto Internacional, Maputo",
  "Praça dos Heróis, Maputo",
  "Bairro da Sommerschield, Maputo",
  "Rua da Independência, Maputo",
  "Mercado Municipal, Maputo",
  "Bairro Tchumene, Matola"
];

const LocationSearchInput = ({ value, onChange, placeholder, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredLocations = SIMULATED_LOCATIONS.filter(loc =>
    loc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (location) => {
    onSelect(location);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => {
          onChange(e.target.value);
          setSearchTerm(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 500)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      {showSuggestions && searchTerm && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                {loc}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400">Nenhum resultado encontrado</div>
          )}
        </div>
      )}
    </div>
  );
};

const AddOrderModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    client: "",
    productId: "",
    origin: "",
    dest: "",
    total: "",
    driver: "Não atribuído"
  });
  const [manualTotal, setManualTotal] = useState(false);

  const calculateTotal = (origin, dest) => {
    if (!origin || !dest) return { total: 0, dist: "0.0" };
    const getDistance = (from, to) => {
      const fromLower = from.toLowerCase();
      const toLower = to.toLowerCase();
      if (fromLower === toLower) return 0;
      const sameCity = (fromLower.includes("maputo") && toLower.includes("maputo")) ||
                       (fromLower.includes("matola") && toLower.includes("matola"));
      if (sameCity) {
        if (fromLower.includes("polana") || toLower.includes("polana")) return 3.2;
        if (fromLower.includes("sommerschield") || toLower.includes("sommerschield")) return 2.8;
        if (fromLower.includes("tchumene") || toLower.includes("tchumene")) return 8.4;
        return 5.0;
      }
      if (fromLower.includes("maputo") && toLower.includes("matola")) return 15.0;
      if (fromLower.includes("matola") && toLower.includes("maputo")) return 15.0;
      return 10.0;
    };
    const distance = getDistance(origin, dest);
    const total = Math.round(50 + (distance * 15));
    return { total, dist: distance.toFixed(1) };
  };

  useEffect(() => {
    if (form.origin && form.dest && !manualTotal) {
      const { total } = calculateTotal(form.origin, form.dest);
      setForm(prev => ({ ...prev, total: total.toString() }));
    }
  }, [form.origin, form.dest, manualTotal]);

  const selectedProduct = PRODUCTS.find(p => p.id.toString() === form.productId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.client || !form.origin || !form.dest || !form.total) return;
    const { dist } = calculateTotal(form.origin, form.dest);
    const newOrder = {
      id: `#${String(ORDERS.length + 1).padStart(3, "0")}`,
      client: form.client,
      clientId: null,
      productId: form.productId,
      origin: form.origin,
      dest: form.dest,
      status: "Pendente",
      driver: form.driver,
      total: form.total + " MZN",
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      dist: dist + " km",
      estimatedDelivery: new Date(new Date().getTime() + 45 * 60000).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })
    };
    onAdd(newOrder);
    onClose();
    setForm({ client: "", productId: "", origin: "", dest: "", total: "", driver: "Não atribuído" });
    setManualTotal(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Pedido">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente</label>
          <input
            type="text"
            value={form.client}
            onChange={e => setForm({ ...form, client: e.target.value })}
            placeholder="Nome do cliente"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Produto</label>
          <select
            value={form.productId}
            onChange={e => setForm({ ...form, productId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Selecione um produto</option>
            {PRODUCTS.filter(p => p.available).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.price} MZN ({p.category})
              </option>
            ))}
          </select>
          {selectedProduct && (
            <p className="text-xs text-slate-400 mt-1">
              Stock: {selectedProduct.stock} | Origem: {selectedProduct.origin}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
          <LocationSearchInput
            value={form.origin}
            onChange={val => setForm({ ...form, origin: val })}
            placeholder="Pesquisar local de recolha..."
            onSelect={val => setForm({ ...form, origin: val })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Destino</label>
          <LocationSearchInput
            value={form.dest}
            onChange={val => setForm({ ...form, dest: val })}
            placeholder="Pesquisar endereço de entrega..."
            onSelect={val => setForm({ ...form, dest: val })}
          />
        </div>
        {form.origin && form.dest && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Distância</p>
                <p className="text-sm font-bold text-slate-800">
                  {calculateTotal(form.origin, form.dest).dist} km
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Tempo Estimado</p>
                <p className="text-sm font-bold text-slate-800">
                  {Math.round(calculateTotal(form.origin, form.dest).dist * 3)} min
                </p>
              </div>
            </div>
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Valor (MZN) {form.origin && form.dest && !manualTotal && (
              <span className="text-purple-500 text-[10px]">(Calculado automaticamente)</span>
            )}
          </label>
          <div className="relative">
            <input
              type="number"
              value={form.total}
              onChange={e => {
                setForm({ ...form, total: e.target.value });
                setManualTotal(true);
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            {form.origin && form.dest && (
              <button
                type="button"
                onClick={() => {
                  const { total } = calculateTotal(form.origin, form.dest);
                  setForm({ ...form, total: total.toString() });
                  setManualTotal(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-purple-500 hover:text-purple-600"
              >
                Recalcular
              </button>
            )}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
          <select
            value={form.driver}
            onChange={e => setForm({ ...form, driver: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="Não atribuído">Não atribuído</option>
            {DRIVERS.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Criar Pedido
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AddDriverModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    vehicle: "",
    licensePlate: "",
    zone: "Maputo — Polana",
    status: "offline",
    bi: "",
    birthDate: "",
    address: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const randomLat = -25.95 + (Math.random() * 0.05);
    const randomLng = 32.55 + (Math.random() * 0.05);
    const newDriver = {
      id: DRIVERS.length + 1,
      name: form.name,
      status: form.status,
      orders: 0,
      rating: 5.0,
      phone: form.phone,
      email: form.email,
      vehicle: form.vehicle || "Mota",
      licensePlate: form.licensePlate,
      zone: form.zone,
      position: [randomLat, randomLng],
      bi: form.bi,
      birthDate: form.birthDate,
      address: form.address
    };
    onAdd(newDriver);
    onClose();
    setForm({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", zone: "Maputo — Polana", status: "offline", bi: "", birthDate: "", address: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Motorista">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: João Silva"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Veículo</label>
          <input
            type="text"
            value={form.vehicle}
            onChange={e => setForm({ ...form, vehicle: e.target.value })}
            placeholder="Ex: Mota, Carro, etc."
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Matrícula</label>
          <input
            type="text"
            value={form.licensePlate}
            onChange={e => setForm({ ...form, licensePlate: e.target.value })}
            placeholder="Ex: MC-1234-MZ"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Zona de Actuação</label>
          <select
            value={form.zone}
            onChange={e => setForm({ ...form, zone: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="Maputo — Polana">Maputo — Polana</option>
            <option value="Maputo — Sommerschield">Maputo — Sommerschield</option>
            <option value="Maputo — Centro">Maputo — Centro</option>
            <option value="Matola">Matola</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">BI/Passaporte</label>
          <input
            type="text"
            value={form.bi}
            onChange={e => setForm({ ...form, bi: e.target.value })}
            placeholder="Ex: 1234567"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Nascimento</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={e => setForm({ ...form, birthDate: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço</label>
          <input
            type="text"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Ex: Bairro Polana, Rua 12"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Adicionar
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AddProductModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    category: "Alimentação",
    price: "",
    available: true,
    origin: "Loja Central, Maputo",
    stock: "",
    description: "",
    image: "🍕"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    const newProduct = {
      id: PRODUCTS.length + 1,
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      available: form.available,
      origin: form.origin,
      stock: parseInt(form.stock),
      description: form.description || "",
      image: form.image,
      preparationTime: form.category === "Alimentação" ? 20 : 5,
      popular: false
    };
    onAdd(newProduct);
    onClose();
    setForm({ name: "", category: "Alimentação", price: "", available: true, origin: "Loja Central, Maputo", stock: "", description: "", image: "🍕" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Produto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Produto</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {PRODUCT_CATEGORIES.filter(c => c !== "Todos").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Preço (MZN)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
          <select
            value={form.origin}
            onChange={e => setForm({ ...form, origin: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="Loja Central, Maputo">Loja Central, Maputo</option>
            <option value="Loja Sul">Loja Sul</option>
            <option value="Armazém Norte">Armazém Norte</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Criar Produto
          </button>
        </div>
      </form>
    </Modal>
  );
};

const EditProductModal = ({ isOpen, onClose, product, onEdit }) => {
  const [form, setForm] = useState({
    name: "",
    category: "Alimentação",
    price: "",
    available: true,
    origin: "Loja Central, Maputo",
    stock: "",
    description: "",
    image: "🍕"
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        available: product.available,
        origin: product.origin,
        stock: product.stock.toString(),
        description: product.description || "",
        image: product.image || "🍕"
      });
    }
  }, [product]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    const updatedProduct = {
      id: product.id,
      name: form.name,
      category: form.category,
      price: parseInt(form.price),
      available: form.available,
      origin: form.origin,
      stock: parseInt(form.stock),
      description: form.description,
      image: form.image,
      preparationTime: product.preparationTime || 15,
      popular: product.popular || false
    };
    onEdit(updatedProduct);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Produto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome do Produto</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {PRODUCT_CATEGORIES.filter(c => c !== "Todos").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Preço (MZN)</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
          <select
            value={form.origin}
            onChange={e => setForm({ ...form, origin: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            <option value="Loja Central, Maputo">Loja Central, Maputo</option>
            <option value="Loja Sul">Loja Sul</option>
            <option value="Armazém Norte">Armazém Norte</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AddCustomerModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const newCustomer = {
      id: CUSTOMERS.length + 1,
      name: form.name,
      phone: form.phone,
      email: form.email,
      orders: 0,
      rating: 5.0,
      frequent: false,
      lastOrder: new Date().toISOString().split('T')[0]
    };
    onAdd(newCustomer);
    onClose();
    setForm({ name: "", phone: "", email: "" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Criar Cliente
          </button>
        </div>
      </form>
    </Modal>
  );
};

const CustomerDetailModal = ({ isOpen, onClose, customer, orders }) => {
  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer.name}>
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-3 mb-2">
            <Icon name="user" size={16} className="text-slate-500" />
            <span className="text-sm text-slate-700">{customer.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Icon name="message" size={16} className="text-slate-500" />
            <span className="text-sm text-slate-700">{customer.email}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Histórico de Pedidos</p>
          {orders.length > 0 ? (
            orders.map(o => (
              <div key={o.id} className="bg-white border border-slate-100 rounded-xl p-3 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-800">{o.id}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[o.status]}`}>{o.status}</span>
                </div>
                <p className="text-xs text-slate-500">{o.time} · {o.total}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">Nenhum pedido encontrado</p>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Total de Pedidos</p>
            <p className="text-lg font-bold text-slate-800">{customer.orders}</p>
          </div>
          <div className="flex items-center gap-1">
            <Icon name="star" size={16} className="text-amber-400" />
            <span className="text-lg font-bold text-slate-800">{customer.rating}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const AddIncidentModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    type: "Acidente",
    title: "",
    description: "",
    driver: "João Motorista",
    status: "Em análise"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    const newIncident = {
      id: INCIDENTS.length + 1,
      type: form.type,
      title: form.title,
      description: form.description,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      driver: form.driver,
      status: form.status,
      photos: [],
      documents: []
    };
    onAdd(newIncident);
    onClose();
    setForm({ type: "Acidente", title: "", description: "", driver: "João Motorista", status: "Em análise" });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Incidente">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Incidente</label>
          <select
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {INCIDENT_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Título</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Descrição</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Motorista</label>
          <select
            value={form.driver}
            onChange={e => setForm({ ...form, driver: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
          >
            {DRIVERS.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
            Cancelar
          </button>
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 hover:bg-purple-600">
            Registrar
          </button>
        </div>
      </form>
    </Modal>
  );
};

const IncidentDetailModal = ({ isOpen, onClose, incident }) => {
  if (!incident) return null;

  const getIncidentColor = (type) => {
    switch(type) {
      case "Acidente": return "bg-red-100 text-red-700";
      case "Avaria": return "bg-orange-100 text-orange-700";
      case "Problema Entrega": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={incident.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getIncidentColor(incident.type)}`}>{incident.type}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${incident.status === "Em análise" ? "bg-amber-100 text-amber-700" : incident.status === "Resolvido" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
            {incident.status}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-1">Descrição</p>
          <p className="text-sm text-slate-700">{incident.description}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="calendar" size={14} className="text-slate-500" />
            <span className="text-xs text-slate-600">{incident.date} às {incident.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="users" size={14} className="text-slate-500" />
            <span className="text-xs text-slate-600">{incident.driver}</span>
          </div>
        </div>
        {incident.photos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Fotos Anexadas</p>
            <div className="flex gap-2">
              {incident.photos.map((p, i) => (
                <div key={i} className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Icon name="image" size={20} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>
        )}
        {incident.documents.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Documentos</p>
            {incident.documents.map((d, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <Icon name="file" size={14} className="text-slate-400" />
                <span className="text-xs text-slate-600">{d}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

const DriverDetailModal = ({ isOpen, onClose, driver }) => {
  if (!driver) return null;

  const driverOrders = ORDERS.filter(o => o.driver === driver.name);
  const completedOrders = driverOrders.filter(o => o.status === "Concluído");
  const cancelledOrders = driverOrders.filter(o => o.status === "Cancelado");
  const driverIncidents = INCIDENTS.filter(incident => incident.driver === driver.name);

  const driverDetails = {
    todayDeliveries: completedOrders.filter(o => {
      const orderDate = new Date(o.time);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length,
    totalHours: Math.floor(Math.random() * 8) + 4,
    totalDistance: (Math.random() * 150 + 50).toFixed(1),
    avgDeliveryTime: Math.floor(Math.random() * 30) + 15,
    avgWaitTime: Math.floor(Math.random() * 15) + 5,
    cancelledOrders: cancelledOrders.length,
    rating: driver.rating,
    earnings: (completedOrders.reduce((sum, o) => sum + parseFloat(o.total), 0) * 0.8).toFixed(0),
    fuelConsumption: (Math.random() * 10 + 5).toFixed(1),
    acceptanceRate: Math.floor((completedOrders.length / Math.max(driverOrders.length, 1)) * 100),
    rejectionRate: Math.floor((cancelledOrders.length / Math.max(driverOrders.length, 1)) * 100),
    activityLogs: [
      { time: "08:00", action: "Login", status: "online" },
      { time: "08:15", action: "Primeira entrega", status: "em_rota" },
      { time: "09:30", action: "Pausa para café", status: "pausa" },
      { time: "09:45", action: "Retomou entregas", status: "em_rota" },
      { time: "11:00", action: "Entrega concluída", status: "concluida" },
      { time: "12:30", action: "Almoço", status: "pausa" },
      { time: "13:30", action: "Retomou entregas", status: "em_rota" },
      { time: "15:45", action: "Logout", status: "offline" }
    ],
    routeHistory: [
      { date: "Hoje", distance: "25.4 km", time: "2h 15m", stops: 8 },
      { date: "Ontem", distance: "32.1 km", time: "2h 45m", stops: 10 },
      { date: "05/05", distance: "28.7 km", time: "2h 30m", stops: 9 },
      { date: "04/05", distance: "41.2 km", time: "3h 20m", stops: 12 }
    ]
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalhes do Motorista - ${driver.name}`}>
      <div className="space-y-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Estado Atual</p>
              <p className="text-lg font-bold flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${driver.status === "online" ? "bg-green-400" : "bg-slate-300"}`} />
                <span>{driver.status === "online" ? "Disponível" : driver.status === "offline" ? "Offline" : "Em entrega"}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-500">Hoje</p>
              <p className="text-lg font-bold text-slate-800">{driverDetails.todayDeliveries} entregas</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">Horas Trabalhadas</p>
            <p className="text-2xl font-bold text-slate-800">{driverDetails.totalHours}h</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">Distância Percorrida</p>
            <p className="text-2xl font-bold text-slate-800">{driverDetails.totalDistance} km</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">Tempo Médio de Entrega</p>
            <p className="text-2xl font-bold text-slate-800">{driverDetails.avgDeliveryTime} min</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-500">Tempo Médio de Espera</p>
            <p className="text-2xl font-bold text-slate-800">{driverDetails.avgWaitTime} min</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-3">Desempenho</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500">Taxa de Aceitação</p>
              <p className="text-lg font-bold text-slate-800">{driverDetails.acceptanceRate}%</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Taxa de Rejeição</p>
              <p className="text-lg font-bold text-slate-800">{driverDetails.rejectionRate}%</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Pedidos Cancelados</p>
              <p className="text-lg font-bold text-slate-800">{driverDetails.cancelledOrders}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Avaliação Média</p>
              <p className="text-lg font-bold text-slate-800 flex items-center gap-1">
                {driverDetails.rating}<Icon name="star" size={14} className="text-amber-400" />
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-3">Financeiro</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Ganhos Hoje</span>
              <span className="text-lg font-bold text-slate-800">{driverDetails.earnings} MZN</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Consumo de Combustível</span>
              <span className="text-lg font-bold text-slate-800">{driverDetails.fuelConsumption} L</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Logs de Atividade</p>
            <span className="text-xs text-purple-500 font-medium">ver todos →</span>
          </div>
          <div className="space-y-2">
            {driverDetails.activityLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full
                  ${log.status === "online" ? "bg-green-400" :
                    log.status === "offline" ? "bg-slate-300" :
                    log.status === "em_rota" ? "bg-blue-400" :
                    log.status === "pausa" ? "bg-yellow-400" :
                    log.status === "concluida" ? "bg-green-500" : "bg-slate-400"}`}>
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-500">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Histórico de Rotas</p>
            <span className="text-xs text-purple-500 font-medium">ver mapa completo →</span>
          </div>
          <div className="space-y-3">
            {driverDetails.routeHistory.map((route, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{route.date}</p>
                  <p className="text-xs text-slate-500">{route.stops} paradas</p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-sm font-semibold text-slate-800">{route.distance}</p>
                  <p className="text-xs text-slate-500">{route.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500">Histórico de Incidentes</p>
            <span className="text-xs text-purple-500 font-medium">ver todos →</span>
          </div>
          {driverIncidents.length > 0 ? (
            <div className="space-y-2">
              {driverIncidents.map((incident, index) => (
                <div key={index} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full ${incident.type === "Acidente" ? "bg-red-400" : incident.type === "Avaria" ? "bg-orange-400" : "bg-blue-400"}`} />
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium text-slate-800">{incident.title}</p>
                    <p className="text-xs text-slate-500">{incident.date} {incident.time}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{incident.description}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${incident.status === "Em análise" ? "bg-amber-100 text-amber-700" : incident.status === "Resolvido" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum incidente registrado</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

const NotificationsPage = () => {
  const [filter, setFilter] = useState("Todas");
  const filters = ["Todas", "Não lidas", "Pedidos", "Motoristas", "Incidentes", "Finanças"];
  
  const filtered = filter === "Todas"
    ? NOTIFICATIONS
    : filter === "Não lidas"
      ? NOTIFICATIONS.filter(n => !n.read)
      : NOTIFICATIONS.filter(n => n.type === filter.toLowerCase().slice(0, -1) ||
          (filter === "Pedidos" && n.type === "order") ||
          (filter === "Motoristas" && n.type === "driver") ||
          (filter === "Incidentes" && n.type === "incident") ||
          (filter === "Finanças" && n.type === "finance"));

  const getNotificationColor = (type) => {
    switch(type) {
      case "order": return "bg-blue-100 text-blue-600";
      case "driver": return "bg-green-100 text-green-600";
      case "incident": return "bg-orange-100 text-orange-600";
      case "finance": return "bg-purple-100 text-purple-600";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === f ? "bg-purple-500 text-white border-purple-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {f}
          </button>
        ))}
      </div>
      
      {filtered.length > 0 ? (
        filtered.map(n => (
          <div key={n.id} className={`bg-white rounded-2xl p-4 border border-slate-100 shadow-sm ${!n.read ? "border-l-4 border-l-purple-500" : ""}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(n.type)}`}>
                <Icon name={n.icon} size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  {!n.read && <div className="w-2 h-2 bg-purple-500 rounded-full" />}
                </div>
                <p className="text-xs text-slate-500">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <Icon name="bell" size={48} className="text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Nenhuma notificação encontrada</p>
        </div>
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;
  if (user.role === "admin") return <AdminApp user={user} onLogout={() => setUser(null)} />;
  if (user.role === "gestor") return <GestorApp user={user} onLogout={() => setUser(null)} />;
  if (user.role === "motorista") return <MotoristaApp user={user} onLogout={() => setUser(null)} />;
  if (user.role === "cliente") return <ClienteApp user={user} onLogout={() => setUser(null)} />;
  return null;
}