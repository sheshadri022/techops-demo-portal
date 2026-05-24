import { useState, useEffect, useContext, createContext } from "react";

export type UserRole = "admin" | "user";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  department?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const DEMO_CREDENTIALS: Record<string, { password: string; user: AuthUser }> = {
  "admin@techopsdemo.com": {
    password: "admin123",
    user: {
      name: "Admin User",
      email: "admin@techopsdemo.com",
      role: "admin",
      initials: "AU",
      department: "IT Operations",
    },
  },
  "user@techopsdemo.com": {
    password: "user123",
    user: {
      name: "Alex Johnson",
      email: "user@techopsdemo.com",
      role: "user",
      initials: "AJ",
      department: "Engineering",
    },
  },
};

const LS_KEY = "techops-auth-user";

function getAutoLoginUser(): AuthUser | null {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get("demoLogin");
  if (demo === "admin") return DEMO_CREDENTIALS["admin@techopsdemo.com"].user;
  if (demo === "user") return DEMO_CREDENTIALS["user@techopsdemo.com"].user;
  return null;
}

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(
    () => getAutoLoginUser() ?? loadStoredUser()
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [user]);

  function login(email: string, password: string): { success: boolean; error?: string } {
    const record = DEMO_CREDENTIALS[email.toLowerCase().trim()];
    if (!record) {
      return { success: false, error: "No account found with that email address." };
    }
    if (record.password !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }
    setUser(record.user);
    return { success: true };
  }

  function logout() {
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
