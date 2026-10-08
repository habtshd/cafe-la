import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Web Audio API realistic mechanical pull-chain switch click synthesizer
function playPullChainClick(isTurningOn: boolean) {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const t = ctx.currentTime;

    // 1. Initial mechanical spring catch (sharp micro-click)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(isTurningOn ? 2400 : 1900, t);
    osc1.frequency.exponentialRampToValueAtTime(350, t + 0.035);
    gain1.gain.setValueAtTime(0.22, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.035);

    // 2. Heavy brass contact latch snap (12ms later)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(isTurningOn ? 3600 : 2800, t + 0.012);
    osc2.frequency.exponentialRampToValueAtTime(750, t + 0.055);
    gain2.gain.setValueAtTime(0.3, t + 0.012);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.012);
    osc2.stop(t + 0.06);
  } catch {
    // Graceful fallback if audio context is blocked
  }
}

export function ModernLightSwitch({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  const [pullY, setPullY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpringing, setIsSpringing] = useState(false);
  const dragStartY = useRef(0);
  const currentY = useRef(0);

  // Trigger the switch pull action
  const triggerSwitch = useCallback(() => {
    playPullChainClick(!isDark);
    toggle();
    // Elastic spring bounce
    setIsSpringing(true);
    setPullY(28);
    setTimeout(() => {
      setPullY(-5);
      setTimeout(() => {
        setPullY(2);
        setTimeout(() => {
          setPullY(0);
          setIsSpringing(false);
        }, 80);
      }, 100);
    }, 120);
  }, [isDark, toggle]);

  // Pointer drag handling for physical pull
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartY.current = e.clientY;
    currentY.current = 0;
    setIsDragging(true);
    setIsSpringing(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = Math.max(0, Math.min(36, (e.clientY - dragStartY.current) * 0.9));
    currentY.current = dy;
    setPullY(dy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore capture release error
    }
    setIsDragging(false);
    if (currentY.current >= 14) {
      triggerSwitch();
    } else {
      // Spring back without switching
      setIsSpringing(true);
      setPullY(0);
      setTimeout(() => setIsSpringing(false), 200);
    }
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerSwitch();
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center select-none pointer-events-auto",
        className
      )}
      style={{ width: 180, height: 260 }}
    >
      {/* 1. Volumetric Warm Lighting Beam (Illuminates downward in Dark Mode) */}
      <div
        className={cn(
          "pointer-events-none absolute top-[115px] left-1/2 -translate-x-1/2 w-[340px] h-[360px] transition-opacity duration-700 ease-out z-0",
          isDark ? "opacity-100" : "opacity-0"
        )}
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 145deg, rgba(255, 210, 100, 0.28) 165deg, rgba(255, 185, 60, 0.35) 180deg, rgba(255, 210, 100, 0.28) 195deg, transparent 215deg)",
          filter: "blur(18px)",
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute top-[135px] left-1/2 -translate-x-1/2 w-[280px] h-[300px] transition-opacity duration-700 ease-out z-0",
          isDark ? "opacity-90" : "opacity-0"
        )}
        style={{
          background:
            "radial-gradient(ellipse 65% 85% at 50% 0%, rgba(255, 225, 120, 0.35) 0%, rgba(255, 175, 40, 0.12) 50%, transparent 80%)",
          filter: "blur(22px)",
        }}
      />

      {/* 2. Photorealistic SVG Hanging Lamp Fixture */}
      <svg
        viewBox="0 0 180 260"
        className="w-[180px] h-[260px] overflow-visible drop-shadow-md z-10"
        aria-hidden="true"
      >
        <defs>
          {/* Metallic Antique Brass Gradient */}
          <linearGradient id="brass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A6318" />
            <stop offset="25%" stopColor="#E6BA54" />
            <stop offset="50%" stopColor="#FFECA0" />
            <stop offset="75%" stopColor="#C9972E" />
            <stop offset="100%" stopColor="#6E4D10" />
          </linearGradient>

          {/* Polished Brass Specular Gradient */}
          <linearGradient id="brass-bead" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B8" />
            <stop offset="35%" stopColor="#E2B144" />
            <stop offset="70%" stopColor="#9C701B" />
            <stop offset="100%" stopColor="#543A08" />
          </linearGradient>

          {/* Crisp Pure White Enamel Outer Shade Gradient */}
          <linearGradient id="shade-outer-white" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ECE8E1" />
            <stop offset="25%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F9F7F4" />
            <stop offset="85%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2DDD4" />
          </linearGradient>

          {/* Reflector Inner Shade Gradient */}
          <radialGradient id="reflector-inner" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#FFE8A3" />
            <stop offset="80%" stopColor="#D99E26" />
            <stop offset="100%" stopColor="#7A530E" />
          </radialGradient>

          {/* Glowing Incandescent Bulb Core Glow Filter */}
          <filter id="bulb-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ceiling Canopy Mount */}
        <ellipse cx="90" cy="4" rx="16" ry="3.5" fill="url(#brass-grad)" />
        <rect x="88.5" y="4" width="3" height="4" fill="url(#brass-grad)" />

        {/* Braided White Fabric Cable */}
        <line
          x1="90"
          y1="8"
          x2="90"
          y2="66"
          stroke="#EAE6DF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Subtle cord highlight weave */}
        <line
          x1="89.5"
          y1="8"
          x2="89.5"
          y2="66"
          stroke="#FFFFFF"
          strokeWidth="0.8"
        />

        {/* Turned Brass Fixture Socket */}
        <rect x="84" y="66" width="12" height="12" rx="1.5" fill="url(#brass-grad)" />
        {/* Knurled socket ring detail */}
        <line x1="84" y1="71" x2="96" y2="71" stroke="#543A08" strokeWidth="0.8" />
        <line x1="84" y1="73" x2="96" y2="73" stroke="#FFF2B8" strokeWidth="0.8" />

        {/* Conical Lamp Shade - Crisp Pure White Enamel */}
        <path
          d="M 64 78 C 64 78, 76 77, 90 77 C 104 77, 116 78, 116 78 L 146 116 C 146 119, 34 119, 34 116 Z"
          fill="url(#shade-outer-white)"
          stroke="#D2CBBC"
          strokeWidth="1.2"
        />

        {/* Spun Brass Shade Rim Lip */}
        <ellipse cx="90" cy="116" rx="56" ry="6.5" fill="url(#brass-grad)" />

        {/* Inner Reflector Cavity */}
        <ellipse
          cx="90"
          cy="115.5"
          rx="53.5"
          ry="5.5"
          fill="url(#reflector-inner)"
          opacity={isDark ? 0.95 : 0.6}
        />

        {/* Exposed Opal Pearl Edison Bulb */}
        <g className="transition-all duration-500">
          {/* Bulb Glow Halo (When ON) */}
          {isDark && (
            <circle
              cx="90"
              cy="134"
              r="22"
              fill="rgba(255, 235, 170, 0.55)"
              filter="url(#bulb-glow)"
            />
          )}

          {/* Hand-Blown White Opal Pearl Glass Envelope */}
          <path
            d="M 81 116 C 80 123, 76 128, 77 136 C 78 144, 84 148, 90 148 C 96 148, 102 144, 103 136 C 104 128, 100 123, 99 116 Z"
            fill={
              isDark
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.88)"
            }
            stroke={isDark ? "#FFE082" : "rgba(255, 255, 255, 0.8)"}
            strokeWidth="1.2"
          />

          {/* Internal Tungsten Filament Coils */}
          {isDark ? (
            // Illuminated Tungsten Coil (Brilliant Warm Light)
            <g filter="url(#bulb-glow)">
              <line x1="88" y1="120" x2="88" y2="128" stroke="#FFE79A" strokeWidth="1.2" />
              <line x1="92" y1="120" x2="92" y2="128" stroke="#FFE79A" strokeWidth="1.2" />
              <path
                d="M 88 128 Q 86 136 88 142 Q 90 145 92 142 Q 94 136 92 128"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M 88 128 Q 86 136 88 142 Q 90 145 92 142 Q 94 136 92 128"
                fill="none"
                stroke="#FFAA00"
                strokeWidth="3.2"
                opacity="0.75"
              />
            </g>
          ) : (
            // Inactive Tungsten Wire (Daylight Ambient Standby)
            <g opacity="0.6">
              <line x1="88" y1="120" x2="88" y2="128" stroke="#9E7628" strokeWidth="0.8" />
              <line x1="92" y1="120" x2="92" y2="128" stroke="#9E7628" strokeWidth="0.8" />
              <path
                d="M 88 128 Q 86 136 88 142 Q 90 145 92 142 Q 94 136 92 128"
                fill="none"
                stroke="#B8860B"
                strokeWidth="1"
              />
            </g>
          )}

          {/* Glass Curved Specular Highlight Reflection */}
          <path
            d="M 79 126 C 78 132, 79 138, 82 142"
            fill="none"
            stroke="rgba(255, 255, 255, 0.75)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>

        {/* Pull Chain Socket Hole Fitting (Beside the shade) */}
        <circle cx="106" cy="116" r="2.2" fill="url(#brass-grad)" />

        {/* 3. Interactive Brass Beaded Pull Chain & Weighted Teardrop Fob */}
        <g
          style={{
            transform: `translateY(${pullY}px)`,
            transition: isSpringing
              ? "transform 0.42s cubic-bezier(0.34, 1.65, 0.64, 1)"
              : isDragging
              ? "none"
              : "transform 0.2s ease-out",
          }}
        >
          {/* Linked Brass Ball Chain */}
          {[120, 126, 132, 138, 144, 150, 156, 162, 168, 174, 180, 186, 192].map((y) => (
            <g key={y}>
              <line x1="106" y1={y - 3} x2="106" y2={y + 3} stroke="#6E4D10" strokeWidth="0.8" />
              <circle cx="106" cy={y} r="1.8" fill="url(#brass-bead)" />
            </g>
          ))}

          {/* Turned Brass Teardrop Pull Handle / Fob */}
          <g>
            <path
              d="M 103.5 197 C 103.5 194, 108.5 194, 108.5 197 L 109.5 210 C 109.5 215, 102.5 215, 102.5 210 Z"
              fill="url(#brass-grad)"
              stroke="#543A08"
              strokeWidth="0.8"
            />
            {/* Highlight rib on fob */}
            <ellipse cx="106" cy="209" rx="3.5" ry="1.2" fill="#FFECA0" opacity="0.8" />
          </g>
        </g>
      </svg>

      {/* 4. Touch & Drag Hit-Area Box for the Pull String */}
      <div
        className={cn(
          "absolute top-[116px] left-[96px] w-[36px] h-[115px] z-20 cursor-grab active:cursor-grabbing group/string touch-none select-none",
          isDragging && "cursor-grabbing"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          // If clicked without dragging
          if (Math.abs(currentY.current) < 5) {
            triggerSwitch();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={isDark ? "Pull string to switch to daylight mode" : "Pull string to switch to nocturnal bistro mode"}
        onKeyDown={handleKeyDown}
        title="Pull string to switch mode"
      >
        {/* Subtle glowing cue on hover */}
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full transition-opacity duration-300 pointer-events-none opacity-0 group-hover/string:opacity-100",
            isDark ? "bg-amber-400/20 blur-sm" : "bg-black/10 blur-sm"
          )}
        />
      </div>
    </div>
  );
}
