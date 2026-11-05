import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Ruler, Check, ShoppingBag, ZoomIn, Eye } from "lucide-react";
import { createPortal } from "react-dom";

export interface GalleryProject {
  id: string;
  number: string;
  title: string;
  category: string;
  price: string;
  originalPrice?: string;
  dimensions: string;
  includedItems: readonly string[];
  description: string;
  placeholder: string;
  src: string;
  hoverSrc?: string;
  surface: string;
  frameFormat?: string;
  width: number;
  aspectRatio: string;
  offset: number;
  rotate: number;
}

interface GalleryModalProps {
  project: GalleryProject | null;
  onClose: () => void;
  onAddToCart: (project: GalleryProject) => void;
}

export function GalleryModal({ project, onClose, onAddToCart }: GalleryModalProps) {
  const [activeImage, setActiveImage] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  useEffect(() => {
    if (project?.src) {
      setActiveImage(project.src);
      setIsZoomed(false);
    }
  }, [project?.id, project?.src]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  const currentDisplayImage = activeImage || project.src;
  const hasDiscountPrice = Boolean(project.originalPrice && project.originalPrice !== project.price);
  const imagesList = [
    { label: "Foto principal", url: project.src },
    ...(project.hoverSrc ? [{ label: "Foto secundária", url: project.hoverSrc }] : []),
  ];

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 md:p-8">
        {/* Backdrop escurecido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#1f1713]/65 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", duration: 0.45, bounce: 0.15 }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-2 border-[#e6c29c] bg-[#fffaf5] shadow-2xl sm:rounded-3xl lg:max-w-5xl"
        >
          {/* Botão Fechar no topo */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3.5 top-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white/90 text-[#8b4114] shadow-sm backdrop-blur-xs transition hover:bg-[#8b4114] hover:text-white"
            aria-label="Fechar detalhes"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:items-start lg:gap-8">
              {/* --- COLUNA ESQUERDA: IMAGEM GRANDE EM DESTAQUE --- */}
              <div className="flex flex-col gap-3">
                <div
                  className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-[#d6bea1] bg-[#f0dfd4]/40 p-2 sm:p-3 transition-all ${
                    isZoomed ? "cursor-zoom-out ring-2 ring-[#7d876d]" : "cursor-zoom-in"
                  }`}
                  style={{ backgroundColor: project.surface || "#f0dfd4" }}
                  onClick={() => setIsZoomed(!isZoomed)}
                  title={isZoomed ? "Clique para diminuir" : "Clique para ampliar a imagem"}
                >
                  <img
                    src={currentDisplayImage}
                    alt={project.title}
                    className={`w-full rounded-xl object-contain transition-transform duration-300 select-none ${
                      isZoomed
                        ? "scale-125 max-h-[36rem]"
                        : "max-h-[22rem] sm:max-h-[26rem] md:max-h-[28rem] hover:scale-[1.02]"
                    }`}
                  />

                  {/* Badge de Dica de Zoom */}
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 font-sans text-[10px] font-medium text-white backdrop-blur-xs">
                    <ZoomIn className="h-3 w-3" />
                    {isZoomed ? "Reduzir" : "Ampliar"}
                  </span>
                </div>

                {/* Miniaturas de Fotos se houver hoverSrc */}
                {imagesList.length > 1 && (
                  <div className="flex items-center gap-2.5 pt-1">
                    {imagesList.map((img, idx) => {
                      const isSelected = currentDisplayImage === img.url;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveImage(img.url);
                            setIsZoomed(false);
                          }}
                          className={`relative flex h-16 w-20 items-center justify-center overflow-hidden rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-[#7d876d] ring-2 ring-[#7d876d]/40 shadow-sm"
                              : "border-[#8b4114]/20 opacity-70 hover:opacity-100 hover:border-[#8b4114]/40"
                          }`}
                        >
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                          {isSelected && (
                            <span className="absolute inset-0 bg-[#7d876d]/10 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-white drop-shadow" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <span className="font-sans text-[11px] font-light text-[#8b4114]/60 ml-1">
                      Clique para alternar a foto
                    </span>
                  </div>
                )}
              </div>

              {/* --- COLUNA DIREITA: INFORMAÇÕES E COMPRA --- */}
              <div className="flex flex-col justify-between">
                <div>
                  {/* Tag da Categoria */}
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efda] px-3.5 py-1 text-[0.72rem] font-semibold tracking-wider text-[#5f6850]">
                    <Sparkles className="h-3.5 w-3.5 text-[#5f6850]" />
                    {project.category}
                  </div>

                  {/* Título & Dimensões */}
                  <h3 className="mt-3 font-sans text-2xl font-light leading-tight text-[#8b4114] sm:text-3xl">
                    {project.title}
                  </h3>

                  <p className="mt-1.5 flex items-center gap-1.5 font-sans text-xs font-light text-[#8b4114]/70">
                    <Ruler className="h-3.5 w-3.5 text-[#8b4114]/60" />
                    {project.dimensions}
                  </p>

                  {/* Preço em destaque */}
                  <div className="mt-4 flex items-baseline gap-3 border-y border-[#8b4114]/10 py-3.5">
                    <span className="font-sans text-2xl font-semibold text-[#8b4114] sm:text-3xl">
                      {project.price}
                    </span>
                    {hasDiscountPrice && (
                      <span className="font-sans text-sm font-medium text-[#8b4114]/50 line-through">
                        {project.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Descrição */}
                  {project.description && (
                    <p className="mt-4 font-sans text-sm font-light leading-relaxed text-[#8b4114]/85">
                      {project.description}
                    </p>
                  )}

                  {/* Itens Inclusos no Kit */}
                  {project.includedItems && project.includedItems.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-[#e6c29c]/70 bg-[#fff9f2] p-4 shadow-2xs">
                      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#7d876d]">
                        O que vem neste kit:
                      </p>
                      <ul className="mt-2.5 space-y-2">
                        {project.includedItems.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 font-sans text-xs font-light leading-snug text-[#8b4114]/85">
                            <Check className="h-4 w-4 shrink-0 text-[#7d876d] mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botão de Compra */}
                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onAddToCart(project);
                      onClose();
                    }}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#7d876d] px-6 font-sans text-sm font-medium text-white shadow-md transition-all hover:bg-[#6c765d] hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <ShoppingBag className="h-4.5 w-4.5" />
                    Adicionar ao pedido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
