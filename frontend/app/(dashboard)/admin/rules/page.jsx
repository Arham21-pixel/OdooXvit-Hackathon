"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Percent, 
  UserCheck, 
  Settings2, 
  Ban,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Individual Sortable List Item
function SortableStep({ id, step, index, updateStep, removeStep }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group bg-white border ${isDragging ? "border-accent shadow-xl scale-[1.02]" : "border-[#E0D8CC] shadow-sm"} rounded-[1.25rem] p-4 flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300`}
    >
      {/* Connector Line Logic inside parent mapping! This is just the card. */}
      
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-move p-2 -ml-2 text-muted hover:text-dark transition-colors shrink-0 outline-none"
      >
        <GripVertical size={20} />
      </div>

      <div className="w-8 h-8 rounded-full bg-sand text-dark font-display font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
         <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] font-body px-1">Approver Identity</label>
            <select
              value={step.approverId}
              onChange={(e) => updateStep(id, "approverId", e.target.value)}
              className="w-full bg-gray-50/50 border border-[#E0D8CC] rounded-xl px-4 py-2.5 font-bold text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              <option value="DIRECT_MANAGER">User's Direct Manager</option>
              <option value="DEPARTMENT_HEAD">Department Head</option>
              <option value="FINANCE_ADMIN">Finance Administrator</option>
              <option value="CEO">Chief Executive Officer</option>
            </select>
         </div>
         <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-[0.15em] font-body px-1">Role Display Label</label>
            <input
              type="text"
              value={step.label}
              onChange={(e) => updateStep(id, "label", e.target.value)}
              className="w-full bg-white border border-[#E0D8CC] rounded-xl px-4 py-2.5 font-semibold text-sm text-dark placeholder-sand focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              placeholder="e.g. Initial Review"
            />
         </div>
      </div>

      <button 
         onClick={() => removeStep(id)}
         className="mt-2 md:mt-0 p-2.5 bg-danger/5 hover:bg-danger text-danger hover:text-white rounded-xl transition-colors shrink-0 duration-300"
      >
        <Trash2 size={18} strokeWidth={2.5} />
      </button>

    </div>
  );
}

export default function ApprovalRulesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Section 1 State
  const [steps, setSteps] = useState([]);
  
  // Section 2 State
  const [condition, setCondition] = useState("NONE");
  const [percentRequired, setPercentRequired] = useState(50);
  const [autoApprover, setAutoApprover] = useState("DIRECT_MANAGER");

  // Drag & Drop Sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    // Mock Fetch setup
    setTimeout(() => {
      setSteps([
        { id: "step-1", approverId: "DIRECT_MANAGER", label: "Initial Manager Review" },
        { id: "step-2", approverId: "FINANCE_ADMIN", label: "Financial Compliance Check" },
      ]);
      setCondition("PERCENTAGE");
      setPercentRequired(100);
      setLoading(false);
    }, 600);
  }, []);

  // Handlers for List Steps
  const addStep = () => {
    setSteps(prev => [
      ...prev, 
      { id: `step-${Date.now()}`, approverId: "DIRECT_MANAGER", label: "New Stage" }
    ]);
  };

  const removeStep = (id) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id, field, value) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Committing governance rules...',
        success: 'Master policies successfully synchronized!',
        error: 'Failed to update rules.',
      }
    ).finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
        <p className="mt-4 font-bold text-muted animate-pulse">Initializing Governance Engine...</p>
      </div>
    );
  }

  const conditionsRaw = [
    { id: "NONE", title: "Sequential Enforcement", desc: "All steps must be approved in exact order.", icon: Ban },
    { id: "PERCENTAGE", title: "Consensus Threshold", desc: "A specific percentage of reviewers must approve.", icon: Percent },
    { id: "OVERRIDE", title: "Executive Override", desc: "Specific roles can bypass the entire pipeline immediately.", icon: UserCheck },
    { id: "HYBRID", title: "Hybrid Engine", desc: "Combines threshold voting with manual overrides.", icon: Settings2 },
  ];

  return (
    <div className="animate-fade-in opacity-0 max-w-5xl mx-auto pb-32" style={{ animationDelay: "0.1s" }}>
      
      <div className="mb-10 mt-2">
         <h1 className="font-display text-4xl font-bold text-dark tracking-tight mb-2">Workspace Governance</h1>
         <p className="text-muted font-body font-semibold">Configure chronological approval sequences and conditional thresholds.</p>
      </div>

      <div className="space-y-12">
        
        {/* SECTION 1: APPROVAL SEQUENCE */}
        <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-8 lg:p-10">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                 <AlertCircle size={24} strokeWidth={2.5} />
              </div>
              <div>
                 <h2 className="font-display text-2xl font-bold text-dark">Sequential Pipeline</h2>
                 <p className="text-xs font-bold text-muted uppercase tracking-[0.1em]">Linear Approval Steps</p>
              </div>
           </div>
           
           <div className="w-full h-px bg-sand mb-8"></div>

           <div className="relative">
              {/* Central dashed line acting as the spine */}
              {steps.length > 1 && (
                <div className="absolute left-[80px] md:left-[96px] top-6 bottom-16 w-[2px] border-l-2 border-dashed border-[#E0D8CC] z-0"></div>
              )}

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6 relative z-10 w-full mb-8">
                     {steps.map((step, idx) => (
                       <SortableStep 
                          key={step.id} 
                          id={step.id} 
                          step={step} 
                          index={idx} 
                          updateStep={updateStep} 
                          removeStep={removeStep} 
                       />
                     ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              <div className="relative z-10 w-full pl-0 md:pl-[84px]">
                 <button 
                   onClick={addStep}
                   className="inline-flex items-center justify-center gap-2 bg-charcoal text-white hover:bg-dark hover:scale-105 transition-all duration-300 rounded-full px-6 py-3 font-bold text-sm shadow-[0_8px_20px_rgba(45,45,63,0.15)] focus:ring-2 focus:ring-accent"
                 >
                   <Plus size={18} strokeWidth={3} /> Inject New Stage
                 </button>
              </div>
           </div>
        </section>


        {/* SECTION 2: CONDITIONAL RULES */}
        <section className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] p-8 lg:p-10">
           <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-[1rem] bg-dark text-cream flex items-center justify-center shadow-md shadow-dark/20">
                 <Settings2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                 <h2 className="font-display text-2xl font-bold text-dark">Conditional Exemptions</h2>
                 <p className="text-xs font-bold text-muted uppercase tracking-[0.1em]">Dynamic Threshold Engine</p>
              </div>
           </div>

           <div className="w-full h-px bg-sand mb-8"></div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {conditionsRaw.map(cond => {
                 const isSelected = condition === cond.id;
                 const TargetIcon = cond.icon;
                 
                 return (
                   <button 
                     key={cond.id}
                     onClick={() => setCondition(cond.id)}
                     className={`text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 relative overflow-hidden group ${
                       isSelected 
                          ? "bg-dark border-dark shadow-[0_12px_30px_rgba(26,26,46,0.15)] -translate-y-1" 
                          : "bg-gray-50/50 border-sand hover:bg-white hover:border-[#E0D8CC] shadow-sm"
                     }`}
                   >
                     {/* Check icon indicator */}
                     <div className={`absolute top-6 right-6 transition-opacity duration-300 text-accent ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
                        <CheckCircle2 size={24} strokeWidth={2.5} className="fill-white" />
                     </div>

                     <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center mb-5 border transition-colors ${
                       isSelected ? "bg-charcoal text-accent border-charcoal/50" : "bg-white text-dark border-[#E0D8CC]"
                     }`}>
                        <TargetIcon size={22} strokeWidth={2.5} />
                     </div>
                     
                     <h3 className={`font-display text-xl font-bold mb-2 tracking-tight ${isSelected ? "text-cream" : "text-dark"}`}>{cond.title}</h3>
                     <p className={`font-body text-sm font-semibold max-w-[240px] leading-relaxed ${isSelected ? "text-sand/80" : "text-muted"}`}>{cond.desc}</p>
                   </button>
                 );
              })}
           </div>

           {/* Dynamic Parameter Settings based on selection */}
           <div className={`bg-sand/30 rounded-2xl p-6 sm:p-8 border border-sand transition-all overflow-hidden ${condition === "NONE" ? "hidden" : "block"}`}>
               <h4 className="font-body font-bold text-sm tracking-widest text-charcoal uppercase mb-6 flex items-baseline gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block pb-1"></span> Parameter Configurator
               </h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(condition === "PERCENTAGE" || condition === "HYBRID") && (
                     <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <label className="text-sm font-bold text-dark">Consensus Requirement</label>
                          <span className="text-xl font-display font-bold text-accent">{percentRequired}%</span>
                        </div>
                        <input 
                          type="range"
                          min="1"
                          max="100"
                          value={percentRequired}
                          onChange={(e) => setPercentRequired(e.target.value)}
                          className="w-full accent-accent h-2 bg-white rounded-lg appearance-none cursor-pointer border border-[#E0D8CC]"
                        />
                        <p className="text-xs font-semibold text-muted leading-relaxed">System will auto-approve once aggregate reviewer votes breach this dynamic threshold limit.</p>
                     </div>
                  )}

                  {(condition === "OVERRIDE" || condition === "HYBRID") && (
                     <div className="space-y-4">
                        <label className="block text-sm font-bold text-dark mb-2">Executive Bypass Identity</label>
                        <select
                          value={autoApprover}
                          onChange={(e) => setAutoApprover(e.target.value)}
                          className="w-full bg-white border border-[#E0D8CC] rounded-xl px-5 py-3.5 font-bold text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer shadow-sm"
                        >
                          <option value="CEO">Chief Executive Officer (CEO)</option>
                          <option value="CFO">Chief Financial Officer (CFO)</option>
                          <option value="DEPARTMENT_HEAD">Specific Department Head</option>
                        </select>
                        <p className="text-xs font-semibold text-muted leading-relaxed">If this identified role executes an approval, all pending sequential steps are immediately collapsed and resolved.</p>
                     </div>
                  )}
               </div>
           </div>

        </section>
      </div>

      {/* FULL WIDTH STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 sm:left-[260px] bg-dark/95 backdrop-blur-xl border-t border-charcoal p-4 z-50 flex justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
         <button 
           onClick={handleSave}
           disabled={saving}
           className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 py-4 bg-accent hover:bg-[#b07a4a] text-white font-bold font-body text-base rounded-[1.25rem] shadow-lg hover:shadow-accent/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:transform-none uppercase tracking-widest"
         >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><Save size={20} /> Commit System Configuration</>
            )}
         </button>
      </div>

    </div>
  );
}
