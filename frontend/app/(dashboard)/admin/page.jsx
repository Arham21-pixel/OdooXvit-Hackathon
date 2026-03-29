"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { 
  DollarSign, 
  CheckCircle, 
  XOctagon, 
  Hourglass, 
  PieChart, 
  AlertCircle,
  MoreVertical,
  Check,
  X
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Attempt to hit the backend API routes (which won't exist yet)
        const [expRes, approvalsRes] = await Promise.all([
          api.get("/expenses"),
          api.get("/approvals/pending")
        ]);
        
        // Populate actual response if backend succeeds
        // Example implementation parsing omitted for brevity & mock safety
      } catch (error) {
        // Fallback to beautiful mock data since backend is missing
        setTimeout(() => {
          setStats([
            { title: "Total Reimbursed", value: "₹4,28,000", trend: 12.4, icon: DollarSign, color: "text-dark bg-white/20" },
            { title: "Approved This Month", value: "₹65,400", trend: 5.2, icon: CheckCircle, color: "text-success bg-success/10" },
            { title: "Pending Approvals", value: "24", trend: -2.1, icon: Hourglass, color: "text-warning bg-warning/10" },
            { title: "Rejected", value: "7", trend: 0.5, icon: XOctagon, color: "text-danger bg-danger/10" },
          ]);

          setRecentExpenses([
            { id: 1, user: "Eleanor Shellstrop", cat: "Travel", amount: "₹45,000", status: "Approved", date: "Oct 24, 2026" },
            { id: 2, user: "Chidi Anagonye", cat: "Meals", amount: "₹8,200", status: "Pending", date: "Oct 23, 2026" },
            { id: 3, user: "Tahani Al-Jamil", cat: "Accommodation", amount: "₹1,20,000", status: "Pending", date: "Oct 22, 2026" },
            { id: 4, user: "Jason Mendoza", cat: "Office Supplies", amount: "₹1,500", status: "Rejected", date: "Oct 21, 2026" },
            { id: 5, user: "Michael", cat: "Travel", amount: "₹34,000", status: "Approved", date: "Oct 20, 2026" },
          ]);

          setPendingApprovals([
            { id: 101, user: "Chidi Anagonye", title: "Ethics Conference Dinner", amount: "₹8,200", daysAgo: 2, cat: "Meals" },
            { id: 102, user: "Tahani Al-Jamil", title: "Luxury Suite Upgrade", amount: "₹1,20,000", daysAgo: 3, cat: "Accommodation" },
            { id: 103, user: "Shawn", title: "Demon Costume Materials", amount: "₹4,500", daysAgo: 5, cat: "Office Supplies" },
          ]);

          setLoading(false);
        }, 800);
      }
    };

    loadDashboard();
  }, []);

  const topCategories = [
    { name: "Travel", value: 45 },
    { name: "Accommodation", value: 30 },
    { name: "Meals", value: 15 },
    { name: "Office Supplies", value: 10 },
  ];

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
        <p className="mt-4 font-bold text-muted animate-pulse">Synchronizing Ledgers...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* TOP ROW: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const isPositive = stat.trend > 0;
          return (
            <div 
               key={stat.title} 
               className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] hover:-translate-y-1 transition-transform duration-300"
               style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
            >
               <div className="flex justify-between items-start mb-6">
                  <p className="text-[13px] font-bold text-muted uppercase tracking-[0.1em] font-body">{stat.title}</p>
                  <div className={`p-2.5 rounded-full ${stat.color}`}>
                    <Icon size={18} strokeWidth={2.5} />
                  </div>
               </div>
               <div className="flex items-end justify-between">
                  <h3 className="font-display text-4xl font-bold text-dark tracking-tight">{stat.value}</h3>
                  <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isPositive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                    {isPositive ? "↑" : "↓"} {Math.abs(stat.trend)}%
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {/* MIDDLE ROW: Table & Top Categories */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent Expenses Table (66% Width) */}
        <div className="xl:col-span-2 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-7 py-6 border-b border-sand flex justify-between items-center bg-gray-50/50">
            <h3 className="font-display text-2xl font-bold text-dark tracking-tight">Recent Ledger Entries</h3>
            <Link href="/admin/expenses" className="text-sm font-bold text-accent hover:text-accent2 transition-colors border-b-2 border-transparent hover:border-accent">
              View All Ledger &rarr;
            </Link>
          </div>
          
          <div className="overflow-x-auto p-2">
             <table className="w-full text-left border-collapse min-w-[700px]">
               <thead>
                 <tr className="border-b border-sand/50">
                   <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Employee</th>
                   <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Category</th>
                   <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Amount</th>
                   <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Date</th>
                   <th className="px-5 py-3 text-xs font-bold text-muted uppercase tracking-[0.15em] font-body">Status</th>
                   <th className="px-5 py-3"></th>
                 </tr>
               </thead>
               <tbody>
                  {recentExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b border-sand/50 hover:bg-sand/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-9 h-9 rounded-full bg-charcoal text-cream font-display font-bold flex items-center justify-center text-sm shadow-sm">
                             {exp.user.charAt(0)}
                           </div>
                           <span className="font-bold text-dark text-sm">{exp.user}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                         <span className="text-sm font-bold text-charcoal flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                           {exp.cat}
                         </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-display font-bold text-lg text-dark">{exp.amount}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold text-muted">{exp.date}</span>
                      </td>
                      <td className="px-5 py-4">
                         <Badge status={exp.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
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

        {/* Top Categories Chart (33% Width) */}
        <div className="xl:col-span-1 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-7 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-display text-2xl font-bold text-dark tracking-tight">Top Categories</h3>
            <div className="p-2.5 rounded-full bg-sand text-accent border border-[#E0D8CC]">
               <PieChart size={20} strokeWidth={2.5} />
            </div>
          </div>
          
          <div className="space-y-6 flex-1 flex flex-col justify-center pb-4">
             {topCategories.map((cat, idx) => (
               <div key={cat.name} className="group">
                   <div className="flex justify-between text-sm font-bold text-charcoal mb-2 font-body">
                     <span>{cat.name}</span>
                     <span className="text-muted tabular-nums">{cat.value}%</span>
                   </div>
                   <div className="w-full bg-cream h-3.5 rounded-full overflow-hidden border border-sand shadow-inner relative">
                     <div 
                        className="absolute top-0 left-0 bg-accent h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110" 
                        style={{ width: `${cat.value}%`, opacity: Math.max(0.4, 1 - (idx * 0.2)) }}
                     ></div>
                   </div>
               </div>
             ))}
          </div>
          
          <div className="mt-auto pt-6 border-t border-sand">
             <Link href="/admin/expenses" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-sand text-dark font-bold text-sm hover:border-accent hover:text-accent transition-colors">
                View Full Audit Report
             </Link>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Pending Approvals Quick List */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-7 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-2.5 rounded-xl bg-warning/10 text-warning border border-warning/20">
             <AlertCircle size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-display text-2xl font-bold text-dark tracking-tight leading-none mb-1">Pending Approvals</h3>
            <p className="text-xs font-bold text-muted uppercase tracking-widest font-body">Requires immediate attention</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingApprovals.map(p => (
            <div key={p.id} className="p-6 rounded-[1.25rem] border-2 border-cream bg-cream hover:bg-white hover:border-[#E0D8CC] hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
               <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-white text-dark font-display text-lg font-bold flex items-center justify-center border border-sand shadow-sm group-hover:scale-110 transition-transform">
                       {p.user.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-dark text-sm leading-tight">{p.user}</p>
                      <p className="text-xs font-bold text-muted font-body mt-0.5">Submitted {p.daysAgo} days ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="font-display font-bold text-xl text-dark tracking-tight leading-none">{p.amount}</p>
                     <span className="inline-block mt-2 text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">{p.cat}</span>
                  </div>
               </div>
               
               <p className="text-sm font-semibold text-charcoal italic mb-5 border-l-2 border-accent/30 pl-3">&ldquo;{p.title}&rdquo;</p>
               
               <div className="flex items-center gap-3 mt-auto pt-4 border-t border-sand/50">
                 <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider bg-success/10 text-success hover:bg-success hover:text-white border border-success/20 transition-all">
                   <Check size={14} strokeWidth={3} /> Approve
                 </button>
                 <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20 transition-all">
                   <X size={14} strokeWidth={3} /> Reject
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
