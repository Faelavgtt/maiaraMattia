import type { ReactNode } from "react";
import { Images, X } from "lucide-react";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";

export const inputClassName =
  "h-11 w-full rounded-xl border border-[#8b4114]/15 bg-white px-3.5 font-sans text-sm font-light text-[#8b4114] outline-none transition-colors placeholder:text-[#8b4114]/35 focus:border-[#8b4114]/45 focus:bg-white";

export const textareaClassName =
  "w-full rounded-xl border border-[#8b4114]/15 bg-white px-3.5 py-3 font-sans text-sm font-light leading-6 text-[#8b4114] outline-none transition-colors placeholder:text-[#8b4114]/35 focus:border-[#8b4114]/45 focus:bg-white";

export function Field({
  label,
  help,
  className = "",
  children,
}: {
  label: string;
  help?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-1.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#76877e]">
        {label}
        {help && <AdminHelpTooltip label={help} />}
      </span>
      {children}
    </div>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#8b4114]">{children}</p>;
}

export function CurrencyInput({
  value,
  required = false,
  placeholder,
  onChange,
  onBlur,
}: {
  value: string;
  required?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onBlur: (value: string) => void;
}) {
  const displayValue = getBrazilianCurrencyDisplayValue(value);

  return (
    <div className="flex h-11 w-full overflow-hidden rounded-xl border border-[#8b4114]/15 bg-white text-[#8b4114] transition-colors focus-within:border-[#8b4114]/45">
      <span className="flex h-full items-center border-r border-[#8b4114]/10 bg-[#fffaf5] px-3 font-sans text-sm font-medium text-[#8b4114]/70">
        R$
      </span>
      <input
        required={required}
        inputMode="decimal"
        value={displayValue}
        onChange={(event) => onChange(sanitizeBrazilianCurrencyInput(event.target.value))}
        onBlur={(event) => onBlur(event.target.value)}
        className="h-full min-w-0 flex-1 bg-white px-3 font-sans text-sm font-light text-[#8b4114] outline-none placeholder:text-[#8b4114]/35"
        placeholder={placeholder}
      />
    </div>
  );
}

export function ImageSlot({
  label,
  value,
  required = false,
  onChoose,
  onClear,
}: {
  label: string;
  value: string;
  required?: boolean;
  onChoose: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-[#8b4114]/15 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#76877e]">{label}{required ? " *" : ""}</p>
        {value && (
          <button type="button" onClick={onClear} className="flex h-7 w-7 items-center justify-center rounded-full text-[#8b4114]/65 hover:bg-[#fffaf5]" aria-label={`Limpar ${label}`}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="mt-2 aspect-[4/3] min-h-0 overflow-hidden rounded-xl border border-[#8b4114]/15 bg-[#fffaf5]">
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center text-[#8b4114]/55">
            <Images className="h-5 w-5" />
            <p className="mt-1 font-sans text-[0.68rem] font-light">Selecionar</p>
          </div>
        )}
      </div>
      <button type="button" onClick={onChoose} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#7d876d] px-3 font-sans text-xs font-medium text-white transition-colors hover:bg-[#68745b]">
        <Images className="h-3.5 w-3.5" />
        Abrir biblioteca
      </button>
    </div>
  );
}

function sanitizeBrazilianCurrencyInput(value: string) {
  const cleanedValue = value.replace(/[^\d,.]/g, "");
  if (!cleanedValue) return "";

  const lastSeparatorIndex = Math.max(cleanedValue.lastIndexOf(","), cleanedValue.lastIndexOf("."));
  if (lastSeparatorIndex < 0) return cleanedValue.replace(/\D/g, "");

  const integerPart = cleanedValue.slice(0, lastSeparatorIndex).replace(/\D/g, "");
  const decimalPart = cleanedValue.slice(lastSeparatorIndex + 1).replace(/\D/g, "").slice(0, 2);
  const separator = decimalPart || /[,.]$/.test(cleanedValue) ? "," : "";

  return `${integerPart}${separator}${decimalPart}`;
}

function getBrazilianCurrencyDisplayValue(value: string) {
  const withoutCurrencySymbol = value.replace(/^R\$\s*/i, "");
  return sanitizeBrazilianCurrencyInput(withoutCurrencySymbol);
}

export function formatBrazilianCurrencyInput(value: string) {
  const cleanedValue = value.trim();
  if (!cleanedValue) return "";

  const lastSeparatorIndex = Math.max(cleanedValue.lastIndexOf(","), cleanedValue.lastIndexOf("."));
  const hasDecimalSeparator = lastSeparatorIndex >= 0;
  const integerPart = hasDecimalSeparator ? cleanedValue.slice(0, lastSeparatorIndex) : cleanedValue;
  const decimalPart = hasDecimalSeparator ? cleanedValue.slice(lastSeparatorIndex + 1) : "";
  const reais = Number(integerPart.replace(/\D/g, "") || "0");
  const centavos = Number((decimalPart.replace(/\D/g, "").slice(0, 2)).padEnd(2, "0") || "0");
  const amount = reais + centavos / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}
