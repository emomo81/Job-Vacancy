"use client";
import { GodRays } from "@paper-design/shaders-react";
import { useEffect, useRef, useState } from "react";

export default function UnicornHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full overflow-hidden">
      <GodRays
        colorBack="#0A0A0F"
        colors={["#1d4ed840", "#2563eb30", "#0A0A0F", "#1e3a8a20"]}
        colorBloom="#2563eb"
        offsetX={0.75}
        offsetY={-0.8}
        intensity={0.55}
        spotty={0.4}
        midSize={8}
        midIntensity={0}
        density={0.35}
        bloom={0.25}
        speed={active ? 0.4 : 0}
        scale={1.5}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      />
    </div>
  );
}
