import React, { forwardRef } from "react";
import Link from "next/link";
import { Loader2, LucideIcon } from "lucide-react";
import clsx from "clsx";

export interface PrivateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "primary" | "outline" | "ghost" | "danger" | "success";
  fullWidth?: boolean;
  href?: string;
  target?: string;
}

const sizeStyles = {
  xs: "px-2.5 py-1 text-[10px] rounded-md gap-1",
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
};

const variantStyles = {
  primary:
    "bg-[#D4561A] text-white shadow-sm hover:bg-[#C24D15] hover:shadow-md",
  outline:
    "border border-[#D4561A]/30 text-[#D4561A] bg-transparent hover:bg-[#D4561A] hover:text-white",
  ghost:
    "bg-transparent text-[#D4561A] hover:bg-[#D4561A]/10",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md",
};

const PrivateButton = forwardRef<HTMLButtonElement, PrivateButtonProps>(
  (
    {
      text,
      icon: Icon,
      iconPosition = "left",
      isLoading = false,
      type = "button",
      size = "md",
      variant = "primary",
      fullWidth = false,
      href,
      target,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

    const content = (
      <>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && Icon && iconPosition === "left" && <Icon size={size === "xs" ? 12 : size === "sm" ? 14 : 16} className="shrink-0" />}
        {(text || children) && <span>{text || children}</span>}
        {!isLoading && Icon && iconPosition === "right" && <Icon size={size === "xs" ? 12 : size === "sm" ? 14 : 16} className="shrink-0" />}
      </>
    );

    const classes = clsx(
      base,
      sizeStyles[size],
      variantStyles[variant],
      fullWidth && "w-full",
      className
    );

    if (href) {
      return (
        <Link href={href} target={target} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isLoading || disabled}
        className={classes}
        {...props}
      >
        {content}
      </button>
    );
  }
);

PrivateButton.displayName = "PrivateButton";

export default PrivateButton;
