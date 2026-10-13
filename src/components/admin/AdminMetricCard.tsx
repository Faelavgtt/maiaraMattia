import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";

type AdminMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle?: string;
  helpText?: string;
  tone?: "terracotta" | "sage" | "amber" | "neutral";
  tag?: string;
  href?: string;
  onClick?: () => void;
};

const toneStyles = {
  terracotta: {
    cardBg: "from-white via-white to-[#fbeee7]/40 border-[#ebd2c3]/80 hover:border-[#8b4114]/40 hover:shadow-[0_8px_30px_rgba(139,65,20,0.08)]",
    iconBg: "bg-[#fbeee7] text-[#8b4114] border-[#ebd2c3]",
    tagBg: "bg-[#fbeee7] text-[#8b4114] border-[#ebd2c3]",
    valueColor: "text-[#8b4114]",
  },
  sage: {
    cardBg: "from-white via-white to-[#eef4f0]/40 border-[#b5ccbd]/80 hover:border-[#33533e]/40 hover:shadow-[0_8px_30px_rgba(45,82,58,0.08)]",
    iconBg: "bg-[#eef4f0] text-[#33533e] border-[#b5ccbd]",
    tagBg: "bg-[#eef4f0] text-[#2d523a] border-[#b5ccbd]",
    valueColor: "text-[#2d523a]",
  },
  amber: {
    cardBg: "from-white via-white to-amber-50/50 border-amber-200/80 hover:border-amber-400/80 hover:shadow-[0_8px_30px_rgba(217,119,6,0.08)]",
    iconBg: "bg-amber-50 text-amber-900 border-amber-200/90",
    tagBg: "bg-amber-100/70 text-amber-900 border-amber-200",
    valueColor: "text-amber-950",
  },
  neutral: {
    cardBg: "from-white via-white to-[#f8f1e9]/40 border-[#e8d5cb]/80 hover:border-[#8b4114]/35 hover:shadow-[0_8px_30px_rgba(139,65,20,0.06)]",
    iconBg: "bg-[#f8f1e9] text-[#8b4114] border-[#e8d5cb]",
    tagBg: "bg-[#f8f1e9] text-[#8b4114] border-[#e8d5cb]",
    valueColor: "text-[#8b4114]",
  },
};

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  helpText,
  tone = "terracotta",
  tag,
  href,
  onClick,
}: AdminMetricCardProps) {
  const selectedTone = toneStyles[tone] ?? toneStyles.terracotta;
  const formattedValue = typeof value === "number" ? String(value).padStart(2, "0") : value;
  const isClickable = Boolean(href || onClick);

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-[#76877e]">
              {label}
            </span>
            {helpText && <AdminHelpTooltip label={helpText} />}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <strong className={`font-sans text-3xl font-light tracking-tight sm:text-4xl ${selectedTone.valueColor}`}>
              {formattedValue}
            </strong>
            {tag && (
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium leading-none ${selectedTone.tagBg}`}>
                {tag}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1.5 text-xs font-light leading-relaxed text-[#8b4114]/70">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${selectedTone.iconBg} shadow-2xs transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="h-5 w-5" />
          </div>

          {isClickable && (
            <div className="flex h-6 w-6 items-center justify-center rounded-lg text-[#76877e] opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>
    </>
  );

  const baseClasses = `group relative block rounded-2xl border bg-gradient-to-br p-4 shadow-[0_4px_20px_rgba(93,51,29,0.03)] transition-all duration-200 ${
    selectedTone.cardBg
  } ${isClickable ? "cursor-pointer hover:-translate-y-0.5" : ""}`;

  if (href) {
    return (
      <Link to={href} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${baseClasses} w-full text-left`}>
        {cardContent}
      </button>
    );
  }

  return <article className={baseClasses}>{cardContent}</article>;
}
