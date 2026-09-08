import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

type HeroSectionProps = {
  phrase: string;
};

const textParent: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const textItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function HeroSection({ phrase }: HeroSectionProps) {
  return (
    <section id="inicio" className="relative overflow-hidden bg-[#d19c88]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/image/elementosFloral/floral7.png"
          alt=""
          className="garden-sway-slow absolute -left-10 top-0 z-[2] h-40 w-auto opacity-80 sm:h-48 md:-left-14 md:h-56 xl:left-0 xl:-top-5 xl:h-80 xl:opacity-95"
          style={{ "--garden-rotate": "0deg" } as CSSProperties}
        />
        <img
          src="/image/elementosFloral/floral1.png"
          alt=""
          className="garden-sway absolute -bottom-24 -left-28 h-[18rem] w-auto opacity-55 sm:h-[22rem] md:-bottom-28 md:-left-32 md:h-[28rem] xl:-bottom-28 xl:-left-24 xl:h-[38rem] xl:opacity-90"
          style={{ "--garden-rotate": "-7deg" } as CSSProperties}
        />
        <img
          src="/image/elementosFloral/floral5.png"
          alt=""
          className="garden-sway-slow absolute -right-32 bottom-8 h-[17rem] w-auto opacity-55 sm:h-[21rem] md:-right-36 md:h-[27rem] xl:-right-20 xl:bottom-0 xl:h-[34rem] xl:opacity-90"
          style={{ "--garden-rotate": "-12deg" } as CSSProperties}
        />
        <img
          src="/image/elementosFloral/floral3.png"
          alt=""
          className="garden-sway absolute -left-24 top-[38%] h-40 w-auto opacity-45 sm:h-48 md:-left-28 md:h-56 xl:-left-20 xl:top-[34%] xl:h-80 xl:opacity-75"
          style={{ "--garden-rotate": "8deg" } as CSSProperties}
        />
        <img
          src="/image/elementosFloral/floral2.png"
          alt=""
          className="garden-sway-slow absolute -right-24 top-[18%] h-36 w-auto opacity-45 sm:h-44 md:-right-28 md:h-52 xl:-right-12 xl:top-[21%] xl:h-72 xl:opacity-75"
          style={{ "--garden-rotate": "-16deg" } as CSSProperties}
        />
        <div className="garden-bee-path absolute left-0 top-[61%] h-9 w-9 md:h-11 md:w-11 xl:top-[58%] xl:h-16 xl:w-16">
          <img src="/image/elementosFloral/abelha.png" alt="" className="garden-bee h-full w-auto" />
        </div>
        <div className="garden-insect-path absolute left-0 top-[24%] h-8 w-8 md:h-10 md:w-10 xl:top-[22%] xl:h-14 xl:w-14">
          <img src="/image/elementosFloral/inseto.png" alt="" className="garden-insect h-full w-auto" />
        </div>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[92svh] max-w-7xl gap-5 px-5 pb-8 pt-20 sm:gap-7 sm:px-8 sm:pb-10 sm:pt-20 md:pb-12 xl:grid-cols-[0.98fr_1.02fr] xl:items-center xl:gap-8 xl:px-5 xl:py-20">
        <motion.div className="relative z-10 max-w-[42rem] md:max-w-3xl xl:max-w-[42rem]" variants={textParent} initial="hidden" animate="show">
          <motion.p variants={textItem} className="eyebrow text-white">
            Maiara Matthia · artista visual
          </motion.p>
          <motion.h1 variants={textItem} className="mt-3 max-w-2xl font-poppins text-[2.15rem] font-thin leading-[1.08] text-[#8b4114] sm:mt-5 sm:text-[2.8rem] sm:leading-[1.04] lg:text-[3.45rem] xl:text-6xl">
            Beleza nas pequenas delicadezas do cotidiano.
          </motion.h1>
          <motion.p variants={textItem} className="mt-4 max-w-xl font-sans text-sm font-light leading-6 text-[#8b4114]/85 sm:mt-5 sm:text-lg sm:leading-7 md:text-xl md:leading-8">
            Sou artista visual e ilustradora, formada pela UCDB. Meu trabalho nasce da infância, da natureza e das memórias afetivas. 
            <br />Acredito que as coisas mais bonitas são também as mais simples:
          </motion.p> 
          <motion.div variants={textItem} className="mt-4 grid max-w-2xl gap-3 font-sans text-[0.82rem] font-light leading-5 text-[#8b4114]/82 sm:mt-5 sm:grid-cols-2 sm:gap-3 sm:text-sm sm:leading-6 md:text-base md:leading-7">
            <p className="border-l border-white/45 pl-4 sm:pl-5">
              Uma flor encontrada durante a caminhada, o papel de carta guardado por muitos anos. Um abraço de quem amamos ou um galho transformado em brincadeira.
            </p>
            <p className="border-l border-white/45 pl-4 sm:pl-5">
              É desse lugar que nasce o meu trabalho. Entre ilustrações, pintura e criação manual, procuro transformar memórias em imagens e objetos que acolhem.
            </p>
          </motion.div>
          <motion.div variants={textItem} className="mt-4 inline-flex max-w-full rounded-full border border-white/45 bg-white/20 px-3 py-2 font-sans text-[0.62rem] font-light uppercase leading-4 tracking-[0.1em] text-[#8b4114]/75 backdrop-blur-sm sm:mt-5 sm:max-w-xl sm:px-5 sm:text-xs sm:tracking-[0.14em] md:text-sm">
            histórias em ilustrações e objetos feitos para durar
          </motion.div>
          <motion.div variants={textItem} className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
            <motion.a
              href="#portfolio"
              whileHover={{ y: -3, rotate: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#8b4114] px-5 font-sans text-sm font-medium text-white shadow-[0_12px_26px_rgba(0,0,0,0.16)] sm:h-12 sm:px-6 sm:text-base md:text-lg"
            >
              Conhecer o universo
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#pedido"
              whileHover={{ y: -3, rotate: 1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#8b4114]/25 bg-white px-5 font-sans text-sm font-light text-[#8b4114] sm:h-12 sm:px-6 sm:text-base md:text-lg"
            >
              Criar comigo
            </motion.a>
          </motion.div>
        </motion.div>

        <div className="relative min-h-0 md:min-h-0 xl:min-h-[620px]">
          <motion.div
            className="relative mx-auto mt-1 max-w-[250px] sm:max-w-[320px] md:mt-3 md:max-w-[380px] lg:max-w-[420px] xl:max-w-[470px]"
            initial={{ opacity: 0, y: 34, rotate: -3, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 95, damping: 15, delay: 0.25 }}
            whileHover={{ rotate: -1, y: -6 }}
          >
            <div className="relative z-10 overflow-hidden rounded-[1.5rem] border border-white/45 bg-white/35 p-2.5 shadow-[0_24px_60px_rgba(93,51,29,0.18)] backdrop-blur-sm sm:rounded-[2rem] sm:p-3">
              <img
                src="/image/maiara.jpeg"
                alt="Retrato de Maiara Matthia cercada por ilustrações florais"
                className="aspect-[4/5] w-full rounded-[1.05rem] object-cover object-center sm:rounded-[1.45rem]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
