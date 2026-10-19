import { useEffect, useRef } from "react";

export function PointerEffects() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    const dot = dotRef.current;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      if (dot) {
        dot.style.opacity = "1";
        dot.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        const target = event.target as HTMLElement | null;
        const interactive = Boolean(
          target?.closest("button, a, [role='button']"),
        );
        dot.classList.toggle("is-hover", interactive);
      }

      const nx = Math.min(1, Math.max(-1, (event.clientX / window.innerWidth) * 2 - 1));
      const ny = Math.min(1, Math.max(-1, (event.clientY / window.innerHeight) * 2 - 1));
      root.style.setProperty("--look-x", nx.toFixed(2));
      root.style.setProperty("--look-y", ny.toFixed(2));

      const vector = document.getElementById("mouseVector");
      if (vector) {
        const sx = nx >= 0 ? "+" : "";
        const sy = ny >= 0 ? "+" : "";
        vector.textContent = `${sx}${Math.round(nx * 99)} / ${sy}${Math.round(ny * 99)}`;
      }
    };

    const onPointerLeave = () => {
      if (dot) dot.style.opacity = "0";
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);
    document.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
      document.removeEventListener("mouseleave", onPointerLeave);
      root.style.removeProperty("--look-x");
      root.style.removeProperty("--look-y");
    };
  }, []);

  return <div className="cursor-dot" id="cursorDot" ref={dotRef} aria-hidden="true" />;
}
