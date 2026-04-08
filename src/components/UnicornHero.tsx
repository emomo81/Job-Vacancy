"use client";
import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

export default function UnicornHero() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Hide "Made with Spline" watermark */}
      <style>{`
        #logo { display: none !important; }
        spline-viewer::part(logo) { display: none !important; }
      `}</style>
      <Spline
        scene="https://prod.spline.design/VLQqZjb4VXENT2oA/scene.splinecode"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
