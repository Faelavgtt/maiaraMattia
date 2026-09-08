import { useEffect, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MessageCircle,
  Sparkles,
  ShoppingBag,
  Star,
  Smile,
} from "lucide-react";
import { GalleryModal, type GalleryProject } from "./GalleryModal";
import { listOtherProjects } from "@/lib/api";
import { useCart } from "@/lib/cart";
import {
  otherProjectFromApi,
  otherProjectsUpdatedEvent,
  readOtherProjects,
  writeOtherProjects,
  type OtherProjectProduct,
} from "@/lib/other-projects";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const otherProjectsMessage = [
  "Quer encomendar alguma peça que não está disponível no site?",
  "Veja disponibilidade clicando aqui:",
  "Conversar",
].join("\n");

const otherProjectsWhatsappUrl = buildWhatsappUrl(otherProjectsMessage);

export function OtherProjectsSection() {
  const wallRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const pressedProjectIdRef = useRef<string | null>(null);
  const reduceMotion = useReducedMotion();

  const [otherProjects, setOtherProjects] = useState<OtherProjectProduct[]>(() => readOtherProjects());
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);
  const { addItem } = useCart();
  const carouselProjects = [...otherProjects, ...otherProjects, ...otherProjects];

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
      left: direction === "next" ? 340 : -340,
      behavior: "smooth",
    });
  };

  const startWallDrag = (event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    pressedProjectIdRef.current = (event.target as HTMLElement).closest<HTMLElement>("[data-other-project-id]")?.dataset.otherProjectId ?? null;
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
      const project = otherProjects.find((item) => item.id === pressedProjectIdRef.current);

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
  }, [otherProjects.length]);

  useEffect(() => {
    const updateProducts = () => setOtherProjects(readOtherProjects());

    window.addEventListener(otherProjectsUpdatedEvent, updateProducts);
    window.addEventListener("storage", updateProducts);

    return () => {
      window.removeEventListener(otherProjectsUpdatedEvent, updateProducts);
      window.removeEventListener("storage", updateProducts);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    listOtherProjects()
      .then((data) => {
        if (!isMounted || data.products.length === 0) return;
        const apiProducts = data.products.map(otherProjectFromApi);
        setOtherProjects(apiProducts);
        writeOtherProjects(apiProducts);
      })
      .catch(() => {
        if (!isMounted) return;
        setOtherProjects(readOtherProjects());
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="outros-projetos" className="relative isolate overflow-hidden bg-[#faf4ed] px-5 py-9 sm:px-8 md:py-11 xl:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#8b4114_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.07]" />

        <svg className="absolute left-0 top-10 w-full text-[#8b4114]/15" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,30 C320,90 420,10 720,60 C1020,110 1120,20 1440,50" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
        </svg>

        <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-[#f6c9b8]/30 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-[#dbe3c9]/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#f5dfb8]/40 blur-3xl" />

        <Star className="absolute bottom-16 right-[6%] h-9 w-9 -rotate-12 fill-[#7d876d] text-[#7d876d]/80" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 border-b border-[#8b4114]/12 pb-4 md:gap-5 md:pb-5 lg:grid-cols-[0.9fr_0.7fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 font-sans text-[0.68rem] font-normal uppercase tracking-[0.2em] text-[#7d876d]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Outros trabalhos do ateliê
            </p>
            <h2 className="mt-2 font-sans text-[1.75rem] font-extralight leading-tight text-[#8b4114] sm:text-3xl md:text-[2.15rem] xl:text-[2.25rem]">
              Peças artísticas desenvolvidas por nós para diversos objetos e superfícies.
            </h2>
            
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="rounded-xl border border-[#8b4114]/10 bg-[#fffaf5] p-4 shadow-[0_14px_30px_rgba(54,67,64,0.07)] sm:rotate-[0.6deg]"
          >
            <p className="font-sans text-[0.68rem] font-normal uppercase tracking-[0.18em] text-[#76877e]">
              Ideia diferente?
            </p>
            <h3 className="mt-1.5 font-sans text-lg font-extralight leading-tight text-[#8b4114] sm:text-xl">
              Quer encomendar alguma peça que não está disponível no site?
            </h3>
            <p className="mt-2 font-sans text-xs font-light leading-5 text-[#8b4114]/72">
              Veja disponibilidade clicando aqui:
            </p>
            <a
              href={otherProjectsWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#7d876d] px-4 font-sans text-xs font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Conversar
            </a>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
          <p className="font-sans text-[0.7rem] font-medium uppercase tracking-wider text-[#8b4114]/60">
            Arraste a parede para ver as peças disponíveis
          </p>

          <div className="flex items-center gap-2.5" aria-label="Controles do carrossel de outros projetos">
            <button
              type="button"
              onClick={() => scrollWall("previous")}
              aria-label="Ver peças anteriores"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white text-[#8b4114] shadow-xs transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4114]/40"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => scrollWall("next")}
              aria-label="Ver próximas peças"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8b4114] text-white shadow-xs transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4114]/40"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-[#979f8a] shadow-inner">
          <div
            ref={wallRef}
            onPointerDown={startWallDrag}
            onPointerMove={dragWall}
            onPointerUp={stopWallDrag}
            onPointerCancel={stopWallDrag}
            onPointerLeave={stopWallDrag}
            onScroll={syncLoopPosition}
            className="flex min-h-[20rem] cursor-grab select-none items-start gap-5 overflow-x-auto px-5 pb-5 pt-7 active:cursor-grabbing sm:min-h-[23rem] sm:gap-6 sm:px-8 sm:pb-7 sm:pt-8 md:min-h-[26rem] md:gap-7 xl:min-h-[28rem] xl:px-8 xl:pb-7 xl:pt-9 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {carouselProjects.map((project, index) => (
              <StickerProductCard
                key={`${index}-${project.id}`}
                project={project}
                index={index}
                reduceMotion={Boolean(reduceMotion)}
                onSelect={() => setSelectedProject(project)}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="mt-4 flex flex-col gap-3 border-t border-[#8b4114]/10 pt-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="font-sans text-[0.72rem] font-light uppercase tracking-[0.14em] text-[#8b4114]/50">
            Fique de olho, sempre teremos peças a pronta entrega nessa aba :)
          </p>
          <a
            href="#pedido"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#c68043] px-4 font-sans text-xs font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
          >
            Conversar
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </motion.div>
      </div>

      <GalleryModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onAddToCart={(project) =>
          addItem({
            productId: project.id,
            title: project.title,
            category: project.category,
            orderType: "outros",
            price: project.price,
            dimensions: project.dimensions,
            imageUrl: project.src,
          })
        }
      />
    </section>
  );
}

function StickerProductCard({
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
  const tapeColors = ["#ead4c6", "#e4e7d9", "#f0dfd4", "#d6bea1"];
  const tapeColor = tapeColors[index % tapeColors.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={reduceMotion ? undefined : { y: -8, rotate: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: "easeOut" }}
      className="group relative shrink-0 snap-center cursor-pointer"
      data-other-project-id={project.id}
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
        width: `min(${Math.round(project.width * 0.94)}px, 78vw)`,
        marginTop: index % 2 === 0 ? 0 : 26,
        rotate: `${project.rotate}deg`,
      }}
    >
      <span
        className="absolute left-1/2 top-[-1.05rem] z-30 h-9 w-24 -translate-x-1/2 rotate-[-2deg] rounded-[0.35rem] opacity-95 shadow-[0_3px_7px_rgba(54,67,64,0.08)] backdrop-blur-[1px]"
        style={{ backgroundColor: tapeColor }}
        aria-hidden="true"
      />

      <div className="absolute -right-3 top-5 z-30 rounded-full bg-[#c68043] px-2.5 py-1 font-sans text-white shadow-[0_5px_10px_rgba(84,45,26,0.12)] transition-transform group-hover:scale-105">
        <span className="block text-[0.62rem] font-semibold leading-none">{project.price}</span>
      </div>

      <div
        className="relative overflow-hidden rounded-[0.45rem] border border-[#8b4114]/8 bg-[#fffaf5] p-3 shadow-[0_10px_20px_rgba(54,67,64,0.13)] transition-shadow duration-300 before:absolute before:inset-0 before:bg-[radial-gradient(#8b4114_0.7px,transparent_0.7px)] before:[background-size:18px_18px] before:opacity-[0.025] group-hover:shadow-[0_14px_24px_rgba(54,67,64,0.17)]"
      >
        <div className="relative z-20 rounded-[0.35rem] bg-[#fffaf5] p-1.5 shadow-[0_6px_12px_rgba(54,67,64,0.10)]">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[0.25rem]" style={{ backgroundColor: project.surface }}>
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f1713]/28 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-78" />
            <span className="absolute bottom-2 left-2 rounded-full bg-[#fffaf5]/92 px-2 py-0.5 font-sans text-[0.58rem] font-semibold uppercase tracking-wider text-[#7d876d]">
              {project.number} - {project.category}
            </span>
          </div>
        </div>

        <div className="relative z-20 mt-3 grid grid-cols-[1fr_2.35rem] items-end gap-3">
          <div className="min-w-0">
            <h3 className="font-sans text-base font-medium leading-tight text-[#8b4114] sm:text-lg">{project.title}</h3>
            <p className="mt-1 line-clamp-2 font-sans text-[0.75rem] font-light leading-4 text-[#8b4114]/72">
              {project.description}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7d876d] text-white shadow-[0_5px_10px_rgba(54,67,64,0.10)] transition-transform group-hover:scale-105">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}
