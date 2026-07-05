import { useState, useEffect } from "react";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { PRODUCTS, PRODUCT_CATEGORIES } from "../../data/mockData";

// Add Product Modal
const AddProductModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({
    name: "",
    category: "Alimentação",
    price: "",
    available: true,
    origin: "Loja Central, Maputo",
    stock: ""
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
      stock: parseInt(form.stock)
    };
    
    onAdd(newProduct);
    onClose();
    setForm({ name: "", category: "Alimentação", price: "", available: true, origin: "Loja Central, Maputo", stock: "" });
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
            placeholder="Ex: Pizza Margherita"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {PRODUCT_CATEGORIES.map(c => (
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
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            placeholder="0"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
          <select
            value={form.origin}
            onChange={e => setForm({ ...form, origin: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
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
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600">
            Criar Produto
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit Product Modal
const EditProductModal = ({ isOpen, onClose, product, onEdit }) => {
  const [form, setForm] = useState({
    name: "",
    category: "Alimentação",
    price: "",
    available: true,
    origin: "Loja Central, Maputo",
    stock: ""
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        available: product.available,
        origin: product.origin,
        stock: product.stock.toString()
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
      stock: parseInt(form.stock)
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            {PRODUCT_CATEGORIES.map(c => (
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
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Origem</label>
          <select
            value={form.origin}
            onChange={e => setForm({ ...form, origin: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
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
          <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600">
            Salvar Alterações
          </button>
        </div>
      </form>
    </Modal>
  );
};

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
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300">
          <Icon name="plus" size={14} /> Novo
        </button>
      </div>
      <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} />
      <EditProductModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} product={selectedProduct} onEdit={handleEditProduct} />
      
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${filter === c ? "bg-orange-500 text-white border-orange-500" : "bg-white text-slate-600 border-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>
      
      {filtered.map(p => (
        <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-800">{p.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.category}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {p.available ? "Disponível" : "Indisponível"}
                </span>
              </div>
            </div>
            <span className="text-sm font-bold text-orange-500">{p.price} MZN</span>
          </div>
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

export default AdminProducts;