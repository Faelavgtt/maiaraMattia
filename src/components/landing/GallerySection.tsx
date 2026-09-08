import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Frame, 
  Image as ImageIcon, 
  MessageCircle, 
  Heart, 
  Star 
} from "lucide-react";
import { GalleryModal, type GalleryProject } from "./GalleryModal";
import {
  galleryProductFromApi,
  galleryProductsUpdatedEvent,
  numberGalleryProducts,
  readGalleryProducts,
  type GalleryProduct,
} from "@/lib/gallery-products";
import { listGalleryProducts } from "@/lib/api";
import { useCart } from "@/lib/cart";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const customGalleryMessage = [
  "Orçar personalizado",
  "Três quadros que se conversam, mais uma Familinha para fechar a história.",
].join("\n");

const customGalleryUrl = buildWhatsappUrl(customGalleryMessage);
const galleryStaticImage = "/image/fotoExemplo.jpeg";
const galleryHoverImage = "/image/fotoExemplo1.jpeg";

export function GallerySection() {
  const wallRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const pressedProjectIdRef = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();
  const { addItem } = useCart();
  
  const [galleryProducts, setGalleryProducts] = useState<GalleryProduct[]>(() => readGalleryProducts());
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);

  const activeGalleryProjects = galleryProducts;
  const carouselProjects = [...activeGalleryProjects, ...activeGalleryProjects, ...activeGalleryProjects];

  const getLoopSegmentWidth = () => {
    const wall = wallRef.current;
    if (!wall) return 0;
    return wall.scrollWidth / 3;
  };

  const syncLoopPosition = () => {
    const wall = wallRef.current;
    const segmentWidth = getLoopSegmentWidth();
    if (!wall || !segmentWidth) return;

    if (wall.scrollLeft < segmentWidth * 0.45) {
      wall.scrollLeft += segmentWidth;
    }

    if (wall.scrollLeft > segmentWidth * 1.55) {
      wall.scrollLeft -= segmentWidth;
    }
  };

  const scrollWall = (direction: "previous" | "next") => {
    const wall = wallRef.current;
    if (!wall) return;

    wall.scrollBy({
      left: direction === "next" ? 380 : -380,
      behavior: "smooth",
    });
  };

  const startWallDrag = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    pressedProjectIdRef.current = (event.target as HTMLElement).closest<HTMLElement>("[data-gallery-project-id]")?.dataset.galleryProjectId ?? null;
    dragStartXRef.current = event.clientX;
    dragStartScrollLeftRef.current = wallRef.current?.scrollLeft ?? 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragWall = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !wallRef.current) return;

    const distance = event.clientX - dragStartXRef.current;
    if (Math.abs(distance) > 6) {
      hasDraggedRef.current = true;
    }
    wallRef.current.scrollLeft = dragStartScrollLeftRef.current - distance;
  };

  const stopWallDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (!hasDraggedRef.current) {
      const project = activeGalleryProjects.find((item) => item.id === pressedProjectIdRef.current);

      if (project) {
        setSelectedProject(project);
      }

      pressedProjectIdRef.current = null;
      return;
    }

    pressedProjectIdRef.current = null;
    syncLoopPosition();
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const wall = wallRef.current;
      const segmentWidth = getLoopSegmentWidth();
      if (!wall || !segmentWidth) return;

      wall.scrollLeft = segmentWidth;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [galleryProducts.length]);

  useEffect(() => {
    const updateProducts = () => setGalleryProducts(readGalleryProducts());

    window.addEventListener(galleryProductsUpdatedEvent, updateProducts);
    window.addEventListener("storage", updateProducts);

    return () => {
      window.removeEventListener(galleryProductsUpdatedEvent, updateProducts);
      window.removeEventListener("storage", updateProducts);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    listGalleryProducts()
      .then((data) => {
        if (!isMounted || data.products.length === 0) return;
        setGalleryProducts(numberGalleryProducts(data.products.map(galleryProductFromApi)));
      })
      .catch(() => {
        if (!isMounted) return;
        setGalleryProducts(readGalleryProducts());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedProject(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section id="galeria" className="relative isolate overflow-hidden bg-[#faf4ed] px-5 pb-9 pt-2 sm:px-8 md:pb-11 md:pt-3 xl:pb-12">
      
      {/* Background Decorativo */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#8b4114_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.06]" />

        

        <div className="absolute right-[-8%] top-1/3 h-80 w-80 rounded-full bg-[#dbe3c9]/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#f5dfb8]/40 blur-3xl" />

        <Star className="absolute left-[6%] bottom-20 h-8 w-8 -rotate-12 fill-[#7d876d] text-[#7d876d]/80" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-4 border-b border-[#8b4114]/12 pb-4 md:gap-5 md:pb-5 lg:grid-cols-[1fr_0.78fr] lg:items-end">
          
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8efda] px-3.5 py-1 font-sans text-xs font-semibold tracking-wider text-[#5f6850] shadow-xs uppercase">
              <Frame className="h-3.5 w-3.5 " aria-hidden="true" />
              Ilustrações
            </div>

            <h2 className="mt-3 font-sans text-[1.85rem] font-light leading-tight text-[#8b4114] sm:text-3xl md:text-[2.35rem] xl:text-[2.5rem]">
              Em formato de pôsteres, disponíveis de forma individual ou coleção completa

            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm font-light leading-6 text-[#8b4114]/80 sm:text-base sm:leading-relaxed">
              Explores clicando em uma das opções para ver os detalhes de cada desenho, dimensões e como comprar.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="relative rounded-xl border-2 border-dashed border-[#e6c29c] bg-[#fff9f2] p-4 shadow-sm transition-all duration-300 hover:rotate-0 sm:-rotate-1 sm:rounded-2xl sm:p-5"
          >
            <span className="inline-flex items-center gap-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-wider text-[#7d876d]">
              <Heart className="h-3 w-3 fill-[#7d876d]" />
              Pronta ou sob medida?
            </span>
            <h3 className="mt-1 font-sans text-lg font-normal leading-tight text-[#8b4114] sm:text-xl">
              Escolha uma galeria pronta ou peça um projeto exclusivo.
            </h3>
            <p className="mt-2 font-sans text-xs font-light leading-relaxed text-[#8b4114]/75">
              Escolha o pôster ou galeria. Se quiser mudar a paleta de cores e enviar o nome da criança personalizado:
            </p>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={customGalleryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-white border border-[#8b4114]/15 px-4 font-sans text-xs font-medium text-[#8b4114] shadow-xs transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Orçar personalizado
              </a>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
          <p className="font-sans text-[0.7rem] font-medium uppercase tracking-wider text-[#8b4114]/60">
            Arraste a parede para explorar os kits
          </p>

          <div className="flex items-center gap-2.5" aria-label="Controles do carrossel">
            <button
              type="button"
              onClick={() => scrollWall("previous")}
              aria-label="Ver galerias anteriores"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white text-[#8b4114] shadow-xs transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4114]/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollWall("next")}
              aria-label="Ver próximas galerias"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8b4114] text-white shadow-xs transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4114]/40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* --- CARROSSEL --- */}
        <div className="mt-3 rounded-xl bg-[#979f8a] shadow-inner sm:mt-4">
          <div
            ref={wallRef}
            onPointerDown={startWallDrag}
            onPointerMove={dragWall}
            onPointerUp={stopWallDrag}
            onPointerCancel={stopWallDrag}
            onPointerLeave={stopWallDrag}
            onScroll={syncLoopPosition}
            className="flex min-h-[20rem] cursor-grab select-none items-start gap-5 overflow-x-auto px-5 pb-5 pt-7 active:cursor-grabbing sm:min-h-[23rem] sm:gap-6 sm:px-8 sm:pb-7 sm:pt-8 md:min-h-[26rem] md:gap-7 md:px-10 xl:min-h-[28rem] xl:gap-8 xl:px-10 xl:pb-8 xl:pt-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselProjects.map((project, index) => (
              <GalleryFrame 
                key={`${index}-${project.number}`} 
                project={project} 
                index={index} 
                reduceMotion={Boolean(reduceMotion)} 
                onSelect={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>

        {/* Rodapé da Seção */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="mt-4 flex flex-col gap-3 border-t border-[#8b4114]/12 pt-3 sm:flex-row sm:items-center sm:justify-between md:mt-5 md:pt-4"
        >
          <p className="max-w-xl font-sans text-xs font-light leading-5 text-[#8b4114]/65">
            Em formato de pôsteres, disponíveis de forma individual ou coleção completa.
          </p>
          <a
            href={customGalleryUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#c68043] px-5 font-sans text-xs font-medium text-white shadow-xs transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Orçar personalizado
          </a>
        </motion.div>
      </div>

      {/* Componente Modal / Pop-up Isolado */}
      <GalleryModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onAddToCart={(project) =>
          addItem({
            productId: project.id,
            title: project.title,
            category: project.category,
            orderType: "galeria",
            price: project.price,
            dimensions: project.dimensions,
            imageUrl: project.src,
          })
        }
      />
    </section>
  );
}

function GalleryFrame({
  project,
  index,
  reduceMotion,
  onSelect,
}: {
  project: GalleryProject;
  index: number;
  reduceMotion: boolean;
  onSelect: () => void;
}) {
  const frameWidth = `min(${Math.round(project.width * 0.96)}px, 74vw)`;
  const hasDiscountPrice = Boolean(project.originalPrice && project.originalPrice !== project.price);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -6, rotate: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.52, delay: index * 0.05, ease: "easeOut" }}
      className="group relative shrink-0 snap-center cursor-pointer"
      data-gallery-project-id={project.id}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      style={{
        width: frameWidth,
        marginTop: Math.round(project.offset * 0.45),
        rotate: `${project.rotate}deg`,
      }}
    >
      {/* Pregador / Pino no topo */}
      <span className="absolute left-1/2 top-[-1.35rem] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#f0dfd4] shadow-[0_2px_6px_rgba(0,0,0,0.2)]" />
      <span className="absolute left-1/2 top-[-1rem] h-6 w-px -translate-x-1/2 bg-[#f0dfd4]/85" />

      {/* Badge de Preço Flutuante */}
      <div className={`absolute -right-2 -top-4 z-20 rounded-full px-2.5 py-1 font-sans text-white shadow-sm transition-transform group-hover:scale-110 ${hasDiscountPrice ? "bg-[#c68043]" : "bg-[#8b4114]"}`}>
        {hasDiscountPrice && (
          <span className="block text-[0.58rem] font-medium leading-none text-white/70 line-through">
            {project.originalPrice}
          </span>
        )}
        <span className="block text-[0.65rem] font-semibold leading-none">
          {project.price}
        </span>
      </div>

      <div className="relative border-[6px] border-[#f0dfd4] bg-[#fffaf5] p-2.5 shadow-[0_14px_28px_rgba(54,67,64,0.24)] transition-shadow duration-300 group-hover:shadow-[0_20px_35px_rgba(54,67,64,0.35)]">
        <div
          className="relative overflow-hidden border border-[#d6bea1]"
          style={{
            aspectRatio: project.aspectRatio,
            backgroundColor: project.surface,
          }}
        >
          {project.src ? (
            <>
              <img
                src={project.src}
                alt={project.title}
                className="h-full w-full object-cover transition-opacity duration-500 ease-out group-hover:opacity-0 group-focus-visible:opacity-0"
                draggable="false"
              />
              {project.hoverSrc && (
                <img
                  src={project.hoverSrc}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                  draggable="false"
                />
              )}
            </>
          ) : (
            <div className="absolute inset-4 flex flex-col items-center justify-center bg-[#fffaf5]/85 px-5 text-center text-[#8b4114]">
              <ImageIcon className="h-8 w-8" aria-hidden="true" />
              <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#8b4114]/80">{project.placeholder}</p>
              <p className="mt-1 font-sans text-[0.68rem] font-light leading-4 text-[#8b4114]/60">Imagem será adicionada depois</p>
            </div>
          )}

        </div>
      </div>

      {/* TEXTO CORRIGIDO: Aplicado fundo pastel/transparente e texto escuro para legibilidade perfeita sobre a parede verde #979f8a */}
      <div className="mt-2.5 rounded-lg bg-black/20 px-2 py-1 text-center backdrop-blur-xs">
        <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-wider text-[#f0dfd4]">
          {project.number} · {project.category}
        </p>
        <h3 className="mt-0.5 font-sans text-xs font-medium leading-tight text-white">{project.title}</h3>
      </div>
    </motion.article>
  );
}
