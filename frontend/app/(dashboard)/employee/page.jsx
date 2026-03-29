"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ChevronRight, FilePlus, CircleDashed, Utensils, Plane, Hotel, Monitor, Coffee } from "lucide-react";

export default function EmployeeExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses");
        setExpenses(res.data);
      } catch (error) {
        // Mock fallback wrapper
        setTimeout(() => {
          setExpenses([
            { id: 1, cat: "Travel", title: "Flights to NYC HQ", amount: "₹45,000", status: "Approved", date: "Oct 24, 2026", daysAgo: 2 },
            { id: 2, cat: "Meals", title: "Client Dinner with Acme Corp", amount: "₹8,200", status: "Pending", date: "Oct 23, 2026", daysAgo: 3 },
            { id: 3, cat: "Accommodation", title: "Marriott Downtown 2 Nights", amount: "₹1,20,000", status: "Pending", date: "Oct 22, 2026", daysAgo: 4 },
            { id: 4, cat: "Office Supplies", title: "Mechanical Keyboard", amount: "₹12,500", status: "Rejected", date: "Oct 15, 2026", daysAgo: 11 },
            { id: 5, cat: "Travel", title: "Uber to Airport", amount: "₹2,400", status: "Approved", date: "Oct 10, 2026", daysAgo: 16 },
          ]);
          setLoading(false);
        }, 600);
      }
    };
    fetchExpenses();
  }, []);

  const getCategoryTheme = (category) => {
    const c = category.toLowerCase();
    if (c.includes("meal")) return { icon: Utensils, bg: "bg-orange-100", text: "text-orange-600" };
    if (c.includes("travel")) return { icon: Plane, bg: "bg-blue-100", text: "text-blue-600" };
    if (c.includes("accommodation") || c.includes("hotel")) return { icon: Hotel, bg: "bg-purple-100", text: "text-purple-600" };
    if (c.includes("office") || c.includes("equipment")) return { icon: Monitor, bg: "bg-emerald-100", text: "text-emerald-600" };
    return { icon: Coffee, bg: "bg-sand", text: "text-charcoal" };
  };

  const filters = ["All", "Pending", "Approved", "Rejected"];
  const filteredExpenses = expenses.filter(exp => filter === "All" ? true : exp.status === filter);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
        <p className="mt-4 font-bold text-muted animate-pulse">Initializing Ledger Sandbox...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* HEADER & FILTER BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-2">
        <div>
           <h1 className="font-display text-4xl font-bold text-dark tracking-tight mb-2">My Expenses</h1>
           <p className="font-body text-muted flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent"></span>
             Track your reimbursement requests
           </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-white border border-[#E0D8CC] rounded-full shadow-sm overflow-x-auto hide-scrollbar">
           {filters.map(f => (
             <button
               key={f}
               onClick={() => setFilter(f)}
               className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                 filter === f 
                  ? "bg-dark text-cream shadow-md" 
                  : "bg-transparent text-muted hover:bg-sand"
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* EXPENSE CARDS LIST OR EMPTY STATE */}
      {filteredExpenses.length === 0 ? (
        <div className="w-full bg-white border-2 border-dashed border-sand rounded-[2rem] p-16 flex flex-col items-center justify-center text-center animate-fade-in opacity-0" style={{ animationDelay: "0.2s" }}>
           <div className="w-24 h-24 mb-6 text-sand">
              <CircleDashed strokeWidth={1} className="w-full h-full text-sand/50" />
           </div>
           <h3 className="font-display text-3xl font-bold text-dark mb-2">No expenses yet</h3>
           <p className="text-muted font-body max-w-sm mb-8">You haven't submitted any reimbursements matching this criteria.</p>
           
           <Link href="/employee/submit" className="inline-flex items-center justify-center gap-2 font-bold font-body rounded-full px-8 py-3.5 bg-dark text-cream hover:bg-charcoal hover:-translate-y-1 hover:shadow-lg focus:ring-2 focus:ring-dark focus:ring-offset-2 focus:ring-offset-cream overflow-hidden shadow-sm transition-all duration-300">
             <FilePlus size={18} /> Submit your first expense
           </Link>
        </div>
      ) : (
        <div className="space-y-4">
           {filteredExpenses.map((exp, idx) => {
              const theme = getCategoryTheme(exp.cat);
              const CatIcon = theme.icon;
              
              return (
                <Link 
                  href={`/employee/${exp.id}`} 
                  key={exp.id} 
                  className="group flex flex-col md:flex-row md:items-center justify-between bg-white rounded-2xl p-5 md:pl-6 md:pr-8 shadow-[0_8px_20px_rgba(0,0,0,0.02)] border border-[#E0D8CC] hover:-translate-y-[2px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.06)] hover:border-accent/40 transition-all duration-300 animate-fade-in opacity-0"
                  style={{ animationDelay: `${0.15 + (idx * 0.05)}s` }}
                >
                   {/* Left & Middle: Icon + Meta */}
                   <div className="flex items-start md:items-center gap-5 md:gap-6 mb-5 md:mb-0">
                      <div className={`w-14 h-14 rounded-[1.25rem] ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 shadow-inner`}>
                         <CatIcon size={24} strokeWidth={2.5} />
                      </div>
                      
                      <div className="flex flex-col">
                         <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-[0.15em] font-body bg-sand/50 px-2 py-0.5 rounded border border-sand">{exp.cat}</span>
                         </div>
                         <h3 className="font-bold text-dark text-base md:text-lg mb-0.5 group-hover:text-accent transition-colors line-clamp-1">{exp.title}</h3>
                         <p className="text-xs font-semibold text-muted font-body">Submitted {exp.daysAgo} days ago • <span className="text-muted/60">{exp.date}</span></p>
                      </div>
                   </div>

                   {/* Right: Amount & Action */}
                   <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-sand/50 md:border-none">
                      <div className="text-left md:text-right">
                         <p className="font-display font-bold text-2xl md:text-3xl text-dark tracking-tight mb-1">{exp.amount}</p>
                         <Badge status={exp.status} />
                      </div>
                      
                      <div className="w-10 h-10 rounded-full border border-sand bg-cream flex items-center justify-center text-charcoal group-hover:bg-dark group-hover:border-dark group-hover:text-cream transition-colors shadow-sm shrink-0">
                         <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                   </div>
                </Link>
              );
           })}
        </div>
      )}
      
    </div>
  );
}
