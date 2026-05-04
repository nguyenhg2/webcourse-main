import { createContext, useContext, useState, useEffect } from "react";
import { loginAPI, registerAPI, getMeAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("codecamp_token");
    if (token) {
      getMeAPI()
        .then((data) => setUser(data))
        .catch(() => {
          localStorage.removeItem("codecamp_token");
          localStorage.removeItem("codecamp_user");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email, password) {
    const data = await loginAPI(email, password);
    localStorage.setItem("codecamp_token", data.access_token);
    const me = await getMeAPI();
    setUser(me);
    localStorage.setItem("codecamp_user", JSON.stringify(me));
    return me;
  }

  async function register(name, email, password) {
    await registerAPI(name, email, password);
    return await login(email, password);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("codecamp_token");
    localStorage.removeItem("codecamp_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
