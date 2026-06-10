// src/components/common/PaymentDialog.jsx
import { useState, useEffect } from "react";
import { CreditCard, Smartphone, Building, Info } from "lucide-react";
import Modal from "./Modal";

const PaymentDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderTotal, 
  isSubmitting, 
  role = "driver",
  defaultPaymentType = null,
  defaultPaymentMethod = null,
  existingPaymentMethod = null
}) => {
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);
  const [paymentType, setPaymentType] = useState(defaultPaymentType);
  const [calculatedTotal, setCalculatedTotal] = useState(orderTotal);
  const [fee, setFee] = useState(0);
  const [feePercentage, setFeePercentage] = useState(0);

  const directTransferOptions = [
    { id: "cash", name: "Dinheiro", number: "Pagar em dinheiro na entrega", holder: "Pague ao motorista" },
    { id: "mpesa", name: "M-Pesa", number: "84 123 4567", holder: "Empresa Logística MZ" },
    { id: "emola", name: "E-Mola", number: "84 765 4321", holder: "Empresa Logística MZ" },
    { id: "bic", name: "Conta BIC", number: "12345678901", holder: "Empresa Logística MZ" }
  ];

  const onlinePaymentOptions = [
    { id: "mpesa", name: "M-Pesa", icon: Smartphone, fee: 3 },
    { id: "emola", name: "E-Mola", icon: Smartphone, fee: 3 },
    { id: "card", name: "Cartão", icon: CreditCard, fee: 5 }
  ];

  // Map existing payment method to display name
  const getPaymentMethodDisplayName = (method) => {
    const names = {
      cash: "Dinheiro",
      mpesa: "M-Pesa",
      emola: "E-Mola",
      card: "Cartão",
      bank_transfer: "Transferência Bancária"
    };
    return names[method] || method;
  };

  // Calculate total with fee when online payment method is selected
  useEffect(() => {
    if (paymentType === "online" && paymentMethod) {
      const selectedOption = onlinePaymentOptions.find(opt => opt.id === paymentMethod);
      if (selectedOption) {
        const feeAmount = (orderTotal * selectedOption.fee) / 100;
        setFee(feeAmount);
        setFeePercentage(selectedOption.fee);
        setCalculatedTotal(orderTotal + feeAmount);
      } else {
        setFee(0);
        setFeePercentage(0);
        setCalculatedTotal(orderTotal);
      }
    } else if (paymentType === "direct") {
      setFee(0);
      setFeePercentage(0);
      setCalculatedTotal(orderTotal);
    }
  }, [paymentType, paymentMethod, orderTotal]);

  const handleConfirm = () => {
    if (!paymentType) {
      alert("Por favor, selecione um tipo de pagamento");
      return;
    }
    if (!paymentMethod) {
      alert("Por favor, selecione um método de pagamento");
      return;
    }
    
    // Map payment method to the correct format for the API
    let apiPaymentMethod = paymentMethod;
    if (paymentType === "direct" && paymentMethod === "bic") {
      apiPaymentMethod = "bank_transfer";
    }
    
    onConfirm({
      paymentType,
      paymentMethod: apiPaymentMethod,
      totalWithFees: calculatedTotal,
      originalTotal: orderTotal,
      fee,
      feePercentage
    });
  };

  const getRoleTitle = () => {
    return role === "admin" ? "Concluir Pedido - Pagamento (Admin)" : "Concluir Pedido - Pagamento";
  };

  // Show existing payment method info if present
  const showExistingPaymentInfo = existingPaymentMethod && !paymentType && !paymentMethod;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getRoleTitle()} size="lg">
      <div className="space-y-5">
        {/* Existing Payment Method Info */}
        {showExistingPaymentInfo && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <Info size={16} className="text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Método de Pagamento Existente</p>
                <p className="text-xs text-blue-600">
                  O pedido já possui um método de pagamento selecionado: <strong>{getPaymentMethodDisplayName(existingPaymentMethod)}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Pode manter ou alterar abaixo.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 text-white">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-orange-100">Valor base</p>
            <p className="text-sm font-semibold">{orderTotal} MZN</p>
          </div>
          
          {fee > 0 && (
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-orange-100">Taxa ({feePercentage}%)</p>
              <p className="text-sm font-semibold">+ {fee.toFixed(2)} MZN</p>
            </div>
          )}
          
          <div className="border-t border-orange-400 my-2"></div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold">Total a pagar</p>
            <p className="text-xl font-bold">{calculatedTotal} MZN</p>
          </div>
        </div>

        {/* Payment Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">Selecione o tipo de pagamento</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setPaymentType("direct");
                setPaymentMethod(null);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                paymentType === "direct"
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <Building size={24} className="mx-auto mb-1 text-slate-600" />
              <p className="text-sm font-semibold text-slate-700">Transferência Directa</p>
              <p className="text-xs text-slate-500">Pagamento manual - Sem taxas</p>
            </button>
            <button
              onClick={() => {
                setPaymentType("online");
                setPaymentMethod(null);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                paymentType === "online"
                  ? "border-orange-500 bg-orange-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <CreditCard size={24} className="mx-auto mb-1 text-slate-600" />
              <p className="text-sm font-semibold text-slate-700">Pagamento Online</p>
              <p className="text-xs text-slate-500">Processamento automático</p>
            </button>
          </div>
        </div>

        {/* Direct Transfer Options */}
        {paymentType === "direct" && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Selecione o método de transferência</label>
            <div className="space-y-2">
              {directTransferOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setPaymentMethod(option.id)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    paymentMethod === option.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-700">{option.name}</p>
                      <p className="text-xs text-slate-500">{option.number}</p>
                      <p className="text-xs text-slate-500">{option.holder}</p>
                    </div>
                    {paymentMethod === option.id && (
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  {paymentMethod === "cash" 
                    ? "Pagamento em dinheiro será feito diretamente ao motorista na entrega."
                    : "Após realizar a transferência para os dados acima, o pedido será marcado como concluído."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Online Payment Options */}
        {paymentType === "online" && (
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">Selecione o método de pagamento online</label>
            <div className="grid grid-cols-3 gap-2">
              {onlinePaymentOptions.map(option => {
                const Icon = option.icon;
                const isSelected = paymentMethod === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPaymentMethod(option.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      isSelected
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    <Icon size={24} className="mx-auto mb-1 text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700">{option.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Taxa: +{option.fee}%</p>
                    {isSelected && (
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 mx-auto"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {paymentMethod && (
              <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-amber-500 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    💡 Simulação de pagamento online. Esta funcionalidade será implementada em breve.
                    O valor total inclui taxa de {onlinePaymentOptions.find(o => o.id === paymentMethod)?.fee}%.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fee Info Box */}
        {paymentType === "online" && (
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <Info size={12} />
              Taxas aplicadas: 3% para M-Pesa e E-Mola, 5% para Cartão
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !paymentType || !paymentMethod}
            className="flex-1 py-2.5 rounded-lg bg-green-500 text-white font-semibold text-sm hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              `Pagar ${calculatedTotal} MZN`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDialog;