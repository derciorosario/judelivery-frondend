import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../common/BottomNav";
import Header from "../common/Header";
import OrdersList from "../common/OrdersList";
import CustomerHome from "./CustomerHome";
import CustomerProfile from "./CustomerProfile";
import CustomerHistory from "./CustomerHistory";
import CreateOrderModal from "./modals/CreateOrderModal";
import FeedbackModal from "./modals/FeedbackModal";
import ServiceSelectionModal from "./modals/ServiceSelectionModal";
import ContactSupportModal from "../common/modals/ContactSupportModal";
import TrackOrderModal from "./modals/TrackOrderModal";
import Notifications from "../common/Notifications";
import {
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getCustomerProfile,
  getCustomerOrders,
  getCustomerDashboard,
  getUrgentCount
} from "../../api/client";
import { toast } from "../../lib/toast";
import { usePlatformSettings } from "../../contexts/SettingsContext";
import Icon from "../common/Icon";
import OrderDetailModal from "../modals/OrderDetailModal";
import { registerPush } from "../../services/push";
import { useData } from "../../contexts/DataContext";

const CustomerApp = () => {
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showServiceSelection, setShowServiceSelection] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetailTab, setOrderDetailTab] = useState("details");
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);
  const [shouldRefreshOrders, setShouldRefreshOrders] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState("");
  const [showSupport, setShowSupport] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [ratedOrderIds, setRatedOrderIds] = useState(new Set());
  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [urgentOrdersCount, setUrgentOrdersCount] = useState(0);
  const { user, signOut } = useAuth();
  const { settings, loading: settingsLoading } = usePlatformSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const data=useData()


   useEffect(() => {
         if(user && !data.pushRegistered){
           registerPush(user?.id,navigate,data)
         }
    }, [user]);

  const tabs = [
    { id: "home", label: "Início", icon: "home", path: "/" },
    { id: "orders", label: "Pedidos", icon: "package", path: "/orders" },
    { id: "tracking", label: "Rastrear", icon: "map", path: "/tracking" },
    { id: "history", label: "Histórico", icon: "history", path: "/history" },
    { id: "profile", label: "Perfil", icon: "user", path: "/profile" },
    { id: "notifications", label: "Notificações", icon: "bell", path: "/my-notifications" }
  ];

  const getTabFromPath = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    const tab = tabs.find(t => t.path === path);
    return tab ? tab.id : "home";
  };

  const activeTab = getTabFromPath();

  const setTab = (tabId) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab && tabId !== "home") {
      navigate(tab.path);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (user?.role !== 'customer') return;
    const fetchUrgentCount = async () => {
      try {
        const res = await getUrgentCount();
        setUrgentOrdersCount(res.data?.count || 0);
      } catch (err) {
        console.error("Failed to fetch urgent orders count", err);
      }
    };
    fetchUrgentCount();
    const interval = setInterval(fetchUrgentCount, 7000);
    return () => clearInterval(interval);
  }, [user]);

  const loadCustomerData = async () => {
    if (!user?.id) return;
    setProfileLoading(true);
    try {
      const [profileResponse, ordersResponse, dashboardResponse] = await Promise.all([
        getCustomerProfile(),
        getCustomerOrders({ limit: 50 }),
        getCustomerDashboard()
      ]);
      setCustomerProfile(profileResponse.data);
      setCustomerOrders(ordersResponse.data?.orders || ordersResponse.data || []);
      setDashboardData(dashboardResponse.data);
    } catch (error) {
      console.error("Failed to load customer profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [user, refreshData, shouldRefreshOrders, data.updateData]);

  useEffect(() => {
    if (activeTab === "home") {
      loadCustomerData();
    }
  }, [activeTab]);

  useEffect(() => {
    const handleOpenOrder = (e) => {
      const orderId = e.detail?.orderId;
      const tab = e.detail?.tab;
      if (orderId) {
        setSelectedOrderId(orderId);
        if (tab) {
          setOrderDetailTab(tab);
        } else {
          setOrderDetailTab("details");
        }
        setShowOrderDetails(true);
        setShouldRefreshOrders(prev => !prev);
      }
    };
    window.addEventListener("notification:openOrder", handleOpenOrder);
    return () => window.removeEventListener("notification:openOrder", handleOpenOrder);
  }, []);

  const openedOrderIdRef = useRef(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id') || null
    if (!orderId || openedOrderIdRef.current === orderId) return;
    openedOrderIdRef.current = orderId;
    setSelectedOrderId(orderId);
    setOrderDetailTab("details");
    setShowOrderDetails(true);
    setShouldRefreshOrders(prev => !prev);
  }, [location.search]);

  const dashboardActiveOrder = dashboardData?.activeOrder || null;
  const dashboardPendingOrders = dashboardData?.pendingOrders || [];
  const dashboardCompletedOrders = dashboardData?.completedOrders || [];

  const activeOrder = dashboardActiveOrder;
  const pendingOrders = dashboardPendingOrders;
  const completedOrders = dashboardCompletedOrders;

  const customerData = {
    id: customerProfile?.customer?.id || user?.id,
    userId: user?.id,
    name: customerProfile?.customer?.name || user?.name || "Cliente",
    phone: customerProfile?.customer?.phone || user?.phone || "",
    email: customerProfile?.customer?.email || user?.email || "",
    orders: customerProfile?.stats?.deliveryCount || customerOrders.length,
    rating: customerProfile?.customer?.rating || 4.8,
    frequent: true,
    addresses: customerProfile?.addresses?.map(a => a.fullAddress) || [],
    defaultAddress: customerProfile?.addresses?.find(a => a.isDefault)?.fullAddress || customerProfile?.customer?.address || "",
    addressesData: customerProfile?.addresses || [],
    paymentMethods: customerProfile?.paymentMethods || [],
    preference: customerProfile?.preference || null
  };

  const totalSpent = customerProfile?.stats?.weeklySpent || dashboardData?.stats?.weeklySpent || 0;
  const deliveryCount = customerProfile?.stats?.deliveryCount || dashboardData?.stats?.deliveryCount || customerOrders.length;
  const completedCount = customerProfile?.stats?.completedCount || dashboardData?.stats?.completedCount || completedOrders.length;
  const _averageRating = customerData.rating || 4.5;

  const getAvailableServiceType = () => {
    if (settingsLoading) return null;
    if (settings.order.allowDelivery) return "delivery";
    if (settings.order.allowTaxi) return "taxi";
    return null;
  };
 
  const _handleCreateOrder = (serviceType = null) => {
    if (settingsLoading) {
      toast.info("A carregar configurações...");
      return;
    }

    const resolvedServiceType = serviceType || getAvailableServiceType();
    if (!resolvedServiceType) {
      toast.error("Nenhum serviço está disponível no momento.");
      return;
    }

    setSelectedServiceType(resolvedServiceType);
    setShowCreateOrder(true);
  };
 
  const handleOpenCreateOrder = () => {
    if (settingsLoading) {
      toast.info("A carregar configurações...");
      return;
    }

    if (!settings.order.allowDelivery && !settings.order.allowTaxi) {
      toast.error("Nenhum serviço está disponível no momento.");
      return;
    }

    setShowServiceSelection(true);
  };

  const handleServiceSelect = (serviceType) => {

    if (serviceType === "delivery" && !settings.order.allowDelivery) {
      toast.error("Pedidos de entrega estão temporariamente indisponíveis.");
      return;
    }

    if (serviceType === "taxi" && !settings.order.allowTaxi) {
      toast.error("Corridas estão temporariamente indisponíveis.");
      return;
    }

    setSelectedServiceType(serviceType);
    setShowServiceSelection(false);
    setShowCreateOrder(true);

  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleGiveFeedback = (order, feedback = null) => {
    setFeedbackOrder(order);
    setExistingFeedback(feedback);
    setShowFeedback(true);
    setShowOrderDetails(false)
  };

  const handleSubmitFeedback = async (rating, comment, feedbackId = null) => {
    if (!feedbackOrder) return;
    try {
      if (feedbackId) {
        await updateFeedback(feedbackId, {
          rating,
          comment,
          category: "service"
        });
      } else {
        await createFeedback({
          orderId: feedbackOrder.id,
          rating,
          comment,
          category: "service",
          driverId: feedbackOrder.driverId || (typeof feedbackOrder.driver === "object" ? feedbackOrder.driver?.id : null)
        });
      }
      setRatedOrderIds(prev => new Set(prev).add(feedbackOrder.id));
      setFeedbackSuccessMessage(feedbackId ? "A sua avaliação foi atualizada com sucesso!" : `A sua avaliação para o pedido #${feedbackOrder.id ? feedbackOrder.id.slice(-6).toUpperCase() : ""} foi registada com sucesso!`);
      setShowFeedbackSuccess(true);
      setShowFeedback(false);
      setFeedbackOrder(null);
      setExistingFeedback(null);
      setRefreshData(true);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao enviar avaliação";
      toast.error(message);
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (!feedbackId) return;
    try {
      await deleteFeedback(feedbackId);
      toast.success("Avaliação removida com sucesso!");
      setRefreshData(true);
    } catch (error) {
      const message = error?.response?.data?.message || "Erro ao remover avaliação";
      toast.error(message);
    }
  };

  const handleTrackOrder = (order) => {
    if (order) {
      setSelectedTrackOrder(order);
      setShowTrackOrder(true);
      return;
    }
    if (activeOrder) {
      setSelectedTrackOrder(activeOrder);
      setShowTrackOrder(true);
    }
  };

  const handleOrderUpdate = (updatedOrder) => {
    setShouldRefreshOrders(prev => !prev);
    if (updatedOrder.action === "feedback" && updatedOrder.id) {
      handleGiveFeedback(updatedOrder);
    }
    setRefreshData(true)
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto">
      <Header
        user={user}
        onLogout={signOut}
        title="DeliveryMZ"
        onNotificationClick={() => setTab("notifications")}
        urgentOrdersCount={urgentOrdersCount}
      />
      <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">
        {activeTab === "home" && (
            <CustomerHome
              user={user}
              customerData={customerData}
              activeOrder={activeOrder}
              pendingOrders={pendingOrders}
              completedOrders={completedOrders}
              totalSpent={totalSpent}
              deliveryCount={deliveryCount}
              completedCount={completedCount}
              onViewOrderDetails={handleViewOrderDetails}
              onTrackOrder={handleTrackOrder}
              onGiveFeedback={handleGiveFeedback}
              onContactSupport={() => setShowSupport(true)}
              onNavigateToHistory={() => setTab("history")}
              settings={settings}
              settingsLoading={settingsLoading}
              ratedOrderIds={ratedOrderIds}
              onRefreshData={() => setRefreshData(true)}
            />
         )}
        {activeTab === "orders" && (
          <OrdersList
            refreshKey={shouldRefreshOrders || refreshData}
            onNewOrderClick={handleOpenCreateOrder}
            showNewOrderButton={true}
            title="Meus Pedidos"
            onOrderUpdate={handleOrderUpdate}
            onGiveFeedback={handleGiveFeedback}
          />
        )}
        {activeTab === "tracking" && (
           <OrdersList
             refreshKey={shouldRefreshOrders || refreshData}
             onNewOrderClick={handleOpenCreateOrder}
             showNewOrderButton={true}
             title="Rastrear Pedido"
             statusFilter="in_transit"
             onOrderUpdate={handleOrderUpdate}
            onGiveFeedback={handleGiveFeedback}
           />
         )}
          {activeTab === "history" && (
            <CustomerHistory onGiveFeedback={handleGiveFeedback} />
          )}
         {activeTab === "profile" && (
          profileLoading ? (
            <div className="text-center py-10 text-sm text-slate-500">A carregar perfil...</div>
          ) : (
            <CustomerProfile
              user={user}
              customerData={customerData}
              profileData={customerProfile}
              orders={customerOrders}
              signOut={signOut}
              onProfileUpdated={loadCustomerData}
            />
          )
        )}
        {activeTab === "notifications" && (
          <Notifications />
        )}
      </div>
      <BottomNav tabs={tabs} active={activeTab} setActive={setTab} />

      <CreateOrderModal
        isOpen={showCreateOrder}
        onClose={(refresh) => {
          setShowCreateOrder(false);
          setSelectedOrder(null);
          setSelectedServiceType(null);
          setShowServiceSelection(false);

          if (refresh === true) {
            setRefreshData(true);
          }
        }}
        user={user}
        customerData={customerData}
        repeatOrder={selectedOrder}
        serviceType={selectedServiceType}
        onRefreshOrders={handleOpenCreateOrder}
        settings={settings}
        settingsLoading={settingsLoading}
      />

     <ServiceSelectionModal
       isOpen={showServiceSelection}
       onClose={() => setShowServiceSelection(false)}
       onSelectService={handleServiceSelect}
       settings={settings}
       settingsLoading={settingsLoading}
     />

      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          setFeedbackOrder(null);
          setExistingFeedback(null);
          setRefreshData(true)
        }}
        order={feedbackOrder}
        existingFeedback={existingFeedback}
        onSubmit={handleSubmitFeedback}
      />

      {showFeedbackSuccess && (
        <div className="fixed inset-0 !mb-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon name="checkCircle" size={24} className="text-green-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Avaliação enviada!</h3>
              <p className="text-sm text-slate-500 mt-2">{feedbackSuccessMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFeedbackSuccess(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

       <OrderDetailModal
         isOpen={showOrderDetails}
         onClose={() => {
           setShowOrderDetails(false);
           setSelectedOrder(null);
           setSelectedOrderId(null);
           setRefreshData(true);
           setOrderDetailTab("details");
         }}
         order={selectedOrder}
         orderId={selectedOrderId}
         onGiveFeedback={handleGiveFeedback}
         initialTab={orderDetailTab}
       />

      <TrackOrderModal
        isOpen={showTrackOrder}
        onClose={() => {
          setShowTrackOrder(false);
          setSelectedTrackOrder(null);
        }}
        order={selectedTrackOrder || activeOrder}
      />

      <ContactSupportModal
        isOpen={showSupport}
        onClose={() => {
          setShowSupport(false);
        }}
        order={activeOrder}
      />
      
    </div>
  );
};

export default CustomerApp;