import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Clock3,
  Database,
  ExternalLink,
  Eye,
  FolderKanban,
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
  const [session, setSession] = useState<AdminSession | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    getAdminSession().then(setSession);
  }, []);

  const { data } = useQuery({
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
  const awaitingPaymentCount = orders.filter((order) => order.status === "awaiting_payment").length;
  const inProductionCount = orders.filter(
    (order) => order.status === "in_production" || order.status === "awaiting_approval",
  ).length;

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

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  return (
    <section className="px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-4">
        {/* Clean Greeting Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[#8b4114]/12 bg-gradient-to-br from-[#fffaf5] via-white to-[#fbf4ee] p-5 shadow-[0_4px_24px_rgba(93,51,29,0.04)] sm:p-6">
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-[#f0dfd4]/35 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#33533e]/20 bg-[#eef4f0] px-2.5 py-1 font-sans text-xs font-medium text-[#2d523a]">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="capitalize">{todayFormatted}</span>
                </div>
              </div>

              <h1 className="mt-2.5 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
                {greeting}, {clientName}!
              </h1>
              <p className="mt-1 font-sans text-xs sm:text-sm font-light text-[#8b4114]/75">
                Visão geral do ateliê. Use os atalhos abaixo ou navegue pelo menu lateral para gerenciar cada área.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-2.5">
              <Link
                to="/admin/pedidos"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#8b4114] px-4 py-2 font-sans text-xs sm:text-sm font-medium text-white shadow-sm transition-all hover:bg-[#72340e] hover:shadow-md"
              >
                <FolderKanban className="h-4 w-4 shrink-0" />
                <span>Ver pedidos</span>
              </Link>
              <Link
                to="/admin/galeria"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#8b4114]/20 bg-white px-4 py-2 font-sans text-xs sm:text-sm font-medium text-[#8b4114] shadow-xs transition-all hover:bg-[#f0dfd4]"
              >
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span>Novo quadro</span>
              </Link>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="col-span-2 sm:col-span-1 inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#8b4114]/20 bg-white px-3.5 py-2 font-sans text-xs sm:text-sm font-medium text-[#8b4114] shadow-xs transition-all hover:bg-[#f0dfd4]"
                title="Abrir loja em nova aba"
              >
                <ExternalLink className="h-4 w-4 shrink-0 text-[#76877e]" />
                <span>Ver loja</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4 Essential Metric Cards */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            icon={FolderKanban}
            label="Pedidos em aberto"
            value={openOrders}
            tone="terracotta"
            subtitle={`${orders.length} pedidos no histórico`}
            helpText="Total de pedidos em andamento que necessitam de produção ou entrega."
            tag="Em andamento"
            href="/admin/pedidos"
          />
          <AdminMetricCard
            icon={Clock3}
            label="Aguardando pagamento"
            value={awaitingPaymentCount}
            tone="amber"
            subtitle="Comprovante ou Pix pendente"
            helpText="Pedidos que ainda aguardam pagamento para dar início à produção."
            tag={awaitingPaymentCount > 0 ? "Atenção" : "Em dia"}
            href="/admin/pedidos?status=awaiting_payment"
          />
          <AdminMetricCard
            icon={Sparkles}
            label="Em produção ou revisão"
            value={inProductionCount}
            tone="sage"
            subtitle="Artes na mesa de desenho"
            helpText="Pedidos em criação ou aguardando aprovação da cliente."
            tag="Ateliê ativo"
            href="/admin/pedidos?status=in_production"
          />
          <AdminMetricCard
            icon={TrendingUp}
            label="Produtos no catálogo"
            value={galleryCount + otherProjectsCount}
            tone="neutral"
            subtitle={`${galleryCount} quadros · ${otherProjectsCount} especiais`}
            helpText="Total de produtos ativos publicados na loja online."
            tag="Catálogo"
            href="/admin/galeria"
          />
        </div>

        {/* 2-Column Balanced Dashboard */}
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12 lg:items-start">
          {/* Left Column (7 cols): Direct Access to System Sections */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-6">
              <div className="border-b border-[#8b4114]/10 pb-3 mb-3.5">
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                  Áreas do Ateliê
                </span>
                <h2 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                  Gerenciamento concentrado por aba
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Pedidos */}
                <Link
                  to="/admin/pedidos"
                  className="group flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all duration-150 hover:border-[#8b4114]/35 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fbeee7] text-[#8b4114] border border-[#ebd2c3]">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#8b4114] bg-[#f0dfd4]/60 px-2 py-0.5 rounded-md">
                        {openOrders} ativos
                      </span>
                    </div>
                    <h3 className="mt-3 font-sans text-sm font-medium text-[#8b4114]">
                      Central de Pedidos
                    </h3>
                    <p className="mt-1 text-xs font-light text-[#76877e] leading-relaxed">
                      Quadro Kanban, tabela de clientes, aprovação de pagamentos e prazos.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end font-sans text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                    <span>Acessar pedidos &rarr;</span>
                  </div>
                </Link>

                {/* Galeria de Quadros */}
                <Link
                  to="/admin/galeria"
                  className="group flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all duration-150 hover:border-[#8b4114]/35 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef4f0] text-[#2d523a] border border-[#b5ccbd]">
                        <Layers3 className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#2d523a] bg-[#eef4f0] px-2 py-0.5 rounded-md">
                        {galleryCount} quadros
                      </span>
                    </div>
                    <h3 className="mt-3 font-sans text-sm font-medium text-[#8b4114]">
                      Galeria de Quadros
                    </h3>
                    <p className="mt-1 text-xs font-light text-[#76877e] leading-relaxed">
                      Cadastro de artes, fotos, valores, kits e organização do carrossel do site.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end font-sans text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                    <span>Gerenciar quadros &rarr;</span>
                  </div>
                </Link>

                {/* Outros Projetos */}
                <Link
                  to="/admin/outros"
                  className="group flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all duration-150 hover:border-[#8b4114]/35 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                        <PackageOpen className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-md">
                        {otherProjectsCount} projetos
                      </span>
                    </div>
                    <h3 className="mt-3 font-sans text-sm font-medium text-[#8b4114]">
                      Outros Projetos
                    </h3>
                    <p className="mt-1 text-xs font-light text-[#76877e] leading-relaxed">
                      Peças especiais feitas à mão, pinturas, cartões e presentes afetivos.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end font-sans text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                    <span>Gerenciar projetos &rarr;</span>
                  </div>
                </Link>

                {/* Biblioteca de Arquivos */}
                <Link
                  to="/admin/bucket"
                  className="group flex flex-col justify-between rounded-xl border border-[#8b4114]/10 bg-gradient-to-br from-[#fffaf5] to-white p-4 transition-all duration-150 hover:border-[#8b4114]/35 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f8f1e9] text-[#8b4114] border border-[#e8d5cb]">
                        <Database className="h-5 w-5" />
                      </div>
                      <span className="font-sans text-[11px] font-medium text-[#76877e] bg-white px-2 py-0.5 rounded-md border border-[#8b4114]/10">
                        R2 Storage
                      </span>
                    </div>
                    <h3 className="mt-3 font-sans text-sm font-medium text-[#8b4114]">
                      Banco de Arquivos
                    </h3>
                    <p className="mt-1 text-xs font-light text-[#76877e] leading-relaxed">
                      Fotos originais e referências enviadas pelas clientes para personalização.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-end font-sans text-xs font-medium text-[#8b4114] group-hover:translate-x-0.5 transition-transform">
                    <span>Ver arquivos &rarr;</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Clean Recent Activity Feed */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-[0_4px_20px_rgba(93,51,29,0.03)] sm:p-6">
              <div className="flex items-center justify-between gap-2 border-b border-[#8b4114]/10 pb-3 mb-3.5">
                <div>
                  <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-[#76877e]">
                    Atividade Recente
                  </span>
                  <h2 className="mt-0.5 font-sans text-base font-medium text-[#8b4114]">
                    Últimos pedidos
                  </h2>
                </div>

                <Link
                  to="/admin/pedidos"
                  className="inline-flex items-center gap-1 font-sans text-xs font-medium text-[#8b4114] hover:underline"
                >
                  <span>Ver todos</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-6 text-center text-sm text-[#76877e]">
                  <FolderKanban className="h-7 w-7 text-[#8b4114]/40 mb-2" />
                  <p className="font-medium text-[#8b4114]">Nenhum pedido registrado.</p>
                  <p className="mt-0.5 text-xs font-light text-[#76877e]">
                    Os novos pedidos dos clientes aparecerão aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentOrders.map((order) => {
                    const cleanPhone = order.customer_phone.replace(/\D/g, "");
                    const formattedPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
                    const initials = order.customer_name ? order.customer_name.slice(0, 2).toUpperCase() : "C";

                    return (
                      <article
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="group cursor-pointer rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 shadow-2xs transition-all hover:border-[#8b4114]/30 hover:bg-white hover:shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-[#8b4114]">
                            {order.code}
                          </span>
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
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#8b4114]/15 bg-white px-2.5 text-xs font-medium text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>Ver</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
