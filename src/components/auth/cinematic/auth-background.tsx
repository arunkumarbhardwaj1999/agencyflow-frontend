"use client";

const PARTICLES = [
  { top: "12%", left: "8%", size: 4, delay: 0 },
  { top: "28%", left: "85%", size: 3, delay: 2 },
  { top: "65%", left: "15%", size: 5, delay: 4 },
  { top: "78%", left: "72%", size: 3, delay: 1 },
  { top: "45%", left: "42%", size: 2, delay: 3 },
  { top: "88%", left: "35%", size: 4, delay: 5 },
  { top: "18%", left: "55%", size: 2, delay: 2.5 },
];

export function AuthBackground() {
  return (
    <div className="auth-bg-gradient pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="auth-bg-orb absolute -left-1/4 -top-1/4 h-[60%] w-[60%] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)" }}
      />
      <div
        className="auth-bg-orb absolute -bottom-1/4 -right-1/4 h-[50%] w-[50%] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.14), transparent 70%)",
          animationDelay: "-6s",
        }}
      />
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="auth-particle"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(79,70,229,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
