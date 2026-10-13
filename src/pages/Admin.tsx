import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Database,
  Eye,
  FolderKanban,
  HelpCircle,
  Layers,
  Layers3,
  MessageCircle,
  PackageOpen,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";
import { AdminOrderDrawer } from "@/components/admin/AdminOrderDrawer";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminSession, type AdminSession } from "@/lib/admin-auth";
import {
  deleteAdminOrder,
  listAdminGalleryProducts,
  listAdminOrders,
  listAdminOtherProjects,
  updateAdminOrderStatus,
  type AdminOrderRow,
  type AdminOrderStatus,
} from "@/lib/admin-api";

const quickLinks = [
  {
    title: "Central de pedidos",
    description: "Acompanhe orçamentos, clientes e andamento das produções.",
    href: "/admin/pedidos",
    icon: FolderKanban,
    accent: "bg-[#fbeee7] text-[#8b4114] border-[#ebd2c3]",
  },
  {
    title: "Galeria de produtos",
    description: "Cadastre quadros, fotos de prévia e carrosséis da loja.",
    href: "/admin/galeria",
    icon: Layers3,
    accent: "bg-[#eef4f0] text-[#2d523a] border-[#b5ccbd]",
  },
  {
    title: "Projetos especiais",
    description: "Gerencie peças manuais, pintura e presentes afetivos.",
    href: "/admin/outros",
    icon: PackageOpen,
    accent: "bg-amber-50 text-amber-900 border-amber-200",
  },
  {
    title: "Banco de arquivos",
    description: "Consulte imagens e referências enviadas pelas clientes.",
    href: "/admin/bucket",
    icon: Database,
    accent: "bg-[#f8f1e9] text-[#8b4114] border-[#e8d5cb]",
  },
];

const emptyOrders: AdminOrderRow[] = [];

