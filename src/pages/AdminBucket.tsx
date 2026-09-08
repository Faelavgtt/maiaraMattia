import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Database, Download, FileText, HardDrive, Images, RefreshCw, Trash2, X } from "lucide-react";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
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
import {
  adminBucketFileUrl,
  deleteAdminBucketFile,
  listAdminBucketFiles,
  type BucketFileAsset,
} from "@/lib/admin-api";

type BucketScope = "site" | "orders" | "all";

const bucketScopes: Array<{
  value: BucketScope;
  label: string;
  description: string;
  prefix: string;
}> = [
  { value: "site", label: "Bucket do site", description: "Galeria e imagens usadas no catálogo", prefix: "gallery/" },
  { value: "orders", label: "Bucket de pedidos", description: "Referências enviadas por clientes", prefix: "orders/" },
  { value: "all", label: "Todos", description: "Visão completa do armazenamento", prefix: "" },
];

const scopePrefixes: Record<BucketScope, string> = {
  site: "gallery/",
  orders: "orders/",
  all: "",
};

const groupLabels: Record<BucketFileAsset["group"], string> = {
  gallery: "Site",
  orders: "Pedidos",
  other: "Outros",
};

const emptyFiles: BucketFileAsset[] = [];

const AdminBucket = () => {
  const [scope, setScope] = useState<BucketScope>("site");
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data, isError, isLoading, refetch } = useQuery({
    queryKey: ["admin-bucket-files", scope],
    queryFn: () => listAdminBucketFiles(scopePrefixes[scope]),
    retry: false,
  });

  const deleteFile = useMutation({
    mutationFn: deleteAdminBucketFile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bucket-files"] }),
  });

  const deleteSelectedFiles = useMutation({
    mutationFn: async (keys: string[]) => {
      await Promise.all(keys.map((key) => deleteAdminBucketFile(key)));
      return keys;
    },
    onSuccess: () => {
      setSelectedKeys(new Set());
      queryClient.invalidateQueries({ queryKey: ["admin-bucket-files"] });
    },
  });

  const files = data?.files ?? emptyFiles;
  const filteredFiles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return files;

    return files.filter((file) =>
      [file.key, file.contentType, groupLabels[file.group]]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [files, search]);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const imageCount = files.filter((file) => isPreviewableImage(file)).length;
  const siteFiles = filteredFiles.filter((file) => file.group === "gallery");
  const orderFiles = filteredFiles.filter((file) => file.group === "orders");
  const otherFiles = filteredFiles.filter((file) => file.group === "other");
  const siteCount = files.filter((file) => file.group === "gallery").length;
  const orderCount = files.filter((file) => file.group === "orders").length;
  const selectedVisibleKeys = filteredFiles.filter((file) => selectedKeys.has(file.key)).map((file) => file.key);
  const hasSelection = selectedKeys.size > 0;
  const allFilteredSelected = filteredFiles.length > 0 && selectedVisibleKeys.length === filteredFiles.length;
  const isDeletingAny = deleteFile.isPending || deleteSelectedFiles.isPending;

  useEffect(() => {
    setSelectedKeys(new Set());
  }, [scope]);

  const copyUrlToClipboard = (key: string) => {
    const url = adminBucketFileUrl(key);
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSelectedKey = (key: string) => {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllFiltered = () => {
    setSelectedKeys((current) => {
      const next = new Set(current);

      if (allFilteredSelected) {
        filteredFiles.forEach((file) => next.delete(file.key));
      } else {
        filteredFiles.forEach((file) => next.add(file.key));
      }

      return next;
    });
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#eef4f0] px-2.5 py-1 text-xs font-medium text-[#2d523a]">
              <Database className="h-3.5 w-3.5" />
              <span>Armazenamento & Mídia</span>
            </div>
            <h1 className="mt-2 font-sans text-2xl font-light tracking-tight text-[#8b4114] sm:text-3xl">
              Bucket de Imagens
            </h1>
            <p className="mt-1 font-sans text-xs sm:text-sm font-light text-[#8b4114]/70">
              Separe as imagens do site dos arquivos enviados nos pedidos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-white px-3.5 font-sans text-xs font-light text-[#8b4114] shadow-sm transition-colors hover:bg-[#f0dfd4] disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Storage Metrics Cards */}
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            label={scope === "site" ? "Arquivos do Site" : scope === "orders" ? "Arquivos de Pedidos" : "Total de Arquivos"}
            value={files.length}
            icon={Database}
            tone="terracotta"
            subtitle={`${imageCount} imagens no filtro`}
          />
          <AdminMetricCard
            label="Site"
            value={scope === "all" ? siteCount : scope === "site" ? files.length : 0}
            icon={Images}
            tone="neutral"
            subtitle="Prefixo gallery/"
          />
          <AdminMetricCard
            label="Pedidos"
            value={scope === "all" ? orderCount : scope === "orders" ? files.length : 0}
            icon={FileText}
            tone="sage"
            subtitle="Prefixo orders/"
          />
          <AdminMetricCard
            label="Espaço"
            value={formatFileSize(totalSize)}
            icon={HardDrive}
            tone="amber"
            subtitle={scope === "orders" ? "Consumo em pedidos" : "Consumo no filtro"}
          />
        </div>

        {/* Filters Toolbar */}
        <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-3.5 shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.75fr)]">
            <div className="grid gap-2 sm:grid-cols-3">
              {bucketScopes.map((item) => {
                const isActive = scope === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setScope(item.value)}
                    className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                      isActive
                        ? "border-[#8b4114] bg-[#8b4114] text-white shadow-sm"
                        : "border-[#8b4114]/10 bg-[#fffaf5] text-[#8b4114] hover:border-[#8b4114]/30"
                    }`}
                  >
                    <span className="block font-sans text-xs font-medium">{item.label}</span>
                    <span className={`mt-0.5 block font-sans text-[11px] font-light ${isActive ? "text-white/75" : "text-[#76877e]"}`}>
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative flex h-10 items-center rounded-xl border border-[#8b4114]/15 bg-white px-3 shadow-xs transition-all focus-within:border-[#8b4114]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent font-sans text-xs sm:text-sm font-light text-[#8b4114] outline-none placeholder:text-[#76877e]/70"
                placeholder="Buscar arquivo por nome, tipo ou caminho..."
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#76877e] hover:bg-[#f0dfd4] hover:text-[#8b4114]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Files Grid */}
        <div className="rounded-2xl border border-[#8b4114]/10 bg-white p-5 shadow-[0_4px_20px_rgba(93,51,29,0.03)]">
          {!isLoading && !isError && filteredFiles.length > 0 && (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-sans text-xs font-medium text-[#8b4114]">
                  {hasSelection ? `${selectedKeys.size} selecionado(s)` : "Selecione imagens para excluir em lote"}
                </p>
                <p className="mt-0.5 font-sans text-[11px] font-light text-[#76877e]">
                  A seleção acompanha o filtro atual de site, pedidos ou todos.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAllFiltered}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs font-light text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{allFilteredSelected ? "Limpar seleção" : "Selecionar visíveis"}</span>
                </button>

                {hasSelection && (
                  <button
                    type="button"
                    onClick={() => setSelectedKeys(new Set())}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#8b4114]/15 bg-white px-3 font-sans text-xs font-light text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancelar</span>
                  </button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      disabled={!hasSelection || isDeletingAny}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 font-sans text-xs font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir selecionados</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl border-[#8b4114]/15 bg-white text-[#8b4114] shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-sans text-xl font-medium text-[#8b4114]">
                        Excluir {selectedKeys.size} arquivo(s)?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="font-sans text-sm font-light leading-relaxed text-[#8b4114]/75">
                        Esta ação remove os objetos selecionados do bucket. Se algum arquivo estiver vinculado a produto ou pedido, ele deixará de abrir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 font-mono text-[11px] text-[#8b4114]">
                      {Array.from(selectedKeys).map((key) => (
                        <p key={key} className="break-all">{key}</p>
                      ))}
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeletingAny} className="rounded-xl border-[#8b4114]/15 text-[#8b4114]">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        disabled={isDeletingAny}
                        onClick={() => deleteSelectedFiles.mutate(Array.from(selectedKeys))}
                        className="rounded-xl bg-red-700 text-white hover:bg-red-800"
                      >
                        {deleteSelectedFiles.isPending ? "Excluindo..." : "Excluir arquivos"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center font-sans text-sm font-light text-[#8b4114]/70">
              Carregando arquivos do bucket...
            </div>
          ) : isError ? (
            <div className="py-16 text-center font-sans text-sm font-light text-red-700">
              Não foi possível carregar o bucket no momento.
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center font-sans text-sm font-light text-[#76877e]">
              Nenhum arquivo encontrado com os filtros atuais.
            </div>
          ) : scope === "all" ? (
            <div className="space-y-7">
              <BucketFileSection
                title="Bucket do site"
                subtitle="Imagens usadas na galeria e nas vitrines do catálogo."
                files={siteFiles}
                copiedKey={copiedKey}
                selectedKeys={selectedKeys}
                isDeleting={isDeletingAny}
                onCopy={copyUrlToClipboard}
                onToggleSelect={toggleSelectedKey}
                onDelete={(key) => deleteFile.mutate(key)}
              />
              <BucketFileSection
                title="Bucket de pedidos"
                subtitle="Referências, arquivos originais e anexos enviados pelos clientes."
                files={orderFiles}
                copiedKey={copiedKey}
                selectedKeys={selectedKeys}
                isDeleting={isDeletingAny}
                onCopy={copyUrlToClipboard}
                onToggleSelect={toggleSelectedKey}
                onDelete={(key) => deleteFile.mutate(key)}
              />
              {otherFiles.length > 0 && (
                <BucketFileSection
                  title="Outros arquivos"
                  subtitle="Objetos fora dos prefixos gallery/ e orders/."
                  files={otherFiles}
                  copiedKey={copiedKey}
                  selectedKeys={selectedKeys}
                  isDeleting={isDeletingAny}
                  onCopy={copyUrlToClipboard}
                  onToggleSelect={toggleSelectedKey}
                  onDelete={(key) => deleteFile.mutate(key)}
                />
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFiles.map((file) => (
                <BucketFileCard
                  key={file.key}
                  file={file}
                  isDeleting={isDeletingAny}
                  isSelected={selectedKeys.has(file.key)}
                  isCopied={copiedKey === file.key}
                  onCopy={copyUrlToClipboard}
                  onToggleSelect={toggleSelectedKey}
                  onDelete={(key) => deleteFile.mutate(key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function BucketFileSection({
  title,
  subtitle,
  files,
  copiedKey,
  selectedKeys,
  isDeleting,
  onCopy,
  onToggleSelect,
  onDelete,
}: {
  title: string;
  subtitle: string;
  files: BucketFileAsset[];
  copiedKey: string | null;
  selectedKeys: Set<string>;
  isDeleting: boolean;
  onCopy: (key: string) => void;
  onToggleSelect: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  if (files.length === 0) {
    return (
      <section>
        <BucketSectionHeader title={title} subtitle={subtitle} count={0} />
        <div className="rounded-xl border border-dashed border-[#8b4114]/15 bg-[#fffaf5] px-4 py-6 text-center font-sans text-xs font-light text-[#76877e]">
          Nenhum arquivo nesta seção.
        </div>
      </section>
    );
  }

  return (
    <section>
      <BucketSectionHeader title={title} subtitle={subtitle} count={files.length} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {files.map((file) => (
          <BucketFileCard
            key={file.key}
            file={file}
            isDeleting={isDeleting}
            isSelected={selectedKeys.has(file.key)}
            isCopied={copiedKey === file.key}
            onCopy={onCopy}
            onToggleSelect={onToggleSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

function BucketSectionHeader({ title, subtitle, count }: { title: string; subtitle: string; count: number }) {
  return (
    <div className="mb-3 flex flex-col gap-1 border-b border-[#8b4114]/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-sans text-base font-medium text-[#8b4114]">{title}</h2>
        <p className="font-sans text-xs font-light text-[#76877e]">{subtitle}</p>
      </div>
      <span className="font-sans text-xs font-medium text-[#8b4114]">
        {count} {count === 1 ? "arquivo" : "arquivos"}
      </span>
    </div>
  );
}

function BucketFileCard({
  file,
  isDeleting,
  isSelected,
  isCopied,
  onCopy,
  onToggleSelect,
  onDelete,
}: {
  file: BucketFileAsset;
  isDeleting: boolean;
  isSelected: boolean;
  isCopied: boolean;
  onCopy: (key: string) => void;
  onToggleSelect: (key: string) => void;
  onDelete: (key: string) => void;
}) {
  const isImage = isPreviewableImage(file);
  const url = adminBucketFileUrl(file.key);
  const fileName = file.key.split("/").pop() ?? file.key;

  return (
    <article className={`group overflow-hidden rounded-2xl border bg-[#fffaf5] shadow-2xs transition-all hover:bg-white hover:shadow-md ${isSelected ? "border-[#8b4114] ring-2 ring-[#8b4114]/18" : "border-[#8b4114]/10"}`}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="relative block aspect-[4/3] overflow-hidden bg-[#f0dfd4]"
      >
        {isImage ? (
          <img
            src={url}
            alt={fileName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#76877e]">
            <FileText className="h-10 w-10 text-[#76877e]/60" />
            <span className="font-sans text-xs font-light">Documento</span>
          </span>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-lg bg-white/95 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wider text-[#8b4114] shadow-xs backdrop-blur-xs">
          {groupLabels[file.group]}
        </span>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleSelect(file.key);
          }}
          className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg border shadow-sm transition-colors ${
            isSelected
              ? "border-[#8b4114] bg-[#8b4114] text-white"
              : "border-[#8b4114]/15 bg-white/95 text-[#8b4114] hover:bg-[#f0dfd4]"
          }`}
          aria-label={isSelected ? "Remover da seleção" : "Selecionar arquivo"}
        >
          <Check className={`h-4 w-4 ${isSelected ? "opacity-100" : "opacity-35"}`} />
        </button>
      </a>

      <div className="p-3.5">
        <p className="truncate font-sans text-xs font-semibold text-[#8b4114]" title={fileName}>
          {fileName}
        </p>
        <p className="mt-0.5 line-clamp-1 font-sans text-[11px] font-light text-[#76877e]" title={file.key}>
          {file.key}
        </p>

        <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px]">
          <div className="rounded-lg bg-white px-2 py-1 border border-[#8b4114]/5">
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#76877e]">Tamanho</span>
            <span className="font-medium text-[#8b4114]">{formatFileSize(file.size)}</span>
          </div>
          <div className="rounded-lg bg-white px-2 py-1 border border-[#8b4114]/5">
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#76877e]">Data</span>
            <span className="font-medium text-[#8b4114]">{formatDate(file.uploaded)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1.5 border-t border-[#8b4114]/10 bg-white p-2.5">
        <button
          type="button"
          onClick={() => onCopy(file.key)}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-lg border border-[#8b4114]/15 bg-[#fffaf5] px-2 font-sans text-xs font-light text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
          title="Copiar URL direta do arquivo"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copiar URL</span>
            </>
          )}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8b4114]/15 bg-[#fffaf5] text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
          title="Abrir / Baixar arquivo"
          aria-label="Abrir arquivo"
        >
          <Download className="h-3.5 w-3.5" />
        </a>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
              title="Excluir arquivo"
              aria-label="Excluir arquivo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-2xl border-[#8b4114]/15 bg-white text-[#8b4114] shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-sans text-xl font-medium text-[#8b4114]">
                Excluir arquivo permanentemente?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-sans text-sm font-light leading-relaxed text-[#8b4114]/75">
                Esta ação remove o objeto do bucket. Se ele estiver vinculado a algum produto ou pedido, a imagem/anexo deixará de abrir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-3 font-sans text-xs font-light text-[#8b4114] break-all">
              {file.key}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting} className="rounded-xl border-[#8b4114]/15 text-[#8b4114]">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                onClick={() => onDelete(file.key)}
                className="rounded-xl bg-red-700 text-white hover:bg-red-800"
              >
                {isDeleting ? "Excluindo..." : "Excluir arquivo"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}

function isPreviewableImage(file: BucketFileAsset) {
  return (file.contentType ?? inferContentTypeFromKey(file.key))?.startsWith("image/") ?? false;
}

function inferContentTypeFromKey(key: string) {
  const extension = key.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    pdf: "application/pdf",
  };

  return extension ? contentTypes[extension] ?? null : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default AdminBucket;
