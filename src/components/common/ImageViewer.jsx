import { useState } from "react";
import Icon from "./Icon";

const ImageViewer = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed !mb-0 inset-0 z-[99] flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all duration-200"
          aria-label="Fechar"
        >
          <Icon name="x" size={20} className="text-white" />
        </button>
        
        {/* Image */}
        <img
          src={imageUrl}
          alt="Visualização"
          className="w-full h-full object-contain rounded-lg"
        />
        
        {/* Optional: Click outside to close */}
        <div 
          className="absolute inset-0 -z-10"
          onClick={onClose}
        />
      </div>
    </div>
  );
};

export default ImageViewer;