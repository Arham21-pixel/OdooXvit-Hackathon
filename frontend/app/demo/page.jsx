"use client";

import { useEffect, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLES } from "@/lib/constants";

function DemoPatcher() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    let timeoutId;
    const role = searchParams.get('role');
    
    // Inject mock credentials strictly for demonstration and bypass the API
    if (role && ["ADMIN", "MANAGER", "EMPLOYEE"].includes(role)) {
       // Replicate Backend JWT Structure specifically enforcing Base64Url (safe for jwtDecode)
       const headerStr = JSON.stringify({ alg: "HS256", typ: "JWT" });
       const payloadStr = JSON.stringify({ 
         id: `dev-${role}`, 
         name: `${role.charAt(0) + role.slice(1).toLowerCase()} Persona`, 
         email: "demo@company.com", 
         role: role 
       });
       
       const toSafeB64 = (str) => btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
       const fakeToken = `${toSafeB64(headerStr)}.${toSafeB64(payloadStr)}.mock_signature`;
       
       login(fakeToken);
       
       timeoutId = setTimeout(() => {
         if (role === "ADMIN") router.push("/admin");
         else if (role === "MANAGER") router.push("/manager");
         else router.push("/employee");
       }, 800);
    } else {
        router.push("/login");
    }
    
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
       <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4 shadow-lg"></div>
       <p className="font-bold text-gray-500 animate-pulse text-lg">Injecting Demo Context...</p>
    </div>
  );
}

export default function DemoInterception() {
   return (
      <Suspense fallback={<div>Loading router...</div>}>
         <DemoPatcher />
      </Suspense>
   );
}
