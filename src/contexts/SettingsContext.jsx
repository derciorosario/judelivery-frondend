import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPlatformSettings } from "../api/client";
import { cloneSettings, defaultPlatformSettings, mergeSettings } from "../utils/platformSettings";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => cloneSettings(defaultPlatformSettings));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const refreshSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getPlatformSettings();
      setSettings(mergeSettings(defaultPlatformSettings, data.settings));
      setUpdatedAt(data.updatedAt ? new Date(data.updatedAt) : null);
    } catch (err) {
      setError(err?.response?.data?.message || "Não foi possível carregar as configurações da plataforma.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      error,
      updatedAt,
      refreshSettings,
    }),
    [settings, loading, error, updatedAt]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export const usePlatformSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("usePlatformSettings must be used within SettingsProvider");
  }
  return context;
};
