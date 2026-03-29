"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LETTERS = ["E", "x", "p", "e", "n", "z", "a"];

/**
 * Expenza Landing Page - Solid & Stunning
 * We use a robust rendering method: Solid color base with a CSS animated 
 * overlay or simple solid shimmer to ensure visibility across all browsers.
 */
export default function LandingPage() {
  const router = useRouter();
  const pageRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Custom cursor logic
    const cursor = (e) => {
      const dot = document.getElementById("ez-dot");
      const ring = document.getElementById("ez-ring");
      if (!dot || !ring) return;
      
      const x = e.clientX;
      const y = e.clientY;
      
      dot.style.transform = `translate(${x - 6}px, ${y - 6}px)`;
      // Fast cursor for dot, delayed for ring via CSS transition
      ring.style.transform = `translate(${x - 30}px, ${y - 30}px)`;
    };

    if (window.matchMedia("(hover: hover)").matches) {
      window.addEventListener("mousemove", cursor);
    }
    
    return () => window.removeEventListener("mousemove", cursor);
  }, []);

  const handleEnter = () => {
    if (pageRef.current) {
      pageRef.current.style.opacity = "0";
      setTimeout(() => router.push("/login"), 600);
    }
  };

  if (!mounted) return <div style={{ backgroundColor: "#0A0A0F", height: "100vh" }} />;

  return (
    <div
      ref={pageRef}
      onClick={handleEnter}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#0A0A0F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "none",
        transition: "opacity 0.6s ease",
        zIndex: 9999
      }}
    >
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@400;500&display=swap');

        /* Background animated gradient */
        @keyframes meshShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .bg-animated {
          background: linear-gradient(135deg, #0A0A0F 0%, #0D1117 30%, #111827 60%, #160F05 100%);
          background-size: 400% 400%;
          animation: meshShift 8s ease infinite;
          position: absolute;
          inset: 0;
          z-index: -2;
        }

        /* Subtle grid */
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          z-index: -1;
        }

        /* Entrance animation for letters */
        @keyframes letterIn {
          0% { transform: translateY(30px); opacity: 0; filter: blur(10px); }
          100% { transform: translateY(0); opacity: 1; filter: blur(0); }
        }

        .letter {
          display: inline-block;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-style: italic;
          font-size: clamp(80px, 16vw, 180px);
          color: #FAF7F2;
          line-height: 1;
          opacity: 0;
          animation: letterIn 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          text-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* Shimmer effect - separate overlay simulation */
        @keyframes shimmerMove {
          0% { opacity: 0.3; transform: translateX(-100%); }
          50% { opacity: 1; }
          100% { opacity: 0.3; transform: translateX(100%); }
        }
        .wordmark-container {
          position: relative;
          display: flex;
          overflow: visible;
        }

        /* Subtle glow pulse */
        @keyframes glowPulse {
          0% { filter: drop-shadow(0 0 10px rgba(200, 149, 108, 0.1)); }
          100% { filter: drop-shadow(0 0 40px rgba(200, 149, 108, 0.4)); }
        }
        .glow-pulse {
          animation: glowPulse 2s ease-in-out infinite alternate;
        }

        /* Cursor styles */
        #ez-dot {
          position: fixed; top: 0; left: 0; width: 12px; height: 12px;
          background-color: #C8956C; border-radius: 50%;
          pointer-events: none; z-index: 10000;
        }
        #ez-ring {
          position: fixed; top: 0; left: 0; width: 60px; height: 60px;
          border: 1px solid rgba(200, 149, 108, 0.4); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transition: transform 0.15s ease-out, width 0.3s, height 0.3s;
        }

        /* Hint animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hint {
          margin-top: 60px;
          opacity: 0;
          animation: fadeIn 1s ease 2.5s forwards;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        /* Corner accents */
        .corner {
          position: absolute; width: 40px; height: 40px;
          border-color: rgba(200, 149, 108, 0.3); border-style: solid;
          opacity: 0; animation: fadeIn 0.8s ease 1.8s forwards;
        }

        @media (max-width: 768px) {
          #ez-dot, #ez-ring { display: none; }
          .letter { font-size: 80px; }
        }
      `}</style>

      {/* Decorative Orbs */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(200, 149, 108, 0.05) 0%, transparent 70%)", filter: "blur(80px)", zIndex: -1 }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(30, 58, 95, 0.08) 0%, transparent 70%)", filter: "blur(80px)", zIndex: -1 }} />

      <div className="bg-animated" />
      <div className="bg-grid" />

      {/* Corners */}
      <div className="corner" style={{ top: 40, left: 40, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <div className="corner" style={{ bottom: 40, right: 40, borderBottomWidth: 1, borderRightWidth: 1 }} />

      {/* Main Content */}
      <div className="wordmark-container glow-pulse">
        {LETTERS.map((l, i) => (
          <span
            key={i}
            className="letter"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="hint">
        <div style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, transparent, #C8956C, transparent)" }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(250,247,242,0.4)" }}>
          enter
        </span>
      </div>

      {/* Custom Cursor */}
      <div id="ez-dot" />
      <div id="ez-ring" />
    </div>
  );
}
