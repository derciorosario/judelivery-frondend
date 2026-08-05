import { FaDownload, FaInfoCircle } from 'react-icons/fa';
import Modal from './Modal';
import { APK_DOWNLOAD_URL } from '../../api/client';

const UpdateAvailableModal = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Atualização Disponível" showClose={false}>
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <FaDownload className="text-primary-600 text-2xl" />
        </div>
        <p className="text-slate-600">
          Há uma nova versão do aplicativo disponível. Por favor, atualize para continuar usando o J. Ribeiro com os recursos mais recentes.
        </p>
        <a
          href={APK_DOWNLOAD_URL}
          download
          className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 !text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
        >
          <FaDownload className="mr-2" />
          Baixar Nova Versão
        </a>
      </div>
    </Modal>
  );
};

export default UpdateAvailableModal;
