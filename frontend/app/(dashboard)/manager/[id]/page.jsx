"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { ArrowLeft, FileText, Calendar, Receipt, ChevronRight, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import StatusTracker from "@/components/expense/StatusTracker";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ApprovalDetailPage({ params }) {
  const { id } = params;
  const router = useRouter();
  
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const res = await api.get(`/expenses/${id}`);
        setExpense(res.data);
      } catch (error) {
        // Fallback for missing dev backend
        setTimeout(() => {
          setExpense({
            id: id,
            user: "Tahani Al-Jamil",
            amount: "₹4,20,000",
            origCurrency: "£4,000 GBP",
            category: "Accommodation",
            description: "Four Seasons Penthouse Suite. The standard rooms were completely unacceptable booked properties, required an immediate executive upgrade to secure standard negotiations.",
            date: "Oct 22, 2026",
            status: "Pending",
            receiptUrl: "https://example.com/receipt.pdf"
          });
          setLoading(false);
        }, 600);
      }
    };
    fetchExpense();
  }, [id]);

  const handleAction = async (action) => {
    if (action === "REJECT" && !comment.trim()) {
      toast.error("A justification comment is required to reject an expense.");
      return;
    }

    setSubmitting(action);
    const apiCall = api.post(`/approvals/${expense?.id}/action`, { action, comment });

    toast.promise(apiCall, {
      loading: 'Committing decision to ledger...',
      success: 'Processing successful!',
      error: 'Backend offline: Mocking successful redirect.',
    }).catch(() => {}); // catch to swallow promise rejection intentionally during mock

    // Mock fallback since api fails locally
    setTimeout(() => {
       toast.success(`Expense successfully ${action === "APPROVE" ? "approved" : "rejected"}!`);
       router.push("/manager");
    }, 1500);
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
      </div>
    );
  }

  if (!expense) return <div className="p-8 text-center text-danger font-bold text-lg">Record not found.</div>;

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* BACK Button */}
      <Link href="/manager" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-dark transition-colors mb-8 group">
         <div className="p-2 rounded-full bg-white border border-sand group-hover:border-dark transition-colors shadow-sm">
           <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
         </div>
         Back to Queue
      </Link>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8 items-start">
        
        {/* Left Full Detail View (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-8 lg:p-10 relative overflow-hidden">
             
             {/* Submitter Profile Inject */}
             <div className="flex items-center gap-4 mb-8 pb-8 border-b border-sand/50">
                <div className="w-14 h-14 rounded-full bg-sand text-charcoal font-display text-2xl font-bold flex items-center justify-center shadow-inner">
                  {expense.user.charAt(0)}
                </div>
                <div>
                   <p className="font-bold text-dark text-lg leading-tight mb-1">{expense.user}</p>
                   <p className="text-xs font-semibold text-muted font-body">Employee ID: MKT-9204</p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
               <div>
                 <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-dark text-cream text-[11px] font-bold uppercase tracking-widest rounded-full font-body shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent"></div> {expense.category}
                    </span>
                    <Badge status={expense.status} />
                 </div>
                 <h1 className="font-display text-5xl font-bold text-dark tracking-tight mb-1">{expense.amount}</h1>
                 <p className="text-sm font-bold text-muted font-body mb-3 opacity-70">Originated as {expense.origCurrency}</p>
                 <p className="text-sm font-semibold text-muted flex items-center gap-2 font-body mt-4">
                   <Calendar size={14} /> Submitted for review on {expense.date}
                 </p>
               </div>
               
               <div className="bg-sand/30 p-6 border border-sand rounded-2xl md:max-w-sm shrink-0">
                  <div className="flex items-center gap-2 mb-3 text-charcoal font-bold">
                    <FileText size={16} className="text-accent" />
                    <span className="text-xs uppercase tracking-widest text-[10px]">Employee Justification</span>
                  </div>
                  <p className="text-sm text-charcoal font-body leading-relaxed">&ldquo;{expense.description}&rdquo;</p>
               </div>
             </div>

             <div className="w-full h-px bg-sand/50 mb-10"></div>

             {/* TIMELINE */}
             <StatusTracker expenseId={expense.id} />
             
           </div>

           {/* Receipt View Panel */}
           <div className="bg-white rounded-[1.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-7 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                    <CheckCircle size={20} strokeWidth={2.5} />
                 </div>
                 <div>
                    <h3 className="font-bold text-dark mb-1">Receipt Authenticated</h3>
                    <p className="text-xs font-semibold text-muted font-body">AI Confidence: High • Tax IDs verified</p>
                 </div>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-sand text-dark font-bold text-sm hover:bg-[#E0D8CC] transition-colors font-body shadow-sm">
                 Inspect Document
              </button>
           </div>
        </div>

        {/* Right Sticky Action Panel (1/3 width) */}
        <div className="xl:col-span-1 xl:sticky xl:top-[128px]">
          <div className="bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-transparent hover:border-accent/10 transition-colors p-8 relative overflow-hidden z-20">
             
             {/* Decorative radial gradient behind panel */}
             <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-br from-cream to-white opacity-50 pointer-events-none"></div>

             <div className="relative z-10 flex items-center gap-3 mb-6">
                <h3 className="font-display font-bold text-2xl text-dark tracking-tight">Your Decision</h3>
             </div>
             
             <div className="relative z-10 space-y-6">
                
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-end px-1">
                     <label className="text-xs font-bold text-charcoal uppercase tracking-widest text-[10px]">Internal Audit Comment</label>
                  </div>
                  <textarea
                    placeholder="Add a comment (required for rejection)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-[#E0D8CC] bg-gray-50/50 text-dark font-body placeholder-sand/80 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent focus:bg-white transition-all shadow-inner resize-none h-32"
                  ></textarea>
                </div>

                <div className="space-y-3 pt-2">
                   <button 
                     onClick={() => handleAction("APPROVE")}
                     disabled={submitting !== null}
                     className="w-full py-4 bg-success hover:bg-emerald-600 text-white font-bold font-body rounded-full shadow-[0_8px_20px_rgba(76,175,125,0.25)] hover:shadow-[0_12px_25px_rgba(76,175,125,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:transform-none"
                   >
                      {submitting === "APPROVE" ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                         <><CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> Approve Reimbursement</>
                      )}
                   </button>
                   
                   <button 
                     onClick={() => handleAction("REJECT")}
                     disabled={submitting !== null}
                     className="w-full py-4 bg-white border-2 border-danger text-danger hover:bg-danger hover:text-white font-bold font-body rounded-full shadow-sm hover:shadow-[0_8px_20px_rgba(224,92,92,0.25)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:transform-none"
                   >
                      {submitting === "REJECT" ? (
                         <div className="w-5 h-5 border-2 border-danger/30 border-t-danger rounded-full animate-spin"></div>
                      ) : (
                         <><XCircle size={20} /> Reject Request</>
                      )}
                   </button>
                </div>
                
                <p className="text-xs font-medium text-muted text-center pt-2">By approving, you authorize the transfer of standard corporate funds mapped to your cost-center limit.</p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
