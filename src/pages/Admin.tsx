import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  FolderKanban,
  Layers,
  Layers3,
  MessageCircle,
  PackageOpen,
  PlusCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminOrderDrawer } from "@/components/admin/AdminOrderDrawer";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
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
    title: "Ver todos os pedidos",
    description: "Acompanhe orçamentos, clientes e andamento das produções.",
    href: "/admin/pedidos",
    icon: FolderKanban,
    accent: "bg-[#fbeee7] text-[#8b4114]",
  },
  {
    title: "Galeria de produtos",
    description: "Cadastre artes, quadros e carrosséis exibidos na loja.",
    href: "/admin/galeria",
    icon: Layers3,
    accent: "bg-[#eef4f0] text-[#33533e]",
  },
  {
    title: "Outros projetos",
    description: "Gerencie peças especiais, pintura manual e presentes.",
    href: "/admin/outros",
    icon: PackageOpen,
    accent: "bg-amber-50 text-amber-900",
  },
  {
    title: "Bucket",
    description: "Consulte arquivos e imagens enviados para o projeto.",
    href: "/admin/bucket",
    icon: Database,
    accent: "bg-[#f8f1e9] text-[#8b4114]",
  },
];

const emptyOrders: AdminOrderRow[] = [];

const Admin = () => {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const queryClient = useQueryClient();

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
  const latestOrders = orders;
  const galleryCount = galleryData?.products.length ?? 0;
  const otherProjectsCount = otherProjectsData?.products.length ?? 0;
  const openOrders = orders.filter((order) => !["finished"].includes(order.status)).length;
  const makerOrders = orders.filter((order) => order.order_type === "maker").length;

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

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  const metrics = useMemo(
    () => [
      {
        key: "open",
        label: "Pedidos Abertos",
        icon: FolderKanban,
        value: openOrders,
        tone: "terracotta" as const,
        subtitle: `${orders.length} pedidos no histórico`,
      },
      {
        key: "payment",
        label: "Aguardando Pagamento",
        icon: Clock3,
        value: pipelineStats.awaiting,
        tone: "amber" as const,
        subtitle: "Orçamentos pendentes",
      },
      {
        key: "paid",
        label: "Em Produção / Aprov.",
        icon: Layers,
        value: pipelineStats.production + pipelineStats.approval,
        tone: "sage" as const,
        subtitle: `${pipelineStats.production} produzindo • ${pipelineStats.approval} aprovando`,
      },
      {
        key: "products",
        label: "Produtos Ativos",
        icon: TrendingUp,
        value: galleryCount + otherProjectsCount,
        tone: "neutral" as const,
        subtitle: `${galleryCount} galeria + ${otherProjectsCount} especiais`,
      },
    ],
    [galleryCount, openOrders, orders.length, otherProjectsCount, pipelineStats],
  );

  return (
    <section className="px-4 py-4 sm:px-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:px-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3.5">
        {/* Welcome Executive Header */}
        <div className="relative overflow-hidden rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] via-white to-[#fbf4ee] p-4 shadow-[0_4px_24px_rgba(93,51,29,0.04)]">
          <div
            className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-[#f0dfd4]/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#eef4f0] px-3 py-1 font-sans text-xs font-medium text-[#2d523a]">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="capitalize">{todayFormatted}</span>
              </div>
              <h1 className="mt-2 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
                Painel do Ateliê
              </h1>
              <p className="mt-1 font-sans text-xs font-light leading-relaxed text-[#8b4114]/75">
                Visão operacional do ateliê: orçamentos, produção artesanal e catálogo de produtos.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/admin/pedidos"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#8b4114] px-4 font-sans text-xs font-medium text-white shadow-sm transition-all hover:bg-[#72340e]"
              >
                <FolderKanban className="h-4 w-4" />
                <span>Ver Pedidos</span>
              </Link>
              <Link
                to="/admin/galeria"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#8b4114]/15 bg-white px-4 font-sans text-xs font-medium text-[#8b4114] shadow-2xs transition-all hover:bg-[#f0dfd4]"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Novo Produto</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <AdminMetricCard
              key={metric.key}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              tone={metric.tone}
              subtitle={metric.subtitle}
            />
          ))}
        </div>

        {/* Main Section: Compact Management & Side Orders */}
        <div className="grid min-h-0 flex-1 gap-3.5 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-stretch">
          <div className="min-w-0 space-y-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-3 shadow-2xs">
                <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-amber-950">Atenção Hoje</h3>
                      <p className="font-sans text-xs font-light text-amber-900/70">
                        {urgentOrders.length} {urgentOrders.length === 1 ? "pedido requer" : "pedidos requerem"} ação
                      </p>
                    </div>
                  </div>

                  <Link to="/admin/pedidos" className="shrink-0 font-sans text-xs font-medium text-amber-900 hover:text-amber-950">
                    Gerenciar &rarr;
                  </Link>
                </div>

                <div className="mt-2">
                  {urgentOrders.length === 0 ? (
                    <div className="flex items-center gap-2 py-2 text-xs font-light text-emerald-800">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Nenhuma ação imediata.</span>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {urgentOrders.slice(0, 2).map((order) => {
                        const cleanPhone = order.customer_phone.replace(/\D/g, "");
                        const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

                        return (
                          <div
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="group cursor-pointer rounded-lg border border-amber-200/70 bg-white p-2.5 shadow-2xs transition-all hover:border-amber-400 hover:shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs font-semibold text-[#8b4114]">{order.code}</span>
                              <AdminStatusBadge status={order.status} size="sm" />
                            </div>
                            <p className="mt-1 truncate text-xs font-medium text-[#8b4114]">{order.customer_name}</p>
                            <a
                              href={`https://wa.me/${formattedPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#8b4114]/10 bg-white p-3 shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">Fluxo</p>
                    <h3 className="font-sans text-sm font-medium text-[#8b4114]">Pipeline do Ateliê</h3>
                  </div>
                  <Link to="/admin/pedidos" className="font-sans text-xs font-medium text-[#8b4114] hover:underline">
                    Ver &rarr;
                  </Link>
                </div>

                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {[
                    { label: "Pag.", value: pipelineStats.awaiting, className: "border-amber-200 bg-amber-50/60 text-amber-900" },
                    { label: "Pago", value: pipelineStats.paid, className: "border-emerald-200 bg-emerald-50/60 text-emerald-900" },
                    { label: "Prod.", value: pipelineStats.production, className: "border-[#8b4114]/20 bg-[#fbeee7] text-[#8b4114]" },
                    { label: "Aprov.", value: pipelineStats.approval, className: "border-purple-200 bg-purple-50/60 text-purple-900" },
                    { label: "Fim", value: pipelineStats.finished, className: "border-slate-200 bg-slate-50 text-slate-800" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg border p-2 text-center ${item.className}`}>
                      <span className="block font-sans text-lg font-light">{item.value}</span>
                      <span className="font-sans text-[10px] font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
            {/* Catalog Snapshot */}
            <div className="rounded-xl border border-[#8b4114]/10 bg-white p-3.5 shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
              <div className="mb-3">
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                  Catálogo
                </p>
                <h3 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Produtos no Site
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/admin/galeria"
                  className="group block rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3.5 transition-colors hover:bg-[#f0dfd4]/40"
                >
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                    Galeria
                  </p>
                  <p className="mt-1 font-sans text-2xl font-light text-[#8b4114]">{galleryCount}</p>
                  <span className="mt-1 block text-[11px] text-[#76877e] group-hover:text-[#8b4114] transition-colors">
                    Gerenciar &rarr;
                  </span>
                </Link>

                <Link
                  to="/admin/outros"
                  className="group block rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3.5 transition-colors hover:bg-[#f0dfd4]/40"
                >
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-[#76877e]">
                    Especiais
                  </p>
                  <p className="mt-1 font-sans text-2xl font-light text-[#8b4114]">{otherProjectsCount}</p>
                  <span className="mt-1 block text-[11px] text-[#76877e] group-hover:text-[#8b4114] transition-colors">
                    Gerenciar &rarr;
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Actions Navigation Cards */}
            <div className="rounded-xl border border-[#8b4114]/10 bg-white p-3.5 shadow-[0_4px_20px_rgba(93,51,29,0.03)] space-y-2.5">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                  Navegação Rápida
                </p>
                <h3 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Gerenciar Ateliê
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="group flex items-center gap-2 rounded-lg border border-[#8b4114]/10 bg-[#fffaf5] p-2.5 transition-all duration-150 hover:bg-[#f8f1e9] hover:shadow-2xs"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#8b4114]/10 ${item.accent} shadow-2xs`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="truncate font-sans text-xs font-medium text-[#8b4114]">
                            {item.title}
                          </h4>
                          <ArrowRight className="h-3 w-3 shrink-0 text-[#76877e] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col rounded-xl border border-[#8b4114]/10 bg-white p-3.5 shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#8b4114]/10 pb-2.5">
              <div>
                <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                  Acompanhamento
                </p>
                <h2 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Pedidos Feitos
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

            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1.5">
              {latestOrders.length === 0 ? (
                <div className="rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-5 text-center text-sm text-[#76877e]">
                  Nenhum pedido recente.
                </div>
              ) : (
                latestOrders.map((order) => {
                  const cleanPhone = order.customer_phone.replace(/\D/g, "");
                  const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

                  return (
                    <article
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="group cursor-pointer rounded-lg border border-[#8b4114]/10 bg-[#fffaf5] p-2.5 shadow-2xs transition-all hover:border-[#8b4114]/30 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-[#8b4114]">
                          {order.code}
                        </span>
                        <AdminStatusBadge status={order.status} size="sm" />
                      </div>
                      <h3 className="mt-1 truncate font-sans text-xs font-medium text-[#8b4114]">
                        {order.customer_name}
                      </h3>
                      <p className="truncate text-[11px] font-light text-[#76877e]">
                        {order.product || "Arte personalizada"} {order.size ? `(${order.size})` : ""}
                      </p>
                      <div
                        className="mt-2 flex items-center justify-between gap-2 border-t border-[#8b4114]/5 pt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`https://wa.me/${formattedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-800"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#8b4114]/15 bg-white px-2 text-[11px] font-medium text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Ver</span>
                        </button>
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
