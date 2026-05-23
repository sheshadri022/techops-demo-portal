import { useState, useContext, createContext } from "react";

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

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

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
