import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind class combiner */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number with thin space as thousands separator (neutral locale look) */
export function formatNumber(n: number) {
  return n.toLocaleString(undefined);
}
