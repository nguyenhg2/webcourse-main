import { createContext, useContext, useState, useEffect } from "react";
import { getMeAPI, loginAPI, registerAPI } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMeAPI()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginAPI(email, password);
    localStorage.setItem("token", data.access_token);
    const me = await getMeAPI();
    setUser(me);
    localStorage.setItem("user", JSON.stringify(me));
    return me;
  };

  const register = async (name, email, password) => {
    await registerAPI(name, email, password);
    return login(email, password);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
