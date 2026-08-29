import { type LucideIcon } from "lucide-react";

type PrivatePageHeadingProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

export default function PrivatePageHeading({
  icon: Icon,
  title,
  description,
  className = "",
}: PrivatePageHeadingProps) {
  return (
    <div className={className}>
      <h1 className="h5 text-brand-neutral-dark flex items-center gap-2">
        {Icon && <Icon className="text-brand-600" size={24} />}
        {title}
      </h1>
      {description && (
        <p className="text-brand-neutral-muted text-sm mt-0.5">{description}</p>
      )}
    </div>
  );
}
