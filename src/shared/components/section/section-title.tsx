import React from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  variant?: "default" | "minimal" | "gradient";
  icon?: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title, subtitle, actionLabel, actionHref, onActionClick, variant = "default", icon,
}) => {
  const hasAction = actionLabel && (actionHref || onActionClick);

  const ActionBtn = () => {
    if (!hasAction) return null;
    const content = (
      <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-2 rounded-xl border-2 border-purple-600/30 text-purple-400 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-200 group">
        {actionLabel}
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    );
    if (onActionClick) return <button onClick={onActionClick}>{content}</button>;
    if (actionHref) return <Link href={actionHref}>{content}</Link>;
    return null;
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-1">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}>
            <span className="text-white">{icon}</span>
          </div>
        )}
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
      {hasAction && <ActionBtn />}
    </div>
  );
};

export default SectionTitle;

