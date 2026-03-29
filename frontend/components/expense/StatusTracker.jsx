"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Check, Clock, Lock } from "lucide-react";

export default function StatusTracker({ expenseId }) {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get(`/approvals/${expenseId}/timeline`);
        setTimeline(res.data);
      } catch (error) {
        // Fallback mock since backend is missing
        setTimeout(() => {
          setTimeline([
            { id: 1, type: "APPROVED", role: "Direct Manager", name: "Chidi Anagonye", date: "Oct 24, 2026", comment: "Looks good. Approved for processing." },
            { id: 2, type: "PENDING", role: "Department Head", name: "Michael" },
            { id: 3, type: "LOCKED", role: "Finance", name: "Janet" }
          ]);
          setLoading(false);
        }, 600);
      }
    };
    fetchTimeline();
  }, [expenseId]);

  if (loading) {
     return (
       <div className="w-full h-32 flex flex-col items-center justify-center">
         <div className="w-8 h-8 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="w-full">
      <h3 className="font-display text-2xl font-bold text-dark mb-8">Approval Pipeline</h3>
      
      {/* Horizontal on md+, Vertical on mobile */}
      <div className="flex flex-col md:flex-row items-start relative w-full justify-between">
         {timeline.map((step, idx) => {
            const isLast = idx === timeline.length - 1;
            
            return (
              <div key={step.id} className="relative flex-1 group w-full flex md:block mb-8 md:mb-0">
                 {/* Connection Line (Desktop) */}
                 {!isLast && (
                   <div className="hidden md:block absolute top-[24px] left-[50%] w-full h-[2px] bg-sand">
                     {step.type === "APPROVED" && <div className="absolute inset-0 bg-success w-full origin-left transition-transform duration-1000"></div>}
                     {step.type === "PENDING" && <div className="absolute inset-0 bg-accent w-1/2 origin-left transition-transform duration-1000 animate-pulse"></div>}
                   </div>
                 )}

                 {/* Connection Line (Mobile) */}
                 {!isLast && (
                    <div className="md:hidden absolute top-[48px] left-[23px] w-[2px] h-full bg-sand">
                      {step.type === "APPROVED" && <div className="absolute top-0 w-full bg-success h-full"></div>}
                      {step.type === "PENDING" && <div className="absolute top-0 w-full bg-accent h-1/2 animate-pulse"></div>}
                    </div>
                 )}
                 
                 <div className="flex md:flex-col items-start md:items-center relative z-10 w-full gap-5 md:gap-3">
                    
                    {/* Circle Node */}
                    <div className="shrink-0 relative">
                       {step.type === "APPROVED" && (
                          <div className="w-12 h-12 rounded-full bg-success text-white flex items-center justify-center shadow-md shadow-success/20 ring-4 ring-white border-2 border-white">
                             <Check size={20} strokeWidth={3} />
                          </div>
                       )}
                       {step.type === "PENDING" && (
                          <div className="w-12 h-12 rounded-full border-2 border-accent bg-white text-accent flex items-center justify-center shadow-[0_0_15px_rgba(200,149,108,0.4)] ring-4 ring-white animate-[pulse_2s_ease-in-out_infinite]">
                             <Clock size={20} strokeWidth={2.5} />
                          </div>
                       )}
                       {step.type === "LOCKED" && (
                          <div className="w-12 h-12 rounded-full bg-sand text-muted flex items-center justify-center border-2 border-[#E0D8CC] ring-4 ring-white">
                             <Lock size={16} strokeWidth={2} />
                          </div>
                       )}
                    </div>
                    
                    {/* Content Details */}
                    <div className="flex-1 md:text-center mt-1 md:mt-0 pb-6 md:pb-0 pr-4 md:pr-0 md:px-4">
                       <p className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] font-body mb-1">{step.role}</p>
                       <p className={`font-bold text-sm ${step.type === "LOCKED" ? "text-muted" : "text-dark"}`}>
                          {step.type === "LOCKED" ? "Awaiting stage" : step.type === "PENDING" ? `Awaiting ${step.name?.split(' ')[0]}` : step.name}
                       </p>
                       
                       {step.type === "APPROVED" && step.date && (
                          <p className="text-xs font-semibold text-success mt-1 inline-flex items-center gap-1 bg-success/10 px-2 py-0.5 rounded-full">
                            <Check size={10} strokeWidth={4} /> {step.date}
                          </p>
                       )}
                       
                       {step.comment && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-sand text-xs text-charcoal text-left relative before:absolute before:-top-1.5 before:left-4 md:before:left-1/2 md:before:-translate-x-1/2 before:w-3 before:h-3 before:bg-gray-50 before:border-l before:border-t before:border-sand before:rotate-45">
                             <span className="relative z-10 block font-body italic leading-relaxed text-muted">"{step.comment}"</span>
                          </div>
                       )}
                    </div>

                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
}
