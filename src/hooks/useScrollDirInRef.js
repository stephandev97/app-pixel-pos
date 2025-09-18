import { useEffect, useState } from "react";

export default function useScrollDirInRef(ref, threshold = 6) {
  const [dir, setDir] = useState("up"); // 'up' | 'down'
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;
    let lastY = el.scrollTop;

    const onScroll = () => {
      const y = el.scrollTop;
      if (Math.abs(y - lastY) > threshold) {
        setDir(y > lastY ? "down" : "up");
        lastY = y;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref, threshold]);

  return dir;
}