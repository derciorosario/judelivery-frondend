import { useState } from "react";
import Icon from "../common/Icon";

const CustomerProfile = ({ user, customerData, orders, signOut }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: customerData.name,
    phone: customerData.phone,
    email: customerData.email,
    defaultAddress: customerData.defaultAddress
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addresses, setAddresses] = useState(customerData.addresses || []);
  const [newAddress, setNewAddress] = useState("");
  
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
  const deliveryCount = orders.length;
  const completedCount = orders.filter(o => o.status === "Concluído" || o.statusCode === "completed").length;
  
  const handleSaveProfile = () => {
    console.log("Saving profile:", formData);
    setEditMode(false);
  };
  
  const handleAddAddress = () => {
    if (newAddress.trim()) {
      setAddresses([...addresses, newAddress]);
      setNewAddress("");
      setShowAddressModal(false);
    }
  };
  
  const handleRemoveAddress = (index) => {
    const newAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(newAddresses);
  };
  
  const handleSetDefaultAddress = (address) => {
    setFormData({ ...formData, defaultAddress: address });
  };

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3 shadow-lg">
          {customerData.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        {!editMode ? (
          <>
            <p className="text-lg font-bold text-slate-800">{customerData.name}</p>
            <p className="text-sm text-slate-400">{customerData.phone}</p>
            <p className="text-sm text-slate-400">{customerData.email}</p>
            <div className="flex items-center justify-center gap-1 mt-2 text-amber-400">
              {[1,2,3,4].map(i => <Icon key={i} name="star" size={16} className="fill-amber-400" />)}
              <Icon name="star" size={16} className={customerData.rating >= 5 ? "fill-amber-400" : ""} />
              <span className="text-sm text-slate-600 ml-1">{customerData.rating}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditMode(true)} className="flex-1 bg-orange-500 text-white text-sm font-semibold py-2 rounded-xl">
                Editar Perfil
              </button>
              <button onClick={signOut} className="flex-1 bg-red-50 text-red-500 text-sm font-semibold py-2 rounded-xl">
                Sair
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-500">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm mt-1"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleSaveProfile} className="flex-1 bg-green-500 text-white text-sm font-semibold py-2 rounded-xl">
                Salvar
              </button>
              <button onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 text-slate-600 text-sm font-semibold py-2 rounded-xl">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{deliveryCount}</p>
          <p className="text-[10px] text-slate-400">Entregas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{totalSpent} MZN</p>
          <p className="text-[10px] text-slate-400">Total Gasto</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{completedCount}</p>
          <p className="text-[10px] text-slate-400">Concluídas</p>
        </div>
      </div>
      
      {/* Addresses */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Meus Endereços</p>
          <button onClick={() => setShowAddressModal(true)} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg">
            + Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {addresses.map((addr, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="mapPin" size={16} className="text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700">{addr}</p>
                  {formData.defaultAddress === addr && (
                    <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Padrão</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {formData.defaultAddress !== addr && (
                  <button onClick={() => handleSetDefaultAddress(addr)} className="p-1 text-xs text-blue-500">
                    Definir padrão
                  </button>
                )}
                <button onClick={() => handleRemoveAddress(idx)} className="p-1 text-red-500">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Métodos de Pagamento</p>
          <button className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg">
            + Adicionar
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="dollar" size={16} className="text-green-500" />
              <span className="text-sm text-slate-700">Dinheiro na entrega</span>
            </div>
            <span className="text-xs text-green-500">Padrão</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="smartphone" size={16} className="text-blue-500" />
              <span className="text-sm text-slate-700">M-Pesa</span>
            </div>
            <span className="text-xs text-slate-400">•••• 1234</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon name="smartphone" size={16} className="text-purple-500" />
              <span className="text-sm text-slate-700">e-Mola</span>
            </div>
            <span className="text-xs text-slate-400">•••• 5678</span>
          </div>
        </div>
      </div>
      
      {/* Settings Options */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <button onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50">
          <Icon name="lock" size={18} className="text-slate-400" />
          <span className="text-sm text-slate-700 flex-1 text-left">Alterar Senha</span>
          <Icon name="chevronRight" size={16} className="text-slate-400" />
        </button>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Icon name="bell" size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">Notificações</span>
          </div>
          <div className="w-10 h-5 bg-orange-500 rounded-full relative">
            <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon name="moon" size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">Modo Escuro</span>
          </div>
          <div className="w-10 h-5 bg-slate-200 rounded-full relative">
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Endereço</h2>
              <button onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon name="x" size={16} />
              </button>
            </div>
            <input
              type="text"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="Digite o endereço completo"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowAddressModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600">
                Cancelar
              </button>
              <button onClick={handleAddAddress} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Alterar Senha</h2>
              <button onClick={() => setShowChangePassword(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                <Icon name="x" size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input type="password" placeholder="Senha atual" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="password" placeholder="Nova senha" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
              <input type="password" placeholder="Confirmar nova senha" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowChangePassword(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600">
                Cancelar
              </button>
              <button className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerProfile;