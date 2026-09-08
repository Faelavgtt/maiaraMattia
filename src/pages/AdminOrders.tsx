import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock3,
  FileCheck,
  FolderKanban,
  Kanban,
  Layers,
  List,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminOrderDrawer } from "@/components/admin/AdminOrderDrawer";
import { AdminOrdersKanban } from "@/components/admin/AdminOrdersKanban";
import { AdminOrdersTable } from "@/components/admin/AdminOrdersTable";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import {
  deleteAdminOrder,
  listAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderRow,
  type AdminOrderSource,
  type AdminOrderStatus,
  type AdminOrderType,
} from "@/lib/admin-api";

type ViewMode = "list" | "kanban";

const statusTabOptions: { value: AdminOrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos os Pedidos" },
  { value: "awaiting_payment", label: "Aguardando Pagamento" },
  { value: "payment_confirmed", label: "Pagamento Confirmado" },
  { value: "in_production", label: "Em Produção" },
  { value: "awaiting_approval", label: "Aguardando Aprovação" },
  { value: "finished", label: "Finalizados" },
];

const emptyOrders: AdminOrderRow[] = [];

const AdminOrders = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderRow | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "all">("all");
  const [type, setType] = useState<AdminOrderType | "all">("all");
  const [source, setSource] = useState<AdminOrderSource | "all">("all");
  const [fileState, setFileState] = useState<"all" | "with_files" | "without_files">("all");
  const queryClient = useQueryClient();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listAdminOrders,
    retry: false,
  });

  const orders = data?.orders ?? emptyOrders;

  const updateStatus = useMutation({
    mutationFn: ({ code, nextStatus }: { code: string; nextStatus: AdminOrderStatus }) =>
      updateAdminOrderStatus(
        code,
        nextStatus,
        nextStatus === "payment_confirmed" ? "Pagamento confirmado no painel" : undefined,
      ),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      // Keep drawer updated if open
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

  // Calculate dynamic tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      awaiting_payment: 0,
      payment_confirmed: 0,
      in_production: 0,
      awaiting_approval: 0,
      finished: 0,
    };

    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });

    return counts;
  }, [orders]);

  const orderStats = useMemo(() => {
    const awaitingPayment = orders.filter((order) => order.status === "awaiting_payment").length;
    const inProgress = orders.filter((order) =>
      ["payment_confirmed", "in_production", "awaiting_approval"].includes(order.status),
    ).length;
    const withFiles = orders.filter((order) => (order.files?.length ?? 0) > 0).length;

    return {
      total: orders.length,
      awaitingPayment,
      inProgress,
      withFiles,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = status === "all" || order.status === status;
      const matchesType =
        type === "all" || order.order_type === type || (order.items?.some((item) => item.order_type === type) ?? false);
      const matchesSource = source === "all" || order.source === source;
      const matchesFiles =
        fileState === "all" ||
        (fileState === "with_files" && (order.files?.length ?? 0) > 0) ||
        (fileState === "without_files" && (!order.files || order.files.length === 0));
      const matchesSearch =
        searchTerm.length === 0 ||
        [
          order.code,
          order.customer_name,
          order.customer_phone,
          order.customer_email,
          order.product,
          order.colors,
          order.size,
          order.notes,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));

      return matchesStatus && matchesType && matchesSource && matchesFiles && matchesSearch;
    });
  }, [orders, search, status, type, source, fileState]);

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setSource("all");
    setFileState("all");
  };

  return (
    <section className="px-4 py-4 sm:px-6 lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:px-6">
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3.5">
        {/* Page Title & View Switcher */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef4f0] px-2.5 py-1 text-xs font-medium text-[#2d523a]">
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Central de Pedidos do Ateliê</span>
            </div>
            <h1 className="mt-1.5 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
              Gestão de Pedidos
            </h1>
            <p className="mt-0.5 font-sans text-xs font-light text-[#8b4114]/70">
              Acompanhe cada etapa de produção, contate clientes via WhatsApp e confirme pagamentos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-[#8b4114]/15 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 font-sans text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-[#8b4114] text-white shadow-2xs"
                    : "text-[#76877e] hover:text-[#8b4114]"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 font-sans text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-[#8b4114] text-white shadow-2xs"
                    : "text-[#76877e] hover:text-[#8b4114]"
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-white px-3.5 font-sans text-xs font-light text-[#8b4114] shadow-2xs transition-colors hover:bg-[#f0dfd4] disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid shrink-0 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            label="Total de Pedidos"
            value={orderStats.total}
            icon={FolderKanban}
            tone="terracotta"
            subtitle="Todos os registros"
          />
          <AdminMetricCard
            label="Aguardando Pagamento"
            value={orderStats.awaitingPayment}
            icon={Clock3}
            tone="amber"
            subtitle="Pendentes de confirmação"
          />
          <AdminMetricCard
            label="Em Produção / Aprov."
            value={orderStats.inProgress}
            icon={Layers}
            tone="sage"
            subtitle="Em andamento no ateliê"
          />
          <AdminMetricCard
            label="Com Arquivos Anexos"
            value={orderStats.withFiles}
            icon={FileCheck}
            tone="neutral"
            subtitle="Prontos para desenho"
          />
        </div>

        {/* Status Segmented Tabs Bar (Shopify style) */}
        <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
          {statusTabOptions.map((tab) => {
            const isActive = status === tab.value;
            const count = tabCounts[tab.value] ?? 0;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-sans text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#8b4114] text-white shadow-sm ring-1 ring-[#8b4114]"
                    : "border border-[#8b4114]/10 bg-white text-[#76877e] hover:bg-[#fffaf5] hover:text-[#8b4114]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-[#f8f1e9] text-[#8b4114]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters Toolbar */}
        <AdminToolbar
          search={search}
          status={status}
          type={type}
          source={source}
          fileState={fileState}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onTypeChange={setType}
          onSourceChange={setSource}
          onFileStateChange={setFileState}
          onClearFilters={clearFilters}
        />

        {/* View Mode: List vs Kanban Board */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1.5 lg:pr-2">
          {viewMode === "list" ? (
            <AdminOrdersTable
              orders={filteredOrders}
              onSelectOrder={(order) => setSelectedOrder(order)}
              onStatusChange={(code, nextStatus) => updateStatus.mutate({ code, nextStatus })}
              onDeleteOrder={(code) => deleteOrder.mutate(code)}
              isUpdatingStatus={updateStatus.isPending}
              isDeletingOrder={deleteOrder.isPending}
            />
          ) : (
            <AdminOrdersKanban
              orders={filteredOrders}
              onSelectOrder={(order) => setSelectedOrder(order)}
              onStatusChange={(code, nextStatus) => updateStatus.mutate({ code, nextStatus })}
              isUpdatingStatus={updateStatus.isPending}
            />
          )}
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

export default AdminOrders;
