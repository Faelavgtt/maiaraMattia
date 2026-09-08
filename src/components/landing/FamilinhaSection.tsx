import { motion } from "framer-motion";
import { Heart, MessageCircle, Star } from "lucide-react";

const familyFrames = [
  {
    src: "/image/desenhos/quadroFamilinha.jpeg",
    alt: "Arte Familinha feita a mão por Maiara Matthia",
    label: "familinha clássica",
    positionClass: "sm:col-span-1 sm:translate-y-4",
    rotate: -4,
    tapeColor: "bg-[#e8cbb0]/80",
    frameBorder: "border-[#f4e3d3]",
    imageClassName: "object-contain", // Evita distorção mantendo proporções da arte
  },
  {
    src: "/image/desenhos/quadroFamilinha2.jpeg",
    alt: "Quadro Familinha com membros da família ilustrados",
    label: "familinha colorida",
    positionClass: "sm:col-span-1 sm:-translate-y-6 sm:scale-105 z-10",
    rotate: 2,
    tapeColor: "bg-[#c3d1ab]/80",
    frameBorder: "border-[#e3ebd5]",
    imageClassName: "object-contain",
  },
  {
    src: "/image/desenhos/quadroFamilinha3.jpeg",
    alt: "Composição Familinha em arte delicada",
    label: "familinha com carinho",
    positionClass: "sm:col-span-1 sm:translate-y-8",
    rotate: 3,
    tapeColor: "bg-[#f3cbbe]/80",
    frameBorder: "border-[#fce8e1]",
    imageClassName: "object-contain",
  },
];

const familyProductDetails = [
  { label: "Moldura", value: "Madeira branca, preta ou crua com vidro" },
  { label: "Tamanho", value: "30x30 cm" },
  { label: "Peso", value: "Aproximadamente 1 kg" },
  { label: "Valor", value: "R$ 450,00" },
];

export function FamilinhaSection() {
  return (
    <section id="familinha" className="relative isolate overflow-hidden bg-[#faf4ed] px-5 pb-10 pt-10 sm:px-8 md:pb-14 md:pt-12 xl:pb-16">
      
      {/* Background Ilustrado Estilo Infância */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#8b4114_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.07]" />
        
        <svg className="absolute top-10 left-0 w-full text-[#8b4114]/15" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0,30 C320,90 420,10 720,60 C1020,110 1120,20 1440,50" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
        </svg>

        <div className="absolute -left-16 top-1/4 h-72 w-72 rounded-full bg-[#f6c9b8]/30 blur-3xl" />
        <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-[#dbe3c9]/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#f5dfb8]/40 blur-3xl" />

        <Star className="absolute bottom-16 right-[6%] h-9 w-9 -rotate-12 fill-[#7d876d] text-[#7d876d]/80" />
      </div>

      <div className="mx-auto grid max-w-[94rem] gap-6 md:gap-8 lg:grid-cols-[minmax(34rem,1.15fr)_minmax(24rem,0.85fr)] lg:items-center xl:gap-9">
        
        {/* Coluna de Texto e Cards Informativos */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-[52rem]"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8efda] px-3.5 py-1 font-sans text-xs font-semibold tracking-wider text-[#5f6850] shadow-sm">
            <Heart className="h-3.5 w-3.5 fill-[#7d876d]" aria-hidden="true" />
            PERSONALIZADOS
          </div>

          <h2 className="mt-4 max-w-2xl font-sans text-[1.85rem] font-light leading-tight text-[#8b4114] sm:mt-5 sm:text-4xl md:text-[2.35rem] xl:text-[2.5rem]">
            Uma arte feita à mão para apresentar quem mora no seu coração.
          </h2>

          <div className="mt-3 space-y-3 max-w-xl font-sans text-sm font-light leading-6 text-[#8b4114]/80 sm:text-base sm:leading-relaxed">
            <p>
              A Familinha é uma ilustração autoral que reúne num abraço os membros da sua família.
            </p>
            <p>
              Cada ilustração é entregue em um quadro de madeira, pronto para pendurar e fazer parte da sua casa.
            </p>
          </div>

          <div className="mt-6 grid max-w-[48rem] grid-cols-3 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
            {familyFrames.map((frame, index) => (
              <motion.figure
                key={frame.src}
                initial={{ opacity: 0, y: 35, rotate: frame.rotate * 1.5 }}
                whileInView={{ opacity: 1, y: 0, rotate: frame.rotate }}
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{
                  y: -12,
                  rotate: 0,
                  scale: 1.05,
                  zIndex: 20,
                  transition: { type: "spring", stiffness: 300, damping: 18 }
                }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative group mobile-soften-tilt ${frame.positionClass}`}
              >
                <div className={`absolute -top-3 left-1/2 z-20 h-5 w-16 -translate-x-1/2 rounded-sm ${frame.tapeColor} shadow-xs backdrop-blur-xs border border-white/40`} aria-hidden="true" />

                <div className={`rounded-[1rem] border-2 ${frame.frameBorder} bg-white p-1.5 pb-2.5 shadow-[0_10px_25px_rgba(139,65,20,0.07)] transition-all duration-300 group-hover:shadow-[0_18px_36px_rgba(139,65,20,0.14)] sm:rounded-[1.8rem_1rem_1.6rem_1.2rem] sm:border-4 sm:p-2 sm:pb-3.5`}>
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[0.75rem] bg-[#fdfaf6] ring-1 ring-[#8b4114]/5 sm:rounded-[1.2rem_0.8rem_1rem_0.8rem]">
                    <motion.img
                      src={frame.src}
                      alt={frame.alt}
                      className={`h-full w-full object-cover ${frame.imageClassName} transition-transform duration-500 ease-out group-hover:scale-[1.03]`}
                      draggable="false"
                    />
                  </div>
                </div>
              </motion.figure>
            ))}
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl border border-[#8b4114]/12 bg-white/78 p-4 shadow-[0_14px_34px_rgba(139,65,20,0.06)] backdrop-blur-sm sm:p-5 lg:justify-self-end xl:p-6"
        >
          <div className="border-b border-[#8b4114]/10 pb-3">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[#76877e]">
              Produto sob encomenda
            </p>
            <h3 className="mt-1 font-sans text-lg font-medium text-[#8b4114]">
              Quadro Familinha
            </h3>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {familyProductDetails.map((detail) => (
              <div key={detail.label} className="rounded-xl border border-[#8b4114]/10 bg-[#fff9f2] px-3.5 py-2.5">
                <span className="block font-sans text-[0.62rem] font-semibold uppercase tracking-[0.15em] text-[#76877e]">
                  {detail.label}
                </span>
                <span className="mt-1 block font-sans text-xs font-medium leading-5 text-[#8b4114]">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 font-sans text-sm font-light leading-6 text-[#8b4114]/78">
            <p>
              Criamos a partir das características de cada membro, tom de cabelo, pele e paleta de cores escolhida pelo cliente.
            </p>
            <p>
              As fotos de referência ajudam a traduzir detalhes e proporções, mas o resultado preserva o encanto e a liberdade do traço, sem ser uma cópia literal da fotografia.
            </p>
            <p>
              O valor base contempla até 4 pessoas + 1 animal de estimação. Para cada pessoa ou animal adicional, acrescenta-se R$ 50,00.
            </p>
          </div>

          <a
            href="#pedido"
            className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#7d876d] px-5 font-sans text-sm font-medium text-white shadow-sm transition hover:bg-[#69725b] sm:w-auto"
          >
            Quero encomendar
            <MessageCircle className="h-4 w-4" />
          </a>
        </motion.div>

      </div>
    </section>
  );
}
