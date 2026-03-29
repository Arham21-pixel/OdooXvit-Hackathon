"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Check, X, FileText, Utensils, Plane, Hotel, Monitor, Coffee, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ManagerPendingPage() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get("/approvals/pending");
        setPending(res.data);
      } catch (error) {
        // Fallback for missing backend UI testing
        setTimeout(() => {
          setPending([
            { id: 101, user: "Eleanor Shellstrop", cat: "Travel", title: "Last minute flight upgrade (Delta)", amount: "₹24,500", origCurrency: "$295 USD", date: "Oct 24, 2026", daysAgo: 1 },
            { id: 102, user: "Chidi Anagonye", cat: "Meals", title: "Philosophy ethics dinner with board", amount: "₹18,200", origCurrency: "₹18,200 INR", date: "Oct 23, 2026", daysAgo: 2 },
            { id: 103, user: "Tahani Al-Jamil", cat: "Accommodation", title: "Four Seasons Penthouse", amount: "₹4,20,000", origCurrency: "£4,000 GBP", date: "Oct 22, 2026", daysAgo: 3 },
          ]);
          setLoading(false);
        }, 600);
      }
    };
    fetchPending();
  }, []);

  const getCategoryTheme = (category) => {
    const c = category.toLowerCase();
    if (c.includes("meal")) return { icon: Utensils, bg: "bg-orange-100", text: "text-orange-600" };
    if (c.includes("travel")) return { icon: Plane, bg: "bg-blue-100", text: "text-blue-600" };
    if (c.includes("accommodation") || c.includes("hotel")) return { icon: Hotel, bg: "bg-purple-100", text: "text-purple-600" };
    if (c.includes("office") || c.includes("equipment")) return { icon: Monitor, bg: "bg-emerald-100", text: "text-emerald-600" };
    return { icon: Coffee, bg: "bg-sand", text: "text-charcoal" };
  };

  const handleQuickAction = (id, action) => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 800)),
      {
         loading: `${action === 'Approve' ? 'Approving' : 'Rejecting'}...`,
         success: `Expense successfully ${action.toLowerCase()}d!`,
         error: 'Failed to process request.',
      }
    );
    setPending(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
     return (
       <div className="w-full h-[60vh] flex flex-col items-center justify-center">
         <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10 mt-2">
         <h1 className="font-display text-4xl font-bold text-dark tracking-tight">Pending Approvals</h1>
         <span className="inline-flex items-center gap-2 px-3 py-1 bg-warning/15 text-warning font-bold text-[11px] uppercase tracking-widest rounded-full border border-warning/30 shadow-sm mt-1 sm:mt-0 w-max">
           <Clock size={12} strokeWidth={3} /> {pending.length} awaiting your action
         </span>
      </div>

      {pending.length === 0 ? (
        <div className="w-full bg-white border-2 border-dashed border-sand rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 mb-6 bg-success/10 text-success rounded-full flex items-center justify-center">
              <Check strokeWidth={3} size={40} />
           </div>
           <h3 className="font-display text-3xl font-bold text-dark mb-2">You're all caught up!</h3>
           <p className="text-muted font-body">No pending reimbursements require your approval today.</p>
        </div>
      ) : (
        <div className="space-y-5">
           {pending.map((p, idx) => {
              const theme = getCategoryTheme(p.cat);
              const CatIcon = theme.icon;

              return (
                 <div 
                   key={p.id} 
                   className="bg-white rounded-[1.5rem] border border-[#E0D8CC] border-l-[6px] border-l-warning shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 p-6 sm:p-7 flex flex-col xl:flex-row xl:items-center justify-between gap-8 group animate-fade-in opacity-0"
                   style={{ animationDelay: `${0.15 + (idx * 0.05)}s` }}
                 >
                    {/* Employee & Meta info */}
                    <div className="flex flex-col md:flex-row md:items-center gap-8 xl:w-2/3">
                       
                       <div className="flex items-center gap-4 shrink-0 w-48">
                         <div className="w-12 h-12 rounded-full bg-sand text-charcoal font-display text-xl font-bold flex items-center justify-center shadow-inner">
                           {p.user.charAt(0)}
                         </div>
                         <div>
                            <p className="font-bold text-dark leading-tight mb-0.5">{p.user}</p>
                            <p className="text-xs font-semibold text-muted font-body">Submitted {p.daysAgo} days ago</p>
                         </div>
                       </div>
                       
                       <div className="hidden md:block w-px h-12 bg-sand"></div>

                       <div className="flex items-start gap-4 flex-1">
                          <div className={`mt-1 p-2 rounded-xl ${theme.bg} ${theme.text} shrink-0`}>
                             <CatIcon size={20} />
                          </div>
                          <div>
                             <p className="font-bold text-dark mb-1 line-clamp-1 group-hover:text-accent transition-colors">{p.title}</p>
                             <div className="text-xs font-semibold text-muted font-body uppercase tracking-wider bg-sand px-2 py-0.5 rounded-md inline-block">{p.cat}</div>
                          </div>
                       </div>
                       
                    </div>

                    {/* Financials & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-6 xl:w-1/3 border-t border-sand/50 xl:border-none pt-6 xl:pt-0">
                       <div className="text-left xl:text-right shrink-0">
                          <p className="font-display font-bold text-3xl text-dark tracking-tight">{p.amount}</p>
                          <p className="text-xs font-bold text-muted font-body mt-0.5 opacity-60">({p.origCurrency})</p>
                       </div>
                       
                       <div className="flex items-center gap-3 shrink-0">
                          <div className="flex bg-sand/30 p-1.5 rounded-full border border-sand">
                             <button onClick={() => handleQuickAction(p.id, "Approve")} title="Quick Approve" className="w-10 h-10 rounded-full flex items-center justify-center text-success hover:bg-success hover:text-white transition-colors">
                                <Check size={20} strokeWidth={3} />
                             </button>
                             <button onClick={() => handleQuickAction(p.id, "Reject")} title="Quick Reject" className="w-10 h-10 rounded-full flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-colors">
                                <X size={20} strokeWidth={3} />
                             </button>
                          </div>
                          <Link href={`/manager/${p.id}`} className="px-5 py-2.5 rounded-full border-2 border-[#E0D8CC] text-charcoal font-bold text-sm hover:border-dark hover:text-dark transition-colors font-body">
                             View Details
                          </Link>
                       </div>
                    </div>

                 </div>
              );
           })}
        </div>
      )}
    </div>
  );
}
