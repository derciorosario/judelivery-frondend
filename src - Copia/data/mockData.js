// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const USERS = [
  { id: 1, email: "admin@judelivery.mz", password: "admin123", role: "admin", name: "Carlos Admin" },
  { id: 2, email: "gestor@judelivery.mz", password: "gestor123", role: "gestor", name: "Maria Gestora" },
  { id: 3, email: "motorista@judelivery.mz", password: "moto123", role: "motorista", name: "João Motorista" },
  { id: 4, email: "cliente@judelivery.mz", password: "cliente123", role: "cliente", name: "Ana Cliente" },
  { id: 5, email: "ana.sitoe@email.com", password: "123456", role: "cliente", name: "Ana Sitoe" },
  { id: 6, email: "pedro.nhaca@email.com", password: "123456", role: "cliente", name: "Pedro Nhaca" },
];

const ORDERS = [
  { id: "#001", client: "Ana Sitoe", clientId: 5, origin: "Loja Central, Maputo", dest: "Av. Eduardo Mondlane 45", status: "Em entrega", driver: "João Motorista", total: "450 MZN", time: "14:32", dist: "3.2 km", productId: "1", productName: "Pizza Margherita", quantity: 1, paymentMethod: "Dinheiro", paymentStatus: "Pendente" },
  { id: "#002", client: "Pedro Nhaca", clientId: 6, origin: "Armazém Norte", dest: "Bairro Polana Cimento", status: "Pendente", driver: "—", total: "280 MZN", time: "14:48", dist: "5.1 km", productId: "2", productName: "Hambúrguer Clássico", quantity: 2, paymentMethod: "M-Pesa", paymentStatus: "Pendente" },
  { id: "#003", client: "Fátima Bila", clientId: null, origin: "Loja Central, Maputo", dest: "Rua da Resistência 12", status: "Concluído", driver: "João Motorista", total: "620 MZN", time: "13:10", dist: "2.8 km", productId: "3", productName: "Refrigerante 2L", quantity: 1, paymentMethod: "e-Mola", paymentStatus: "Pago" },
  { id: "#004", client: "Marco Simango", clientId: null, origin: "Loja Sul", dest: "Av. Julius Nyerere 88", status: "Atribuído", driver: "João Motorista", total: "180 MZN", time: "15:05", dist: "1.9 km", productId: "5", productName: "Salada Caesar", quantity: 1, paymentMethod: "Dinheiro", paymentStatus: "Pendente" },
  { id: "#005", client: "Rosa Cossa", clientId: null, origin: "Armazém Norte", dest: "Matola, Zona A", status: "Cancelado", driver: "—", total: "340 MZN", time: "12:55", dist: "8.4 km", productId: "1", productName: "Pizza Margherita", quantity: 1, paymentMethod: "M-Pesa", paymentStatus: "Cancelado" },
  { id: "#006", client: "Ana Sitoe", clientId: 5, origin: "Loja Central, Maputo", dest: "Av. Eduardo Mondlane 45", status: "Aprovado", driver: "—", total: "520 MZN", time: "10:30", dist: "3.2 km", productId: "1", productName: "Pizza Margherita", quantity: 1, paymentMethod: "e-Mola", paymentStatus: "Pendente", scheduledTime: "14:00", instructions: "Portão azul, tocar campainha" },
];

const CUSTOMER_REQUESTS = [
  { id: "REQ001", customerId: 1, customerName: "Ana Cliente", origin: "Loja Central, Maputo", dest: "Av. Eduardo Mondlane 45", productName: "Pizza Margherita", quantity: 2, weight: "1.5 kg", instructions: "Sem cebola", photos: [], contactOrigin: "+258 84 111 2233", contactDest: "+258 84 111 2233", scheduledTime: "2024-05-08 19:00", urgent: true, status: "pending", createdAt: "2024-05-08 14:30" },
  { id: "REQ002", customerId: 2, customerName: "Carlos Silva", origin: "Restaurante Sabores", dest: "Rua da Resistência 12", productName: "Combo Família", quantity: 1, weight: "3.2 kg", instructions: "Trazer talheres", photos: [], contactOrigin: "+258 82 999 0011", contactDest: "+258 82 999 0011", scheduledTime: "2024-05-08 20:00", urgent: false, status: "pending", createdAt: "2024-05-08 15:00" },
];


const DRIVERS = [
  { 
    id: 1, 
    name: "João Motorista", 
    status: "working", 
    orders: 12, 
    rating: 4.8, 
    phone: "+258 84 111 2233", 
    email: "joao@judelivery.mz", 
    vehicle: "Mota · MC-1234-MZ", 
    licensePlate: "MC-1234-MZ", 
    zone: "Maputo — Polana", 
    position: [-25.9653, 32.5778],
    currentDelivery: "Entregando para Maria Santos",
    eta: "5 min"
  },
  { 
    id: 2, 
    name: "Américo Cossa", 
    status: "online", 
    orders: 8, 
    rating: 4.5, 
    phone: "+258 82 999 0011", 
    email: "americo@judelivery.mz", 
    vehicle: "Mota · MC-5678-MZ", 
    licensePlate: "MC-5678-MZ", 
    zone: "Maputo — Sommerschield", 
    position: [-25.9753, 32.5678],
    currentDelivery: null,
    eta: null
  },
  { 
    id: 3, 
    name: "Beatriz Mache", 
    status: "working", 
    orders: 15, 
    rating: 4.9, 
    phone: "+258 86 777 5566", 
    email: "beatriz@judelivery.mz", 
    vehicle: "Mota · MC-9012-MZ", 
    licensePlate: "MC-9012-MZ", 
    zone: "Maputo — Polana", 
    position: [-25.9553, 32.5878],
    currentDelivery: "Entregando para Carlos Mendes",
    eta: "8 min"
  },
  { 
    id: 4, 
    name: "Marcos Novela", 
    status: "offline", 
    orders: 12, 
    rating: 4.2, 
    phone: "+258 86 456 5574", 
    email: "marcos@judelivery.mz", 
    vehicle: "Mota · MC-9012-MZ", 
    licensePlate: "MC-9012-MZ", 
    zone: "Maputo — Polana", 
    position: [-25.9653, 32.5978],
    currentDelivery: null,
    eta: null
  },
];


// ─── PRODUCTS DATA ───────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: "Pizza Margherita", category: "Alimentação", price: 350, available: true, origin: "Loja Central, Maputo", stock: 50, description: "Pizza tradicional com molho de tomate, mussarela e manjericão", imageUrl: null },
  { id: 2, name: "Hambúrguer Clássico", category: "Alimentação", price: 280, available: true, origin: "Loja Central, Maputo", stock: 30, description: "Hambúrguer artesanal com queijo, alface e tomate", imageUrl: null },
  { id: 3, name: "Refrigerante 2L", category: "Bebidas", price: 120, available: true, origin: "Armazém Norte", stock: 100, description: "Refrigerante 2 litros", imageUrl: null },
  { id: 4, name: "Combo Família", category: "Alimentação", price: 850, available: false, origin: "Loja Central, Maputo", stock: 0, description: "Combo para 4 pessoas", imageUrl: null },
  { id: 5, name: "Salada Caesar", category: "Alimentação", price: 220, available: true, origin: "Loja Sul", stock: 25, description: "Salada com frango, croutons e molho caesar", imageUrl: null },
];

const PRODUCT_CATEGORIES = ["Alimentação", "Bebidas", "Doces", "Salgados", "Outros"];

// ─── CUSTOMERS DATA ────────────────────────────────────────────────────────────
const MANAGERS = [
  { id: 1, name: "Maria Gestora", email: "gestor@judelivery.mz", phone: "+258 84 555 6666", role: "gestor", status: "active" },
  { id: 2, name: "Pedro Gestor", email: "pedro.gestor@email.com", phone: "+258 82 777 8888", role: "gestor", status: "active" },
];

