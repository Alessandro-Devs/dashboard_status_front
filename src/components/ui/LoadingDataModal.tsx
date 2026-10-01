"use client";

import { useEffect, useState } from "react";

// Modal de carga del dashboard. Se muestra mientras se consultan los datos de la fecha,
// incluido el tiempo que tardan Vercel y Neon en despertar (capas gratuitas).
// Si la espera se alarga, el mensaje explica qué está pasando para que el usuario no piense
// que la aplicación se trabó.

const formatDate = (value?: string) => {
  const match = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null;
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
};

export default function LoadingDataModal({ date }: { date?: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const formatted = formatDate(date);
  const message = seconds >= 40
    ? "Seguimos intentando conectar con el servidor. Gracias por tu paciencia."
    : seconds >= 8
      ? "El servidor se está activando. Esto puede tardar unos segundos más."
      : formatted
        ? `Estamos preparando la información del ${formatted}.`
        : "Estamos preparando la información más reciente.";

  return (
    <div className="fixed inset-0 z-[1250] flex items-center justify-center bg-[#0f2a47]/35 px-4 backdrop-blur-[6px]" role="presentation">
      <style>{`
        @keyframes loading-bar { 0%, 100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
        @keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
        @keyframes loading-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .loading-anim { animation: none !important; } }
      `}</style>
      <div
        role="status"
        aria-live="polite"
        className="loading-anim w-full max-w-[280px] rounded-2xl border border-[#e1e7ef] bg-white px-6 pb-5 pt-6 text-center shadow-[0_24px_60px_rgba(15,42,71,0.22)]"
        style={{ animation: "loading-in .25s ease-out both" }}
      >
        <div className="mx-auto flex h-14 w-20 items-end justify-center gap-1.5 rounded-xl bg-[#f1f6fc] px-3 pb-3 pt-2" aria-hidden="true">
          {["#0b376c", "#187ec7", "#2fd0a8", "#187ec7", "#0b376c"].map((color, index) => (
            <span
              key={index}
              className="loading-anim h-full w-2 origin-bottom rounded-full"
              style={{ background: color, animation: `loading-bar 1.1s ease-in-out ${index * 0.12}s infinite` }}
            />
          ))}
        </div>
        <p className="mt-4 text-[13px] font-bold text-[#0f2a47]">Cargando datos</p>
        <p className="mt-1.5 min-h-[28px] text-[10px] leading-[1.45] text-[#5e7894]">{message}</p>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#e8eef5]" aria-hidden="true">
          <div className="loading-anim h-full w-2/5 rounded-full bg-gradient-to-r from-[#187ec7] to-[#2fd0a8]" style={{ animation: "loading-slide 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}
