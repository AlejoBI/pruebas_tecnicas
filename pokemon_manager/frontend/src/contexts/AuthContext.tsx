import { useState, useEffect, type ReactNode } from "react";
import client from "../api/client";
import type { User, AuthResponse } from "../types/auth";
import { AuthContext } from "../contexts/auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(() =>
    Boolean(localStorage.getItem("token")),
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    client
      .get("/auth/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await client.post<AuthResponse>("/auth/login", {
      email,
      password,
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(res.data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await client.post<AuthResponse>("/auth/register", {
      email,
      password,
      name,
    });

    const token = res.data.access_token;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
