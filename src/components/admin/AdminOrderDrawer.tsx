import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MessageCircle,
  Palette,
  Phone,
  Ruler,
  Sparkles,
  Trash2,
  X,
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

type AdminOrderDrawerProps = {
  order: AdminOrderRow | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (code: string, status: AdminOrderStatus) => void;
  onDeleteOrder?: (code: string) => void;
  isUpdatingStatus?: boolean;
  isDeletingOrder?: boolean;
};

const statusPipeline: { id: AdminOrderStatus; label: string; step: number }[] = [
  { id: "awaiting_payment", label: "Aguardando Pagamento", step: 1 },
  { id: "payment_confirmed", label: "Pagamento Confirmado", step: 2 },
  { id: "in_production", label: "Em Produção", step: 3 },
  { id: "awaiting_approval", label: "Aguardando Aprovação", step: 4 },
  { id: "finished", label: "Finalizado", step: 5 },
];

export function AdminOrderDrawer({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteOrder,
  isUpdatingStatus = false,
  isDeletingOrder = false,
}: AdminOrderDrawerProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  if (!isOpen || !order) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(order.code);
    setCopiedCode(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedCode(false), 2000);
  };

  const cleanPhone = order.customer_phone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

  // WhatsApp quick templates
  const whatsappTemplates = [
    {
      label: "Confirmar Orçamento",
      msg: `Olá ${order.customer_name}! Aqui é do Ateliê Maiara Matthia. Recebemos seu pedido #${order.code} e estamos à disposição para tirar dúvidas e combinar o pagamento. Como podemos ajudar?`,
    },
    {
      label: "Entrou em Produção",
      msg: `Olá ${order.customer_name}! Passando para avisar que o pagamento do seu pedido #${order.code} foi confirmado e ele já está na mesa de produção do ateliê! ✨`,
    },
    {
      label: "Enviar Prévia da Arte",
      msg: `Olá ${order.customer_name}! Temos uma prévia linda da sua arte do pedido #${order.code}. Segue a imagem para sua aprovação! O que achou?`,
    },
    {
      label: "Arte Pronta / Envio",
      msg: `Olá ${order.customer_name}! Seu pedido #${order.code} está pronto e finalizado com muito carinho no ateliê!`,
    },
  ];

  const openWhatsAppTemplate = (message: string) => {
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const noteFields = parseOrderNotes(order.notes);
  const currentPipelineIndex = statusPipeline.findIndex((p) => p.id === order.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1f1713]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <aside className="relative flex h-full w-full max-w-2xl flex-col bg-[#fffaf5] shadow-2xl transition-transform duration-300 ease-out sm:border-l sm:border-[#8b4114]/15">
        {/* Drawer Header */}
        <header className="flex items-center justify-between border-b border-[#8b4114]/10 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-[#f8f1e9] px-3 py-1.5 border border-[#8b4114]/10">
              <span className="font-mono text-sm font-semibold tracking-wide text-[#8b4114]">
                {order.code}
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="text-[#76877e] hover:text-[#8b4114] transition-colors"
                title="Copiar código"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <AdminStatusBadge status={order.status} size="md" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8b4114]/15 text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
            aria-label="Fechar gaveta"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Visual Production Pipeline Stepper */}
          <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-2xs">
            <p className="mb-3 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
              Etapa de Produção
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {statusPipeline.map((step, idx) => {
                const isCompleted = currentPipelineIndex >= idx;
                const isCurrent = currentPipelineIndex === idx;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center">
                    <div
                      className={`h-2 w-full rounded-full transition-all ${
                        isCompleted ? "bg-[#8b4114]" : "bg-[#8b4114]/15"
                      } ${isCurrent ? "ring-2 ring-[#8b4114] ring-offset-1" : ""}`}
                    />
                    <span
                      className={`mt-1.5 block line-clamp-2 text-[10px] ${
                        isCurrent
                          ? "font-semibold text-[#8b4114]"
                          : isCompleted
                          ? "font-medium text-[#8b4114]/75"
                          : "font-light text-[#76877e]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Next Stage Action */}
            {currentPipelineIndex >= 0 && currentPipelineIndex < statusPipeline.length - 1 && onStatusChange && (
              <div className="mt-4 flex justify-end border-t border-[#8b4114]/10 pt-3">
                <button
                  type="button"
                  onClick={() => onStatusChange(order.code, statusPipeline[currentPipelineIndex + 1].id)}
                  disabled={isUpdatingStatus}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#8b4114] px-3 font-sans text-xs font-medium text-white shadow-2xs transition-colors hover:bg-[#72340e] disabled:opacity-60"
                >
                  <span>Avançar para: {statusPipeline[currentPipelineIndex + 1].label}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Customer Dossier & Contact */}
          <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fbeee7] font-sans text-base font-bold text-[#8b4114] border border-[#ebd2c3]">
                  {order.customer_name.slice(0, 2).toUpperCase() || "C"}
                </div>
                <div>
                  <h3 className="font-sans text-base font-medium text-[#8b4114]">
                    {order.customer_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-light text-[#76877e]">
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="inline-flex items-center gap-1 hover:text-[#8b4114]"
                    >
                      <Phone className="h-3 w-3" />
                      <span>{order.customer_phone}</span>
                    </a>
                    {order.customer_email && (
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="inline-flex items-center gap-1 hover:text-[#8b4114]"
                      >
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-40">{order.customer_email}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${formattedPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 font-sans text-xs font-medium text-white shadow-xs transition-colors hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* 1-Click WhatsApp Quick Messages */}
            <div>
              <p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                Modelos de Mensagem Rápida no WhatsApp
              </p>
              <div className="grid grid-cols-2 gap-2">
                {whatsappTemplates.map((tmpl) => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => openWhatsAppTemplate(tmpl.msg)}
                    className="flex items-center justify-between rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-2.5 text-left transition-colors hover:bg-[#f0dfd4]/50"
                  >
                    <span className="font-sans text-xs font-medium text-[#8b4114]">{tmpl.label}</span>
                    <ExternalLink className="h-3 w-3 text-[#76877e]" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Project Items & Customization Details */}
          <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-2xs space-y-4">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
              Itens e Detalhes do Projeto
            </p>

            <div className="rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm font-semibold text-[#8b4114]">
                  {order.product || "Arte Personalizada"}
                </span>
                <span className="rounded-lg bg-white px-2 py-0.5 font-sans text-[10px] font-semibold uppercase text-[#76877e] border border-[#8b4114]/10">
                  {order.order_type}
                </span>
              </div>

              {/* Attributes Chips */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {order.size && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <Ruler className="h-3 w-3 text-[#76877e]" />
                    <span>{order.size}</span>
                  </span>
                )}
                {order.colors && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <Palette className="h-3 w-3 text-[#76877e]" />
                    <span>{order.colors}</span>
                  </span>
                )}
                {noteFields.subtitle && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <Sparkles className="h-3 w-3 text-[#76877e]" />
                    <span>Subtítulo: &ldquo;{noteFields.subtitle}&rdquo;</span>
                  </span>
                )}
                {noteFields.orientation && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <span className="text-[#76877e]">↕</span>
                    <span>Orientação: {noteFields.orientation}</span>
                  </span>
                )}
                {noteFields.background && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <span
                      className="h-3 w-3 rounded-full border border-[#8b4114]/20"
                      style={{ backgroundColor: noteFields.background }}
                    />
                    <span>Fundo: {noteFields.background}</span>
                  </span>
                )}
                {noteFields.outline && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <span
                      className="h-3 w-3 rounded-full border-2"
                      style={{ borderColor: noteFields.outline }}
                    />
                    <span>Traço: {noteFields.outline}</span>
                  </span>
                )}
                {noteFields.uploadedFile && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[#8b4114] border border-[#8b4114]/10">
                    <span>📎</span>
                    <span>{noteFields.uploadedFile}</span>
                  </span>
                )}
              </div>

              {/* Designer Notes from Maker */}
              {noteFields.designerNotes && noteFields.designerNotes !== "sem observações" && (
                <div className="mt-3 rounded-xl border border-[#8b4114]/10 bg-white p-3 text-xs">
                  <span className="block font-semibold uppercase tracking-wider text-[#76877e] text-[10px]">
                    Observações para a Designer
                  </span>
                  <p className="mt-1 font-light leading-relaxed text-[#8b4114] whitespace-pre-wrap">
                    {noteFields.designerNotes}
                  </p>
                </div>
              )}

              {/* Free-form Customer Observations Box */}
              {noteFields.observations && (
                <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-xs">
                  <span className="block font-semibold uppercase tracking-wider text-amber-900 text-[10px]">
                    Observações do Cliente
                  </span>
                  <p className="mt-1 font-light leading-relaxed text-amber-950 whitespace-pre-wrap">
                    {noteFields.observations}
                  </p>
                </div>
              )}
            </div>


            {/* Cart Items Breakdown if any */}
            {order.items && order.items.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#76877e]">
                  Composição do Carrinho ({order.items.length} itens)
                </span>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-[#8b4114]/10 bg-white p-3 shadow-2xs"
                    >
                      <div>
                        <p className="font-sans text-xs font-medium text-[#8b4114]">{item.title}</p>
                        <p className="text-[11px] font-light text-[#76877e]">
                          {item.dimensions} {item.category ? `• ${item.category}` : ""}
                        </p>
                      </div>
                      <span className="font-sans text-xs font-semibold text-[#8b4114]">
                        {item.price || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attached Files & Artwork Previews */}
          {order.files && order.files.length > 0 && (
            <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-2xs space-y-3">
              <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                Arquivos e Referências ({order.files.length})
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {order.files.map((file) => {
                  const fileUrl = adminOrderFileUrl(file.id);
                  const isImage = file.content_type.startsWith("image/");

                  return (
                    <div
                      key={file.id}
                      className="overflow-hidden rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-2.5 shadow-2xs"
                    >
                      {isImage ? (
                        <div
                          className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg bg-[#f0dfd4]"
                          onClick={() => setSelectedPreviewImage(fileUrl)}
                        >
                          <img
                            src={fileUrl}
                            alt={file.file_name}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-lg bg-[#f0dfd4] text-[#76877e]">
                          <FileText className="h-8 w-8" />
                          <span className="mt-1 text-[11px]">Documento</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-1">
                        <span className="truncate font-sans text-xs text-[#8b4114]" title={file.file_name}>
                          {file.file_name}
                        </span>
                        <a
                          href={fileUrl}
                          download={file.file_name}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#8b4114]/15 bg-white text-[#8b4114] hover:bg-[#f0dfd4]"
                          title="Baixar arquivo"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#8b4114]/10 bg-white p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-light text-[#76877e]">Status:</span>
            {onStatusChange && (
              <Select
                value={order.status}
                onValueChange={(next) => onStatusChange(order.code, next as AdminOrderStatus)}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="h-9 min-w-44 rounded-xl border-[#8b4114]/15 bg-white px-3 font-sans text-xs font-medium text-[#8b4114] shadow-xs">
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
          </div>

          {onDeleteOrder && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={isDeletingOrder}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 font-sans text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Excluir Pedido</span>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border-[#8b4114]/15 bg-white text-[#8b4114] shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-sans text-xl font-medium text-[#8b4114]">
                    Excluir pedido {order.code}?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-sans text-sm font-light leading-relaxed text-[#8b4114]/75">
                    Esta ação é irreversível e removerá o pedido e seus anexos do painel administrativo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl border-[#8b4114]/15 text-[#8b4114]">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDeleteOrder(order.code);
                      onClose();
                    }}
                    className="rounded-xl bg-red-700 text-white hover:bg-red-800"
                  >
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </footer>
      </aside>

      {/* Lightbox Zoom Preview Modal */}
      {selectedPreviewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-white p-2">
            <img
              src={selectedPreviewImage}
              alt="Prévia ampliada"
              className="max-h-[85vh] w-auto object-contain"
            />
            <button
              type="button"
              onClick={() => setSelectedPreviewImage(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeNoteKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseOrderNotes(notes: string | null) {
  if (!notes) return { subtitle: "", observations: "" };

  // Parse key: value pairs — same normalization as the worker
  const fields = new Map<string, string>();
  const unknownLines: string[] = [];

  const knownKeys = new Set([
    "subtitulo",
    "orientacao",
    "fundo",
    "traco",
    "arquivo enviado",
    "observacoes da designer",
  ]);

  for (const line of notes.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex > 0) {
      const rawKey = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1).trim();
      const normalizedKey = normalizeNoteKey(rawKey);
      if (value && knownKeys.has(normalizedKey)) {
        fields.set(normalizedKey, value);
      } else if (value) {
        unknownLines.push(line.trim());
      }
    } else if (line.trim()) {
      unknownLines.push(line.trim());
    }
  }

  return {
    subtitle: fields.get("subtitulo") ?? "",
    orientation: fields.get("orientacao") ?? "",
    background: fields.get("fundo") ?? "",
    outline: fields.get("traco") ?? "",
    uploadedFile: fields.get("arquivo enviado") ?? "",
    designerNotes: fields.get("observacoes da designer") ?? "",
    observations: unknownLines.join("\n").trim(),
  };
}
