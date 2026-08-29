import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

export interface FormActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    isLoading?: boolean;
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
    variant?: "primary" | "outline" | "ghost" | "danger";
}

const FormActionButton = forwardRef<HTMLButtonElement, FormActionButtonProps>(
    (
        {
            text = "Save",
            isLoading = false,
            type = "button",
            size = "md",
            fullWidth = false,
            variant = "primary",
            className,
            ...props
        },
        ref
    ) => {
        const base = "cursor-pointer inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

        const sizeStyles = {
            sm: "px-3.5 py-1.5 text-xs rounded-lg",
            md: "px-5 py-2.5 text-sm rounded-xl",
            lg: "px-7 py-3.5 text-base rounded-xl",
        };

        const variantStyles = {
            primary: "bg-[#D4561A] text-white shadow-sm hover:bg-[#C24D15] hover:shadow-md",
            outline: "border-2 border-brand-navy text-brand-navy bg-transparent hover:bg-brand-navy hover:text-white",
            ghost: "bg-transparent text-brand-navy hover:bg-brand-navy/10",
            danger: "bg-red-600 text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-red-600/30",
        };

        return (
            <button
                ref={ref}
                type={type}
                disabled={isLoading || props.disabled}
                className={clsx(
                    base,
                    sizeStyles[size],
                    variantStyles[variant],
                    fullWidth && "w-full",
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {text}
            </button>
        );
    }
);

FormActionButton.displayName = "FormActionButton";

export default FormActionButton;