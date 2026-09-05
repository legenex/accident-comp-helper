import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { photo } from "@/lib/siteImages";

/**
 * Full-bleed photographic backdrop for the hero.
 *
 * Three things are happening on top of each other:
 *   1. A slow cross-fade between frames (8s hold, 1.6s dissolve).
 *   2. A Ken Burns drift on whichever frame is currently visible.
 *   3. A pointer parallax that shifts the whole photo layer a few px.
 *
 * All three are switched off when the visitor prefers reduced motion,
 * which leaves a single sharp still image.
 */
export default function HeroBackdrop({ slides = [], interval = 8000 }) {
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(() => slides.map(() => false));
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [reduce, slides.length, interval]);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      setOffset({ x: x * -18, y: y * -12 });
    };
    const onLeave = () => setOffset({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  const markLoaded = (i) =>
    setLoaded((prev) => {
      if (prev[i]) return prev;
      const next = [...prev];
      next[i] = true;
      return next;
    });

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden bg-navy">
      {/* photo layer */}
      <div
        className="absolute inset-[-3%] transition-transform ease-out will-change-transform [transition-duration:900ms]"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        {slides.map((s, i) => (
          <img
            key={s.id}
            src={photo(s.id, { w: 2000, q: 68 })}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchpriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
            onLoad={() => markLoaded(i)}
            className={[
              "absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out [transition-duration:1600ms]",
              i === active && loaded[i] ? "opacity-100" : "opacity-0",
              !reduce && i === active ? "animate-ken-burns" : "",
            ].join(" ")}
            style={{ objectPosition: s.focus || "50% 50%" }}
          />
        ))}
      </div>

      {/* navy duotone so the photo reads as atmosphere, never as a claim */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(97deg, rgba(28,44,59,0.97) 0%, rgba(28,44,59,0.93) 30%, rgba(28,44,59,0.72) 56%, rgba(28,44,59,0.42) 78%, rgba(28,44,59,0.30) 100%)",
        }}
      />
      <div
        className="absolute inset-0 mix-blend-soft-light"
        style={{ background: "linear-gradient(120deg, rgba(2,140,201,0.55), transparent 62%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(28,44,59,0.9))" }}
      />

      {/* frame indicators */}
      {slides.length > 1 && !reduce && (
        <div className="pointer-events-auto absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2 lg:left-auto lg:right-8 lg:translate-x-0">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={[
                "h-1.5 rounded-full transition-all duration-500",
                i === active ? "w-7 bg-white/85" : "w-1.5 bg-white/35 hover:bg-white/60",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
