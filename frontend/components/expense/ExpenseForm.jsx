"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { id: "Meals", label: "Meals", icon: "🍽️" },
  { id: "Travel", label: "Travel", icon: "✈️" },
  { id: "Accommodation", label: "Accommodation", icon: "🏨" },
  { id: "Medical", label: "Medical", icon: "💊" },
  { id: "Office Supplies", label: "Office Supplies", icon: "🖊️" },
  { id: "Other", label: "Other", icon: "📦" }
];

export default function ExpenseForm({ parsedData }) {
  const [formData, setFormData] = useState({
    amount: "",
    currency: "USD",
    category: "",
    date: "",
    description: "",
  });
  
  const [countries, setCountries] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  
  const router = useRouter();

  // Handle OCR Pre-fill
  useEffect(() => {
    if (parsedData) {
      setFormData(prev => ({
        ...prev,
        amount: parsedData.amount || prev.amount,
        date: parsedData.date || prev.date,
        description: parsedData.description || prev.description,
      }));
    }
  }, [parsedData]);

  // Fetch Currencies for Dropdown
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,currencies,flags");
        const data = await response.json();
        
        const map = new Map();
        data.forEach(country => {
          if (country.currencies) {
            const code = Object.keys(country.currencies)[0];
            const flag = country.flags?.emoji || "🌐";
            if (!map.has(code)) {
              map.set(code, { code, name: country.currencies[code].name, flag });
            }
          }
        });
        
        setCurrencies(Array.from(map.values()).sort((a,b) => a.code.localeCompare(b.code)));
      } catch (err) {
        console.error("Failed to load currencies", err);
      }
    }
    fetchCurrencies();
  }, []);

  // Mock Currency Conversion
  useEffect(() => {
    if (!formData.amount || isNaN(formData.amount)) {
      setConvertedAmount(null);
      return;
    }
    
    // Simulate API delay for conversion to company default (INR)
    const timer = setTimeout(() => {
      let rate = 1;
      if (formData.currency === "USD") rate = 83.5;
      else if (formData.currency === "EUR") rate = 90.2;
      else if (formData.currency === "GBP") rate = 105.4;
      else if (formData.currency !== "INR") rate = 45.0; // dummy fallback
      
      const conv = (parseFloat(formData.amount) * rate).toLocaleString("en-IN", { maximumFractionDigits: 2 });
      setConvertedAmount(conv);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.amount, formData.currency]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setCategory = (id) => {
    setFormData(prev => ({ ...prev, category: id }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.post("/expenses", formData);
      router.push("/employee");
    } catch (error) {
       alert(error.message || "Failed to submit expense");
       setLoading(false);
    }
  };

  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-8 sm:p-12 font-body h-full relative overflow-hidden">
      
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-sand rounded-full filter blur-[60px] opacity-60"></div>

      <div className="mb-10 relative z-10">
        <h2 className="font-display text-[32px] sm:text-[40px] font-bold text-dark mb-2 tracking-tight leading-none">
          Submit Expense
        </h2>
        <p className="text-muted font-semibold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
          Input manual details or use smart scan
        </p>
      </div>

      <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
        
        {/* Amount Input with attached Dropdown */}
        <div className="space-y-3">
           <label className="text-sm font-bold text-charcoal px-1 uppercase tracking-widest text-[11px]">Requested Amount</label>
           <div className="flex items-stretch shadow-sm rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-accent/40 transition-shadow">
              <input 
                 type="number"
                 step="0.01"
                 min="0.01"
                 required
                 name="amount"
                 value={formData.amount}
                 onChange={handleChange}
                 placeholder="0.00"
                 className="flex-1 px-8 py-5 border-y border-l border-[#E0D8CC] bg-white rounded-l-full font-display font-bold text-3xl sm:text-4xl text-dark placeholder-sand/50 focus:outline-none"
              />
              <div className="relative border border-l-0 border-[#E0D8CC] bg-gray-50 hover:bg-white rounded-r-full transition-colors flex items-center px-4 w-32 shrink-0">
                 <select
                   name="currency"
                   value={formData.currency}
                   onChange={handleChange}
                   className="w-full bg-transparent font-bold text-charcoal appearance-none focus:outline-none cursor-pointer pl-2 pr-6 h-full"
                 >
                   {currencies.map(c => (
                     <option key={c.code} value={c.code}>
                       {c.flag} {c.code}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute right-5 text-muted">
                    <svg className="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                 </div>
              </div>
           </div>
           {/* Live Conversion Preview */}
           <div className="h-4 pl-4">
              {convertedAmount && (
                <p className="text-xs font-bold text-muted animate-fade-in inline-flex items-center gap-1.5">
                   <span className="w-1 h-1 bg-success rounded-full"></span>
                   ≈ {convertedAmount} INR <span className="text-[9px] font-normal uppercase">(Corporate Target)</span>
                </p>
              )}
           </div>
        </div>

        <div className="w-full h-px bg-sand/50"></div>

        {/* Category Pill Grid */}
        <div className="space-y-4">
           <label className="text-sm font-bold text-charcoal px-1 uppercase tracking-widest text-[11px]">Classification</label>
           <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => {
                 const isSelected = formData.category === cat.id;
                 return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`py-3.5 px-3 rounded-[1.25rem] text-sm font-bold border transition-all duration-300 flex items-center justify-center gap-2 ${
                        isSelected 
                          ? "bg-dark text-cream border-dark shadow-md scale-[1.02]" 
                          : "bg-cream text-charcoal border-[#E0D8CC] hover:bg-white hover:border-dark hover:shadow-sm"
                      }`}
                    >
                       <span className="text-lg">{cat.icon}</span> <span className="truncate">{cat.label}</span>
                    </button>
                 );
              })}
           </div>
           {!formData.category && <p className="text-[10px] text-danger font-bold pl-2">Required field*</p>}
        </div>

        <div className="space-y-4">
           {/* Date input styled as Input component */}
           <Input 
             label="TRANSACTION DATE"
             type="date"
             name="date"
             required
             max={maxDate}
             value={formData.date}
             onChange={handleChange}
             className="uppercase text-sm"
           />

           {/* Description Textarea */}
           <div className="flex flex-col gap-2 w-full pt-2">
             <div className="flex justify-between items-end px-1">
                <label className="text-sm font-bold text-charcoal uppercase tracking-widest text-[11px]">Business Context</label>
                <span className={`text-[10px] font-bold ${formData.description.length > 250 ? 'text-danger' : 'text-muted'}`}>
                  {formData.description.length}/250
                </span>
             </div>
             <textarea
               name="description"
               required
               maxLength={250}
               placeholder="Briefly describe the purpose of this expense..."
               value={formData.description}
               onChange={handleChange}
               className="w-full px-6 py-4 rounded-[1.5rem] border border-[#E0D8CC] bg-white text-dark font-body placeholder-sand/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm resize-none h-32"
             ></textarea>
           </div>
        </div>

        <div className="pt-6 border-t border-sand/50">
           <Button type="submit" disabled={!formData.category} className="w-full py-5 text-lg shadow-[0_8px_20px_rgba(0,0,0,0.06)]" isLoading={loading}>
              Submit for Approval
           </Button>
        </div>

      </form>
    </div>
  );
}
