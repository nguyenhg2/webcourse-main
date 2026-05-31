import { createContext, useContext, useState, useEffect } from "react";
import { getCartAPI, getMeAPI, loginAPI, registerAPI } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCartCount = async () => {
    if (!localStorage.getItem("token")) {
      setCartCount(0);
      return 0;
    }

    try {
      const data = await getCartAPI();
      const count = data.items?.length || 0;
      setCartCount(count);
      return count;
    } catch {
      setCartCount(0);
      return 0;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMeAPI()
      .then((data) => {
        setUser(data);
        if (data.role === "student") {
          refreshCartCount();
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
        setCartCount(0);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, expectedRole) => {
    const data = await loginAPI(email, password, expectedRole);
    localStorage.setItem("token", data.access_token);
    const me = await getMeAPI();
    setUser(me);
    localStorage.setItem("user", JSON.stringify(me));
    if (me.role === "student") {
      await refreshCartCount();
    } else {
      setCartCount(0);
    }
    return me;
  };

  const register = async (name, email, password) => {
    await registerAPI(name, email, password);
    return login(email, password, "student");
  };

  const logout = () => {
    setUser(null);
    setCartCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, cartCount, setCartCount, refreshCartCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
