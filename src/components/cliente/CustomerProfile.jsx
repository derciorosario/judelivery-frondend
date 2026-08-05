import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import Modal from "../common/Modal";
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import {
  changeCustomerPassword,
  createCustomerAddress,
  createCustomerPaymentMethod,
  deleteCustomerAddress,
  deleteCustomerPaymentMethod,
  updateCustomerAddress,
  updateCustomerProfile,
  updateProfilePreferences
} from "../../api/client";
import { toast } from "../../lib/toast";
import { Geolocation } from "@capacitor/geolocation";
import { isNative } from "../../api/client";
import { useAuth } from "../../contexts/AuthContext";

const GOOGLE_MAPS_KEY = "AIzaSyAt3JMQnStFWcbODF6HBHGck0IUseek_Ak";
const MAPUTO_CENTER = { lat: -25.9653, lng: 32.5778 };
const GOOGLE_MAPS_LIBRARIES = ["places"];

const CustomerProfile = ({
  user,
  customerData,
  profileData,
  orders = [],
  signOut,
  onProfileUpdated
}) => {
 const customer = profileData?.customer || customerData || {};
 const [editMode, setEditMode] = useState(false);
 const [formData, setFormData] = useState({
   name: customer.name || user?.name || "",
   phone: customer.phone || user?.phone || "",
   defaultAddress: customer.address || ""
 });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addresses, setAddresses] = useState(profileData?.addresses || customer.addressesData || []);
  const { setAddresses:authSetAddresses, addresses:authAddresses} = useAuth()
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState(
    profileData?.paymentMethods || customer.paymentMethods || []
  );
  const [preference, setPreference] = useState(profileData?.preference || customer.preference || {
    themeMode: "light",
    notificationsEnabled: true
  });