const CUSTOMERS = [
  { id: 1, name: "Ana Sitoe", phone: "+258 84 111 2233", email: "ana@email.com", orders: 12, rating: 4.8, frequent: true, lastOrder: "2024-05-07", addresses: ["Av. Eduardo Mondlane 45, Maputo", "Bairro Polana, Rua 123"], defaultAddress: "Av. Eduardo Mondlane 45, Maputo" },
  { id: 2, name: "Pedro Nhaca", phone: "+258 82 999 0011", email: "pedro@email.com", orders: 8, rating: 4.5, frequent: true, lastOrder: "2024-05-06", addresses: ["Bairro Polana Cimento, Maputo"], defaultAddress: "Bairro Polana Cimento, Maputo" },
  { id: 3, name: "Fátima Bila", phone: "+258 86 777 5566", email: "fatima@email.com", orders: 15, rating: 4.9, frequent: true, lastOrder: "2024-05-07", addresses: ["Rua da Resistência 12, Maputo"], defaultAddress: "Rua da Resistência 12, Maputo" },
  { id: 4, name: "Marco Simango", phone: "+258 83 555 4433", email: "marco@email.com", orders: 3, rating: 4.2, frequent: false, lastOrder: "2024-05-05", addresses: ["Av. Julius Nyerere 88, Maputo"], defaultAddress: "Av. Julius Nyerere 88, Maputo" },
  { id: 5, name: "Rosa Cossa", phone: "+258 84 333 2211", email: "rosa@email.com", orders: 7, rating: 4.6, frequent: false, lastOrder: "2024-05-04", addresses: ["Matola, Zona A"], defaultAddress: "Matola, Zona A" },
];

// ─── CUSTOMER ORDERS (for client view) ──────────────────────────────────────────
const CUSTOMER_ORDERS = [
  { 
    id: "#001", 
    clientId: 5,
    origin: "Loja Central, Maputo", 
    dest: "Av. Eduardo Mondlane 45", 
    status: "Em entrega",
    statusCode: "in_progress",
    driver: "João Motorista",
    driverPhone: "+258 84 111 2233",
    driverRating: 4.8,
    total: "450 MZN",
    totalValue: 450,
    orderDate: "2024-05-07",
    orderTime: "14:32",
    deliveryDate: "2024-05-07",
    deliveryTime: "15:30",
    dist: "3.2 km",
    duration: "58 min",
    productName: "Pizza Margherita",
    productId: 1,
    quantity: 1,
    unitPrice: 350,
    paymentMethod: "Dinheiro",
    paymentStatus: "Pendente",
    instructions: "Portão azul, tocar campainha",
    driverPosition: [-25.9653, 32.5778],
    originCoords: [-25.9700, 32.5800],
    destCoords: [-25.9600, 32.5750],
    timeline: [
      { time: "14:00", status: "Pedido confirmado", completed: true },
      { time: "14:15", status: "Motorista a caminho da coleta", completed: true },
      { time: "14:30", status: "Produto coletado", completed: true },
      { time: "14:45", status: "Em rota de entrega", completed: true },
      { time: "15:30", status: "Entregue", completed: false }
    ]
  },
  { 
    id: "#003", 
    clientId: 5,
    origin: "Loja Central, Maputo", 
    dest: "Rua da Resistência 12", 
    status: "Concluído",
    statusCode: "completed",
    driver: "João Motorista",
    driverPhone: "+258 84 111 2233",
    driverRating: 4.8,
    total: "620 MZN",
    totalValue: 620,
    orderDate: "2024-05-06",
    orderTime: "13:10",
    deliveryDate: "2024-05-06",
    deliveryTime: "14:05",
    dist: "2.8 km",
    duration: "55 min",
    productName: "Refrigerante 2L",
    productId: 3,
    quantity: 1,
    unitPrice: 120,
    paymentMethod: "e-Mola",
    paymentStatus: "Pago",
    instructions: "",
    driverRatingGiven: 5,
    driverComment: "Motorista muito educado!"
  },
  { 
    id: "#006", 
    clientId: 5,
    origin: "Loja Central, Maputo", 
    dest: "Av. Eduardo Mondlane 45", 
    status: "Aprovado",
    statusCode: "approved",
    driver: null,
    driverPhone: null,
    driverRating: null,
    total: "520 MZN",
    totalValue: 520,
    orderDate: "2024-05-08",
    orderTime: "10:30",
    deliveryDate: null,
    deliveryTime: null,
    dist: "3.2 km",
    duration: null,
    productName: "Pizza Margherita",
    productId: 1,
    quantity: 1,
    unitPrice: 350,
    paymentMethod: "e-Mola",
    paymentStatus: "Pendente",
    instructions: "Entregar após as 14h",
    scheduledTime: "14:00"
  }
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
  { id: 1, type: "order", title: "Novo Pedido #006", message: "Ana Sitoe fez um novo pedido - Pizza Margherita", time: "5 min atrás", read: false, icon: "package", userId: null },
  { id: 2, type: "driver", title: "Motorista Online", message: "Beatriz Mache ficou online e está disponível", time: "12 min atrás", read: false, icon: "users", userId: null },
  { id: 3, type: "incident", title: "Incidente Reportado", message: "Colisão na Av. Julius Nyerere - João Motorista", time: "1 hora atrás", read: true, icon: "alertTriangle", userId: null },
  { id: 4, type: "order", title: "Pedido Concluído", message: "Entrega #003 concluída com sucesso - Fátima Bila", time: "2 horas atrás", read: true, icon: "check", userId: null },
  { id: 5, type: "finance", title: "Pagamento Recebido", message: "Recebido 1.240 MZN de entregas de hoje", time: "3 horas atrás", read: true, icon: "dollar", userId: null },
  { id: 6, type: "driver", title: "Motorista Offline", message: "Américo Cossa ficou offline - Sem atividade", time: "4 horas atrás", read: true, icon: "users", userId: null },
  { id: 7, type: "order", title: "Pedido Pendente", message: "Pedido #002 aguarda atribuição de motorista", time: "5 horas atrás", read: false, icon: "package", userId: null },
  { id: 8, type: "incident", title: "Avaria Resolvida", message: "Quebra de amortecedor - Américo Cossa - Resolvido", time: "Ontem", read: true, icon: "wrench", userId: null },
  // Customer notifications
  { id: 9, type: "customer_order", title: "Pedido Confirmado", message: "Seu pedido #006 foi confirmado e está sendo processado", time: "10 min atrás", read: false, icon: "checkCircle", userId: 5 },
  { id: 10, type: "customer_driver", title: "Motorista a caminho", message: "João Motorista está a caminho para coleta do seu pedido #001", time: "20 min atrás", read: false, icon: "truck", userId: 5 },
  { id: 11, type: "customer_promo", title: "Desconto Especial", message: "Ganhe 20% de desconto na sua próxima entrega!", time: "1 dia atrás", read: true, icon: "gift", userId: 5 },
];

// ─── FINANCIAL DATA ───────────────────────────────────────────────────────────────
const FINANCIAL_TRANSACTIONS = [
  {
    id: 1,
    type: "receita",
    category: "Entregas",
    description: "Pagamento da entrega #001",
    amount: 450,
    date: "2024-05-07",
    time: "14:32",
    status: "pago",
    paymentMethod: "Dinheiro",
    driver: "João Motorista",
    client: "Ana Sitoe"
  },
  {
    id: 2,
    type: "receita",
    category: "Entregas",
    description: "Pagamento da entrega #003",
    amount: 620,
    date: "2024-05-06",
    time: "13:10",
    status: "pago",
    paymentMethod: "e-Mola",
    driver: "João Motorista",
    client: "Fátima Bila"
  },
  {
    id: 3,
    type: "despesa",
    category: "Combustível",
    description: "Abastecimento - Mota MC-1234-MZ",
    amount: 250,
    date: "2024-05-07",
    time: "08:15",
    status: "pago",
    paymentMethod: "Dinheiro",
    driver: "João Motorista"
  },
  {
    id: 4,
    type: "despesa",
    category: "Manutenção",
    description: "Troca de óleo - Mota MC-5678-MZ",
    amount: 180,
    date: "2024-05-06",
    time: "10:30",
    status: "pago",
    paymentMethod: "M-Pesa",
    driver: "Américo Cossa"
  },
  {
    id: 5,
    type: "despesa",
    category: "Salários",
    description: "Pagamento semanal - João Motorista",
    amount: 1200,
    date: "2024-05-05",
    time: "17:00",
    status: "pago",
    paymentMethod: "Transferência Bancária"
  },
  {
    id: 6,
    type: "despesa",
    category: "Alimentação",
    description: "Refeição da equipe",
    amount: 85,
    date: "2024-05-07",
    time: "12:30",
    status: "pago",
    paymentMethod: "Dinheiro"
  },
  {
    id: 7,
    type: "receita",
    category: "Entregas",
    description: "Pagamento da entrega #004",
    amount: 180,
    date: "2024-05-07",
    time: "15:05",
    status: "pendente",
    paymentMethod: "Dinheiro",
    driver: "João Motorista",
    client: "Marco Simango"
  },
  {
    id: 8,
    type: "despesa",
    category: "Taxas operacionais",
    description: "Taxa de plataforma",
    amount: 45,
    date: "2024-05-07",
    time: "14:32",
    status: "pago",
    paymentMethod: "Dinheiro"
  }
];

const EXPENSE_CATEGORIES = [
  "Combustível",
  "Manutenção",
  "Salários",
  "Alimentação",
  "Taxas operacionais",
  "Outros"
];

const PAYMENT_METHODS = [
  "Dinheiro",
  "M-Pesa",
  "E-Mola",
  "Visa / PayPal",
  "Transferência Bancária"
];

const FINANCIAL_SUMMARY = {
  totalRevenue: 1250,
  totalExpenses: 1760,
  netProfit: -510,
  cashFlow: 420,
  monthlyRevenue: 1250,
  monthlyExpenses: 1760,
  fuelExpenses: 250,
  maintenanceExpenses: 180,
  salaryExpenses: 1200,
  foodExpenses: 85,
  operationalExpenses: 45
};

const STATUSCOLOR = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Pendente": "bg-amber-100 text-amber-700",
  "Concluído": "bg-green-100 text-green-700",
  "Atribuído": "bg-purple-100 text-purple-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em coleta": "bg-orange-100 text-orange-700",
  "Aprovado": "bg-teal-100 text-teal-700",
  "Rejeitado": "bg-red-100 text-red-700"
};

// ─── CUSTOMER STATUS CONFIGURATION ──────────────────────────────────────────────
const ORDER_STATUS_CONFIG = {
  pending_approval: { label: "Aguardando Aprovação", icon: "clock", color: "text-amber-600", bgColor: "bg-amber-50", step: 1 },
  approved: { label: "Pedido Aprovado", icon: "checkCircle", color: "text-teal-600", bgColor: "bg-teal-50", step: 2 },
  in_collection: { label: "Em Coleta", icon: "truck", color: "text-blue-600", bgColor: "bg-blue-50", step: 3 },
  in_transit: { label: "Em Transporte", icon: "navigation", color: "text-indigo-600", bgColor: "bg-indigo-50", step: 4 },
  delivered: { label: "Entregue", icon: "checkCircle", color: "text-green-600", bgColor: "bg-green-50", step: 5 },
  cancelled: { label: "Cancelado", icon: "xCircle", color: "text-red-600", bgColor: "bg-red-50", step: 0 },
  rejected: { label: "Rejeitado", icon: "alertOctagon", color: "text-red-600", bgColor: "bg-red-50", step: 0 }
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




















export {  USERS, INCIDENTS, ORDERS, DRIVERS, SIMULATED_LOCATIONS, CUSTOMER_REQUESTS, ORDER_STATUS_CONFIG, STATUSCOLOR, INCIDENT_TYPES, INCIDENT_STATUSES, PRODUCT_CATEGORIES, CUSTOMERS, MANAGERS, CUSTOMER_ORDERS, NOTIFICATIONS, PRODUCTS, FINANCIAL_TRANSACTIONS, EXPENSE_CATEGORIES, PAYMENT_METHODS, FINANCIAL_SUMMARY};