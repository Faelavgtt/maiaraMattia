import { motion } from "framer-motion";
import { Heart, MessageCircleHeart, Sparkles, Star } from "lucide-react";
import { useState } from "react";

const feedbacks = [
  {
    name: "Familia da Maria",
    note: "Ficou delicado demais, exatamente com a carinha da nossa pequena.",
    src: "/image/feedbacks/feedback1.png",
    color: "bg-[#ddb8a6]",
    tape: "bg-[#e4e7d9]",
    rotate: "-rotate-[1.5deg]",
  },
  {
    name: "Mãe do Theo",
    note: "A arte chegou cheia de afeto. Virou o presente mais especial da festa.",
    src: "/image/feedbacks/feedback2.png",
    color: "bg-[#e4e7d9]",
    tape: "bg-[#f0dfd4]",
    rotate: "rotate-[1.25deg]",
  },
  {
    name: "Familia da Helena",
    note: "Todo mundo reconheceu os detalhes. Parece uma lembrança desenhada.",
    src: "/image/feedbacks/feedback3.png",
    color: "bg-[#f9e7d6]",
    tape: "bg-[#ddb8a6]",
    rotate: "-rotate-[0.75deg]",
  },
  {
    name: "Mãe do Bento",
    note: "O desenho dele virou um quadro lindo, sem perder a espontaneidade.",
    src: "/image/feedbacks/feedback4.png",
    color: "bg-[#d19c88]",
    tape: "bg-[#e4e7d9]",
    rotate: "rotate-[1.75deg]",
  },
  {
    name: "Familia da Alice",
    note: "Foi uma surpresa linda ver a história dela aparecer em cada detalhe.",
    src: "/image/feedbacks/feedback5.png",
    color: "bg-[#7d876d]",
    tape: "bg-[#f9e7d6]",
    rotate: "-rotate-[1.25deg]",
  },
] as const;

export function FeedbacksSection() {
  return (
    <section id="feedbacks" className="relative isolate overflow-hidden bg-[#d19c88] px-5 py-9 text-[#8b4114] sm:px-8 md:py-11 xl:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <img
          src="/image/elementosFloral/floral1.png"
          alt=""
          className="garden-sway absolute -bottom-24 -left-24 h-72 w-auto opacity-35 sm:h-96 lg:opacity-45"
        />
        <img
          src="/image/elementosFloral/floral5.png"
          alt=""
          className="garden-sway-slow absolute -right-32 top-10 h-72 w-auto opacity-30 sm:h-96 lg:opacity-45"
        />
        <Star className="services-float absolute left-[9%] top-16 h-8 w-8 rotate-12 fill-[#f9e7d6] text-[#f9e7d6]" />
        <Heart className="services-float-slow absolute bottom-20 right-[12%] h-9 w-9 -rotate-12 fill-[#7d876d] text-[#7d876d]" />
        <svg className="absolute left-[28%] top-8 h-16 w-40 text-[#8b4114]/18" viewBox="0 0 160 60" fill="none">
          <path d="M4 40c26-25 44 17 69-10s44 14 83-18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 9" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end"
        >
          <div>
            <p className="inline-flex items-center gap-2 font-sans text-[0.68rem] font-normal uppercase tracking-[0.2em] text-white">
              <MessageCircleHeart className="h-3.5 w-3.5" aria-hidden="true" />
              Clientes
            </p>
            <h2 className="mt-3 max-w-4xl font-sans text-[1.85rem] font-extralight leading-tight text-[#8b4114] sm:text-5xl md:text-[2.0rem] xl:text-[2.0rem]">
              Recados que chegam e despertam um sorriso a certeza que a missão foi cumprida.
            </h2>
          </div>

          <p className="max-w-2xl font-sans text-sm font-light leading-6 text-[#8b4114]/78 sm:text-base sm:leading-7 lg:justify-self-end">
            Um pedacinho da história depois que a arte chega: a surpresa, o carinho da família e aquele detalhe pequeno que fez tudo fazer sentido.
          </p>
        </motion.div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {feedbacks.map((feedback, index) => (
            <FeedbackCard key={feedback.name} feedback={feedback} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeedbackCard({ feedback, index }: { feedback: (typeof feedbacks)[number]; index: number }) {
  const [imageMissing, setImageMissing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.48, delay: index * 0.05, ease: "easeOut" }}
      className={`group relative rounded-[1.2rem] shadow-[0_18px_38px_rgba(93,51,29,0.15)] transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 sm:rounded-[1.7rem_1rem_2rem_1.1rem] ${feedback.rotate}`}
    >
      <span className={`absolute left-1/2 -top-3 z-20 h-5 w-16 -translate-x-1/2 ${feedback.tape} opacity-90 shadow-sm sm:-top-5 sm:h-7 sm:w-24 ${index % 2 === 0 ? "rotate-2" : "-rotate-2"}`} aria-hidden="true" />

      <div className="rounded-[1.2rem] bg-[#fffaf5] p-1 shadow-[inset_0_0_0_1px_rgba(139,65,20,0.08)] sm:rounded-[1.7rem_1rem_2rem_1.1rem] sm:p-[5px]">
        <div className="relative aspect-[9/13] overflow-hidden rounded-[0.95rem] bg-[#f8f1e9] sm:aspect-[9/14] sm:rounded-[1.35rem_0.7rem_1.65rem_0.8rem]">
          {!imageMissing && (
            <img
              src={feedback.src}
              alt={`Print do feedback de ${feedback.name}`}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="eager"
              onError={() => setImageMissing(true)}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          {!imageLoaded && (
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
              <Sparkles className="h-8 w-8 text-[#c68043]" aria-hidden="true" />
              <p className="mt-3 font-sans text-xs font-normal uppercase tracking-[0.16em] text-[#8b4114]/65">Feedback recebido</p>
              <p className="mt-2 font-sans text-[0.72rem] font-light leading-5 text-[#8b4114]/58">{feedback.note}</p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
