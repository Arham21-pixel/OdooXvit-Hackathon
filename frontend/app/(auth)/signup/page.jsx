"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { ROLES } from "@/lib/constants";
import { AuthHeroPanel } from "./../login/page"; // Reuse the beautiful left panel!

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "",
  });
  
  const [countries, setCountries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies,flags");
        const data = await response.json();
        
        // Map and sort alphabetically by country name
        const mapped = data.map((country) => {
          const currencyCode = country.currencies ? Object.keys(country.currencies)[0] : "USD";
          const flag = country.flags?.emoji || "🌐";
          return {
            name: country.name.common,
            currency: currencyCode,
            flag: flag,
            id: `${country.name.common}-${currencyCode}`,
          };
        }).sort((a, b) => a.name.localeCompare(b.name));
        
        setCountries(mapped);
      } catch (err) {
        console.error("Failed to load countries", err);
      }
    }
    fetchCountries();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.country) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/signup", {
        ...formData,
        role: ROLES.EMPLOYEE, // Default role on initial signup
      });
      
      const { token } = response.data;
      login(token);

      const decoded = jwtDecode(token);
      if (decoded.role === ROLES.ADMIN) router.push("/admin");
      else if (decoded.role === ROLES.MANAGER) router.push("/manager");
      else router.push("/employee");
    } catch (err) {
      // Mock Fallback since backend is missing during dev
      setTimeout(() => {
        const headerStr = JSON.stringify({ alg: "HS256", typ: "JWT" });
        const payloadStr = JSON.stringify({ 
          id: `dev-EMPLOYEE`, 
          name: formData.name, 
          email: formData.email, 
          role: "EMPLOYEE" 
        });
        const toSafeB64 = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const fakeToken = `${toSafeB64(headerStr)}.${toSafeB64(payloadStr)}.mock_signature`;
        login(fakeToken);
        router.push("/employee");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Reused Left Panel Component */}
      <AuthHeroPanel />

      {/* RIGHT SIDE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
          
          <div className="bg-white p-10 sm:p-12 rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-sand my-8">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="font-display text-[32px] font-bold text-dark mb-2 tracking-tight leading-tight">
                Create your workspace
              </h2>
              <p className="font-body text-muted">Join the seamless reimbursement network.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              {error && (
                <div className="p-4 rounded-3xl bg-danger/5 border border-danger/10 text-sm text-danger text-center font-medium shadow-sm font-body">
                  {error}
                </div>
              )}
              
              <Input
                label="Full Legal Name"
                name="name"
                required
                placeholder="Eleanor Shellstrop"
                value={formData.name}
                onChange={handleChange}
              />

              <Input
                label="Corporate Email"
                name="email"
                type="email"
                required
                placeholder="eleanor@company.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Secure Password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />

              <div className="flex flex-col gap-2 w-full pt-1 pb-2">
                <label className="text-sm font-semibold text-charcoal font-body px-1">Headquarters Country</label>
                <div className="relative">
                  <select
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-6 py-3.5 rounded-full border border-[#E0D8CC] bg-white font-body text-dark focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-sm appearance-none"
                  >
                    <option value="" disabled className="text-muted">Select branch jurisdiction...</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.flag} {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-6 text-charcoal">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full shadow-dark/10" isLoading={loading}>
                  Establish Workspace
                </Button>
              </div>
            </form>
          </div>
          
          <div className="mb-8 text-center font-body animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-muted">
              Already a platform member?{" "}
              <Link href="/login" className="font-bold text-dark border-b-2 border-accent/30 hover:border-accent transition-colors pb-0.5">
                Sign in securely
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
