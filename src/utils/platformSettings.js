export const defaultPlatformSettings = {
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
    driverCanCancel: true,
    driverCanReject: true,
    driverCanUpdateAmount: false,
    maxDistanceKm: 80,
    maxWaitingTimeMinutes: 20,
  },
  pricing: {
    deliveryBasePrice: 50,
    deliveryPerKm: 12,
    urgentPercentage: 30,
    veryUrgentPercentage: 60,
    taxiBasePrice: 80,
    taxiPerKm: 20,
    returnTripFee: 100,
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
      { id: "bank_transfer", code: "bank_transfer", name: "Transferência", enabled: true, primary: false, instructions: "Confirmar comprovativo antes de atribuir motorista.", number: "12345678901", holder: "Empresa Logística MZ" },
      { id: "mpesa", code: "mpesa", name: "M-Pesa", enabled: true, primary: true, instructions: "Pagamento móvel por número da plataforma.", number: "84 123 4567", holder: "Empresa Logística MZ" },
      { id: "emola", code: "emola", name: "e-Mola", enabled: true, primary: false, instructions: "Confirmar referência ou número da carteira.", number: "84 765 4321", holder: "Empresa Logística MZ" },
      { id: "cash", code: "cash", name: "Dinheiro", enabled: true, primary: false, instructions: "O cliente paga directamente ao motorista.", number: "", holder: "" },
    ],
  },
  app: {
    appName: "J. RIBEIRO SERVIÇOS E.I",
    currency: "MZN",
    countryRestriction: "mz",
    defaultLanguage: "pt",
    defaultTimezone: "Africa/Maputo",
    supportName: "Plataforma/Suporte",
    supportPhone: "+258 82 333 4455",
    supportEmail: "suporte@jrmultiservicos.co.mz",
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
    driverStatus: true,
    orderPriceUpdated: true,
    incidentReported: true,
  },
  drivers: {
    requireDriverOnline: true,
    maxActiveOrdersPerDriver: 3,
    showDriverPhoneToCustomer: true,
    allowDriverToAcceptScheduledOrders: true,
    maxDistanceFromPickupKm: 15,
  },
  promotion: {
    enabled: false,
    title: "PROMOÇÃO DE LANÇAMENTO",
    discountPercentage: 40,
    discountText: "40% OFF",
    subtitle: "EM TODOS OS PEDIDOS",
    validityText: "VÁLIDO DURANTE OS PRIMEIROS 15 DIAS",
    startDate: "",
    endDate: "",
    daysDuration: 15,
    minOrderValue: 0,
    maxOrderValue: 0,
    totalUsageLimit: 0,
    newCustomersOnly: false,
    firstOrderOnly: true,
  },
};

export const cloneSettings = (value = defaultPlatformSettings) => JSON.parse(JSON.stringify(value));

export const mergeSettings = (base, override = {}) => {
  const merged = cloneSettings(base);

  Object.keys(override || {}).forEach((section) => {
    const overrideSection = override[section];
    if (!overrideSection || typeof overrideSection !== "object" || Array.isArray(overrideSection)) {
      merged[section] = cloneSettings(overrideSection);
      return;
    }

    if (!merged[section] || typeof merged[section] !== "object" || Array.isArray(merged[section])) {
      merged[section] = {};
    }

    Object.keys(overrideSection).forEach((key) => {
      const value = overrideSection[key];
      if (Array.isArray(value)) {
        merged[section][key] = value.map((item) => (item && typeof item === "object" ? { ...item } : item));
      } else if (value && typeof value === "object") {
        merged[section][key] = { ...value };
      } else {
        merged[section][key] = value;
      }
    });
  });

  return merged;
};

export const getEnabledPaymentMethods = (settings) => {
  const methods = settings?.payments?.methods || [];
  return methods.filter((method) => method?.enabled);
};

export const getPrimaryPaymentMethod = (settings) => {
  const enabledMethods = getEnabledPaymentMethods(settings);
  return enabledMethods.find((method) => method?.primary) || enabledMethods[0] || null;
};

export const paymentCodeToLabel = {
  bank_transfer: "Transferência",
  mpesa: "M-Pesa",
  emola: "e-Mola",
  cash: "Dinheiro",
  card: "Cartão",
  bic: "Conta BIC",
};

export const paymentLabelToCode = {
  Transferência: "bank_transfer",
  "M-Pesa": "mpesa",
  "e-Mola": "emola",
  Dinheiro: "cash",
  Cash: "cash",
};

export const normalizePaymentMethod = (method, settings) => {
  if (!method) return getPrimaryPaymentMethod(settings);
  if (paymentLabelToCode[method]) return paymentLabelToCode[method];
  if (typeof method === "object") return method.code || method.id || getPrimaryPaymentMethod(settings)?.code || "bank_transfer";
  return method;
};

export const formatMoney = (amount, currency = "MZN") => {
  try {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: currency || "MZN",
    }).format(Number(amount) || 0);
  } catch {
    return `${Number(amount) || 0} ${currency || "MZN"}`;
  }
};
