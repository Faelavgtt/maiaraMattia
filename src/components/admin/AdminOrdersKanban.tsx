import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  FileText,
  MessageCircle,
  Palette,
  Phone,
  Ruler,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { adminOrderFileUrl, type AdminOrderRow, type AdminOrderStatus } from "@/lib/admin-api";

type AdminOrdersKanbanProps = {
  orders: AdminOrderRow[];
  onSelectOrder: (order: AdminOrderRow) => void;
  onStatusChange?: (code: string, status: AdminOrderStatus) => void;
  isUpdatingStatus?: boolean;
};

type KanbanColumn = {
  id: AdminOrderStatus;
  title: string;
  nextStatus?: AdminOrderStatus;
  nextLabel?: string;
  accent: string;
  badgeBg: string;
  headerBorder: string;
};

const kanbanColumns: KanbanColumn[] = [
  {
    id: "awaiting_payment",
    title: "Aguardando Pagamento",
    nextStatus: "payment_confirmed",
    nextLabel: "Confirmar Pago",
    accent: "text-amber-800 bg-amber-50 border-amber-200",
    badgeBg: "bg-amber-100 text-amber-900",
    headerBorder: "border-amber-300",
  },
  {
    id: "payment_confirmed",
    title: "Pagamento Confirmado",
    nextStatus: "in_production",
    nextLabel: "Iniciar Produção",
    accent: "text-emerald-800 bg-emerald-50 border-emerald-200",
    badgeBg: "bg-emerald-100 text-emerald-900",
    headerBorder: "border-emerald-300",
  },
  {
    id: "in_production",
    title: "Em Produção / Desenho",
    nextStatus: "awaiting_approval",
    nextLabel: "Enviar Prévia",
    accent: "text-[#8b4114] bg-[#fbeee7] border-[#ebd2c3]",
    badgeBg: "bg-[#f0dfd4] text-[#8b4114]",
    headerBorder: "border-[#8b4114]/40",
  },
  {
    id: "awaiting_approval",
    title: "Aguardando Aprovação",
    nextStatus: "finished",
    nextLabel: "Finalizar Arte",
    accent: "text-purple-800 bg-purple-50 border-purple-200",
    badgeBg: "bg-purple-100 text-purple-900",
    headerBorder: "border-purple-300",
  },
  {
    id: "finished",
    title: "Finalizados",
    accent: "text-slate-700 bg-slate-50 border-slate-200",
    badgeBg: "bg-slate-200 text-slate-800",
    headerBorder: "border-slate-300",
  },
];

export function AdminOrdersKanban({
  orders,
  onSelectOrder,
  onStatusChange,
  isUpdatingStatus = false,
}: AdminOrdersKanbanProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth -mx-3 px-3 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-5 xl:overflow-visible">
      {kanbanColumns.map((col) => {
        const columnOrders = orders.filter((order) => order.status === col.id);

        return (
          <div
            key={col.id}
            className="flex min-h-0 w-[84vw] max-w-[320px] shrink-0 snap-center flex-col rounded-2xl border border-[#8b4114]/10 bg-[#fbf7f3] p-3 shadow-2xs sm:w-[310px] xl:w-auto xl:max-w-none xl:shrink"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between border-b pb-2.5 ${col.headerBorder}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-xs font-semibold uppercase tracking-wider text-[#8b4114]">
                  {col.title}
                </h3>
              </div>
              <span
                className={`rounded-lg px-2 py-0.5 font-sans text-xs font-bold ${col.badgeBg}`}
              >
                {columnOrders.length}
              </span>
            </div>

            {/* Cards List in Column */}
            <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
              {columnOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#8b4114]/15 py-8 text-center text-[#76877e]">
                  <p className="font-sans text-xs font-light">Nenhum pedido nesta etapa</p>
                </div>
              ) : (
                columnOrders.map((order) => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, "");
                  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                  const originalFile = order.files?.find((f) => f.kind === "original") ?? order.files?.[0];
                  const fileUrl = originalFile ? adminOrderFileUrl(originalFile.id) : null;
                  const isImage = originalFile?.content_type.startsWith("image/");
                  const noteFields = parseOrderNotes(order.notes);

                  return (
                    <article
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="group cursor-pointer rounded-xl border border-[#8b4114]/10 bg-white p-3.5 shadow-2xs transition-all duration-150 hover:border-[#8b4114]/30 hover:shadow-md"
                    >
                      {/* Top Bar: Code & WhatsApp Button */}
                      <div className="flex items-center justify-between gap-2 border-b border-[#8b4114]/5 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-[#8b4114]">
                            {order.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(e, order.code)}
                            className="text-[#76877e] hover:text-[#8b4114] transition-colors"
                            title="Copiar código"
                          >
                            {copiedCode === order.code ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        <a
                          href={`https://wa.me/${formattedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white"
                          title="Abrir conversa no WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </div>

                      {/* Customer Info */}
                      <div className="mt-2.5">
                        <h4 className="truncate font-sans text-xs font-semibold text-[#8b4114]">
                          {order.customer_name}
                        </h4>
                        <p className="truncate text-[11px] font-light text-[#76877e]">
                          {order.customer_phone}
                        </p>
                      </div>

                      {/* Product & Dimensions */}
                      <div className="mt-2 rounded-lg bg-[#fffaf5] p-2 text-[11px] border border-[#8b4114]/5">
                        <p className="truncate font-medium text-[#8b4114]">
                          {order.product || "Arte personalizada"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1 text-[10px] text-[#76877e]">
                          {order.size && <span>• {order.size}</span>}
                          {order.colors && <span>• {order.colors}</span>}
                        </div>
                      </div>

                      {/* Image Thumbnail if any */}
                      {isImage && fileUrl && (
                        <div className="mt-2 overflow-hidden rounded-lg bg-[#f0dfd4]">
                          <img
                            src={fileUrl}
                            alt=""
                            className="h-16 w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Card Footer: Advance Button / Details */}
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#8b4114]/5 pt-2">
                        <span className="text-[10px] font-medium text-[#76877e] group-hover:text-[#8b4114] transition-colors">
                          Ver detalhes &rarr;
                        </span>

                        {col.nextStatus && onStatusChange && (
                          <button
                            type="button"
                            disabled={isUpdatingStatus}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(order.code, col.nextStatus!);
                            }}
                            className="inline-flex h-6 items-center gap-1 rounded-lg bg-[#8b4114] px-2 text-[10px] font-medium text-white shadow-2xs transition-colors hover:bg-[#72340e] disabled:opacity-60"
                            title={`Avançar para: ${col.nextLabel}`}
                          >
                            <span>{col.nextLabel}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function parseOrderNotes(notes: string | null) {
  if (!notes) return { subtitle: "", observations: "" };

  const subtitleMatch = notes.match(/Subtítulo\s*:\s*([^|\n]+)/i);
  const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "";

  const cleanObservations = notes
    .replace(/Subtítulo\s*:\s*[^|\n]+/gi, "")
    .replace(/^\|\s*|\s*\|$/g, "")
    .trim();

  return { subtitle, observations: cleanObservations };
}
