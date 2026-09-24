import { Copy, Edit3, Layers3, Trash2 } from "lucide-react";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";
import type { GalleryProduct } from "@/lib/gallery-products";

export function AdminGalleryProductsList({
  products,
  onEditProduct,
  onDuplicateProduct,
  onRemoveProduct,
}: {
  products: GalleryProduct[];
  onEditProduct: (product: GalleryProduct) => void;
  onDuplicateProduct: (product: GalleryProduct) => void;
  onRemoveProduct: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-white p-4 shadow-[0_18px_40px_rgba(93,51,29,0.06)] sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-[#8b4114]/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-sans text-lg font-light text-[#8b4114]">Produtos cadastrados</h2>
            <AdminHelpTooltip label="Esta lista mostra os produtos salvos. Editar, duplicar ou excluir mantém o mesmo modelo de card." />
          </div>
          <p className="mt-0.5 font-sans text-xs font-light text-[#8b4114]/65">Itens que aparecem no carrossel da home.</p>
        </div>
        <Layers3 className="h-5 w-5 text-[#76877e]" />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-1">
        {products.map((product) => (
          <article key={product.id} className="grid gap-3 rounded-xl border border-[#8b4114]/15 bg-[#fffaf5] p-3 shadow-sm transition-colors hover:bg-white sm:grid-cols-[5.5rem_1fr_auto]">
            <div className="overflow-hidden rounded-lg bg-[#f0dfd4]" style={{ aspectRatio: product.aspectRatio }}>
              <img src={product.src} alt={product.title} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="font-sans text-xs font-light uppercase tracking-[0.16em] text-[#76877e]">{product.number} - {product.category}</p>
              <h3 className="mt-1 break-words font-sans text-base font-light leading-snug text-[#8b4114]">{product.title}</h3>
              <p className="mt-1 font-sans text-sm font-medium text-[#8b4114]">{product.price}</p>
              <p className="mt-1 line-clamp-2 font-sans text-xs font-light leading-5 text-[#8b4114]/65">{product.description}</p>
              <p className="mt-1 font-sans text-[0.68rem] font-light text-[#8b4114]">
                {product.dimensions} | {product.includedItems.length} itens
              </p>
            </div>
            <div className="flex items-center gap-2 sm:flex-col">
              <button type="button" onClick={() => onEditProduct(product)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8b4114]/15 bg-white text-[#8b4114] transition-colors hover:bg-[#7d876d] hover:text-white" aria-label={`Editar ${product.title}`} title="Editar">
                <Edit3 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onDuplicateProduct(product)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8b4114]/15 bg-white text-[#8b4114] transition-colors hover:bg-[#f0dfd4] hover:text-[#8b4114]" aria-label={`Duplicar ${product.title}`} title="Duplicar">
                <Copy className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => onRemoveProduct(product.id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#8b4114]/15 bg-white text-[#8b4114] transition-colors hover:bg-[#8b4114] hover:text-white" aria-label={`Remover ${product.title}`} title="Excluir">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
