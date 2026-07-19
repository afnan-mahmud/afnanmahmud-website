// Verbatim copy of the flagship page's <style> contents (app/ai-for-developers/page.tsx
// lines 28-80): animations, glass-panel, neon borders, modal keyframes — so segment
// pages render identically without importing from the flagship page module.
export const SEGMENT_GLOBAL_STYLES = `
  html {
    scroll-behavior: smooth;
    background-color: #020617; /* slate-950 */
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes pulseGlow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
  }
  @keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  .animate-float-delayed {
    animation: float-delayed 7s ease-in-out infinite;
  }
  .animate-pulse-glow {
    animation: pulseGlow 5s ease-in-out infinite;
  }
  .animate-marquee {
    animation: marquee 25s linear infinite;
  }
  .neon-border {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3), inset 0 0 10px rgba(99, 102, 241, 0.1);
  }
  .neon-border-pink {
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.1);
  }
  .glass-panel {
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes modalSlideIn {
    from { opacity: 0; transform: translateY(16px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;
