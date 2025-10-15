// src/components/ui/aspect-ratio.tsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

/**
 * Radix AspectRatio wrapper to maintain a fixed ratio for its children.
 * Usage: <AspectRatio ratio={16 / 9}>...</AspectRatio>
 */
const AspectRatio = AspectRatioPrimitive.Root;

export { AspectRatio };
