import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@techopsdemo.com",
    password: "admin123",
    description: "Full IT admin access — assets, tickets, employees & dashboard",
    icon: Shield,
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    role: "End User",
    email: "user@techopsdemo.com",
    password: "user123",
    description: "Employee self-service — submit tickets and track requests",
    icon: User,
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
];

export default function Login() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error ?? "Login failed.");
        setLoading(false);
      } else {
        setLocation("/");
      }
    }, 400);
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar to-sidebar/90 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-lg mb-2">
            <span className="text-primary-foreground font-black text-2xl tracking-tighter">T</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">TechOps</h1>
          <p className="text-white/60 text-sm">IT Asset & Helpdesk Portal</p>
        </div>

        {/* Login card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-white/80 text-sm">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@techopsdemo.com"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20"
                  required
                  data-testid="input-email"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:border-primary focus-visible:ring-primary/20 pr-10"
                    required
                    data-testid="input-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    data-testid="toggle-password-visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2" data-testid="login-error">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={loading}
                data-testid="button-login"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-transparent px-3 text-white/40">Demo credentials</span>
              </div>
            </div>

            {/* Demo accounts */}
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 p-3 transition-all group"
                    data-testid={`demo-${acc.role.toLowerCase().replace(" ", "-")}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-7 h-7 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4 text-white/60 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white">{acc.role}</span>
                          <Badge variant="outline" className={`text-xs px-1.5 py-0 ${acc.badgeColor}`}>{acc.role === "Admin" ? "Full Access" : "Self-Service"}</Badge>
                        </div>
                        <p className="text-xs text-white/50 leading-snug">{acc.description}</p>
                        <p className="text-xs text-white/35 mt-1 font-mono">{acc.email} · {acc.password}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs">TechOps Demo — for demonstration purposes only</p>
      </div>
    </div>
  );
}
