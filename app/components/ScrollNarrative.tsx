"use client";

import { useRef, useEffect, useState } from "react";
import Scene from "./Scene";

const LABELS   = ["FRAGMENT", "EVOLVE", "SCATTER", "CONNECT", "BEGIN"];
const SUBTEXTS = ["scroll to begin", "let it grow", "let it go", "find the pattern", ""];

export default function ScrollNarrative() {
  const scrollProgressRef = useRef(0);
  const sceneIdxRef       = useRef(0);
  const [sceneIdx, setSceneIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      scrollProgressRef.current = progress;

      // 5 equal bands: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0
      const idx = Math.min(4, Math.floor(progress * 5));
      if (idx !== sceneIdxRef.current) {
        sceneIdxRef.current = idx;
        setSceneIdx(idx);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scrollable height — gives 500vh of effective scroll distance */}
      <div style={{ height: "600vh" }} />

      {/* Fixed canvas — always covers viewport */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "#000",
        }}
      >
        <Scene scrollProgress={scrollProgressRef} />
      </div>

      {/* Fixed text overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {LABELS.map((label, i) => (
          <div
            key={label}
            style={{
              position: "absolute",
              textAlign: "center",
              opacity: sceneIdx === i ? 1 : 0,
              transform: sceneIdx === i ? "translateY(0)" : "translateY(18px)",
              transition:
                "opacity 0.85s cubic-bezier(0.16,1,0.3,1), transform 0.85s cubic-bezier(0.16,1,0.3,1)",
              pointerEvents: sceneIdx === i && i === 4 ? "auto" : "none",
            }}
          >
            <span
              style={{
                display: "block",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                fontSize: "clamp(2.8rem, 11vw, 9.5rem)",
                fontWeight: 100,
                letterSpacing: "0.45em",
                paddingLeft: "0.45em",
                color: "rgba(255,255,255,0.92)",
                textShadow:
                  "0 0 60px rgba(0,200,255,0.4), 0 0 120px rgba(0,200,255,0.15)",
                lineHeight: 1,
              }}
            >
              {label}
            </span>

            {SUBTEXTS[i] && (
              <span
                style={{
                  display: "block",
                  marginTop: "1.5rem",
                  fontFamily: "var(--font-inter), system-ui, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 300,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.22)",
                }}
              >
                {SUBTEXTS[i]}
              </span>
            )}

            {/* CTA on final state */}
            {i === 4 && (
              <div style={{ marginTop: "3.5rem" }}>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "var(--font-inter), system-ui, sans-serif",
                    fontSize: "0.65rem",
                    fontWeight: 300,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    padding: "1rem 3rem",
                    cursor: "pointer",
                    transition: "background 0.3s, color 0.3s, border-color 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    const b = e.currentTarget;
                    b.style.background = "#fff";
                    b.style.color = "#000";
                    b.style.borderColor = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    const b = e.currentTarget;
                    b.style.background = "transparent";
                    b.style.color = "rgba(255,255,255,0.7)";
                    b.style.borderColor = "rgba(255,255,255,0.25)";
                  }}
                >
                  Restart →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar — right side */}
      <div
        style={{
          position: "fixed",
          right: "2rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {LABELS.map((_, i) => (
          <div
            key={i}
            style={{
              width: "2px",
              height: i === sceneIdx ? "24px" : "6px",
              background:
                i <= sceneIdx
                  ? "rgba(255,255,255,0.75)"
                  : "rgba(255,255,255,0.15)",
              transition:
                "height 0.5s cubic-bezier(0.16,1,0.3,1), background 0.5s",
              borderRadius: "1px",
            }}
          />
        ))}
      </div>

      {/* Scroll cue */}
      <div
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
          opacity: sceneIdx === 0 ? 0.5 : 0,
          transition: "opacity 0.6s",
          pointerEvents: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <div
          style={{
            width: "1px",
            height: "40px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
          }}
        />
      </div>
    </>
  );
}
