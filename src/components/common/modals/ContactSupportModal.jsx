import { Phone, HelpCircle, ChevronRight } from "lucide-react";
import Icon from "../Icon";

const DEFAULT_SUPPORT = {
  name: "Plataforma/Suporte",
  phone: "+258 82 333 4455",
  hours: "Segunda a Sexta: 8h às 18h | Sábado: 9h às 13h",
  responseTime: "Tempo médio de resposta: 2 horas"
};

const FAQ_ITEMS = [
  {
    question: "Como posso contactar o motorista?",
    answer: "Use o botão 'Ligar' ao lado do contacto do motorista para entrar em contacto diretamente. Certifique-se de que o pedido está em status 'Em entrega' ou 'Atribuído'."
  },
  {
    question: "O que fazer se o motorista não atende?",
    answer: "Se o motorista não atender, tente novamente dentro de alguns minutos. Se persistir, contacte o suporte da plataforma para assistência."
  },
  {
    question: "Como cancelar um pedido?",
    answer: "Para cancelar um pedido, acesse os detalhes do pedido e clique em 'Cancelar'. Atenção: pedidos em entrega podem ter taxas de cancelamento."
  },
  {
    question: "Quem deve eu contactar para reclamações?",
    answer: "Para reclamações sobre serviço ou motorista, contacte o suporte da plataforma. Para dúvidas sobre o pedido, o motorista é o contacto mais apropriado."
  },
  {
    question: "Posso mudar o destino do pedido?",
    answer: "Alterações de destino só são possíveis antes do motorista iniciar a entrega. Contacte o suporte imediatamente para solicitar mudanças."
  }
];

const ContactSupportModal = ({ 
  isOpen, 
  onClose, 
  order,
  supportContact = DEFAULT_SUPPORT
}) => {
  if (!isOpen) return null;

  const handleCall = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const driverName = typeof order?.driver === "string" 
    ? order.driver 
    : order?.driver?.name || null;
  
  const driverPhone = order?.driver?.phone || null;

  const originContact = order?.contactOrigin || null;
  const originName = order?.originName || order?.origin || "Origem";

  const destinationContact = order?.contactDest || null;
  const destinationName = order?.destinationName || order?.dest || "Destino";

  const hasDriverContact = driverPhone && driverName;
  const hasOriginContact = originContact;
  const hasDestinationContact = destinationContact;
  const hasAnyContact = hasDriverContact || hasOriginContact || hasDestinationContact;

  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Contacto e Suporte</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <div className="p-4 space-y-5">


           <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Icon name="headphones" size={14} /> Contacto do Suporte
            </h3>
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{supportContact.name}</p>
                  <p className="text-xs text-slate-500">{supportContact.phone}</p>
                </div>
                <button
                  onClick={() => handleCall(supportContact.phone)}
                  className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1"
                >
                  <Phone size={14} /> Ligar
                </button>
              </div>
              {supportContact.hours && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-500">{supportContact.hours}</p>
                  {supportContact.responseTime && (
                    <p className="text-xs text-orange-500 mt-1">{supportContact.responseTime}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          
          {hasAnyContact && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Phone size={14} /> Contactos da Encomenda
              </h3>
              <div className="space-y-3">
                {hasDriverContact && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{driverName}</p>
                        <p className="text-xs text-slate-500">{driverPhone}</p>
                      </div>
                      <button
                        onClick={() => handleCall(driverPhone)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Phone size={14} /> Ligar
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Motorista</p>
                  </div>
                )}

                {hasOriginContact && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{originName}</p>
                        <p className="text-xs text-slate-500">{originContact}</p>
                      </div>
                      <button
                        onClick={() => handleCall(originContact)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Phone size={14} /> Ligar
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Contacto de Origem</p>
                  </div>
                )}

                {hasDestinationContact && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{destinationName}</p>
                        <p className="text-xs text-slate-500">{destinationContact}</p>
                      </div>
                      <button
                        onClick={() => handleCall(destinationContact)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Phone size={14} /> Ligar
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Contacto de Destino</p>
                  </div>
                )}
              </div>
            </div>
          )}

         

          {/* FAQ Section with arrows */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <HelpCircle size={14} /> Perguntas Frequentes
            </h3>
            <div className="space-y-3">
              {FAQ_ITEMS.map((item, idx) => (
                <details key={idx} className="group">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center justify-between gap-2 list-none">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="flex w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{item.question}</span>
                    </div>
                    <ChevronRight 
                      size={16} 
                      className="text-slate-400 group-open:rotate-90 transition-transform duration-200 flex-shrink-0" 
                    />
                  </summary>
                  <div className="mt-2 ml-7 pl-2 border-l border-slate-200">
                    <p className="text-xs text-slate-600 leading-relaxed">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportModal;