"use client";

import { useState } from "react";
import ExpenseForm from "@/components/expense/ExpenseForm";
import OcrUpload from "@/components/expense/OcrUpload";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SubmitExpensePage() {
  const [parsedData, setParsedData] = useState(null);

  const handleParsed = (data) => {
    // This receives the payload directly from the AI OCR wrapper
    // and seamlessly injects it into the smart form inputs!
    setParsedData(data);
  };

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* Back Nav */}
      <Link href="/employee" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-dark transition-colors mb-8 group">
         <div className="p-2 rounded-full bg-white border border-sand group-hover:border-dark transition-colors shadow-sm">
           <ArrowLeft size={16} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
         </div>
         Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl">
         
         {/* LEFT SCREEN: FORM */}
         <div className="w-full order-2 lg:order-1 h-full">
            <ExpenseForm parsedData={parsedData} />
         </div>

         {/* RIGHT SCREEN: OCR UPLOAD */}
         <div className="w-full order-1 lg:order-2 lg:sticky lg:top-[128px]">
            <OcrUpload onParsed={handleParsed} />
         </div>
         
      </div>
    </div>
  );
}
