import { useState, useEffect, useRef } from "react";
import { useSocket } from "../../contexts/SocketContext";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDrivers, createDriver, updateDriver, deleteDriver, getUserAuditLogs, getEntityAuditLogs } from "../../api/client";
import { toast } from "../../lib/toast";
import ImageViewer from "../common/ImageViewer";
import { Capacitor } from '@capacitor/core';
import { useAuth } from "../../contexts/AuthContext";

// FileUploadInput component with camera support
const FileUploadInput = ({ 
  label, 
  setViewerOpen, 
  setSelectedImage, 
  fieldName, 
  file, 
  onFileChange, 
  onRemove, 
  existingUrl, 
  accept = "image/*,.pdf", 
  isProfile = false, 
  isRemoved = false,
  isNative = false,
  onTakePhoto
}) => {
  const fileInputRef = useRef(null);
  const hasFile = !!file;
  const hasExisting = !!existingUrl && !file && !isRemoved;

  const isImageFile = (url) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
  };

  const handleOpenFile = (fileUrl) => {
    if (isImageFile(fileUrl)) {
      setSelectedImage(fileUrl);
      setViewerOpen(true);
      return;
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileChange(fieldName, { target: { files: [file] } });
    }
    e.target.value = "";
  };

  const handleTakePhoto = () => {
    if (onTakePhoto) {
      onTakePhoto(fieldName);
    }
  };

  if (isProfile) {
    const previewUrl = file ? URL.createObjectURL(file) : isRemoved ? null : existingUrl;
    return (
      <div className="flex flex-col items-center">
        <label className="text-xs font-semibold text-slate-500 mb-2">{label}</label>
        <div className="relative">
          <input
            type="file"
            id={fieldName}
            accept={accept}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            ref={fileInputRef}
          />
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-orange-200 bg-orange-50 flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <Icon name="camera" size={32} className="text-orange-500" />
            )}
          </div>
        </div>
        {isNative && !hasFile && !hasExisting && (
          <button
            type="button"
            onClick={handleTakePhoto}
            className="mt-2 px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Icon name="camera" size={14} className="inline mr-1" />
            Tirar Foto
          </button>
        )}
        {(hasFile || hasExisting) && (
          <button
            type="button"
            onClick={() => onRemove && onRemove(fieldName)}
            className="mt-2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Remover foto"
          >
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-500">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="file"
            id={fieldName}
            accept={accept}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            ref={fileInputRef}
          />
          <div
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
              hasFile || hasExisting ? "bg-orange-50 border-orange-200" : "bg-white border-slate-200 hover:bg-slate-50"
            } cursor-pointer`}
          >
            <div className="flex items-center gap-2">
              <Icon name={hasFile || hasExisting ? "checkCircle" : "upload"} size={16} className={hasFile || hasExisting ? "text-green-500" : "text-orange-500"} />
              <span className="text-slate-600 text-xs truncate max-w-[150px]">
                {hasFile ? file.name : hasExisting ? "Documento" : "Selecionar"}
              </span>
            </div>
            <Icon name="chevronRight" size={14} className="text-slate-400" />
          </div>
        </div>
        {isNative && !hasFile && !hasExisting && (
          <button
            type="button"
            onClick={handleTakePhoto}
            className="p-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Tirar foto"
          >
            <Icon name="camera" size={16} />
          </button>
        )}
        {(hasFile || hasExisting) && (
          <button
            type="button"
            onClick={() => onRemove && onRemove(fieldName)}
            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Remover"
          >
            <Icon name="x" size={16} />
          </button>
        )}
      </div>

      {hasExisting && !hasFile && (
        <div onClick={() => handleOpenFile(existingUrl)} className="inline-flex cursor-pointer items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors">
          <Icon name="externalLink" size={12} />
          Visualizar
        </div>
      )}

      {hasFile && !isImageFile(file.name) && (
        <div
          onClick={() => {
            const fileUrl = URL.createObjectURL(file);
            handleOpenFile(fileUrl);
            setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
          }}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Icon name="externalLink" size={12} />
          Abrir arquivo
        </div>
      )}
    </div>
  );
};

// Camera Modal for native devices
const CameraModal = ({ isOpen, onClose, onTakePhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Stop camera when modal closes
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsCameraReady(false);
      setError(null);
      return;
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onTakePhoto(file);
          onClose();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/90">
        <button onClick={onClose} className="text-white p-2">
          <Icon name="x" size={24} />
        </button>
        <button onClick={switchCamera} className="text-white p-2">
          <Icon name="refreshCw" size={20} />
        </button>
      </div>
      
      <div className="flex-1 relative bg-black flex items-center justify-center">
        {error ? (
          <div className="text-center text-white p-6">
            <Icon name="alertCircle" size={48} className="mx-auto mb-4 text-red-400" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={startCamera}
              className="mt-4 px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="p-6 bg-black/90 flex justify-center">
        <button
          onClick={capturePhoto}
          disabled={!isCameraReady}
          className={`w-16 h-16 rounded-full border-4 border-white ${
            isCameraReady ? 'bg-white hover:bg-gray-200' : 'bg-gray-500'
          } transition-colors flex items-center justify-center`}
        >
          <div className="w-12 h-12 rounded-full bg-transparent border-2 border-black" />
        </button>
      </div>
    </div>
  );
};

// AddDriverModal with camera support
const AddDriverModal = ({ isOpen, onClose, onAdd }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", bi: "", birthDate: "", address: "", emergencyContact: "", password: "", zone: "", admissionDate: "" });
  const [files, setFiles] = useState({ profilePhoto: null, biCopy: null, driverLicenseCopy: null, vehicleRegistration: null, insuranceDocument: null, trainingCertificateCopy: null });
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraField, setCameraField] = useState(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", bi: "", birthDate: "", address: "", emergencyContact: "", password: "", zone: "", admissionDate: "" });
      setFiles({ profilePhoto: null, biCopy: null, driverLicenseCopy: null, vehicleRegistration: null, insuranceDocument: null, trainingCertificateCopy: null });
      setAutoGeneratePassword(true);
    }
  }, [isOpen]);

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) setFiles((prev) => ({ ...prev, [fieldName]: file }));
  };

  const handleRemoveFile = (fieldName) => setFiles((prev) => ({ ...prev, [fieldName]: null }));

  const handleTakePhoto = (fieldName) => {
    setCameraField(fieldName);
    setCameraOpen(true);
  };

  const handleCameraCapture = (file) => {
    if (cameraField) {
      setFiles((prev) => ({ ...prev, [cameraField]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("email", form.email);
    formData.append("vehicle", form.vehicle || "");
    formData.append("licensePlate", form.licensePlate || "");
    formData.append("bi", form.bi || "");
    formData.append("birthDate", form.birthDate || "");
    formData.append("address", form.address || "");
    formData.append("emergencyContact", form.emergencyContact || "");
    formData.append("zone", form.zone || "");
    formData.append("admissionDate", form.admissionDate || "");
    if (!autoGeneratePassword && form.password) formData.append("password", form.password);

    Object.entries(files).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    try {
      const response = await createDriver(formData);
      onAdd(response.data);
      onClose();
      setForm({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", bi: "", birthDate: "", address: "", emergencyContact: "", password: "", zone: "", admissionDate: "" });
      setFiles({ profilePhoto: null, biCopy: null, driverLicenseCopy: null, vehicleRegistration: null, insuranceDocument: null, trainingCertificateCopy: null });
      toast.success("Motorista criado com sucesso");
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao criar motorista";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CameraModal 
        isOpen={cameraOpen} 
        onClose={() => {
          setCameraOpen(false);
          setCameraField(null);
        }}
        onTakePhoto={handleCameraCapture}
      />
      <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Motorista">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <FileUploadInput 
            label="Foto" 
            fieldName="profilePhoto" 
            file={files.profilePhoto} 
            onFileChange={handleFileChange} 
            onRemove={handleRemoveFile} 
            accept="image/*" 
            isProfile
            isNative={isNative}
            onTakePhoto={handleTakePhoto}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="João Silva" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={autoGeneratePassword} onChange={(e) => setAutoGeneratePassword(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
            Gerar password automaticamente
          </label>
          {!autoGeneratePassword && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="********" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto de Emergência</label>
            <input type="tel" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="+258 84 000 0000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Veículo</label>
            <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Ex: Toyota Corolla" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Matrícula</label>
            <input type="text" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="MC-1234-MZ" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">BI/Passaporte</label>
            <input type="text" value={form.bi} onChange={(e) => setForm({ ...form, bi: e.target.value })} placeholder="1234567" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Nascimento</label>
            <DatePicker selected={form.birthDate ? new Date(form.birthDate) : null} onChange={(date) => setForm({ ...form, birthDate: date ? date.toISOString().split("T")[0] : "" })} dateFormat="yyyy-MM-dd" placeholderText="Selecionar data" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Bairro, Rua, Nº" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Zona</label>
              <input type="text" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Ex: Centro" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Admissão</label>
              <DatePicker selected={form.admissionDate ? new Date(form.admissionDate) : null} onChange={(date) => setForm({ ...form, admissionDate: date ? date.toISOString().split("T")[0] : "" })} dateFormat="yyyy-MM-dd" placeholderText="Selecionar data" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">Documentos</p>
            <div className="space-y-3">
              <FileUploadInput 
                label="Cópia do BI" 
                fieldName="biCopy" 
                file={files.biCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Carta de Condução" 
                fieldName="driverLicenseCopy" 
                file={files.driverLicenseCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Registo do Veículo" 
                fieldName="vehicleRegistration" 
                file={files.vehicleRegistration} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Seguro" 
                fieldName="insuranceDocument" 
                file={files.insuranceDocument} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Certificado de Formação" 
                fieldName="trainingCertificateCopy" 
                file={files.trainingCertificateCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
              {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : <Icon name="plus" size={16} />}
              {isSubmitting ? "Criando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

// EditDriverModal with camera support
const EditDriverModal = ({ isOpen, onClose, onEdit, driver, setSelectedImage, setViewerOpen }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", bi: "", birthDate: "", address: "", emergencyContact: "", password: "", zone: "", admissionDate: "", accountStatus: "active" });
  const [files, setFiles] = useState({ profilePhoto: null, biCopy: null, driverLicenseCopy: null, vehicleRegistration: null, insuranceDocument: null, trainingCertificateCopy: null });
  const [filesToRemove, setFilesToRemove] = useState({ profilePhoto: false, biCopy: false, driverLicenseCopy: false, vehicleRegistration: false, insuranceDocument: false, trainingCertificateCopy: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraField, setCameraField] = useState(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: "", phone: "", email: "", vehicle: "", licensePlate: "", bi: "", birthDate: "", address: "", emergencyContact: "", password: "", zone: "", admissionDate: "", accountStatus: "active" });
      setFiles({ profilePhoto: null, biCopy: null, driverLicenseCopy: null, vehicleRegistration: null, insuranceDocument: null, trainingCertificateCopy: null });
      setFilesToRemove({ profilePhoto: false, biCopy: false, driverLicenseCopy: false, vehicleRegistration: false, insuranceDocument: false, trainingCertificateCopy: false });
    }
  }, [isOpen]);

  useEffect(() => {
    if (driver && isOpen) {
      setForm({
        name: driver.name || "",
        phone: driver.phone || "",
        email: driver.email || "",
        vehicle: driver.vehicle || "",
        licensePlate: driver.licensePlate || "",
        bi: driver.bi || "",
        birthDate: driver.birthDate || "",
        address: driver.address || "",
        emergencyContact: driver.emergencyContact || "",
        zone: driver.zone || "",
        admissionDate: driver.admissionDate || "",
        accountStatus: driver.accountStatus || "active",
        password: "",
      });
    }
  }, [driver, isOpen]);

  const handleFileChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fieldName]: file }));
      setFilesToRemove((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleRemoveFile = (fieldName) => {
    setFilesToRemove((prev) => ({ ...prev, [fieldName]: true }));
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleTakePhoto = (fieldName) => {
    setCameraField(fieldName);
    setCameraOpen(true);
  };

  const handleCameraCapture = (file) => {
    if (cameraField) {
      setFiles((prev) => ({ ...prev, [cameraField]: file }));
      setFilesToRemove((prev) => ({ ...prev, [cameraField]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("phone", form.phone);
    formData.append("email", form.email || "");
    formData.append("vehicle", form.vehicle || "");
    formData.append("licensePlate", form.licensePlate || "");
    formData.append("bi", form.bi || "");
    formData.append("birthDate", form.birthDate || "");
    formData.append("address", form.address || "");
    formData.append("emergencyContact", form.emergencyContact || "");
    formData.append("zone", form.zone || "");
    formData.append("admissionDate", form.admissionDate || "");
    formData.append("accountStatus", form.accountStatus || "active");
    if (form.password) formData.append("password", form.password);

    Object.entries(files).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    Object.entries(filesToRemove).forEach(([key, value]) => {
      if (value) formData.append(key, "REMOVE");
    });

    try {
      const response = await updateDriver(driver.id, formData);
      onEdit(response.data);
      onClose();
      toast.success("Motorista atualizado com sucesso");
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao atualizar motorista";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!driver) return null;

  return (
    <>
      <CameraModal 
        isOpen={cameraOpen} 
        onClose={() => {
          setCameraOpen(false);
          setCameraField(null);
        }}
        onTakePhoto={handleCameraCapture}
      />
      <Modal isOpen={isOpen} onClose={onClose} title="Editar Motorista">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <FileUploadInput 
            label="Foto" 
            fieldName="profilePhoto" 
            file={files.profilePhoto} 
            onFileChange={handleFileChange} 
            onRemove={handleRemoveFile} 
            existingUrl={driver.profilePhotoUrl} 
            isRemoved={filesToRemove.profilePhoto} 
            accept="image/*" 
            isProfile 
            setSelectedImage={setSelectedImage} 
            setViewerOpen={setViewerOpen}
            isNative={isNative}
            onTakePhoto={handleTakePhoto}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nome Completo</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="João Silva" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Telefone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+258 84 000 0000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nova Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Deixe em branco para manter" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Contacto de Emergência</label>
            <input type="tel" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="+258 84 000 0000" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Veículo</label>
            <input type="text" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} placeholder="Ex: Toyota Corolla" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Matrícula</label>
            <input type="text" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} placeholder="MC-1234-MZ" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">BI/Passaporte</label>
            <input type="text" value={form.bi} onChange={(e) => setForm({ ...form, bi: e.target.value })} placeholder="1234567" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Nascimento</label>
            <DatePicker selected={form.birthDate ? new Date(form.birthDate) : null} onChange={(date) => setForm({ ...form, birthDate: date ? date.toISOString().split("T")[0] : "" })} dateFormat="yyyy-MM-dd" placeholderText="Selecionar data" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Bairro, Rua, Nº" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Status da Conta</label>
            <select
              value={form.accountStatus}
              onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Status atual: <span className={`font-semibold ${
                form.accountStatus === 'active' ? 'text-green-600' : 
                form.accountStatus === 'inactive' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {form.accountStatus === 'active' ? 'Ativo' : 
                 form.accountStatus === 'inactive' ? 'Inativo' : 
                 'Suspenso'}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Zona</label>
              <input type="text" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} placeholder="Ex: Centro" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data de Admissão</label>
              <DatePicker selected={form.admissionDate ? new Date(form.admissionDate) : null} onChange={(date) => setForm({ ...form, admissionDate: date ? date.toISOString().split("T")[0] : "" })} dateFormat="yyyy-MM-dd" placeholderText="Selecionar data" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4">
            <p className="text-xs font-semibold text-slate-500 mb-3">Documentos</p>
            <div className="space-y-3">
              <FileUploadInput 
                label="Cópia do BI" 
                fieldName="biCopy" 
                file={files.biCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                existingUrl={driver.biCopyUrl} 
                isRemoved={filesToRemove.biCopy} 
                setSelectedImage={setSelectedImage} 
                setViewerOpen={setViewerOpen}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Carta de Condução" 
                fieldName="driverLicenseCopy" 
                file={files.driverLicenseCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                existingUrl={driver.driverLicenseCopyUrl} 
                isRemoved={filesToRemove.driverLicenseCopy} 
                setSelectedImage={setSelectedImage} 
                setViewerOpen={setViewerOpen}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Registo do Veículo" 
                fieldName="vehicleRegistration" 
                file={files.vehicleRegistration} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                existingUrl={driver.vehicleRegistrationUrl} 
                isRemoved={filesToRemove.vehicleRegistration} 
                setSelectedImage={setSelectedImage} 
                setViewerOpen={setViewerOpen}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Seguro" 
                fieldName="insuranceDocument" 
                file={files.insuranceDocument} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                existingUrl={driver.insuranceDocumentUrl} 
                isRemoved={filesToRemove.insuranceDocument} 
                setSelectedImage={setSelectedImage} 
                setViewerOpen={setViewerOpen}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
              <FileUploadInput 
                label="Certificado de Formação" 
                fieldName="trainingCertificateCopy" 
                file={files.trainingCertificateCopy} 
                onFileChange={handleFileChange} 
                onRemove={handleRemoveFile} 
                existingUrl={driver.trainingCertificateCopyUrl} 
                isRemoved={filesToRemove.trainingCertificateCopy} 
                setSelectedImage={setSelectedImage} 
                setViewerOpen={setViewerOpen}
                isNative={isNative}
                onTakePhoto={handleTakePhoto}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/30 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors">
              {isSubmitting ? <Icon name="refreshCw" size={16} className="animate-spin" /> : <Icon name="save" size={16} />}
              {isSubmitting ? "Atualizando..." : "Atualizar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

// Account status color helper
const accountStatusColor = (status) => {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "inactive") return "bg-yellow-100 text-yellow-700";
  if (status === "suspended") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-500";
};

const accountStatusLabel = (status) => {
  if (status === "active") return "Ativo";
  if (status === "inactive") return "Inativo";
  if (status === "suspended") return "Suspenso";
  return "Desconhecido";
};

// Driver status (for display only)
const statusColor = (status) => {
  if (status === "online") return "bg-green-100 text-green-700";
  if (status === "working") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-500";
};

const statusLabel = (status) => {
  if (status === "online") return "Online";
  if (status === "working") return "Em viagem";
  return "Offline";
};

const AdminDrivers = () => {
  const { socket, connected } = useSocket();
  const api = { getDrivers, createDriver, updateDriver, deleteDriver };
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [locationNames, setLocationNames] = useState({});
  const [isGeocoderLoaded, setIsGeocoderLoaded] = useState(false);
  const geocoderRef = useRef(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [activityDriver, setActivityDriver] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth()

   const fetchDriversData = async () => {
     setLoading(true);
     try {
       const response = await api.getDrivers();
       setDrivers((response.data || []).map(driver => 
         typeof driver.position === 'string' 
           ? (() => { try { return { ...driver, position: JSON.parse(driver.position) }; } catch { return driver; } })()
           : driver
       ));
       if(socket) socket.emit('admin:snapshot')
     } catch (error) {
       const message = error?.response?.data?.message || "Erro ao carregar motoristas";
       toast.error(message);
     } finally {
       setLoading(false);
     }
   };
  useEffect(() => {
    if (window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
      setIsGeocoderLoaded(true);
    } else {
      // Load Google Maps if not available
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        geocoderRef.current = new window.google.maps.Geocoder();
        setIsGeocoderLoaded(true);
      };
      document.head.appendChild(script);
    }
  }, []);

  // Function to get location name from coordinates
  const getLocationName = async (lat, lng, driverId) => {
    if (!geocoderRef.current || !isGeocoderLoaded) return;
    
    try {
      const response = await geocoderRef.current.geocode({
        location: { lat, lng }
      });
      
      if (response.results && response.results.length > 0) {
        // Get a short address (street, neighborhood, or city)
        let shortName = '';
        for (const component of response.results[0].address_components) {
          const types = component.types;
          if (types.includes('route')) {
            shortName = component.long_name;
            break;
          } else if (types.includes('sublocality') || types.includes('neighborhood')) {
            shortName = component.long_name;
            break;
          } else if (types.includes('locality') || types.includes('administrative_area_level_3')) {
            shortName = component.long_name;
          }
        }
        
        const addressName = shortName || response.results[0].formatted_address.split(',')[0];
        
        setLocationNames(prev => ({
          ...prev,
          [driverId]: addressName
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
  };

  // Update location names when drivers have positions
  useEffect(() => {
    drivers.forEach(driver => {
      if (driver?.position?.lat && driver?.position?.lng && !locationNames[driver.id]) {
        getLocationName(driver.position.lat, driver.position.lng, driver.id);
      }
    });
  }, [drivers, isGeocoderLoaded]);

   useEffect(() => {
     let isActive = true;
     const fetchDrivers = async () => {
       if (!isActive) return;
       try {
         const response = await api.getDrivers();
         if (!isActive) return;
         
         setDrivers((response.data || []).map(driver => 
           typeof driver.position === 'string' 
             ? (() => { try { return { ...driver, position: JSON.parse(driver.position) }; } catch { return driver; } })()
             : driver
         ));

         if(socket) socket.emit('admin:snapshot')

       } catch (error) {
         const message = error?.response?.data?.message || "Erro ao carregar motoristas";
         toast.error(message);
       } finally {
         if (isActive) setLoading(false);
       }
     };
     fetchDrivers();
     return () => {
       isActive = false;
     };
   }, [connected]);

  useEffect(() => {
    if (!socket) return;
    

    socket.emit("admin:snapshot");

    const onStatus = (data) => {
      setDrivers((prev) => prev.map((d) => (d.userId === data.driverId || d.id === data.driverId ? { ...d, status: data.status } : d)));
    };
    const onLocation = (data) => {

      console.log({a:1,data})
      setDrivers((prev) => prev.map((d) => {
        if (d.userId === data.driverId || d.id === data.driverId) {
          // Clear location name for this driver to force refetch
          setLocationNames(prevNames => {
            const newNames = { ...prevNames };
            delete newNames[d.id];
            return newNames;
          });
          return { ...d, position: data.coords, lastSeen: new Date().toISOString() };
        }
        return d;
      }));
    };
    const onSnapshot = (items) => {

        console.log({a:2,items})

      const list = Array.isArray(items) ? items : [];
      setDrivers((prev) => {
        const byId = Object.create(null);
        prev.forEach((d) => {
          const key = String(d.userId || d.id || "").trim();
          if (key) byId[key] = d;
        });
        const next = { ...byId };
        list.forEach((entry) => {
          const key = String(entry.userId || entry.id || "").trim();
          if (!key) return;
          const current = next[key] || {};
          next[key] = {
            ...current,
            ...entry,
            userId: current.userId || entry.userId || entry.id,
            id: current.id || entry.id || entry.userId,
            position: entry.position || current.position,
            lastSeen: entry.lastSeen || current.lastSeen,
            status: entry.status || current.status || "offline",
          };
          // Clear location name for updated drivers
          if (entry.position) {
            setLocationNames(prevNames => {
              const newNames = { ...prevNames };
              delete newNames[next[key].id];
              return newNames;
            });
          }
        });
        return Object.values(next);
      });
    };
    socket.on("driver:status:updated", onStatus);
    socket.on("driver:location:updated", onLocation);
    socket.on("admin:snapshot", onSnapshot);
    return () => {
      socket.off("driver:status:updated", onStatus);
      socket.off("driver:location:updated", onLocation);
      socket.off("admin:snapshot", onSnapshot);
    };
  }, [socket]);


  const handleAddDriver = (newDriver) => setDrivers((prev) => [newDriver, ...prev]);
  const handleEditDriver = (updatedDriver) => setDrivers((prev) => prev.map((d) => (d.id === updatedDriver.id ? updatedDriver : d)));

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteDriver(deleteTarget.id);
      setDrivers((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Motorista removido com sucesso");
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao remover motorista";
      toast.error(message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleUpdateAccountStatus = async (driver, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("accountStatus", newStatus);
      const response = await api.updateDriver(driver.id, formData);
      setDrivers((prev) => prev.map((d) => (d.id === driver.id ? { ...d, accountStatus: newStatus } : d)));
      toast.success(`Status da conta atualizado para ${accountStatusLabel(newStatus)}`);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao atualizar status da conta";
      toast.error(message);
    }
  };

  const openActivityModal = async (driver) => {
    setActivityDriver(driver);
    setActivityOpen(true);
    setActivityLoading(true);
    try {
      const logs = [];
      // Fetch user-level actions (login, orders, etc.)
      if (driver.userId) {
        const userRes = await getUserAuditLogs(driver.userId, { limit: 100 });
        logs.push(...(userRes.data.logs || []));
      }
      // Fetch entity-level actions (admin actions on this driver)
      const entityRes = await getEntityAuditLogs("driver", driver.id, { limit: 100 });
      logs.push(...(entityRes.data.logs || []));
      // Deduplicate by ID and sort by date
      const seen = new Set();
      const unique = logs.filter((log) => {
        if (seen.has(log.id)) return false;
        seen.add(log.id);
        return true;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setActivityLogs(unique);
    } catch (error) {
      toast.error("Erro ao carregar atividade do motorista: " + error.message);
      setActivityLogs([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const groupLogsByDay = (logs) => {
    const grouped = {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt).toLocaleDateString("pt-MZ", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(log);
    });
    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  const formatActionLabel = (action) => {
    const labels = {
      create: "Criou",
      update: "Atualizou",
      delete: "Removeu",
      view: "Visualizou",
      assign: "Atribuiu",
      cancel: "Cancelou",
      complete: "Concluiu",
      approve: "Aprovou",
      reject: "Rejeitou",
      payment: "Processou pagamento",
      status_change: "Alterou status",
      export: "Exportou",
      import: "Importou",
      settings_change: "Alterou configurações",
      password_change: "Alterou password",
      verification: "Verificou",
      login: "Iniciou sessão",
      logout: "Terminou sessão",
      other: "Realizou outra ação",
    };
    return labels[action] || action;
  };

  const formatEntityLabel = (entityType) => {
    const labels = {
      driver: "Motorista",
      order: "Encomenda",
      customer: "Cliente",
      user: "Utilizador",
      product: "Produto",
      company: "Empresa",
      payment: "Pagamento",
      auth: "Autenticação",
      settings: "Configurações",
      incident: "Incidente",
      feedback: "Feedback",
      notification: "Notificação",
      financial: "Financeiro",
      report: "Relatório",
    };
    return labels[entityType] || entityType;
  };

  return (
    <div className="space-y-4">
      {viewerOpen && selectedImage && <ImageViewer isOpen={viewerOpen} onClose={() => setViewerOpen(false)} imageUrl={selectedImage} />}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Motoristas</p>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setRefreshing(true);
              await fetchDriversData();
              setRefreshing(false);
            }}
            disabled={loading}
            className="flex items-center justify-center w-8 h-8 bg-white text-orange-500 rounded-xl border border-orange-200 hover:bg-orange-50 disabled:opacity-50"
          >
            <Icon name="refreshCw" size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 bg-orange-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm shadow-orange-300 transition-colors hover:bg-orange-600"
          >
            <Icon name="plus" size={14} />
            Adicionar
          </button>
        </div>
      </div>

      <AddDriverModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDriver} />
      <EditDriverModal
        setSelectedImage={setSelectedImage}
        setViewerOpen={setViewerOpen}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditDriver(null);
        }}
        onEdit={handleEditDriver}
        driver={editDriver}
      />

      {/* Activity Modal */}
      <Modal
        isOpen={activityOpen}
        onClose={() => {
          setActivityOpen(false);
          setActivityDriver(null);
          setActivityLogs([]);
        }}
        title={`Atividade — ${activityDriver?.name || ""}`}
      >
        <div>
          {activityLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-slate-500">A carregar atividade...</p>
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="history" size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-500">Sem atividade registada</p>
              <p className="text-xs text-slate-400 mt-1">Nenhum registo de auditoria encontrado para este motorista.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {groupLogsByDay(activityLogs).map(([date, logs]) => (
                <div key={date}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Icon name="calendar" size={12} className="text-orange-400" />
                    {date}
                  </h4>
                  <div className="space-y-2 pl-2 border-l-2 border-slate-100 ml-2">
                    {logs.map((log) => (
                      <div key={log.id} className="bg-slate-50 rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-700">
                            {formatActionLabel(log.action)}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(log.createdAt).toLocaleTimeString("pt-MZ", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {log.description || formatEntityLabel(log.entityType)} {log.entityId ? `- ${log.entityId}` : ""}
                        </p>
                        {log.userName && (
                          <p className="text-slate-400 text-[10px] mt-1">
                            Por: {log.userName} ({log.userRole})
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-500">A carregar motoristas...</p>
        </div>
      ) : deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Remover Motorista</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover <strong>{deleteTarget.name}</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 transition-colors">
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="truck" size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-500">Nenhum motorista registado</p>
          <p className="text-xs text-slate-400 mt-1">Comece por adicionar um novo motorista.</p>
        </div>
      ) : (
        drivers.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {d.profilePhotoUrl ? (
                  <img src={d.profilePhotoUrl} alt={d.name} className="w-10 h-10 rounded-xl object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <Icon name="user" size={20} className="text-orange-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.phone}</p>
                </div>
              </div>
              <div className="flex items-end gap-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(d.status)}`}>
                  {statusLabel(d.status)}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${accountStatusColor(d.accountStatus)}`}>
                  {accountStatusLabel(d.accountStatus)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Veículo</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{d.vehicle || "—"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Emergência</p>
                <p className="text-xs font-semibold text-slate-700 truncate">{d.emergencyContact || "—"}</p>
              </div>
            </div>

            {d.position && (
              <div className="mb-3 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-400 uppercase tracking-wide mb-0.5">Localização em tempo real</p>
                {locationNames[d.id] ? (
                  <div className="flex items-start gap-1.5 mb-1">
                    <Icon name="mapPin" size={12} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-blue-700 break-words">
                      {locationNames[d.id]}
                    </p>
                  </div>
                ) : null}
                <div className="flex items-start gap-1.5">
                  <Icon name="navigation" size={12} className="text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs font-mono text-blue-600">
                    {d.position.lat?.toFixed(5)}, {d.position.lng?.toFixed(5)}
                  </p>
                </div>
                {d.lastSeen && (
                  <p className="text-[10px] text-blue-400 mt-1.5 flex items-center gap-1">
                    <Icon name="clock" size={10} />
                    Atualizado: {new Date(d.lastSeen).toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-100">
             { <button 
                onClick={() => openActivityModal(d)}
                className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors"
              >
                <Icon name="history" size={14} className="inline mr-1" />
                Histórico
              </button>}
              <button
                onClick={() => {
                  setEditDriver(d);
                  setShowEditModal(true);
                }}
                className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                Editar
              </button>
              <div className="flex-1 relative">
                <select
                  value={d.accountStatus || "active"}
                  onChange={(e) => handleUpdateAccountStatus(d, e.target.value)}
                  className={`w-full text-center text-xs font-semibold py-2 rounded-lg px-2 transition-colors cursor-pointer appearance-none ${
                    d.accountStatus === 'active' ? 'bg-green-50 text-green-600 hover:bg-green-100' :
                    d.accountStatus === 'inactive' ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' :
                    'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  <option value="active">Ativar</option>
                  <option value="inactive">Inativar</option>
                  <option value="suspended">Suspender</option>
                </select>
                <Icon name="chevronDown" size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <button
                onClick={() => setDeleteTarget(d)}
                className="flex-1 text-xs bg-slate-100 text-slate-600 font-semibold py-2 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
              >
                Remover
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDrivers;