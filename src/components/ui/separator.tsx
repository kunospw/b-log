import React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export function Separator({ 
  className = "", 
  orientation = "horizontal",
  ...props 
}: SeparatorProps) {
  return (
    <div
      className={
        orientation === "horizontal"
          ? `h-px w-full bg-gray-200 ${className}`
          : `h-full w-px bg-gray-200 ${className}`
      }
      {...props}
    />
  );
}

