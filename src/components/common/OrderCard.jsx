import React from 'react';
import Icon from './Icon';
import { PRODUCTS, STATUSCOLOR } from '../../data/mockData';

const OrderCard = ({ order, showAssign, onAssign }) => {
  // Get product name from productId
  const product = PRODUCTS.find(p => p.id.toString() === order.productId);
  const productName = product ? product.name : order.productName || "Produto não especificado";
  
  // Get driver name from drivers array or use the driver field directly
  const driverName = order.driver !== "—" ? order.driver : "Não atribuído";
  
  // Calculate time estimate based on distance (3 minutes per km)
  const timeEstimate = order.dist ? Math.round(parseFloat(order.dist) * 3) + " min" : "15 min";
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{order.id}</span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUSCOLOR[order.status]}`}>{order.status}</span>
        </div>
        <span className="text-sm font-bold text-orange-500">{order.total}</span>
      </div>
      <p className="text-sm font-medium text-slate-700">{order.client}</p>
      <p className="text-xs text-slate-500 mb-1">{productName} {order.quantity > 1 && `(x${order.quantity})`}</p>
      <p className="text-xs text-slate-500 mb-1">Motorista: {driverName}</p>
      <div className="mt-2 space-y-1">
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-orange-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{order.origin}</span>
        </div>
        <div className="flex items-start gap-1.5 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-slate-400 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{order.dest}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Icon name="clock" size={12} />{order.time}</span>
          <span className="flex items-center gap-1"><Icon name="location" size={12} />{order.dist}</span>
          <span className="flex items-center gap-1"><Icon name="clock" size={12} />{timeEstimate}</span>
        </div>
        {showAssign && (order.status === "Pendente" || order.status === "Aprovado") && (
          <button onClick={() => onAssign && onAssign(order)} className="text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-lg hover:bg-orange-100 transition-colors">
            Atribuir →
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderCard;