import { motion } from "framer-motion";
import { Baby, Brush, Gift, MessageCircle, Palette, Sparkles } from "lucide-react";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const budgetMessage = [
  "Olá! Quero pedir um orçamento com a Maiara Matthia.",
  "Tenho interesse em um projeto, desenho personalizado ou arte de aniversário.",
  "Podemos conversar sobre ideias, valores e prazos?",
].join("\n");

const budgetWhatsappUrl = buildWhatsappUrl(budgetMessage);

const projectTypes = [
  {
    title: "Desenho infantil",
    text: "O rabisco da criança ganha acabamento, cor e uma composição feita para guardar.",
    icon: Baby,
    color: "bg-[#ead4c6]",
    rotate: "-rotate-[1.5deg]",
  },
  {
    title: "Arte autoral",
    text: "Personagens, cenas e pequenos universos visuais criados a partir de uma história.",
    icon: Brush,
    color: "bg-[#e4e7d9]",
    rotate: "rotate-[1deg]",
  },
  {
    title: "Presente afetivo",
    text: "Quadros, papelaria e lembranças com nome, memória e detalhes bem pessoais.",
    icon: Gift,
    color: "bg-[#f0dfd4]",
    rotate: "-rotate-[0.8deg]",
  },
];

export function WorkShowcaseSection() {
  return (
    <section id="portfolio" className="relative overflow-hidden bg-[#f8f1e9] px-5 py-8 sm:px-8 md:py-10 lg:py-12">
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-4 border-b border-[#8b4114]/15 pb-4 md:gap-5 md:pb-5 lg:grid-cols-[1fr_0.74fr] lg:items-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 font-sans text-[0.68rem] font-normal uppercase tracking-[0.2em] text-[#7d876d]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Artes e projetos
            </p>
            <h2 className="mt-2 font-sans text-[1.75rem] font-extralight leading-tight text-[#8b4114] sm:text-3xl md:text-[2.15rem] xl:text-[2.25rem]">
              Ideias pequenas viram arte com história, cor e afeto.
            </h2>
            <p className="mt-2 max-w-2xl font-sans text-sm font-light leading-6 text-[#8b4114]/70">
              Projetos personalizados, desenhos infantis, artes de aniversário e pequenos universos visuais criados com delicadeza.
            </p>
          </motion.div>

          <div className="rounded-xl border border-[#8b4114]/10 bg-[#d39a7e] p-4 text-white shadow-[0_14px_34px_rgba(102,61,36,0.12)] [&_h3]:mt-1.5 [&_h3]:text-lg sm:[&_h3]:text-xl">
            <p className="font-sans text-[0.68rem] font-normal uppercase tracking-[0.18em] text-white">Quer algo nesse estilo?</p>
            <h3 className="mt-2 font-sans text-2xl font-extralight leading-tight">Peça um orçamento pelo WhatsApp.</h3>
            <p className="mt-1.5 font-sans text-xs font-light leading-5 text-white/78">
              Envie sua ideia, tema, prazo e formato. A conversa começa simples e vai ganhando forma junto.
            </p>
            <a
              href={budgetWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full bg-[#7d876d] px-4 font-sans text-xs font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.14)] transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Pedir orçamento
            </a>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
          {projectTypes.map((project, index) => {
            const Icon = project.icon;

            return (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, rotate: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.48, delay: index * 0.08, ease: "easeOut" }}
                className={`relative overflow-hidden rounded-xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_14px_30px_rgba(54,67,64,0.07)] sm:p-5 ${project.rotate}`}
              >
                <span className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${project.color}`} aria-hidden="true" />
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#fff6eb] text-[#8b4114]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="relative mt-3 font-sans text-lg font-light leading-tight text-[#8b4114]">{project.title}</h3>
                <p className="relative mt-2 font-sans text-[0.78rem] font-light leading-5 text-[#8b4114]/72">{project.text}</p>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[#8b4114]/10 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-[0.72rem] font-light uppercase tracking-[0.14em] text-[#8b4114]/50">
            A parede de quadros agora continua na Galeria.
          </p>
          <a
            href="#galeria"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#c68043] px-4 font-sans text-xs font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5"
          >
            <Palette className="h-4 w-4" aria-hidden="true" />
            Ver galerias prontas
          </a>
        </div>
      </div>
    </section>
  );
}
