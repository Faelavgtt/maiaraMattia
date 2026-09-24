import type { LucideIcon } from "lucide-react";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";

type AdminMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle?: string;
  helpText?: string;
  tone?: "terracotta" | "sage" | "amber" | "neutral";
};

const toneStyles = {
  terracotta: {
    iconBg: "bg-[#fbeee7] text-[#8b4114] border-[#ebd2c3]",
  },
  sage: {
    iconBg: "bg-[#eef4f0] text-[#33533e] border-[#b5ccbd]",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-900 border-amber-200/80",
  },
  neutral: {
    iconBg: "bg-[#f8f1e9] text-[#8b4114] border-[#e8d5cb]",
  },
};

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  helpText,
  tone = "terracotta",
}: AdminMetricCardProps) {
  const selectedTone = toneStyles[tone] ?? toneStyles.terracotta;
  const formattedValue = typeof value === "number" ? String(value).padStart(2, "0") : value;

  return (
    <article className="group relative rounded-xl border border-[#8b4114]/10 bg-white p-3.5 shadow-[0_4px_20px_rgba(93,51,29,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(93,51,29,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="font-sans text-xs font-normal uppercase tracking-[0.1em] text-[#76877e]">
              {label}
            </p>
            {helpText && <AdminHelpTooltip label={helpText} />}
          </div>
          <strong className="mt-1.5 block font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
            {formattedValue}
          </strong>
          {subtitle && (
            <p className="mt-0.5 text-[11px] font-light text-[#8b4114]/60">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${selectedTone.iconBg} shadow-sm transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </article>
  );
}
