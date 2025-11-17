import React from "react";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "info";
}

const variantStyles = {
  default: "bg-gray-50 text-gray-900 border-gray-200",
  destructive: "bg-red-50 text-red-900 border-red-200",
  success: "bg-green-50 text-green-900 border-green-200",
  info: "bg-blue-50 text-blue-900 border-blue-200",
};

const iconMap = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  info: Info,
};

export function Alert({ className = "", variant = "default", children, ...props }: AlertProps) {
  const Icon = iconMap[variant];

  return (
    <div
      className={`flex items-start gap-3 rounded-md border p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
}

export function AlertTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={`mb-1 font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = "", children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm ${className}`} {...props}>
      {children}
    </p>
  );
}

