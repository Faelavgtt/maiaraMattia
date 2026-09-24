type AdminHelpTooltipProps = {
  label: string;
  side?: "top" | "right" | "bottom" | "left";
};

export function AdminHelpTooltip({ label, side = "top" }: AdminHelpTooltipProps) {
  const positionClassName =
    side === "right"
      ? "left-full top-1/2 ml-2 -translate-y-1/2"
      : side === "left"
        ? "right-full top-1/2 mr-2 -translate-y-1/2"
        : side === "bottom"
          ? "left-1/2 top-full mt-2 -translate-x-1/2"
          : "bottom-full left-1/2 mb-2 -translate-x-1/2";

  return (
    <span className="group/help relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#8b4114]/20 bg-white font-sans text-[11px] font-semibold leading-none text-[#8b4114]/75 shadow-xs transition-colors hover:border-[#8b4114]/35 hover:bg-[#fffaf5] hover:text-[#8b4114] focus:outline-none focus:ring-2 focus:ring-[#8b4114]/20"
        aria-label={label}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        ?
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute z-[90] hidden w-60 rounded-xl border border-[#8b4114]/10 bg-white px-3 py-2 text-left font-sans text-xs font-light leading-relaxed text-[#8b4114] shadow-[0_12px_32px_rgba(93,51,29,0.16)] group-hover/help:block group-focus-within/help:block ${positionClassName}`}
      >
        {label}
      </span>
    </span>
  );
}
