export function AdminGalleryHeader({
  statusMessage,
  productsCount,
  eyebrow = "Galeria",
  title = "Cadastrar produto na galeria",
  countLabel = "Produtos no carrossel",
}: {
  statusMessage: string;
  productsCount: number;
  eyebrow?: string;
  title?: string;
  countLabel?: string;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(13rem,auto)] lg:items-end">
      <div>
        <p className="font-sans text-xs font-normal uppercase tracking-[0.18em] text-[#76877e]">{eyebrow}</p>
        <h1 className="font-sans text-2xl font-light text-[#8b4114] md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl rounded-xl border border-[#8b4114]/15 bg-white px-3.5 py-2 font-sans text-sm font-light leading-5 text-[#8b4114]/70 shadow-xs">
          {statusMessage}
        </p>
      </div>

      <div className="rounded-2xl border border-[#8b4114]/15 bg-white px-5 py-3 shadow-[0_10px_24px_rgba(93,51,29,0.06)]">
        <p className="font-sans text-xs font-normal uppercase tracking-[0.16em] text-[#76877e]">{countLabel}</p>
        <p className="mt-1 font-sans text-3xl font-light text-[#8b4114]">{productsCount}</p>
      </div>
    </div>
  );
}
