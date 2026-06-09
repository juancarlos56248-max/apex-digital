import { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 70;

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    // Only activate if scrolled to top
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling.current || startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      e.preventDefault();
      setPullY(Math.min(delta * 0.5, THRESHOLD + 20));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    startY.current = null;
    if (pullY >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPullY(0);
      }
    } else {
      setPullY(0);
    }
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / THRESHOLD, 1);
  const showing = pullY > 4;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-x" }}
    >
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: showing ? `${pullY}px` : 0 }}
      >
        <RefreshCw
          className={`w-5 h-5 text-gold transition-all ${refreshing ? "animate-spin" : ""}`}
          style={{ transform: `rotate(${progress * 360}deg)`, opacity: progress }}
        />
      </div>
      {children}
    </div>
  );
}