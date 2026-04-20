import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("codecamp_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      localStorage.removeItem("codecamp_user");
    }
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem("codecamp_user", JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("codecamp_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
