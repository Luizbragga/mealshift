import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

type SliderProps = React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> & {
  /** aria-label para cada thumb (string ou array do mesmo tamanho do value/defaultValue) */
  thumbLabels?: string | string[];
  /** formata o aria-valuetext (ex.: v => `${v}%`) */
  valueText?: (v: number) => string;
};

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, thumbLabels, valueText, ...props }, ref) => {
  // Quantidade de thumbs = tamanho do value ou defaultValue (fallback 1)
  const values = (props.value ?? props.defaultValue ?? [0]) as number[];
  const thumbsCount = Math.max(Array.isArray(values) ? values.length : 1, 1);

  const getThumbLabel = (i: number) =>
    Array.isArray(thumbLabels)
      ? thumbLabels[i] ?? `Slider thumb ${i + 1}`
      : thumbLabels ?? "Slider thumb";

  const getValueText = (i: number) =>
    valueText ? valueText(values[i] ?? 0) : undefined;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        // vertical tweaks
        "data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-6 data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative w-full grow overflow-hidden rounded-full bg-secondary",
          "h-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2"
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "absolute h-full bg-primary",
            "data-[orientation=vertical]:w-full"
          )}
        />
      </SliderPrimitive.Track>

      {Array.from({ length: thumbsCount }).map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={getThumbLabel(i)}
          aria-valuetext={getValueText(i)}
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background",
            "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
