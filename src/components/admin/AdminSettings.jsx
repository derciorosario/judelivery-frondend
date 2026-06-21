import { useState } from "react";
import Icon from "../common/Icon";

const orderStatuses = [
  { value: "pending_approval", label: "Pendente" },
  { value: "approved", label: "Aprovado" },
  { value: "assigned", label: "Atribuído" },
  { value: "in_transit", label: "Em entrega" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
  { value: "scheduled", label: "Agendado" },
];

const defaultSettings = {
  order: {
    allowDelivery: true,
    allowTaxi: true,
    defaultServiceType: "delivery",
    defaultStatus: "pending_approval",
    allowManualAddressInput: true,
    requireCoordinates: false,
    allowScheduledOrders: true,
    allowRepeatingOrders: true,
    autoAssignDriver: false,
    requireDriverConfirmation: true,
    customerCanCancel: true,
    adminCanCancel: true,
    maxDistanceKm: 80,
    maxWaitingTimeMinutes: 20,
  },
  pricing: {
    deliveryBasePrice: 50,
    deliveryPerKm: 12,
    urgentMultiplier: 1.3,
    veryUrgentMultiplier: 1.6,
    taxiBasePrice: 80,
    taxiPerKm: 20,
    returnTripFee: 120,
    waitingFeePerMinute: 4,
    luggageFee: 40,
    extraPassengerThreshold: 3,
    extraPassengerFee: 30,
  },
  payments: {
    requirePaymentBeforeAssignment: false,
    paymentConfirmationRequired: true,
    showPaymentDialog: true,
    allowCashForScheduledOrders: true,
    methods: [
      { id: "bank_transfer", code: "bank_transfer", name: "Transferência", enabled: true, primary: false, instructions: "Confirmar comprovativo antes de atribuir motorista." },
      { id: "mpesa", code: "mpesa", name: "M-Pesa", enabled: true, primary: true, instructions: "Pagamento móvel por número da plataforma." },
      { id: "emola", code: "emola", name: "e-Mola", enabled: true, primary: false, instructions: "Confirmar referência ou número da carteira." },
      { id: "cash", code: "cash", name: "Dinheiro", enabled: true, primary: false, instructions: "O cliente paga directamente ao motorista." },
    ],
  },
  app: {
    appName: "JuDelivery",
    currency: "MZN",
    countryRestriction: "mz",
    defaultLanguage: "pt",
    defaultTimezone: "Africa/Maputo",
    supportName: "Plataforma/Suporte",
    supportPhone: "+258 82 333 4455",
    supportEmail: "suporte@judelivery.co.mz",
    supportHours: "Segunda a Sexta: 8h às 18h | Sábado: 9h às 13h",
    supportResponseTime: "Tempo médio de resposta: 2 horas",
  },
  notifications: {
    orderCreated: true,
    driverAssigned: true,
    driverArrived: true,
    orderCompleted: true,
    paymentConfirmed: true,
    cancellation: true,
    promotions: false,
  },
  drivers: {
    requireDriverOnline: true,
    maxActiveOrdersPerDriver: 3,
    showDriverPhoneToCustomer: true,
    allowDriverToAcceptScheduledOrders: true,
    maxDistanceFromPickupKm: 15,
  },
};

const cloneSettings = () => JSON.parse(JSON.stringify(defaultSettings));

const SectionCard = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
        <Icon name={icon} size={18} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const Field = ({ label, hint, children }) => (
  <label className="block">
    <span className="block text-xs font-semibold text-slate-700">{label}</span>
    {children}
    {hint && <span className="block text-[11px] text-slate-400 mt-1">{hint}</span>}
  </label>
);

const SwitchField = ({ checked, onChange, label, hint }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left hover:bg-slate-100"
  >
    <span>
      <span className="block text-xs font-semibold text-slate-700">{label}</span>
      {hint && <span className="block text-[11px] text-slate-400 mt-0.5">{hint}</span>}
    </span>
    <span className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? "bg-orange-500" : "bg-slate-300"}`}>
      <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-5" : ""}`} />
    </span>
  </button>
);

