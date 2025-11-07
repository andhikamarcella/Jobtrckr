"use client";

import * as React from "react";

const commonProps = {
  fill: "none",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const SunIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function SunIcon(
  { className, stroke = "currentColor", ...rest },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={className}
      stroke={stroke}
      aria-hidden="true"
      {...commonProps}
      {...rest}
    >
      <circle cx="12" cy="12" r="3.25" />
      <path d="M12 5V3" />
      <path d="M12 21v-2" />
      <path d="M5 12H3" />
      <path d="M21 12h-2" />
      <path d="m18.364 5.636-1.414 1.414" />
      <path d="m7.05 16.95-1.414 1.414" />
      <path d="m5.636 5.636 1.414 1.414" />
      <path d="m16.95 16.95 1.414 1.414" />
    </svg>
  );
});

export const MoonIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(function MoonIcon(
  { className, stroke = "currentColor", ...rest },
  ref
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={className}
      stroke={stroke}
      aria-hidden="true"
      {...commonProps}
      {...rest}
    >
      <path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z" />
    </svg>
  );
});