const [newAddress, setNewAddress] = useState("");
   const [newAddressCoords, setNewAddressCoords] = useState(null);
   const [loadingLocation, setLoadingLocation] = useState(false);
   const [loadingMapLocation, setLoadingMapLocation] = useState(false);
   const [mapOpen, setMapOpen] = useState(false);
   const [mapCenter, setMapCenter] = useState(MAPUTO_CENTER);
   const [mapMarker, setMapMarker] = useState(null);
   const [locationError, setLocationError] = useState(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "cash",
    displayName: "",
    maskedNumber: "",
    phoneNumber: "",
    isDefault: false
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [saving, setSaving] = useState(false);
  const { isLoaded: mapsLoaded, loadError: mapsLoadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  useEffect(() => {
    setFormData({
     name: customer.name || user?.name || "",
     phone: customer.phone || user?.phone || "",
     defaultAddress: customer.address || ""
   });
    setAddresses(profileData?.addresses || customer.addressesData || []);
    setPaymentMethods(profileData?.paymentMethods || customer.paymentMethods || []);
    setPreference(profileData?.preference || customer.preference || {
      themeMode: "light",
      notificationsEnabled: true
    });
  }, [customer, customer.addressesData, customer.paymentMethods, customer.preference, profileData, user]);

  const totalSpent = profileData?.stats?.totalSpent || orders.reduce((sum, o) => sum + Number(o.total || o.totalValue || 0), 0);
  const deliveryCount = profileData?.stats?.deliveryCount || orders.length;
  const completedCount = profileData?.stats?.completedCount || orders.filter(o => o.status === "completed" || o.statusCode === "completed").length;

  const getCurrentPosition = async () => {
    if (isNative) {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === "denied") {
        throw new Error("PERMISSION_DENIED");
      }
      if (permission.location !== "granted") {
        const request = await Geolocation.requestPermissions();
        if (request.location === "denied") {
          throw new Error("PERMISSION_DENIED");
        }
      }
      return await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    }

    if (!navigator.geolocation) {
      throw new Error("GEOLOCATION_NOT_SUPPORTED");
    }

    return await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
    });
  };

  const refreshProfile = async () => {
    if (onProfileUpdated) await onProfileUpdated();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await updateCustomerProfile({
       name: formData.name,
       phone: formData.phone,
       defaultAddress: formData.defaultAddress
     });
      setFormData({
       name: response.data.customer?.name || formData.name,
       phone: response.data.customer?.phone || formData.phone,
       defaultAddress: response.data.customer?.address || formData.defaultAddress
     });
      setEditMode(false);
      toast.success("Perfil atualizado com sucesso");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    setSaving(true);
    try {
      const response = await createCustomerAddress({
        fullAddress: newAddress.trim(),
        lat: newAddressCoords?.lat || null,
        lng: newAddressCoords?.lng || null,
        isDefault: addresses.length === 0
      });
      setAddresses(prev => [...prev, response.data]);
      authSetAddresses(prev => [...prev, response.data])

      setNewAddress("");
      setNewAddressCoords(null);
      setShowAddressModal(false);
      toast.success("Endereço adicionado com sucesso");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao adicionar endereço");
    } finally {
      setSaving(false);
    }
  };


  console.log({authAddresses,addresses})

  const handleRemoveAddress = (address) => {
    setDeleteTarget({ type: "address", data: address });
  };

  const handleSetDefaultAddress = async (address) => {
    setSaving(true);
    try {
      const response = await updateCustomerAddress(address.id, { isDefault: true });
      setAddresses(prev => prev.map(item => ({ ...item, isDefault: item.id === address.id })));
      setFormData(prev => ({ ...prev, defaultAddress: response.data.fullAddress }));
      toast.success("Endereço padrão atualizado");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar endereço");
    } finally {
      setSaving(false);
    }
  };

  const openAddressMap = async () => {
    setLoadingMapLocation(true);
    let center = MAPUTO_CENTER;

    try {
      const position = await getCurrentPosition();
      center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      if (error.message === "PERMISSION_DENIED") {
        toast.warning("A permissão de localização foi negada. Usando localização padrão.");
      } else if (error.message === "GEOLOCATION_NOT_SUPPORTED") {
        toast.warning("Geolocalização não é suportada. Usando localização padrão.");
      } else {
        toast.warning("Não foi possível obter sua localização. Usando localização padrão.");
      }
    }

    setMapCenter(center);
    setMapMarker(newAddressCoords);
    setMapOpen(true);
    setLoadingMapLocation(false);
  };

  const handleAddressMapLoad = (map) => {
    mapRef.current = map;
  };

  const handleAddressAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handleAddressPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || place.name || newAddress;

    setNewAddress(address);
    setNewAddressCoords({ lat, lng });
    setMapMarker({ lat, lng });
    setMapCenter({ lat, lng });

    if (window.google && mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  const handleAddressMapClick = (event) => {
    if (!window.google) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const coords = { lat, lng };

    setNewAddressCoords(coords);
    setMapMarker(coords);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setNewAddress(results[0].formatted_address);
      } else {
        setNewAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    });
  };

  const confirmAddressMapSelection = () => {
    if (!mapMarker) return;

    const coords = { lat: mapMarker.lat, lng: mapMarker.lng };
    setNewAddressCoords(coords);

    if (!window.google) {
      setMapOpen(false);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: coords }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setNewAddress(results[0].formatted_address);
      }
      setMapOpen(false);
    });
  };

  const useCurrentAddressLocation = () => {
    
    setLoadingLocation(true);

    getCurrentPosition()
      .then((position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setNewAddressCoords(coords);
        setMapMarker(coords);
        setMapCenter(coords);

        if (!window.google) {
          setNewAddress(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
          setLoadingLocation(false);
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            setNewAddress(results[0].formatted_address);
          } else {
            setNewAddress(`${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
          }
          setLoadingLocation(false);
        });
      })
      .catch((error) => {
        console.error("Geolocation error:", error);
        if (error.message === "PERMISSION_DENIED") {
          setLocationError("A permissão de localização foi negada. Por favor, habilite-a nas configurações do dispositivo para usar a sua localização actual.");
        } else if (error.message === "GEOLOCATION_NOT_SUPPORTED") {
          setLocationError("Geolocalização não é suportada pelo seu dispositivo.");
        } else {
          setLocationError("Não foi possível obter a sua localização actual. Por favor, verifique as permissões de localização e tente novamente.");
        }
        setLoadingLocation(false);
      });
  };

  const closeAddressMap = () => {
    setMapOpen(false);
    setMapMarker(null);
    setLoadingMapLocation(false);
  };

  const closeLocationErrorDialog = () => {
    setLocationError(null);
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.type) return;
    setSaving(true);
    try {
      const response = await createCustomerPaymentMethod({
        ...newPaymentMethod,
        isDefault: paymentMethods.length === 0 || newPaymentMethod.isDefault
      });
      setPaymentMethods(prev => [...prev, response.data]);
      setNewPaymentMethod({ type: "cash", displayName: "", maskedNumber: "", phoneNumber: "", isDefault: false });
      setShowPaymentModal(false);
      toast.success("Método de pagamento adicionado");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao adicionar método de pagamento");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePaymentMethod = (method) => {
    setDeleteTarget({ type: "payment", data: method });
  };

  const handleToggleNotifications = async () => {
    setSaving(true);
    try {
      const response = await updateProfilePreferences({
        ...preference,
        notificationsEnabled: !preference.notificationsEnabled
      });
      setPreference(response.data);
      toast.success("Preferências atualizadas");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar preferências");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDarkMode = async () => {
    setSaving(true);
    try {
      const themeMode = preference.themeMode === "dark" ? "light" : "dark";
      const response = await updateProfilePreferences({
        ...preference,
        themeMode
      });
      setPreference(response.data);
      toast.success("Modo escuro atualizado");
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar tema");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("As novas senhas não coincidem");
      return;
    }
    setSaving(true);
    try {
      await changeCustomerPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowChangePassword(false);
      toast.success("Senha alterada com sucesso");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (deleteTarget.type === "address") {
        await deleteCustomerAddress(deleteTarget.data.id);
        setAddresses(prev => prev.filter(item => item.id !== deleteTarget.data.id));
        toast.success("Endereço removido com sucesso");
      } else if (deleteTarget.type === "payment") {
        await deleteCustomerPaymentMethod(deleteTarget.data.id);
        setPaymentMethods(prev => prev.filter(item => item.id !== deleteTarget.data.id));
        toast.success("Método de pagamento removido");
      }
      await refreshProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Erro ao remover item");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  const formatPaymentType = (type) => ({
    cash: "Dinheiro na entrega",
    mpesa: "M-Pesa",
    emola: "e-Mola",
    bank_transfer: "Transferência Bancária"
  }[type] || type);

  return (
    <div className="space-y-4">
      {deleteTarget && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="alertTriangle" size={24} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {deleteTarget.type === "address" ? "Remover Endereço" : "Remover Método de Pagamento"}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Tem certeza que deseja remover <strong>{deleteTarget.data.fullAddress || deleteTarget.data.displayName || "este item"}</strong>? Esta ação não pode ser revertida.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-300 hover:bg-red-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {saving ? "A remover..." : "Remover"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3 shadow-lg">
          {(formData.name || customerData?.name || "Cliente").split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        {!editMode ? (
          <>
           <p className="text-lg font-bold text-slate-800">{formData.name}</p>
           <p className="text-sm text-slate-400">{formData.phone}</p>
           <p className="text-sm text-slate-400">{customer.email || user?.email || ""}</p>
           
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
           <div className="bg-slate-50 rounded-xl px-3 py-2 mt-3">
             <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Email</label>
             <p className="text-sm text-slate-700 break-words">{customer.email || user?.email || "—"}</p>
             <p className="text-[10px] text-slate-400 mt-1">O email não pode ser alterado pelo perfil.</p>
           </div>
           <div className="flex gap-2 mt-4">
              <button disabled={saving} onClick={handleSaveProfile} className="flex-1 bg-green-500 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50">
                {saving ? "A salvar..." : "Salvar"}
              </button>
              <button disabled={saving} onClick={() => setEditMode(false)} className="flex-1 bg-slate-100 text-slate-600 text-sm font-semibold py-2 rounded-xl disabled:opacity-50">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{deliveryCount}</p>
          <p className="text-[10px] text-slate-400">Entregas</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{Number(totalSpent || 0).toFixed(2)} MZN</p>
          <p className="text-[10px] text-slate-400">Total Gasto</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-100">
          <p className="text-xl font-bold text-slate-800">{completedCount}</p>
          <p className="text-[10px] text-slate-400">Concluídas</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Meus Endereços</p>
          <button disabled={saving} onClick={() => setShowAddressModal(true)} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg disabled:opacity-50">
            + Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon name="mapPin" size={16} className="text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-700">{addr.fullAddress}</p>
                  {addr.isDefault && (
                    <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">Padrão</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {!addr.isDefault && (
                  <button disabled={saving} onClick={() => handleSetDefaultAddress(addr)} className="p-1 text-xs text-blue-500 disabled:opacity-50">
                    Definir padrão
                  </button>
                )}
                <button disabled={saving} onClick={() => handleRemoveAddress(addr)} className="p-1 text-red-500 disabled:opacity-50">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 hidden"> {/***Leave this section hidden */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-slate-700">Métodos de Pagamento</p>
          <button disabled={saving} onClick={() => setShowPaymentModal(true)} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg disabled:opacity-50">
            + Adicionar
          </button>
        </div>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name={method.type === "cash" ? "dollar" : "smartphone"} size={16} className={method.type === "cash" ? "text-green-500" : "text-blue-500"} />
                <div>
                  <span className="text-sm text-slate-700">{formatPaymentType(method.type)}</span>
                  {method.maskedNumber && <p className="text-xs text-slate-400">{method.maskedNumber}</p>}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                {method.isDefault && <span className="text-xs text-green-500">Padrão</span>}
                <button disabled={saving} onClick={() => handleRemovePaymentMethod(method)} className="p-1 text-red-500 disabled:opacity-50">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <button disabled={saving} onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 disabled:opacity-50">
          <Icon name="lock" size={18} className="text-slate-400" />
          <span className="text-sm text-slate-700 flex-1 text-left">Alterar Senha</span>
          <Icon name="chevronRight" size={16} className="text-slate-400" />
        </button>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Icon name="bell" size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">Notificações</span>
          </div>
          <button disabled={saving} onClick={handleToggleNotifications} className={`w-10 h-5 rounded-full relative ${preference.notificationsEnabled ? "bg-orange-500" : "bg-slate-200"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${preference.notificationsEnabled ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between px-4 py-3 hidden"> {/** leave this section hidden */}
          <div className="flex items-center gap-3">
            <Icon name="moon" size={18} className="text-slate-400" />
            <span className="text-sm text-slate-700">Modo Escuro</span>
          </div>
          <button disabled={saving} onClick={handleToggleDarkMode} className={`w-10 h-5 rounded-full relative ${preference.themeMode === "dark" ? "bg-orange-500" : "bg-slate-200"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full ${preference.themeMode === "dark" ? "right-0.5" : "left-0.5"}`} />
          </button>
        </div>
      </div>

      <button onClick={() => navigate('/forgot-password')} className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl mt-2">
        Recuperar Senha
      </button>

      {showAddressModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Endereço</h2>
              <button disabled={saving} onClick={() => setShowAddressModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-50">
                <Icon name="x" className={"text-black"} size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {mapsLoaded && (
                <Autocomplete
                  onLoad={handleAddressAutocompleteLoad}
                  onPlaceChanged={handleAddressPlaceChanged}
                  restrictions={{ country: "mz" }}
                  options={{
                    componentRestrictions: { country: "mz" },
                    types: ["geocode", "establishment"]
                  }}
                >
                  <input
                    type="text"
                    value={newAddress}
                    onChange={e => setNewAddress(e.target.value)}
                    placeholder="Pesquisar endereço..."
                    disabled
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400"
                  />
                </Autocomplete>
              )}
              {!mapsLoaded && (
                <input
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="Digite o endereço completo"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              )}
              {mapsLoadError && (
                <p className="text-xs text-red-500">Não foi possível carregar o Google Maps.</p>
              )}
              <button
                type="button"
                disabled={saving || !mapsLoaded || loadingMapLocation}
                onClick={openAddressMap}
                className="w-full py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingMapLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-700"></div>
                    <span>A obter localização...</span>
                  </>
                ) : (
                  <>
                    <Icon name="map" size={14} />
                    <span>Selecionar no mapa</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={saving || loadingLocation}
                onClick={useCurrentAddressLocation}
                className="w-full py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
              >
                {loadingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                    <span>A obter localização...</span>
                  </>
                ) : (
                  <>
                    <Icon name="navigation" size={14} />
                    <span>Usar localização atual</span>
                  </>
                )}
              </button>
             
              <div className="flex gap-2">
                <button disabled={saving} onClick={() => setShowAddressModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50">
                  Cancelar
                </button>
                <button disabled={saving || !newAddress.trim() || !newAddressCoords} onClick={handleAddAddress} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50">
                  {saving ? "A salvar..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mapOpen && (
        
        <div className="fixed inset-0 !mb-0 z-[60] flex items-center justify-center p-4 bg-black/50">
  <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
      <h3 className="text-sm font-bold text-slate-800">Selecionar Endereço no Mapa</h3>
      <button
        type="button"
        disabled={saving}
        onClick={closeAddressMap}
        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 disabled:opacity-50 hover:bg-slate-200 transition-colors flex-shrink-0"
      >
        <Icon name="x" className={"text-black"} size={16} />
      </button>
    </div>

    <div className="h-80 bg-slate-100 relative">
      {!mapsLoaded || loadingMapLocation ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">
              {loadingMapLocation ? "A obter localização..." : "A carregar mapa..."}
            </p>
          </div>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={14}
          onClick={handleAddressMapClick}
          onLoad={handleAddressMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false
          }}
        >
          {mapMarker && <Marker position={mapMarker} />}
        </GoogleMap>
      )}
    </div>

    {newAddress && mapMarker && (
      <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
        <p className="text-xs text-blue-700 font-medium truncate">📍 {newAddress}</p>
      </div>
    )}

    <div className="px-4 py-3 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={useCurrentAddressLocation}
          disabled={saving || loadingLocation}
          className="w-full sm:flex-1 py-2.5 sm:py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          {loadingLocation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 flex-shrink-0"></div>
              <span>A obter...</span>
            </>
          ) : (
            <>
              
              <span>Localização atual</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={closeAddressMap}
          className="w-full sm:flex-1 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm min-h-[44px]"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmAddressMapSelection}
          disabled={saving || !mapMarker}
          className="w-full sm:flex-1 py-2.5 sm:py-2 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
        >
          Confirmar
        </button>
      </div>
    </div>
  </div>
</div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-800">Adicionar Pagamento</h2>
              <button disabled={saving} onClick={() => setShowPaymentModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-50">
                <Icon name="x" className={"text-black"} size={16} />
              </button>
            </div>
            <select
              value={newPaymentMethod.type}
              onChange={e => setNewPaymentMethod({ ...newPaymentMethod, type: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            >
              <option value="cash">Dinheiro na entrega</option>
              <option value="mpesa">M-Pesa</option>
              <option value="emola">e-Mola</option>
              <option value="bank_transfer">Transferência Bancária</option>
            </select>
            <input
              type="text"
              value={newPaymentMethod.displayName}
              onChange={e => setNewPaymentMethod({ ...newPaymentMethod, displayName: e.target.value })}
              placeholder="Nome do método"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <input
              type="text"
              value={newPaymentMethod.maskedNumber}
              onChange={e => setNewPaymentMethod({ ...newPaymentMethod, maskedNumber: e.target.value })}
              placeholder="Ex: •••• 1234"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={newPaymentMethod.isDefault}
                onChange={e => setNewPaymentMethod({ ...newPaymentMethod, isDefault: e.target.checked })}
              />
              Definir como padrão
            </label>
            <div className="flex gap-2">
              <button disabled={saving} onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50">
                Cancelar
              </button>
              <button disabled={saving} onClick={handleAddPaymentMethod} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50">
                {saving ? "A salvar..." : "Adicionar"}
              </button>
            </div>
          </div>
        </div>
      )}

{showChangePassword && (
         <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
           <div className="bg-white rounded-2xl w-full max-w-md p-4">
             <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-slate-800">Alterar Senha</h2>
               <button disabled={saving} onClick={() => setShowChangePassword(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center disabled:opacity-50">
                 <Icon name="x" className={"text-black"} size={16} />
               </button>
             </div>
             <div className="space-y-3">
               <input
                 type="password"
                 placeholder="Senha atual"
                 value={passwordForm.currentPassword}
                 onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                 className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
               />
               <input
                 type="password"
                 placeholder="Nova senha"
                 value={passwordForm.newPassword}
                 onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                 className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
               />
               <input
                 type="password"
                 placeholder="Confirmar nova senha"
                 value={passwordForm.confirmPassword}
                 onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                 className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
               />
             </div>
             <div className="flex gap-2 mt-4">
               <button disabled={saving} onClick={() => setShowChangePassword(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50">
                 Cancelar
               </button>
               <button disabled={saving} onClick={handlePasswordChange} className="flex-1 py-2 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-50">
                 {saving ? "A salvar..." : "Salvar"}
               </button>
             </div>
           </div>
         </div>
       )}

       {locationError && (
         <Modal isOpen={!!locationError} onClose={closeLocationErrorDialog} title="Erro de Localização">
           <div className="space-y-4">
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                 <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                 </svg>
               </div>
               <p className="text-sm text-slate-600">{locationError}</p>
             </div>
             <button
               type="button"
               onClick={closeLocationErrorDialog}
               className="w-full py-2.5 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/30 hover:bg-red-600 transition-colors"
             >
               OK
             </button>
           </div>
         </Modal>
       )}
     </div>
  );
};

export default CustomerProfile;