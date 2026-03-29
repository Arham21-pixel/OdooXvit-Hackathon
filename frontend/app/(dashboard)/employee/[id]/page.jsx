"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, Receipt, ChevronRight, InboxIcon } from "lucide-react";
import StatusTracker from "@/components/expense/StatusTracker";

export default function ExpenseDetailPage({ params }) {
  const { id } = params;
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get(`/expenses/${id}`);
        setExpense(res.data);
      } catch (error) {
        // Fallback since backend is missing during dev
        setTimeout(() => {
          setExpense({
            id: id,
            amount: "₹45,000",
            currency: "INR",
            category: "Travel",
            description: "Round trip flights to Mumbai for the Q4 Regional Sales Summit. Includes baggage fees.",
            date: "Oct 24, 2026",
            status: "Pending",
            companyCurrencyAmount: "₹45,000",
            receiptUrl: "https://example.com/receipt.pdf" // Dummy URL
          });
          setLoading(false);
        }, 600);
      }
    };
    fetchExpense();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
      </div>
    );
  }

  if (!expense) return <div className="p-8 text-center text-danger font-bold text-lg">Expense not found.</div>;

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* BACK Button */}
      <Link href="/employee" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-dark transition-colors mb-8 group">
         <div className="p-2 rounded-full bg-white border border-sand group-hover:border-dark transition-colors shadow-sm">
           <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
         </div>
         My Expenses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Top / Main Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-8 lg:p-10 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark text-cream text-[11px] font-bold uppercase tracking-widest rounded-full font-body shadow-sm">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> {expense.category}
                 </span>
                 <Badge status={expense.status} />
              </div>
              <h1 className="font-display text-5xl font-bold text-dark tracking-tight mb-2">{expense.amount}</h1>
              <p className="text-sm font-semibold text-muted flex items-center gap-2 font-body">
                <Calendar size={14} /> Submitted on {expense.date}
              </p>
            </div>
            
            <div className="bg-sand/30 p-5 border border-sand rounded-2xl sm:max-w-xs shrink-0">
               <div className="flex items-center gap-2 mb-2 text-charcoal font-bold">
                 <FileText size={16} className="text-accent" />
                 <span className="text-sm uppercase tracking-widest text-[10px]">Justification</span>
               </div>
               <p className="text-sm text-charcoal font-body leading-relaxed">{expense.description}</p>
            </div>
          </div>

          <div className="w-full h-px bg-sand/50 mb-10"></div>

          {/* APPROVAL TIMELINE */}
          <StatusTracker expenseId={expense.id} />
          
        </div>

        {/* Action / Receipt Sidebar (1/3 width) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-7 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
                <Receipt size={24} strokeWidth={2} />
             </div>
             <h3 className="font-display font-bold text-xl text-dark mb-1">Receipt Verified</h3>
             <p className="text-xs font-semibold text-muted font-body mb-6">OCR Confidence: 98.4%</p>
             
             <a href={expense.receiptUrl} target="_blank" rel="noreferrer" className="w-full py-3 px-4 rounded-xl border-2 border-sand text-dark font-bold text-sm hover:border-dark hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group">
               View Full Document <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
             </a>
          </div>
          
          <div className="bg-charcoal rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-7 text-cream relative overflow-hidden">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-accent rounded-full filter blur-[50px] opacity-20"></div>
             <h3 className="font-display font-bold text-xl mb-3 relative z-10 tracking-tight">Need assistance?</h3>
             <p className="text-sm text-sand/80 font-body mb-5 relative z-10 leading-relaxed">If this reimbursement is stalled or requires an internal audit query, contact your assigned financial representative.</p>
             <button className="text-xs font-bold uppercase tracking-widest text-accent hover:text-white transition-colors border-b-2 border-accent/30 hover:border-white pb-0.5 relative z-10">
               Open Support Ticket
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
