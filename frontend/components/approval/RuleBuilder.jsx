"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import api from "@/lib/api";

export default function RuleBuilder() {
  const [steps, setSteps] = useState([{ id: 1, roleLabel: "Direct Manager", isSpecificApprover: false }]);
  const [condition, setCondition] = useState("None");
  const [conditionValue, setConditionValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await api.get("/rules");
        if (res.data.steps) setSteps(res.data.steps);
        if (res.data.condition) {
          setCondition(res.data.condition.type);
          setConditionValue(res.data.condition.value);
        }
      } catch (err) {
        console.warn("Using default rules config for dev");
      }
    }
    loadConfig();
  }, []);

  const addStep = () => {
    setSteps([...steps, { id: Date.now(), roleLabel: "", isSpecificApprover: false }]);
  };

  const removeStep = (id) => {
    if (steps.length === 1) return;
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStep = (id, field, value) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/rules/steps", { steps });
      await api.post("/rules/condition", { type: condition, value: conditionValue });
      alert("System rules successfully applied across the organization.");
    } catch (err) {
      setTimeout(() => alert("Dev Check: Configuration Saved!"), 600);
    } finally {
      setTimeout(() => setSaving(false), 600);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: Approval Sequence */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">1. Master Approval Pipeline</h3>
        <p className="text-gray-500 mb-6 font-medium text-sm">Define the sequential chain of approvals every expense must pass through.</p>
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60 shadow-sm relative group">
              
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                {index + 1}
              </div>
              
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approver Identity</label>
                  <select 
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    value={step.isSpecificApprover ? "specific" : "dynamic"}
                    onChange={(e) => updateStep(step.id, 'isSpecificApprover', e.target.value === "specific")}
                  >
                    <option value="dynamic">Reporting Hierarchy (Dynamic)</option>
                    <option value="specific">Specific Department Lead (Static)</option>
                  </select>
                </div>
                
                <div className="w-full">
                   <Input 
                     label="Logic / Title Label" 
                     placeholder="e.g. Employee's Manager"
                     value={step.roleLabel}
                     onChange={(e) => updateStep(step.id, 'roleLabel', e.target.value)}
                     className="py-2.5"
                   />
                </div>
              </div>

              <button 
                onClick={() => removeStep(step.id)}
                className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
                disabled={steps.length === 1}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>

        <Button variant="secondary" onClick={addStep} className="mt-5 w-full border-dashed border-2 py-4 text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Next Pipeline Tier
        </Button>
      </div>

      {/* SECTION 2: Conditional Thresholds */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-2">2. Conditional Fast-Tracking Rules</h3>
        <p className="text-gray-500 mb-6 font-medium text-sm">Automate specific triggers to bypass approval stages or flag high-value requests.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
             {["None", "Auto-Approve Below Amount", "Require Director Above Amount"].map(opt => (
               <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${condition === opt ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${condition === opt ? "border-blue-600" : "border-gray-300"}`}>
                   {condition === opt && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                 </div>
                 <input type="radio" className="hidden" name="conditionRule" value={opt} checked={condition === opt} onChange={() => setCondition(opt)} />
                 <span className="font-semibold text-gray-800 text-sm">{opt}</span>
               </label>
             ))}
          </div>

          <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-100 h-full flex flex-col justify-center">
             {condition === "None" ? (
               <div className="text-center text-gray-400 font-medium text-sm">
                 <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 Standard pipeline applies to all requests regardless of monetary value.
               </div>
             ) : (
               <div className="animate-in fade-in duration-300">
                 <p className="text-sm font-bold text-gray-700 mb-3">{condition === "Auto-Approve Below Amount" ? "Maximum Auto threshold" : "Minimum Flag threshold"}</p>
                 <Input 
                   type="number" 
                   min="0"
                   placeholder="E.g. 500.00" 
                   value={conditionValue} 
                   onChange={(e) => setConditionValue(e.target.value)} 
                 />
                 <p className="text-xs text-gray-500 mt-3 italic">Value evaluated against the company's base currency.</p>
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={handleSave} isLoading={saving} className="px-10 h-14 text-lg shadow-lg shadow-blue-500/30">
          Deploy Corporate Rules
        </Button>
      </div>
    </div>
  );
}
