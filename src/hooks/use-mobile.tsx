import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // modern
    if ("addEventListener" in mql) {
      (mql as MediaQueryList).addEventListener("change", onChange);
    } else if ("addListener" in mql) {
      // legacy Safari
      (mql as any).addListener(onChange);
    }

    onChange();

    return () => {
      if ("removeEventListener" in mql) {
        (mql as MediaQueryList).removeEventListener("change", onChange);
      } else if ("removeListener" in mql) {
        (mql as any).removeListener(onChange);
      }
    };
  }, []);

  return isMobile;
}
