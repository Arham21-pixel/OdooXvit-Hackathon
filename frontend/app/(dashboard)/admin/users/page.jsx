"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Plus, Trash2, X, Shield, Lock, ChevronDown, CheckCircle, Mail, Briefcase } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  
  // Add User Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    managerId: "",
    isApprover: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        const mappedUsers = res.data.map(u => ({
          ...u,
          role: u.role.toUpperCase(),
          managerId: u.manager_id,
          reportsTo: u.manager_id ? 'Assigned' : null, // Would ideally look up manager name
          isApprover: u.is_manager_approver
        }));
        setUsers(mappedUsers);
      } catch (error) {
        setUsers([]);
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all core user fields.");
      return;
    }

    const payload = {
      ...formData,
      role: formData.role.toLowerCase(),
      manager_id: formData.managerId || null,
      is_manager_approver: formData.isApprover,
    };

    setSaving(true);
    toast.promise(
      api.post("/users", payload),
      {
        loading: 'Provisioning new identity...',
        success: 'Team member successfully established!',
        error: 'Failed to create user.',
      }
    ).then(() => {
      // Mock local success
      setUsers(prev => [
         { 
           id: Date.now(), 
           name: formData.name, 
           email: formData.email, 
           role: formData.role, 
           reportsTo: formData.managerId ? users.find(u => u.id == formData.managerId)?.name : null,
           isApprover: formData.isApprover 
         },
         ...prev
      ]);
      setAddPanelOpen(false);
      setFormData({ name: "", email: "", password: "", role: "EMPLOYEE", managerId: "", isApprover: false });
    }).finally(() => {
      setSaving(false);
    });
  };

  const getRoleColor = (role) => {
    if (role === "ADMIN") return "bg-dark text-cream shadow-dark/20 border-charcoal";
    if (role === "MANAGER") return "bg-accent text-white shadow-accent/20 border-accent/80";
    return "bg-sand text-charcoal shadow-[#E0D8CC] border-[#E0D8CC]";
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-accent border-r-transparent animate-spin"></div>
        <p className="mt-4 font-bold text-muted animate-pulse">Syncing User Directory...</p>
      </div>
    );
  }

  const managerOptions = users.filter(u => u.role === "MANAGER" || u.role === "ADMIN");

  return (
    <div className="animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 mt-2">
         <div>
            <h1 className="font-display text-4xl font-bold text-dark tracking-tight mb-2">Team Members</h1>
            <p className="text-muted font-body font-semibold">Manage workspace identities and role assignments.</p>
         </div>
         
         <button 
           onClick={() => setAddPanelOpen(true)}
           className="inline-flex items-center justify-center gap-2 bg-dark text-cream font-bold font-body px-6 py-3.5 rounded-full hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-lg transition-all"
         >
           <Plus size={18} strokeWidth={3} /> Add Member
         </button>
      </div>

      {/* USER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, idx) => {
          const avatarColors = getRoleColor(user.role);
          
          return (
             <div 
               key={user.id} 
               className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-[#E0D8CC] flex flex-col hover:-translate-y-1 transition-transform duration-300 group animate-fade-in opacity-0"
               style={{ animationDelay: `${0.15 + (idx * 0.05)}s` }}
             >
                <div className="flex items-start justify-between mb-4">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl shadow-inner border ${avatarColors} group-hover:scale-110 transition-transform`}>
                     {user.name.charAt(0)}
                   </div>
                   <button className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
                
                <h3 className="font-display text-2xl font-bold text-dark tracking-tight line-clamp-1 mb-1">{user.name}</h3>
                
                <p className="text-sm font-semibold text-muted font-body flex items-center gap-1.5 mb-5 truncate pb-1">
                   <Mail size={12} /> {user.email}
                </p>

                <div className="w-full h-px bg-sand/50 mb-4"></div>

                <div className="flex items-center justify-between mb-4">
                   <span className="text-xs uppercase tracking-widest font-bold text-charcoal opacity-50 font-body">Current Role</span>
                   <Badge role={user.role} />
                </div>
                
                {user.reportsTo && (
                  <div className="flex items-center justify-between mb-1 mt-auto">
                     <span className="text-xs uppercase tracking-widest font-bold text-charcoal opacity-50 font-body">Reports To</span>
                     <span className="text-sm font-bold text-dark font-body bg-sand/40 px-2 py-0.5 rounded-md truncate max-w-[120px]">{user.reportsTo}</span>
                  </div>
                )}
                
                {!user.reportsTo && user.isApprover && (
                  <div className="mt-auto flex justify-end">
                     <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-success border border-success/20 bg-success/10 px-2 py-0.5 rounded-md">
                        <CheckCircle size={10} /> Approver Active
                     </span>
                  </div>
                )}
             </div>
          );
        })}
      </div>

      {/* RIGHT SIDEBAR ADD USER MODAL */}
      <div 
         className={`fixed inset-0 z-[100] bg-dark/20 backdrop-blur-sm transition-opacity duration-300 ${addPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
         onClick={(e) => { if (e.target === e.currentTarget) setAddPanelOpen(false); }}
      >
         <div className={`absolute top-0 right-0 h-full w-full sm:w-[500px] bg-cream shadow-[-20px_0_50px_rgba(0,0,0,0.1)] transform transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] overflow-y-auto flex flex-col ${addPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
            
            <div className="p-8 border-b border-sand flex items-center justify-between sticky top-0 bg-cream/90 backdrop-blur-md z-10">
               <div>
                  <h2 className="font-display text-3xl font-bold text-dark tracking-tight">Add Team Member</h2>
                  <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Provision a new workspace identity</p>
               </div>
               <button onClick={() => setAddPanelOpen(false)} className="p-2 rounded-full bg-sand text-dark hover:bg-[#E0D8CC] transition-colors hover:rotate-90">
                  <X size={20} />
               </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-8 flex-1 flex flex-col gap-8">
               
               <div className="space-y-5">
                  <Input 
                    label="Full Legal Name"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />

                  <Input 
                    label="Corporate Email Address"
                    name="email"
                    type="email"
                    required
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />

                  <div className="relative">
                    <Input 
                      label="Initial Vault Password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                    <Lock size={16} className="absolute right-5 top-[2.4rem] text-muted pointer-events-none" />
                  </div>
               </div>

               <div className="w-full h-px bg-[#E0D8CC]"></div>

               <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl text-dark flex items-center gap-2"><Shield size={20} className="text-accent" /> Role & Permissions</h3>
                  
                  <div className="flex flex-col gap-2">
                     <label className="text-xs font-bold font-body text-charcoal uppercase tracking-widest px-1">Access Level</label>
                     <div className="relative">
                        <select
                          className="w-full px-5 py-4 rounded-[1.25rem] bg-white border border-[#E0D8CC] font-bold text-dark font-body appearance-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 cursor-pointer shadow-sm"
                          value={formData.role}
                          onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value, managerId: e.target.value === "ADMIN" ? "" : prev.managerId }))}
                        >
                          <option value="EMPLOYEE">Standard Employee</option>
                          <option value="MANAGER">Manager / Department Head</option>
                          <option value="ADMIN">System Administrator</option>
                        </select>
                        <ChevronDown size={18} className="absolute right-5 top-[1.2rem] text-muted pointer-events-none" />
                     </div>
                  </div>

                  {formData.role === "EMPLOYEE" && (
                     <div className="flex flex-col gap-2 animate-fade-in opacity-0" style={{ animationDelay: "0.1s" }}>
                       <label className="text-xs font-bold font-body text-charcoal uppercase tracking-widest px-1">Assigned Manager</label>
                       <div className="relative">
                          <select
                            className="w-full px-5 py-4 rounded-[1.25rem] bg-white border border-[#E0D8CC] font-bold text-dark font-body appearance-none focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 shadow-sm"
                            value={formData.managerId}
                            onChange={(e) => setFormData(prev => ({ ...prev, managerId: e.target.value }))}
                          >
                            <option value="">Select a manager...</option>
                            {managerOptions.map(m => (
                              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                            ))}
                          </select>
                          <ChevronDown size={18} className="absolute right-5 top-[1.2rem] text-muted pointer-events-none" />
                       </div>
                     </div>
                  )}

                  <div className="bg-sand/30 border border-sand rounded-2xl p-5 flex items-center justify-between mt-2 hover:bg-white hover:border-[#E0D8CC] transition-colors group cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isApprover: !prev.isApprover }))}>
                     <div>
                        <p className="font-bold text-dark font-display text-lg tracking-tight mb-0.5">Approval Authority</p>
                        <p className="text-xs font-semibold text-muted font-body max-w-[200px]">Can this user process and approve team expenses?</p>
                     </div>
                     
                     {/* Custom elegant toggle switch */}
                     <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${formData.isApprover ? "bg-success" : "bg-muted"}`}>
                        <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${formData.isApprover ? "translate-x-6" : "translate-x-0"}`}></div>
                     </div>
                  </div>

               </div>

               <div className="mt-auto pt-6 border-t border-[#E0D8CC]">
                 <Button type="submit" isLoading={saving} className="w-full py-4 text-base shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
                    Provision Member
                 </Button>
               </div>
               
            </form>
         </div>
      </div>

    </div>
  );
}
