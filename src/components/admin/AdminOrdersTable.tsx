import { useState } from "react";
import {
  CalendarClock,
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Inbox,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Ruler,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { adminStatuses } from "@/components/admin/admin-data";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminOrderFileUrl, type AdminOrderRow, type AdminOrderStatus } from "@/lib/admin-api";

type AdminOrdersTableProps = {
  orders: AdminOrderRow[];
  onSelectOrder?: (order: AdminOrderRow) => void;
  onStatusChange?: (code: string, status: AdminOrderStatus) => void;
  onDeleteOrder?: (code: string) => void;
  isUpdatingStatus?: boolean;
  isDeletingOrder?: boolean;
};

const orderTypeLabels: Record<string, string> = {
  familinha: "Familinha",
  maker: "Maker",
  galeria: "Galeria",
  outros: "Outros projetos",
};

const orderTypeColors: Record<string, string> = {
  familinha: "bg-[#8b4114] text-white",
  maker: "bg-[#76877e] text-white",
  galeria: "bg-[#c68043] text-white",
  outros: "bg-[#4f5f50] text-white",
};

const statusProgressMap: Record<AdminOrderStatus, { step: number; label: string; width: string }> = {
  awaiting_payment: { step: 1, label: "1/4 Orçamento", width: "w-1/4 bg-amber-400" },
  received: { step: 1, label: "1/4 Recebido", width: "w-1/4 bg-amber-400" },
  payment_confirmed: { step: 2, label: "2/4 Confirmado", width: "w-2/4 bg-emerald-500" },
  in_production: { step: 3, label: "3/4 Em Produção", width: "w-3/4 bg-[#8b4114]" },
  awaiting_approval: { step: 3, label: "3/4 Aprovação", width: "w-3/4 bg-purple-500" },
  finished: { step: 4, label: "4/4 Finalizado", width: "w-full bg-slate-600" },
};

