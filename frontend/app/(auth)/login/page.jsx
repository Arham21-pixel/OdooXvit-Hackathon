"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ROLES } from "@/lib/constants";

// Sub-component for the design panel
export function AuthHeroPanel() {
  return (
    <div className="hidden lg:flex w-1/2 relative bg-dark flex-col justify-between p-16 text-cream overflow-hidden">
      {/* subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <div className="relative z-10 animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
        {/* Expenza wordmark */}
        <div className="mb-10 flex items-center gap-2">
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontStyle: "italic",
            fontSize: "24px",
            color: "#FAF7F2",
            letterSpacing: "-0.01em",
            lineHeight: 1,
          }}>
            Expenza
          </span>
          <span style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#C8956C",
            display: "inline-block",
            marginBottom: "2px",
            flexShrink: 0,
          }} />
        </div>
        <h1 className="font-display text-5xl xl:text-7xl font-bold leading-tight max-w-lg tracking-tight">
          Expense.<br />
          <span className="text-accent italic font-medium">Simplified.</span>
        </h1>
        <p className="mt-8 text-lg text-muted max-w-md font-body leading-relaxed">
          Eliminate the friction from corporate spending. Fully automated reimbursements, AI-powered receipts, and instant multi-tier approvals.
        </p>
      </div>

      {/* Frosted glass stat cards */}
      <div className="relative z-10 grid grid-cols-2 gap-4 max-w-lg mb-8 animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors shadow-2xl">
           <p className="font-display text-4xl text-cream mb-2 tracking-tight">₹2.4L</p>
           <p className="text-xs font-semibold text-muted font-body uppercase tracking-widest">Reimbursed today</p>
         </div>
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors shadow-2xl">
           <p className="font-display text-4xl text-cream mb-2 tracking-tight">98%</p>
           <p className="text-xs font-semibold text-muted font-body uppercase tracking-widest">Fast-track approval</p>
         </div>
      </div>
      
      {/* Decorative gradient blur */}
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;
      
      login(token);

      const decoded = jwtDecode(token);
      if (decoded.role === ROLES.ADMIN) router.push("/admin");
      else if (decoded.role === ROLES.MANAGER) router.push("/manager");
      else router.push("/employee");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please verify your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    const headerStr = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const payloadStr = JSON.stringify({ 
      id: `dev-${role}`, 
      name: `${role.charAt(0) + role.slice(1).toLowerCase()} Persona`, 
      email: "demo@company.com", 
      role: role 
    });
    const toSafeB64 = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const fakeToken = `${toSafeB64(headerStr)}.${toSafeB64(payloadStr)}.mock_signature`;
    
    login(fakeToken);
    
    if (role === ROLES.ADMIN) router.push("/admin");
    else if (role === ROLES.MANAGER) router.push("/manager");
    else router.push("/employee");
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AuthHeroPanel />

      {/* RIGHT SIDE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          
          <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-sand">
            <div className="mb-10 text-center sm:text-left">
              <h2 className="font-display text-[32px] font-bold text-dark mb-2 tracking-tight">
                Welcome back
              </h2>
              <p className="font-body text-muted flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-success"></span>
                Sign in to your workspace
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-4 rounded-3xl bg-danger/5 border border-danger/10 text-sm text-danger text-center font-medium shadow-sm truncate whitespace-pre-wrap font-body">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div className="space-y-1">
                  <Input
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="flex justify-end pr-2 pt-1">
                    <a href="#" className="text-sm font-semibold text-accent hover:text-accent2 transition-colors font-body">
                      Forgot password?
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full shadow-dark/10" isLoading={loading}>
                  Sign In
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center font-body animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-muted">
              Don't have a workspace account?{" "}
              <Link href="/signup" className="font-bold text-dark border-b-2 border-accent/30 hover:border-accent transition-colors pb-0.5">
                Create one now
              </Link>
            </p>

            {/* DEMO BYPASS */}
            <div className="mt-10 flex items-center justify-center gap-4 text-xs font-semibold text-muted/50 uppercase tracking-widest">
                <span className="w-10 h-px bg-sand"></span>
                Demo Bypass
                <span className="w-10 h-px bg-sand"></span>
            </div>
            <div className="mt-5 flex justify-center gap-3">
               {['EMPLOYEE', 'MANAGER', 'ADMIN'].map(role => (
                 <button 
                   key={role} 
                   onClick={() => handleDemoLogin(role)}
                   className="w-10 h-10 rounded-full bg-white border border-sand shadow-sm text-xs font-bold text-charcoal flex items-center justify-center hover:bg-sand transition-colors group relative"
                 >
                   {role.charAt(0)}
                   <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-dark text-cream px-3 py-1.5 rounded-xl text-xs whitespace-nowrap hidden sm:block">
                     {role} View
                   </span>
                 </button>
               ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
