"use client";

import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Badge from "@/components/ui/Badge";
import { 
  Briefcase, 
  FilePlus, 
  CheckCircle, 
  Users, 
  LayoutDashboard, 
  Settings, 
  Bell, 
  Menu, 
  X,
  LogOut
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent hydration errors by only rendering dashboard shell context on the client
  const [mount, setMount] = useState(false);
  useEffect(() => setMount(true), []);

  if (!mount || !user) return null;

  const NAV_LINKS = {
    [ROLES.EMPLOYEE]: [
      { name: "My Expenses", href: "/employee", icon: Briefcase },
      { name: "Submit Expense", href: "/employee/submit", icon: FilePlus },
    ],
    [ROLES.MANAGER]: [
      { name: "Pending Approvals", href: "/manager", icon: CheckCircle },
      { name: "Team Expenses", href: "/manager", icon: Users },
    ],
    [ROLES.ADMIN]: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "All Expenses", href: "/admin/expenses", icon: FilePlus }, // Using FilePlus or a similar valid lucide icon
      { name: "Manage Users", href: "/admin/users", icon: Users },
      { name: "Approval Rules", href: "/admin/rules", icon: Settings },
    ],
  };

  const links = NAV_LINKS[user.role] || [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric" 
  });

  return (
    <div className="min-h-screen bg-cream font-body flex transition-colors duration-300 selection:bg-accent selection:text-white">
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-dark/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (260px wide, fixed) Background: #1A1A2E (dark navy) */}
      <aside 
        className={`fixed top-0 left-0 h-full w-[260px] bg-dark text-cream z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top: Company logo area */}
        <div className="h-[96px] flex items-center px-8 border-b border-white/5 relative shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-[42px] h-[42px] rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20 relative shrink-0">
               <Briefcase size={20} className="text-white" />
               {/* Online green dot badge */}
               <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-dark shadow-sm"></div>
             </div>
             <div className="flex flex-col">
               <h1 className="font-display text-2xl font-bold tracking-tight text-white leading-none mb-1">Acme Corp.</h1>
               <span className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold font-body leading-none">Financial Systems</span>
             </div>
          </div>
          
          <button 
            className="lg:hidden absolute right-4 text-muted hover:text-white transition-colors bg-white/5 p-2 rounded-full" 
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-5 py-8 space-y-2 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-muted uppercase tracking-[0.15em] mb-4">Workspace Navigation</p>
          
          {links.map((link) => {
            // Simplified active checking specifically to match Next App Router root variants
            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href.length > 8);
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-white/5 text-white font-bold" 
                    : "text-muted hover:bg-white/5 hover:text-cream font-semibold"
                }`}
              >
                {/* Active link style: accent color (#C8956C) left border */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-accent rounded-r-md"></div>
                )}
                <Icon size={20} className={isActive ? "text-accent" : "text-muted group-hover:text-accent transition-colors"} />
                <span className="text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user avatar (initials circle) + name + role badge + Logout button */}
        <div className="p-5 border-t border-white/5 mb-2">
          <div className="bg-charcoal/40 rounded-[1.25rem] p-4 flex flex-col gap-4 border border-white/5 shadow-inner">
             <div className="flex items-center gap-3.5">
               <div className="w-11 h-11 rounded-full bg-sand text-charcoal flex items-center justify-center font-bold font-display text-lg shadow-sm border border-[#E0D8CC]">
                 {user.name?.charAt(0) || "U"}
               </div>
               <div className="overflow-hidden flex-1">
                 <p className="text-sm font-bold text-white truncate mb-1">{user.name}</p>
                 <Badge role={user.role} className="mt-0 border-none px-2.5 py-1 tracking-[0.15em]" />
               </div>
             </div>
             
             <button 
               onClick={handleLogout}
               className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-dark border border-white/10 hover:bg-danger/20 hover:border-danger hover:text-danger text-muted text-xs uppercase tracking-widest font-bold transition-all mt-1"
             >
               <LogOut size={14} />
               Secure Logout
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:pl-[260px] max-w-full w-full bg-cream transition-all duration-300 z-10 relative">
        
        {/* Top Navbar */}
        <header className="h-[96px] px-6 sm:px-10 flex items-center justify-between sticky top-0 bg-cream/90 backdrop-blur-xl z-30 border-b border-[#E0D8CC]/50 supports-[backdrop-filter]:bg-cream/60">
          <div className="flex items-center gap-5">
            <button 
              className="lg:hidden p-2.5 rounded-xl bg-white shadow-sm border border-sand text-dark hover:bg-sand transition-colors" 
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:block animate-fade-in opacity-0" style={{ animationDelay: '0.1s' }}>
              <h2 className="font-display text-3xl font-bold text-dark tracking-tight leading-none mb-1">
                Good morning, {(user.name || "User").split(' ')[0]}
              </h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest font-body">{dateStr}</p>
            </div>
            
            <div className="sm:hidden block">
              <h2 className="font-display text-2xl font-bold text-dark tracking-tight">Dashboard</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-5 animate-fade-in opacity-0" style={{ animationDelay: '0.2s' }}>
            <div className="hidden md:flex bg-white px-5 py-2.5 rounded-full border border-sand shadow-sm text-xs font-bold text-charcoal items-center gap-2 relative">
               <span className="w-2 h-2 rounded-full bg-success"></span>
               Cloud SYNC: ACTIVE
            </div>
            
            <button className="relative p-3 rounded-full bg-white border border-sand text-charcoal hover:bg-sand transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent group">
              <Bell size={20} className="group-hover:rotate-12 transition-transform" />
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></div>
            </button>
          </div>
        </header>

        {/* Content area with 24px padding */}
        <main className="flex-1 p-[24px] overflow-x-hidden animate-fade-in opacity-0" style={{ animationDelay: '0.3s' }}>
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
}
