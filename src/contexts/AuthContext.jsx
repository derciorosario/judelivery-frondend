import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import client, { getStoredToken, getStoredRefreshToken, setStoredToken, setStoredRefreshToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getStoredToken());
  const [refreshToken, setRefreshTokenState] = useState(getStoredRefreshToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStoredToken(token || null);
  }, [token]);

  useEffect(() => {
    setStoredRefreshToken(refreshToken || null);
  }, [refreshToken]);

  const fetchMe = async (overrideToken) => {
    const currentToken = overrideToken || token;
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setStoredToken(currentToken);

    try {
      const { data } = await client.get("/auth/profile");
      
      setUser(data?.user || null);
    } catch (e) {
      if (e?.response?.status === 401) {
        setTokenState(null);
        setRefreshTokenState(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
      setReady(true);
    }
  };

  useEffect(() => {
    fetchMe();
  }, [token]);

  useEffect(() => {
    const onUnauthorized = () => {
      setTokenState(null);
      setRefreshTokenState(null);
      setUser(null);
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, []);

  const signInWithToken = async (accessToken, newRefreshToken) => {
    setStoredToken(accessToken);
    setTokenState(accessToken);
    if (newRefreshToken) {
      setStoredRefreshToken(newRefreshToken);
      setRefreshTokenState(newRefreshToken);
    }
    return true;
  };

  const signOut = async () => {
    setLoading(true);
    setTokenState(null);
    setRefreshTokenState(null);
    setUser(null);
    setLoading(false);
    window.location.href = "/login";
  };

  const hasRole = (roles = []) => {
    if (!roles?.length) return true;
    const r = user?.role || user?.accountType;
    return roles.includes(r);
  };

  const value = useMemo(
    () => ({
      token,
      refreshToken,
      user,
      loading,
      ready,
      setToken: signInWithToken,
      signInWithToken,
      setRefreshToken: (refreshToken) => {
        setStoredRefreshToken(refreshToken);
        setRefreshTokenState(refreshToken);
      },
      refreshAuth: fetchMe,
      signOut,
      hasRole,
      setUser,
      isAuthed: Boolean(user && token),
    }),
    [token, refreshToken, user, loading, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}