function formatOrderDate(dateString?: string | null) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return `Hoje às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "";
  }
}

const Admin = () => {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [recentFilter, setRecentFilter] = useState<"all" | "pending" | "finished">("all");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    getAdminSession().then(setSession);
  }, []);

  const { data, isError, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listAdminOrders,
    retry: false,
  });

  const { data: galleryData } = useQuery({
    queryKey: ["admin-gallery-products"],
    queryFn: listAdminGalleryProducts,
    retry: false,
  });

  const { data: otherProjectsData } = useQuery({
    queryKey: ["admin-other-projects"],
    queryFn: listAdminOtherProjects,
    retry: false,
  });

  const updateStatus = useMutation({
    mutationFn: ({ code, nextStatus }: { code: string; nextStatus: AdminOrderStatus }) =>
      updateAdminOrderStatus(
        code,
        nextStatus,
        nextStatus === "payment_confirmed" ? "Pagamento confirmado no painel" : undefined,
      ),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      if (selectedOrder && selectedOrder.code === updatedData.code) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: updatedData.status } : null));
      }
    },
  });

  const deleteOrder = useMutation({
    mutationFn: deleteAdminOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrder(null);
    },
  });

  const orders = data?.orders ?? emptyOrders;
  const galleryCount = galleryData?.products.length ?? 0;
  const otherProjectsCount = otherProjectsData?.products.length ?? 0;
  const openOrders = orders.filter((order) => order.status !== "finished").length;

  // Orders needing immediate attention (awaiting payment or awaiting approval)
  const urgentOrders = useMemo(() => {
    return orders.filter((order) => ["awaiting_payment", "awaiting_approval"].includes(order.status));
  }, [orders]);

  // Production pipeline stats
  const pipelineStats = useMemo(() => {
    const awaiting = orders.filter((o) => o.status === "awaiting_payment").length;
    const paid = orders.filter((o) => o.status === "payment_confirmed").length;
    const production = orders.filter((o) => o.status === "in_production").length;
    const approval = orders.filter((o) => o.status === "awaiting_approval").length;
    const finished = orders.filter((o) => o.status === "finished").length;

    return { awaiting, paid, production, approval, finished };
  }, [orders]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  const clientName = session?.username ? session.username : "Maiara";

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const copyOrderCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredRecentOrders = useMemo(() => {
    if (recentFilter === "pending") {
      return orders.filter((order) => order.status !== "finished").slice(0, 10);
    }
    if (recentFilter === "finished") {
      return orders.filter((order) => order.status === "finished").slice(0, 10);
    }
    return orders.slice(0, 10);
  }, [orders, recentFilter]);

  const pipelineSteps = [
    {
      id: "awaiting_payment" as AdminOrderStatus,
      stepNumber: "1",
      label: "Aguardando Pagamento",
      shortLabel: "A pagar",
      sublabel: "Aguardando Pix / comprovante",
      count: pipelineStats.awaiting,
      badgeColor: "border-amber-200 bg-amber-50/80 text-amber-900 hover:border-amber-400 hover:bg-amber-100/60",
      pillClass: "bg-amber-100 text-amber-900 border-amber-200",
    },
    {
      id: "payment_confirmed" as AdminOrderStatus,
      stepNumber: "2",
      label: "Pagamento Confirmado",
      shortLabel: "Pago",
      sublabel: "Pronto para iniciar desenho",
      count: pipelineStats.paid,
      badgeColor: "border-emerald-200 bg-emerald-50/80 text-emerald-950 hover:border-emerald-400 hover:bg-emerald-100/60",
      pillClass: "bg-emerald-100 text-emerald-950 border-emerald-200",
    },
    {
      id: "in_production" as AdminOrderStatus,
      stepNumber: "3",
      label: "Em Produção",
      shortLabel: "Produzindo",
      sublabel: "Na mesa de desenho do ateliê",
      count: pipelineStats.production,
      badgeColor: "border-[#ebd2c3] bg-[#fbeee7]/80 text-[#8b4114] hover:border-[#8b4114]/50 hover:bg-[#fbeee7]",
      pillClass: "bg-[#f0dfd4] text-[#8b4114] border-[#ebd2c3]",
    },
    {
      id: "awaiting_approval" as AdminOrderStatus,
      stepNumber: "4",
      label: "Em Revisão",
      shortLabel: "Revisão",
      sublabel: "Prévia enviada à cliente",
      count: pipelineStats.approval,
      badgeColor: "border-purple-200 bg-purple-50/80 text-purple-950 hover:border-purple-400 hover:bg-purple-100/60",
      pillClass: "bg-purple-100 text-purple-950 border-purple-200",
    },
    {
      id: "finished" as AdminOrderStatus,
      stepNumber: "5",
      label: "Finalizado",
      shortLabel: "Pronto",
      sublabel: "Arte aprovada e entregue",
      count: pipelineStats.finished,
      badgeColor: "border-slate-200 bg-slate-50/80 text-slate-800 hover:border-slate-300 hover:bg-slate-100",
      pillClass: "bg-slate-200 text-slate-800 border-slate-300",
    },
  ];

  return (
    <section className="px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
        {/* Welcome Executive Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[#8b4114]/12 bg-gradient-to-br from-[#fffaf5] via-white to-[#fbf4ee] p-4.5 shadow-[0_4px_24px_rgba(93,51,29,0.04)] sm:p-6">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-64 w-64 rounded-full bg-[#f0dfd4]/35 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              {/* Date & System Status Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#33533e]/20 bg-[#eef4f0] px-2.5 py-1 font-sans text-xs font-medium text-[#2d523a]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="capitalize">{todayFormatted}</span>
                </div>

                {urgentOrders.length > 0 ? (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 font-sans text-xs font-medium text-amber-900">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                    <span>
                      {urgentOrders.length} {urgentOrders.length === 1 ? "pedido precisa" : "pedidos precisam"} de atenção hoje
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-sans text-xs font-medium text-emerald-900">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Tudo em dia no ateliê</span>
                  </div>
                )}
              </div>

              <h1 className="mt-3 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
                {greeting}, {clientName}!
              </h1>
              <p className="mt-1 max-w-2xl font-sans text-xs sm:text-sm font-light leading-relaxed text-[#8b4114]/75">
                Aqui você acompanha tudo de forma simples: pedidos de clientes, confirmações de pagamento, produção das artes e catálogo da loja.
              </p>
            </div>

            {/* Quick Action Primary Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/admin/pedidos"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#8b4114] px-4 font-sans text-xs font-medium text-white shadow-sm transition-all hover:bg-[#72340e] hover:shadow-md"
              >
                <FolderKanban className="h-4 w-4" />
                <span>Ver pedidos</span>
              </Link>
              <Link
                to="/admin/galeria"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#8b4114]/15 bg-white px-4 font-sans text-xs font-medium text-[#8b4114] shadow-2xs transition-all hover:bg-[#f0dfd4]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Cadastrar produto</span>
              </Link>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-white px-3.5 font-sans text-xs font-light text-[#8b4114]/85 shadow-2xs transition-all hover:bg-[#f0dfd4]"
                title="Abrir loja em nova aba"
              >
                <Eye className="h-4 w-4 text-[#76877e]" />
                <span className="hidden sm:inline">Loja</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Key Metric Cards */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            icon={FolderKanban}
            label="Pedidos em aberto"
            value={openOrders}
            tone="terracotta"
            subtitle={`${orders.length} pedidos no histórico total`}
            helpText="Mostra todos os pedidos ativos que ainda precisam ser produzidos ou entregues."
            tag="Em andamento"
            href="/admin/pedidos"
          />
          <AdminMetricCard
            icon={Clock3}
            label="Falta pagamento"
            value={pipelineStats.awaiting}
            tone="amber"
            subtitle="Clientes que ainda não confirmaram"
            helpText="Pedidos que aguardam comprovante ou confirmação do Pix para você iniciar a arte."
            tag={pipelineStats.awaiting > 0 ? "Requer atenção" : "Em dia"}
            href="/admin/pedidos?status=awaiting_payment"
          />
          <AdminMetricCard
            icon={Layers}
            label="Em produção ou revisão"
            value={pipelineStats.production + pipelineStats.approval}
            tone="sage"
            subtitle={`${pipelineStats.production} produzindo · ${pipelineStats.approval} revisando`}
            helpText="Mostra o total de artes na sua mesa de desenho e as que já foram enviadas para aprovação da cliente."
            tag="Ateliê ativo"
            href="/admin/pedidos?status=in_production"
          />
          <AdminMetricCard
            icon={TrendingUp}
            label="Produtos no site"
            value={galleryCount + otherProjectsCount}
            tone="neutral"
            subtitle={`${galleryCount} na galeria · ${otherProjectsCount} especiais`}
            helpText="Total de quadros e artes cadastrados para clientes comprarem no site."
            tag="Catálogo no ar"
            href="/admin/galeria"
          />
        </div>

        {/* Urgent Action Center ("⚡ Precisa de Atenção Hoje") */}
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-4 shadow-2xs sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-sans text-base font-semibold text-amber-950">
                    Precisa de atenção hoje
                  </h2>
                  <AdminHelpTooltip label="Estes pedidos aguardam uma ação sua (confirmar pagamento ou aprovar arte) para continuarem avançando." />
                </div>
                <p className="font-sans text-xs font-light text-amber-900/75">
                  {urgentOrders.length === 0
                    ? "Nenhum cliente aguardando resposta agora."
                    : `${urgentOrders.length} ${urgentOrders.length === 1 ? "pedido aguarda" : "pedidos aguardam"} sua confirmação ou aprovação.`}
                </p>
              </div>
            </div>

            {urgentOrders.length > 0 && (
              <Link
                to="/admin/pedidos?status=awaiting_payment"
                className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-amber-900 hover:text-amber-950 hover:underline"
              >
                <span>Ver todos os pendentes</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="mt-3.5">
            {urgentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/40 py-6 px-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mt-2.5 font-sans text-sm font-medium text-emerald-950">
                  Tudo tranquilo e em dia! ✨
                </h3>
                <p className="mt-0.5 max-w-md font-sans text-xs font-light text-emerald-800/80">
                  Nenhum pedido precisa de confirmação imediata de pagamento ou revisão de arte no momento.
                </p>
                <Link
                  to="/admin/pedidos"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 font-sans text-xs font-medium text-emerald-900 shadow-2xs hover:bg-emerald-50 transition-colors"
                >
                  <span>Ver pedidos em produção</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {urgentOrders.slice(0, 3).map((order) => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, "");
                  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                  const isAwaitingPayment = order.status === "awaiting_payment";

                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="group relative flex flex-col justify-between cursor-pointer rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs transition-all hover:border-amber-400 hover:shadow-sm"
                    >
                      <div>
                        {/* Header: Code & Action Reason Tag */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-[#8b4114]">
                              {order.code}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => copyOrderCode(e, order.code)}
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

                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              isAwaitingPayment
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-purple-100 text-purple-900 border border-purple-200"
                            }`}
                          >
                            {isAwaitingPayment ? "Falta pagamento" : "Falta aprovação"}
                          </span>
                        </div>

                        {/* Customer & Product */}
                        <h4 className="mt-2 truncate font-sans text-sm font-medium text-[#8b4114]">
                          {order.customer_name}
                        </h4>
                        <p className="mt-0.5 truncate font-sans text-xs font-light text-[#76877e]">
                          {order.product || "Arte personalizada"} {order.size ? `(${order.size})` : ""}
                        </p>
                      </div>

                      {/* Action Bar */}
                      <div
                        className="mt-3 flex items-center justify-between gap-2 border-t border-amber-100 pt-2.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`https://wa.me/${formattedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-emerald-700 transition-colors"
                          title="Falar com cliente no WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 rounded-lg border border-[#8b4114]/15 bg-white px-2.5 py-1.5 text-xs font-medium text-[#8b4114] hover:bg-[#f0dfd4] transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Production Funnel Roadmap ("Fluxo de Produção do Ateliê") */}
        <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-[#8b4114]/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                  Fluxo de trabalho
                </span>
                <AdminHelpTooltip label="Clique em qualquer etapa para ir direto aos pedidos daquela fase." />
              </div>
              <h2 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                Caminho dos pedidos no ateliê
              </h2>
            </div>

            <Link
              to="/admin/pedidos"
              className="inline-flex items-center gap-1 font-sans text-xs font-medium text-[#8b4114] hover:underline"
            >
              <span>Abrir tabela de pedidos</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Interactive Steps Grid */}
          <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {pipelineSteps.map((step) => (
              <Link
                key={step.id}
                to={`/admin/pedidos?status=${step.id}`}
                className={`group flex flex-col justify-between rounded-xl border p-3 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm ${step.badgeColor}`}
                title={`Ver pedidos em: ${step.label}`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] font-medium opacity-65">
                      Passo {step.stepNumber}
                    </span>
                    <span
                      className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 font-sans text-xs font-bold ${step.pillClass}`}
                    >
                      {step.count}
                    </span>
                  </div>

                  <strong className="mt-1.5 block font-sans text-sm font-medium leading-snug">
                    {step.label}
                  </strong>
                  <p className="mt-0.5 text-[11px] font-light leading-snug opacity-75">
                    {step.sublabel}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center justify-end text-[11px] font-medium opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  <span>Filtrar</span>
                  <ArrowRight className="h-3 w-3 ml-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Grid: Management & Side Orders Feed */}
        <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_25rem] xl:items-stretch">
          {/* Left Column: Catalog & Quick Navigation */}
          <div className="min-w-0 space-y-4">
            {/* Catalog Overview */}
            <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-5">
              <div className="flex items-center justify-between gap-2 border-b border-[#8b4114]/10 pb-3 mb-3.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                      Catálogo & Loja
                    </span>
                    <AdminHelpTooltip label="Gerencie os quadros e itens especiais disponíveis para compra no site." />
                  </div>
                  <h3 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                    Produtos publicados no site
                  </h3>
                </div>

                <Link
                  to="/admin/galeria"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#8b4114] px-2.5 font-sans text-xs font-medium text-white shadow-2xs hover:bg-[#72340e] transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Cadastrar arte</span>
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  to="/admin/galeria"
                  className="group relative flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all hover:border-[#8b4114]/35 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                        Galeria de Quadros
                      </span>
                      <h4 className="mt-0.5 font-sans text-sm font-medium text-[#8b4114]">
                        Quadros prontos & Carrosséis
                      </h4>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4f0] text-[#2d523a] border border-[#b5ccbd]">
                      <Layers3 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-sans text-2xl font-light text-[#8b4114]">{galleryCount} artes</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                      Editar &rarr;
                    </span>
                  </div>
                </Link>

                <Link
                  to="/admin/outros"
                  className="group relative flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all hover:border-[#8b4114]/35 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                        Projetos Especiais
                      </span>
                      <h4 className="mt-0.5 font-sans text-sm font-medium text-[#8b4114]">
                        Peças manuais & Presentes
                      </h4>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                      <PackageOpen className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="font-sans text-2xl font-light text-[#8b4114]">{otherProjectsCount} peças</span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                      Editar &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-5">
              <div className="mb-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                    Acesso rápido
                  </span>
                  <AdminHelpTooltip label="Atalhos diretos para as áreas mais usadas do painel administrativo." />
                </div>
                <h3 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Áreas do painel
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="group flex items-center gap-3 rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 transition-all duration-150 hover:bg-[#f8f1e9] hover:border-[#8b4114]/25 hover:shadow-2xs"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${item.accent} shadow-2xs transition-transform group-hover:scale-105`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-sans text-xs font-medium text-[#8b4114]">
                            {item.title}
                          </h4>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#76877e] transition-transform group-hover:translate-x-1" />
                        </div>
                        <p className="mt-0.5 truncate text-[11px] font-light text-[#76877e]">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Workflow Guide & Help Box */}
            <div className="rounded-2xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 shadow-2xs">
              <button
                type="button"
                onClick={() => setIsHelpOpen((prev) => !prev)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef4f0] text-[#2d523a] border border-[#b5ccbd]">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-sans text-xs font-medium text-[#8b4114]">
                      Como funciona o fluxo de pedidos no ateliê?
                    </h4>
                    <p className="font-sans text-[11px] font-light text-[#76877e]">
                      Dica simples para nunca se perder na rotina diária
                    </p>
                  </div>
                </div>
                <span className="font-sans text-xs font-medium text-[#8b4114]">
                  {isHelpOpen ? "Ocultar" : "Ver guia"}
                </span>
              </button>

              {isHelpOpen && (
                <div className="mt-3.5 space-y-2 border-t border-[#8b4114]/10 pt-3 font-sans text-xs font-light text-[#8b4114]/85 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8b4114] text-[10px] font-semibold text-white">1</span>
                    <p><strong>Aguardando Pagamento:</strong> O cliente finalizou o pedido no site. Confirme se o Pix caiu na conta antes de começar.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">2</span>
                    <p><strong>Pagamento Confirmado:</strong> Clique no pedido e mude o status para confirmar o pagamento. Ele entra na sua fila de produção.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#8b4114] text-[10px] font-semibold text-white">3</span>
                    <p><strong>Em Produção & Revisão:</strong> Desenhe a arte. Envie a prévia no WhatsApp da cliente e marque como <em>Em Revisão</em>.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[10px] font-semibold text-white">4</span>
                    <p><strong>Finalizado:</strong> Cliente aprovou a arte? Mude para <em>Finalizado</em> para arquivar o pedido com tudo certo!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Recent Orders Feed */}
          <aside className="flex min-h-[30rem] flex-col rounded-2xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-5 xl:min-h-0">
            {/* Feed Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#8b4114]/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                    Atividade recente
                  </span>
                  <AdminHelpTooltip label="Clique em qualquer pedido para abrir a gaveta de detalhes e ações." side="left" />
                </div>
                <h2 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Últimos pedidos
                </h2>
              </div>

              <Link
                to="/admin/pedidos"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#8b4114]/15 bg-white px-2.5 font-sans text-xs font-light text-[#8b4114] shadow-xs transition-all hover:bg-[#f0dfd4]"
              >
                <span>Ver todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Quick Filter Segmented Buttons */}
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#f8f1e9] p-1 border border-[#8b4114]/10">
              <button
                type="button"
                onClick={() => setRecentFilter("all")}
                className={`flex-1 rounded-lg py-1 text-center font-sans text-xs font-medium transition-all ${
                  recentFilter === "all"
                    ? "bg-[#8b4114] text-white shadow-2xs"
                    : "text-[#76877e] hover:text-[#8b4114]"
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setRecentFilter("pending")}
                className={`flex-1 rounded-lg py-1 text-center font-sans text-xs font-medium transition-all ${
                  recentFilter === "pending"
                    ? "bg-[#8b4114] text-white shadow-2xs"
                    : "text-[#76877e] hover:text-[#8b4114]"
                }`}
              >
                Pendentes ({openOrders})
              </button>
              <button
                type="button"
                onClick={() => setRecentFilter("finished")}
                className={`flex-1 rounded-lg py-1 text-center font-sans text-xs font-medium transition-all ${
                  recentFilter === "finished"
                    ? "bg-[#8b4114] text-white shadow-2xs"
                    : "text-[#76877e] hover:text-[#8b4114]"
                }`}
              >
                Prontos ({pipelineStats.finished})
              </button>
            </div>

            {/* Scrollable Order Feed */}
            <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
              {filteredRecentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-8 text-center text-sm text-[#76877e]">
                  <FolderKanban className="h-8 w-8 text-[#8b4114]/40 mb-2" />
                  <p className="font-medium text-[#8b4114]">Nenhum pedido nesta aba.</p>
                  <p className="mt-0.5 text-xs font-light text-[#76877e]">
                    Mude o filtro acima para ver outros pedidos.
                  </p>
                </div>
              ) : (
                filteredRecentOrders.map((order) => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, "");
                  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                  const initials = order.customer_name ? order.customer_name.slice(0, 2).toUpperCase() : "C";

                  return (
                    <article
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="group cursor-pointer rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 shadow-2xs transition-all hover:border-[#8b4114]/30 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-semibold text-[#8b4114]">
                            {order.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyOrderCode(e, order.code)}
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
                        <AdminStatusBadge status={order.status} size="sm" />
                      </div>

                      <div className="mt-2 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0dfd4] font-sans text-xs font-bold text-[#8b4114] border border-[#ebd2c3]">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate font-sans text-xs font-medium text-[#8b4114]">
                            {order.customer_name}
                          </h4>
                          <p className="truncate text-[11px] font-light text-[#76877e]">
                            {order.product || "Arte personalizada"} {order.size ? `(${order.size})` : ""}
                          </p>
                        </div>
                      </div>

                      <div
                        className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#8b4114]/5 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] font-light text-[#76877e]">
                          {formatOrderDate(order.created_at)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <a
                            href={`https://wa.me/${formattedPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex h-6.5 items-center gap-1 rounded-lg border border-[#8b4114]/15 bg-white px-2 text-[11px] font-medium text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </aside>
        </div>

        {/* Full Order Detail Drawer */}
        <AdminOrderDrawer
          order={selectedOrder}
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(code, nextStatus) => updateStatus.mutate({ code, nextStatus })}
          onDeleteOrder={(code) => deleteOrder.mutate(code)}
          isUpdatingStatus={updateStatus.isPending}
          isDeletingOrder={deleteOrder.isPending}
        />
      </div>
    </section>
  );
};

export default Admin;
