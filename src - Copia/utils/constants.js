export const STATUSCOLOR = {
  "Em entrega": "bg-blue-100 text-blue-700",
  "Pendente": "bg-amber-100 text-amber-700",
  "Concluído": "bg-green-100 text-green-700",
  "Atribuído": "bg-purple-100 text-purple-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Em coleta": "bg-orange-100 text-orange-700",
  "Aprovado": "bg-teal-100 text-teal-700",
  "Rejeitado": "bg-red-100 text-red-700"
};

export const ORDER_STATUS_CONFIG = {
  pending_approval: { label: "Aguardando Aprovação", icon: "clock", color: "text-amber-600", bgColor: "bg-amber-50", step: 1 },
  approved: { label: "Pedido Aprovado", icon: "checkCircle", color: "text-teal-600", bgColor: "bg-teal-50", step: 2 },
  in_collection: { label: "Em Coleta", icon: "truck", color: "text-blue-600", bgColor: "bg-blue-50", step: 3 },
  in_transit: { label: "Em Transporte", icon: "navigation", color: "text-indigo-600", bgColor: "bg-indigo-50", step: 4 },
  delivered: { label: "Entregue", icon: "checkCircle", color: "text-green-600", bgColor: "bg-green-50", step: 5 },
  cancelled: { label: "Cancelado", icon: "xCircle", color: "text-red-600", bgColor: "bg-red-50", step: 0 },
  rejected: { label: "Rejeitado", icon: "alertOctagon", color: "text-red-600", bgColor: "bg-red-50", step: 0 }
};