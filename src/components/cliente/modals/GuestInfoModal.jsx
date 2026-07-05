import { useState } from "react";
import Icon from "../../common/Icon";

const GuestInfoModal = ({ isOpen, onClose, onContinue }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }
    if (!contact.trim()) {
      newErrors.contact = "Contacto é obrigatório";
    } else if (!/^[+]?[\d\s()-]+$/.test(contact.trim())) {
      newErrors.contact = "Contacto inválido";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Email inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onContinue({
      name: name.trim(),
      contact: contact.trim(),
      email: email.trim() || null
    });
  };

  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-fadeInUp">
        <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Seus Dados</h2>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-xs text-slate-500 -mt-2">
            Preencha os dados abaixo para continuar com o pedido. O email é opcional.
          </p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Contacto <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="+258 84 123 4567"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.contact ? "border-red-300 bg-red-50" : "border-slate-200"
              }`}
            />
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email <span className="text-slate-400">(opcional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                errors.email ? "border-red-300 bg-red-50" : "border-slate-200"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestInfoModal;
