import { FaWifi, FaRedo } from 'react-icons/fa';
import Modal from './Modal';

const NoInternetModal = ({ isOpen, onRetry, retrying = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Sem Conexão" showClose={false}>
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <FaWifi className="text-red-500 text-2xl" />
        </div>
        <p className="text-slate-600">
          É necessária uma conexão com a internet para aceder ao aplicativo. Por favor, verifique a sua ligação e tente novamente.
        </p>
        <button
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-70"
        >
          {retrying ? (
            <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          ) : (
            <FaRedo className="mr-2" />
          )}
          {retrying ? 'A verificar...' : 'Tentar Novamente'}
        </button>
      </div>
    </Modal>
  );
};

export default NoInternetModal;
