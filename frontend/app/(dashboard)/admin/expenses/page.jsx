"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { MoreVertical, Search, Filter } from "lucide-react";

export default function AdminAllExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await api.get("/expenses");
        const mapped = (res.data || []).map(exp => ({
          id: exp.id,
          user: exp.employee_name || 'Employee',
          cat: exp.category || 'Other',
          amount: exp.converted_amount ? `₹${Number(exp.converted_amount).toLocaleString('en-IN')}` : `${exp.currency} ${exp.amount}`,
          status: exp.status ? exp.status.charAt(0).toUpperCase() + exp.status.slice(1) : 'Pending',
          date: exp.date ? new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        }));
        setExpenses(mapped);
        setLoading(false);
      } catch (error) {
        // Fallback for missing backend testing
        setTimeout(() => {
          setExpenses([
            { id: 1, user: "Eleanor Shellstrop", cat: "Travel", amount: "₹45,000", status: "Approved", date: "Oct 24, 2026" },
            { id: 2, user: "Chidi Anagonye", cat: "Meals", amount: "₹8,200", status: "Pending", date: "Oct 23, 2026" },
            { id: 3, user: "Tahani Al-Jamil", cat: "Accommodation", amount: "₹1,20,000", status: "Pending", date: "Oct 22, 2026" },
            { id: 4, user: "Jason Mendoza", cat: "Office Supplies", amount: "₹1,500", status: "Rejected", date: "Oct 21, 2026" },
            { id: 5, user: "Michael", cat: "Travel", amount: "₹34,000", status: "Approved", date: "Oct 20, 2026" },
            { id: 6, user: "Janet", cat: "Other", amount: "₹500", status: "Approved", date: "Oct 19, 2026" },
            { id: 7, user: "Eleanor Shellstrop", cat: "Meals", amount: "₹4,000", status: "Pending", date: "Oct 18, 2026" },
          ]);
          setLoading(false);
        }, 600);
      }
    };
    fetchExpenses();
  }, []);

  const statuses = ["All", "Pending", "Approved", "Rejected"];

  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.cat.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
        <p className="mt-4 font-bold text-muted animate-pulse">Loading Ledger Engine...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 mt-2 gap-4">
         <div>
           <h1 className="font-display text-4xl font-bold text-dark tracking-tight mb-2">Company Ledger</h1>
           <p className="font-body text-muted flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-accent"></span>
             Full audit trail of all expenses
           </p>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted h-4 w-4" />
             <input 
               type="text" 
               placeholder="Search entries..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-11 pr-4 py-2.5 rounded-full border border-sand bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-accent/20 w-full sm:w-64"
             />
           </div>
           
           <div className="bg-white border border-sand rounded-full p-1 shadow-sm flex overflow-x-auto hide-scrollbar">
             {statuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                    statusFilter === s ? "bg-dark text-cream" : "text-muted hover:bg-sand"
                  }`}
                >
                  {s}
                </button>
             ))}
           </div>
         </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] overflow-hidden min-h-[500px]">
        
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[700px]">
             <thead>
               <tr className="border-b border-sand bg-gray-50/50">
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body text-center w-16">ID</th>
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Employee</th>
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Category</th>
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Amount</th>
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Date</th>
                 <th className="px-6 py-5 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Status</th>
                 <th className="px-6 py-5"></th>
               </tr>
             </thead>
             <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-muted font-body">No matching expenses found in the ledger.</td>
                  </tr>
                ) : filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-sand/50 hover:bg-sand/30 transition-colors group">
                    <td className="px-6 py-4 text-center text-xs font-bold text-muted/60">#{exp.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-charcoal text-cream font-display font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                           {exp.user.charAt(0)}
                         </div>
                         <span className="font-bold text-dark text-sm whitespace-nowrap">{exp.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-sm font-bold text-charcoal flex items-center gap-2 whitespace-nowrap">
                         <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                         {exp.cat}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-display font-bold text-lg text-dark whitespace-nowrap">{exp.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-muted whitespace-nowrap">{exp.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <Badge status={exp.status.toLowerCase()} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-muted hover:text-accent hover:bg-white rounded-lg transition-colors border border-transparent hover:border-sand shadow-sm opacity-0 group-hover:opacity-100">
                         <MoreVertical size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      </div>
      
    </div>
  );
}