export function AdminOrdersTable({
  orders,
  onSelectOrder,
  onStatusChange,
  onDeleteOrder,
  isUpdatingStatus = false,
  isDeletingOrder = false,
}: AdminOrdersTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-3.5">
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#8b4114]/10 bg-white px-6 py-16 text-center shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f8f1e9] text-[#76877e]">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-sans text-lg font-medium text-[#8b4114]">Nenhum pedido encontrado</h3>
          <p className="mt-1 max-w-md font-sans text-xs sm:text-sm font-light text-[#8b4114]/65">
            Tente ajustar a busca ou clicar em outra aba de status acima.
          </p>
        </div>
      ) : (
        orders.map((order) => {
          const originalFile = order.files?.find((file) => file.kind === "original") ?? order.files?.[0];
          const fileUrl = originalFile ? adminOrderFileUrl(originalFile.id) : "";
          const isImage = originalFile?.content_type.startsWith("image/");
          const noteFields = parseOrderNotes(order.notes);
          const orderTypeTags = getOrderTypeTags(order);
          const progress = statusProgressMap[order.status] || { step: 1, label: "Em análise", width: "w-1/4 bg-amber-400" };

          const customerInitials =
            order.customer_name
              .split(" ")
              .map((name) => name[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "C";

          const cleanPhone = order.customer_phone.replace(/\D/g, "");
          const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

          return (
            <article
              key={order.id}
              onClick={() => onSelectOrder?.(order)}
              className={`group overflow-hidden rounded-2xl border border-[#8b4114]/10 bg-white p-4 sm:p-5 shadow-2xs transition-all duration-200 hover:border-[#8b4114]/30 hover:shadow-md ${
                onSelectOrder ? "cursor-pointer" : ""
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Code, Date, Customer & Product Overview */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center min-w-0 flex-1">
                  {/* Customer Avatar & Initials */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbeee7] font-sans text-sm font-bold text-[#8b4114] border border-[#ebd2c3]">
                    {customerInitials}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Order Code + Tags + Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-lg bg-[#f8f1e9] px-2.5 py-0.5 border border-[#8b4114]/10">
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

                      {orderTypeTags.map((type) => (
                        <span
                          key={type}
                          className={`rounded-md px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider ${
                            orderTypeColors[type] ?? "bg-[#8b4114] text-white"
                          }`}
                        >
                          {orderTypeLabels[type] ?? type}
                        </span>
                      ))}

                      <span className="flex items-center gap-1 font-sans text-[11px] font-light text-[#76877e]">
                        <CalendarClock className="h-3 w-3" />
                        <span>{formatRelativeDate(order.created_at)}</span>
                      </span>
                    </div>

                    {/* Customer Name & Phone */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h4 className="font-sans text-sm font-medium text-[#8b4114]">
                        {order.customer_name}
                      </h4>
                      <span className="text-xs text-[#76877e]">{order.customer_phone}</span>

                      {/* WhatsApp Pill */}
                      <a
                        href={`https://wa.me/${formattedPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 font-sans text-[11px] font-medium text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>

                    {/* Product & Customization Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-[#8b4114]/85">
                      <span className="font-medium text-[#8b4114]">
                        {order.product || "Arte personalizada"}
                      </span>
                      {order.size && (
                        <span className="rounded bg-[#f8f1e9] px-1.5 py-0.5 text-[11px] text-[#76877e]">
                          {order.size}
                        </span>
                      )}
                      {order.colors && (
                        <span className="rounded bg-[#f8f1e9] px-1.5 py-0.5 text-[11px] text-[#76877e]">
                          {order.colors}
                        </span>
                      )}
                      {order.files && order.files.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded bg-[#eef4f0] px-1.5 py-0.5 text-[11px] font-medium text-[#2d523a]">
                          <FileCheck className="h-3 w-3" />
                          <span>{order.files.length} anexo(s)</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Progress Pill, Status Selector & Actions */}
                <div
                  className="flex flex-wrap items-center gap-2 border-t border-[#8b4114]/10 pt-3 sm:justify-between lg:border-0 lg:pt-0 lg:justify-end"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Status Badge */}
                  <AdminStatusBadge status={order.status} size="md" />

                  {/* Status Dropdown */}
                  {onStatusChange && (
                    <Select
                      value={order.status}
                      onValueChange={(nextStatus) => onStatusChange(order.code, nextStatus as AdminOrderStatus)}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="h-9 min-w-32 flex-1 sm:flex-initial sm:w-auto rounded-xl border-[#8b4114]/15 bg-white px-2.5 font-sans text-xs font-medium text-[#8b4114] shadow-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[80] rounded-xl border-[#8b4114]/15 bg-white p-1 shadow-xl">
                        {adminStatuses.map((st) => (
                          <SelectItem key={st.id} value={st.id} className="rounded-lg text-xs">
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Details Button */}
                  {onSelectOrder && (
                    <button
                      type="button"
                      onClick={() => onSelectOrder(order)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-[#fffaf5] px-3 font-sans text-xs font-medium text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Detalhes</span>
                    </button>
                  )}

                  {/* Delete Button */}
                  {onDeleteOrder && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          disabled={isDeletingOrder}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-white text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                          title="Excluir pedido"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl border-[#8b4114]/15 bg-white text-[#8b4114] shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-sans text-xl font-medium text-[#8b4114]">
                            Excluir pedido {order.code}?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-sans text-sm font-light leading-relaxed text-[#8b4114]/75">
                            Esta ação remove o pedido e seus anexos do painel administrativo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl border-[#8b4114]/15 text-[#8b4114]">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteOrder(order.code)}
                            className="rounded-xl bg-red-700 text-white hover:bg-red-800"
                          >
                            Excluir Pedido
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function getOrderTypeTags(order: AdminOrderRow) {
  const tags = new Set<string>();
  if (order.order_type) tags.add(order.order_type);
  order.items?.forEach((item) => {
    if (item.order_type) tags.add(item.order_type);
  });
  return Array.from(tags);
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

function formatRelativeDate(isoDate: string) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
