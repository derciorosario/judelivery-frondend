import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Icon from '../common/Icon';
import LocationSearchInput from '../common/LocationSearchInput';
import { DRIVERS, PRODUCTS } from '../../data/mockData';

const AddOrderModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    client: "",
    productId: "",
    origin: "",
    dest: "",
    total: "",
    driver: "Não atribuído",
    quantity: 1
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
      const { total, dist } = calculateTotal(form.origin, form.dest);
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
      productId: form.productId,
      productName: selectedProduct?.name || "",
      quantity: form.quantity,
      origin: form.origin,
      dest: form.dest,
      status: "Pendente",
      driver: form.driver,
      total: form.total + " MZN",
      time: new Date().toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" }),
      dist: dist + " km"
    };
    
    onAdd(newOrder);
    onClose();
    setForm({ client: "", productId: "", origin: "", dest: "", total: "", driver: "Não atribuído", quantity: 1 });
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Produto</label>
          <select
            value={form.productId}
            onChange={e => setForm({ ...form, productId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          <label className="block text-xs font-semibold text-slate-500 mb-1">Quantidade</label>
          <input
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
            min="1"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
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
              <span className="text-orange-500 text-[10px]">(Calculado automaticamente)</span>
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
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-orange-500 hover:text-orange-600"
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
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
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600">
            Criar Pedido
          </button>
        </div>
      </form>
    </Modal>
  );
};


export default AddOrderModal;