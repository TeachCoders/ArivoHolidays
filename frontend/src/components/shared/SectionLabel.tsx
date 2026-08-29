import React from "react";

interface SectionLabelProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({ children, icon, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 text-[#2E8B8B] font-semibold text-xs uppercase tracking-wider mb-2 ${className}`}>
      {icon}
      <span>{children}</span>
    </div>
  );
};
