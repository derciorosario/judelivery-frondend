import { useState } from "react";
import Icon from "../../common/Icon";

const FeedbackModal = ({ isOpen, onClose, order, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleSubmit = () => {
    onSubmit(rating, comment);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Avaliar Entrega</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <Icon name="x" size={16} />
          </button>
        </div>
        
        {order && (
          <div className="text-center mb-4">
            <p className="text-sm text-slate-600">Pedido {order.id}</p>
            <p className="text-xs text-slate-400">{order.productName}</p>
            {order.driver && <p className="text-xs text-slate-400 mt-1">Motorista: {order.driver}</p>}
          </div>
        )}
        
        <div className="text-center mb-6">
          <p className="text-sm text-slate-700 mb-2">Como foi sua experiência?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Icon
                  name="star"
                  size={32}
                  className={`${(hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300"} transition-colors`}
                />
              </button>
            ))}
          </div>
          <div className="mt-2">
            <p className="text-xs text-slate-500">
              {rating === 5 ? "Excelente!" :
               rating === 4 ? "Muito bom" :
               rating === 3 ? "Bom" :
               rating === 2 ? "Razoável" :
               rating === 1 ? "Ruim" : ""}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Comentário (opcional)</label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Conte-nos sobre sua experiência..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
        </div>
        
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm">
            Enviar Avaliação
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;