const NumberInput = ({ value, onChange, suffix, ...props }) => (
  <div className="relative">
    <input
      type="number"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-12 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-300"
      {...props}
    />
    {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
  </div>
);

const AdminSettings = () => {
  const [settings, setSettings] = useState(cloneSettings());
  const [activeTab, setActiveTab] = useState("orders");
  const [notice, setNotice] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [newPayment, setNewPayment] = useState({ code: "", name: "", instructions: "" });

  const tabs = [
    { id: "orders", label: "Pedidos", icon: "package" },
    { id: "pricing", label: "Preços", icon: "dollar" },
    { id: "payments", label: "Pagamentos", icon: "creditCard" },
    { id: "app", label: "App", icon: "settings" },
  ];

  const money = new Intl.NumberFormat("pt-MZ", {
    style: "currency",
    currency: settings.app.currency,
  });

  const update = (section, key, value) => {
    setSettings((previous) => ({ ...previous, [section]: { ...previous[section], [key]: value } }));
    setNotice("");
  };

  const updateNested = (section, key, nestedKey, value) => {
    setSettings((previous) => ({
      ...previous,
      [section]: { ...previous[section], [key]: { ...previous[section][key], [nestedKey]: value } },
    }));
    setNotice("");
  };

  const updatePayment = (id, key, value) => {
    setSettings((previous) => ({
      ...previous,
      payments: {
        ...previous.payments,
        methods: previous.payments.methods.map((method) => (method.id === id ? { ...method, [key]: value } : method)),
      },
    }));
    setNotice("");
  };

  const addPayment = () => {
    const code = newPayment.code.trim().toLowerCase();
    const name = newPayment.name.trim();

    if (!code || !name) {
      setNotice("Preencha o código e o nome do método de pagamento.");
      return;
    }

    if (settings.payments.methods.some((method) => method.code === code || method.id === code)) {
      setNotice("Já existe um método com esse código.");
      return;
    }

    setSettings((previous) => ({
      ...previous,
      payments: {
        ...previous.payments,
        methods: [
          ...previous.payments.methods,
          {
            id: code,
            code,
            name,
            enabled: true,
            primary: previous.payments.methods.length === 0,
            instructions: newPayment.instructions.trim() || "Confirmar pagamento antes de concluir o pedido.",
          },
        ],
      },
    }));
    setNewPayment({ code: "", name: "", instructions: "" });
    setNotice("Método adicionado apenas no formulário frontend.");
  };

  const removePayment = (id) => {
    setSettings((previous) => ({
      ...previous,
      payments: { ...previous.payments, methods: previous.payments.methods.filter((method) => method.id !== id) },
    }));
    setNotice("");
  };

  const saveFrontend = () => {
    setLastSavedAt(new Date());
    setNotice("Alterações guardadas no ecrã. Nenhuma chamada ao backend foi feita.");
  };

  const resetFrontend = () => {
    setSettings(cloneSettings());
    setNewPayment({ code: "", name: "", instructions: "" });
    setNotice("Configurações restauradas para o modelo frontend.");
    setLastSavedAt(null);
  };

  const deliveryPreview = money.format(Number(settings.pricing.deliveryBasePrice) + 5 * Number(settings.pricing.deliveryPerKm));
  const taxiPreview = money.format(Number(settings.pricing.taxiBasePrice) + 5 * Number(settings.pricing.taxiPerKm));
  const enabledPayments = settings.payments.methods.filter((method) => method.enabled).length;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 p-5 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">Admin · Configurações</p>
              <h1 className="mt-1 text-2xl font-black">Configurações da Plataforma</h1>
              <p className="mt-2 text-sm opacity-90">Gestão frontend de pedidos, pagamentos, preços e preferências da aplicação.</p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon name="settings" size={22} />
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-white/15 p-3 text-xs text-white/90">
            Página standalone. Não está conectada a outras páginas, não chama API e não altera o backend.
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                activeTab === tab.id ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"
              }`}
            >
              <Icon name={tab.icon} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {notice && <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-medium text-orange-700">{notice}</div>}
        {lastSavedAt && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700">
            Última acção frontend: {lastSavedAt.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <SectionCard icon="package" title="Tipos e fluxo de pedidos" description="Controlo visual dos serviços e estados usados pelo CreateOrderModal.">
              <div className="grid grid-cols-2 gap-3">
                <SwitchField checked={settings.order.allowDelivery} onChange={(value) => update("order", "allowDelivery", value)} label="Entregas" hint="Permitir pedidos de entrega" />
                <SwitchField checked={settings.order.allowTaxi} onChange={(value) => update("order", "allowTaxi", value)} label="Táxis" hint="Permitir corridas" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Field label="Serviço padrão">
                  <select value={settings.order.defaultServiceType} onChange={(event) => update("order", "defaultServiceType", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300">
                    <option value="delivery">Entrega</option>
                    <option value="taxi">Táxi</option>
                  </select>
                </Field>
                <Field label="Estado inicial">
                  <select value={settings.order.defaultStatus} onChange={(event) => update("order", "defaultStatus", event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300">
                    {orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <SwitchField checked={settings.order.allowManualAddressInput} onChange={(value) => update("order", "allowManualAddressInput", value)} label="Endereço manual" hint="Permitir sem coordenadas" />
                <SwitchField checked={settings.order.requireCoordinates} onChange={(value) => update("order", "requireCoordinates", value)} label="Exigir coordenadas" hint="Quando não for manual" />
                <SwitchField checked={settings.order.allowScheduledOrders} onChange={(value) => update("order", "allowScheduledOrders", value)} label="Agendados" hint="Permitir hora futura" />
                <SwitchField checked={settings.order.allowRepeatingOrders} onChange={(value) => update("order", "allowRepeatingOrders", value)} label="Repetir pedido" hint="Criar a partir do histórico" />
              </div>
            </SectionCard>

            <SectionCard icon="users" title="Motoristas e cancelamento" description="Preferências de atribuição e permissões do ciclo do pedido.">
              <div className="grid grid-cols-2 gap-3">
                <SwitchField checked={settings.order.autoAssignDriver} onChange={(value) => update("order", "autoAssignDriver", value)} label="Auto atribuir" hint="Atribuir motorista automaticamente" />
                <SwitchField checked={settings.order.requireDriverConfirmation} onChange={(value) => update("order", "requireDriverConfirmation", value)} label="Confirmação" hint="Exigir aceite do motorista" />
                <SwitchField checked={settings.order.customerCanCancel} onChange={(value) => update("order", "customerCanCancel", value)} label="Cliente cancela" hint="Permitir cancelamento do cliente" />
                <SwitchField checked={settings.order.adminCanCancel} onChange={(value) => update("order", "adminCanCancel", value)} label="Admin cancela" hint="Permitir cancelamento pelo admin" />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Field label="Distância máxima" hint="km">
                  <NumberInput value={settings.order.maxDistanceKm} onChange={(value) => update("order", "maxDistanceKm", value)} suffix="km" />
                </Field>
                <Field label="Tempo de espera máximo" hint="minutos">
                  <NumberInput value={settings.order.maxWaitingTimeMinutes} onChange={(value) => update("order", "maxWaitingTimeMinutes", value)} suffix="min" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard icon="clipboard" title="Estados disponíveis" description="Lista visual usada para controlar o fluxo dos pedidos.">
              <div className="space-y-2">
                {orderStatuses.map((status) => (
                  <div key={status.value} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-sm font-semibold text-slate-700">{status.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{status.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="space-y-4">
            <SectionCard icon="dollar" title="Preços de entrega" description="Base e distância por km usadas no cálculo de pedidos de entrega.">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço base">
                  <NumberInput value={settings.pricing.deliveryBasePrice} onChange={(value) => update("pricing", "deliveryBasePrice", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Preço por km">
                  <NumberInput value={settings.pricing.deliveryPerKm} onChange={(value) => update("pricing", "deliveryPerKm", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Urgente">
                  <NumberInput value={settings.pricing.urgentMultiplier} onChange={(value) => update("pricing", "urgentMultiplier", value)} suffix="x" />
                </Field>
                <Field label="Muito urgente">
                  <NumberInput value={settings.pricing.veryUrgentMultiplier} onChange={(value) => update("pricing", "veryUrgentMultiplier", value)} suffix="x" />
                </Field>
              </div>
              <div className="mt-4 rounded-2xl bg-orange-50 border border-orange-100 p-3">
                <p className="text-xs font-semibold text-orange-700">Exemplo frontend</p>
                <p className="text-sm font-bold text-orange-800 mt-1">Entrega estimada: {deliveryPreview}</p>
                <p className="text-[11px] text-orange-600 mt-0.5">5 km · sem urgência · cálculo local apenas.</p>
              </div>
            </SectionCard>

            <SectionCard icon="car" title="Preços de táxi" description="Base, distância e extras usados no cálculo de corridas.">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Preço base">
                  <NumberInput value={settings.pricing.taxiBasePrice} onChange={(value) => update("pricing", "taxiBasePrice", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Preço por km">
                  <NumberInput value={settings.pricing.taxiPerKm} onChange={(value) => update("pricing", "taxiPerKm", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Ida e volta">
                  <NumberInput value={settings.pricing.returnTripFee} onChange={(value) => update("pricing", "returnTripFee", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Bagagem">
                  <NumberInput value={settings.pricing.luggageFee} onChange={(value) => update("pricing", "luggageFee", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Espera por minuto">
                  <NumberInput value={settings.pricing.waitingFeePerMinute} onChange={(value) => update("pricing", "waitingFeePerMinute", value)} suffix={settings.app.currency} />
                </Field>
                <Field label="Passageiros acima de">
                  <NumberInput value={settings.pricing.extraPassengerThreshold} onChange={(value) => update("pricing", "extraPassengerThreshold", value)} />
                </Field>
                <Field label="Taxa passageiro extra">
                  <NumberInput value={settings.pricing.extraPassengerFee} onChange={(value) => update("pricing", "extraPassengerFee", value)} suffix={settings.app.currency} />
                </Field>
              </div>
              <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs font-semibold text-blue-700">Exemplo frontend</p>
                <p className="text-sm font-bold text-blue-800 mt-1">Corrida estimada: {taxiPreview}</p>
                <p className="text-[11px] text-blue-600 mt-0.5">5 km · sem extras · cálculo local apenas.</p>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <SectionCard icon="creditCard" title="Regras de pagamento" description="Preferências gerais para pagamentos de pedidos e corridas.">
              <div className="grid grid-cols-2 gap-3">
                <SwitchField checked={settings.payments.requirePaymentBeforeAssignment} onChange={(value) => update("payments", "requirePaymentBeforeAssignment", value)} label="Pagamento antes da atribuição" hint="Exigir confirmação inicial" />
                <SwitchField checked={settings.payments.paymentConfirmationRequired} onChange={(value) => update("payments", "paymentConfirmationRequired", value)} label="Confirmar pagamento" hint="Admin/cliente confirma" />
                <SwitchField checked={settings.payments.showPaymentDialog} onChange={(value) => update("payments", "showPaymentDialog", value)} label="Mostrar diálogo" hint="No resumo do pedido" />
                <SwitchField checked={settings.payments.allowCashForScheduledOrders} onChange={(value) => update("payments", "allowCashForScheduledOrders", value)} label="Dinheiro em agendados" hint="Permitir cash" />
              </div>
            </SectionCard>

            <SectionCard icon="receipt" title="Métodos de pagamento" description={`${enabledPayments} método(s) activo(s) no formulário frontend.`}>
              <div className="space-y-2">
                {settings.payments.methods.map((method) => (
                  <div key={method.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{method.name}</p>
                          {method.primary && <span className="text-[10px] font-semibold text-orange-700 bg-orange-100 rounded-full px-2 py-0.5">Principal</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{method.code}</p>
                      </div>
                      <button type="button" onClick={() => removePayment(method.id)} className="w-8 h-8 rounded-xl bg-white text-red-500 border border-red-100 flex items-center justify-center">
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <SwitchField checked={method.enabled} onChange={(value) => updatePayment(method.id, "enabled", value)} label="Activo" hint="Mostrar no pedido" />
                      <SwitchField checked={method.primary} onChange={(value) => updatePayment(method.id, "primary", value)} label="Principal" hint="Destaque no resumo" />
                    </div>
                    <div className="mt-3">
                      <Field label="Instruções">
                        <input type="text" value={method.instructions} onChange={(event) => updatePayment(method.id, "instructions", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard icon="plus" title="Adicionar método" description="Cria apenas um item local na lista frontend.">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Código">
                    <input type="text" value={newPayment.code} onChange={(event) => setNewPayment((previous) => ({ ...previous, code: event.target.value }))} placeholder="ex: mola" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                  </Field>
                  <Field label="Nome">
                    <input type="text" value={newPayment.name} onChange={(event) => setNewPayment((previous) => ({ ...previous, name: event.target.value }))} placeholder="ex: Mola" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                  </Field>
                </div>
                <Field label="Instruções">
                  <input type="text" value={newPayment.instructions} onChange={(event) => setNewPayment((previous) => ({ ...previous, instructions: event.target.value }))} placeholder="Instruções para o cliente" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <button type="button" onClick={addPayment} className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-300 hover:bg-orange-600">
                  Adicionar ao formulário
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "app" && (
          <div className="space-y-4">
            <SectionCard icon="settings" title="Perfil da aplicação" description="Informações principais usadas em toda a app.">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome da app">
                  <input type="text" value={settings.app.appName} onChange={(event) => update("app", "appName", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <Field label="Moeda">
                  <input type="text" value={settings.app.currency} onChange={(event) => update("app", "currency", event.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <Field label="País no mapa">
                  <input type="text" value={settings.app.countryRestriction} onChange={(event) => update("app", "countryRestriction", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <Field label="Idioma padrão">
                  <select value={settings.app.defaultLanguage} onChange={(event) => update("app", "defaultLanguage", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300">
                    <option value="pt">Português</option>
                    <option value="en">English</option>
                  </select>
                </Field>
              </div>
              <div className="mt-3">
                <Field label="Fuso horário">
                  <input type="text" value={settings.app.defaultTimezone} onChange={(event) => update("app", "defaultTimezone", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard icon="headphones" title="Suporte e contactos" description="Contactos exibidos no resumo e confirmação de pedidos.">
              <div className="space-y-3">
                <Field label="Nome do suporte">
                  <input type="text" value={settings.app.supportName} onChange={(event) => update("app", "supportName", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Telefone">
                    <input type="tel" value={settings.app.supportPhone} onChange={(event) => update("app", "supportPhone", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={settings.app.supportEmail} onChange={(event) => update("app", "supportEmail", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                  </Field>
                </div>
                <Field label="Horário de atendimento">
                  <input type="text" value={settings.app.supportHours} onChange={(event) => update("app", "supportHours", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
                <Field label="Tempo de resposta">
                  <input type="text" value={settings.app.supportResponseTime} onChange={(event) => update("app", "supportResponseTime", event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300" />
                </Field>
              </div>
            </SectionCard>

            <SectionCard icon="bell" title="Notificações" description="Preferências visuais para eventos importantes da app.">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(settings.notifications).map(([key, value]) => (
                  <SwitchField key={key} checked={value} onChange={(next) => updateNested("notifications", key, key, next)} label={key.replaceAll("_", " ")} hint={key === "promotions" ? "Opcional" : "Evento da app"} />
                ))}
              </div>
            </SectionCard>

            <SectionCard icon="users" title="Motoristas" description="Preferências gerais para motoristas em toda a app.">
              <div className="grid grid-cols-2 gap-3">
                <SwitchField checked={settings.drivers.requireDriverOnline} onChange={(value) => update("drivers", "requireDriverOnline", value)} label="Motorista online" hint="Exigir para atribuição" />
                <SwitchField checked={settings.drivers.showDriverPhoneToCustomer} onChange={(value) => update("drivers", "showDriverPhoneToCustomer", value)} label="Mostrar telefone" hint="Para o cliente" />
                <SwitchField checked={settings.drivers.allowDriverToAcceptScheduledOrders} onChange={(value) => update("drivers", "allowDriverToAcceptScheduledOrders", value)} label="Agendados" hint="Motoristas aceitam" />
                <Field label="Pedidos máximos por motorista">
                  <NumberInput value={settings.drivers.maxActiveOrdersPerDriver} onChange={(value) => update("drivers", "maxActiveOrdersPerDriver", value)} />
                </Field>
                <Field label="Distância máxima do pickup" hint="km">
                  <NumberInput value={settings.drivers.maxDistanceFromPickupKm} onChange={(value) => update("drivers", "maxDistanceFromPickupKm", value)} suffix="km" />
                </Field>
              </div>
            </SectionCard>
          </div>
        )}

        <div className="sticky bottom-20 bg-slate-50 pt-2">
          <div className="flex gap-2">
            <button type="button" onClick={resetFrontend} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-slate-50">
              Restaurar
            </button>
            <button type="button" onClick={saveFrontend} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-300 hover:bg-orange-600">
              Guardar no frontend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
