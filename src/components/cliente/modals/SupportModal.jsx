import { useState } from "react";
import Icon from "../../common/Icon";

const SupportModal = ({ isOpen, onClose }) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  
  const handleSubmit = () => {
    console.log("Support message:", { subject, message });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Suporte ao Cliente</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon name="x" className="text-black" size={16} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-green-50 rounded-xl text-green-600 text-sm font-semibold">
              <Icon name="whatsapp" size={18} className="inline mr-2" />
              WhatsApp
            </button>
            <button className="flex-1 py-2 bg-blue-50 rounded-xl text-blue-600 text-sm font-semibold">
              <Icon name="phone" size={18} className="inline mr-2" />
              Ligar
            </button>
          </div>
          
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Enviar mensagem</p>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Assunto"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Descreva seu problema ou dúvida..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
            <button onClick={handleSubmit} className="w-full mt-3 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm">
              Enviar Mensagem
            </button>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">Atendimento</p>
            <p className="text-xs text-slate-600">Segunda a Sexta: 8h às 18h</p>
            <p className="text-xs text-slate-600">Sábado: 9h às 13h</p>
            <p className="text-xs text-orange-500 mt-2">Tempo médio de resposta: 2 horas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;