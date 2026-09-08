import { motion } from "framer-motion";
import { Brush, Heart, MessageCircle } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-[#ddb8a6]/30 bg-[#8b4114] px-5 py-5 text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Maiara Mattia - início">
          <span
            aria-hidden="true"
            className="h-10 w-[4.35rem] bg-[#f9e7d6]"
            style={{
              WebkitMaskImage: 'url("/logoMaiara.svg")',
              maskImage: 'url("/logoMaiara.svg")',
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
          
        </a>

        <nav className="flex flex-wrap gap-x-5 gap-y-2 font-sans text-xs font-light text-white/70 md:justify-center">
          <a href="#familinha" className="transition-colors hover:text-[#f9e7d6]">Personalizados</a>
          <a href="#outros-projetos" className="transition-colors hover:text-[#f9e7d6]">Produtos</a>
          <a href="#maker" className="transition-colors hover:text-[#f9e7d6]">Pequeno Artista</a>
          <a href="#pedido" className="transition-colors hover:text-[#f9e7d6]">Contato</a>
        </nav>

        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="font-sans text-xs font-light text-white/55">© {year}</p>
          <div className="flex items-center gap-2 text-[#ddb8a6]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Heart className="h-4 w-4 fill-current" aria-hidden="true" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <Brush className="h-4 w-4" aria-hidden="true" />
            </span>
            <a href="#pedido" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7d876d] text-white transition-transform hover:-translate-y-0.5" aria-label="Ir para contato">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
