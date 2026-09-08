import { motion } from "framer-motion";
import { BookOpen, Brush, Frame, Gift, Heart, Palette, Sparkles, Star } from "lucide-react";

const services = [
  {
    number: "01",
    title: "Retratos afetivos",
    eyebrow: "histórias em traço",
    text: "Ilustrações feitas a partir de pessoas, vínculos e detalhes que fazem sentido para aquela história.",
    details: ["família", "casais", "pets"],
    icon: Frame,
  },
  {
    number: "02",
    title: "Memórias ilustradas",
    eyebrow: "para guardar",
    text: "Uma cena, uma frase ou uma lembrança vira arte com acabamento leve e personalizado.",
    details: ["datas especiais", "frases", "lembranças"],
    icon: Heart,
  },
  {
    number: "03",
    title: "Papelaria afetiva",
    eyebrow: "peças delicadas",
    text: "Artes para capas, cartões e detalhes impressos com identidade visual feita com cuidado.",
    details: ["capas", "cartões", "etiquetas"],
    icon: BookOpen,
  },
  {
    number: "04",
    title: "Pequeno artista",
    eyebrow: "desenho da criança",
    text: "O desenho original da criança ganha cor, composição e uma versão pronta para virar lembrança.",
    details: ["desenho enviado", "cores", "arte final"],
    icon: Palette,
  },
  {
    number: "05",
    title: "Presentes com nome",
    eyebrow: "feito para alguém",
    text: "Artes personalizadas para presentear com intenção, sem excesso e com uma estética própria.",
    details: ["aniversário", "família", "datas afetivas"],
    icon: Gift,
  },
  {
    number: "06",
    title: "Produtos do ateliê",
    eyebrow: "prontos ou sob consulta",
    text: "Peças autorais e ilustrações disponíveis para quem quer escolher algo já criado pela Maiara.",
    details: ["pôsteres", "coleções", "peças prontas"],
    icon: Sparkles,
  },
];

const processNotes = [
  "você envia a ideia",
  "a Maiara organiza o caminho",
  "a arte segue para finalização",
];

const cardStyles = [
  {
    card: "sm:translate-y-1 sm:-rotate-[0.6deg]",
    color: "bg-[#ddb8a6]",
    icon: "bg-[#f0dfd4]",
    detail: "bg-[#fffaf5]",
  },
  {
    card: "sm:-translate-y-1 sm:rotate-[0.5deg]",
    color: "bg-[#c68043]",
    icon: "bg-[#f9e7d6]",
    detail: "bg-[#fffaf5]",
  },
  {
    card: "sm:translate-y-1 sm:rotate-[0.4deg]",
    color: "bg-[#7d876d]",
    icon: "bg-[#e4e7d9]",
    detail: "bg-[#fffaf5]",
  },
  {
    card: "sm:-translate-y-1 sm:-rotate-[0.7deg]",
    color: "bg-[#d39a7e]",
    icon: "bg-[#ead4c6]",
    detail: "bg-[#fffaf5]",
  },
  {
    card: "sm:translate-y-1 sm:-rotate-[0.4deg]",
    color: "bg-[#d19c88]",
    icon: "bg-[#f0dfd4]",
    detail: "bg-[#fffaf5]",
  },
  {
    card: "sm:translate-y-1 sm:rotate-[0.6deg]",
    color: "bg-[#76877e]",
    icon: "bg-[#e4e7d9]",
    detail: "bg-[#fffaf5]",
  },
];

export function ServicesSection() {
  return (
    <section id="servicos" className="relative isolate overflow-hidden bg-[#faf4ed] px-5 py-9 sm:px-8 md:py-11 lg:py-12 xl:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#8b4114_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.06]" />
        <div className="absolute right-[-8%] top-1/3 h-80 w-80 rounded-full bg-[#dbe3c9]/35 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[#f5dfb8]/40 blur-3xl" />
        <Star className="absolute bottom-20 right-[6%] h-8 w-8 -rotate-12 fill-[#8b4114] text-[#8b4114]/80" />
      </div>

      <div className="mx-auto grid max-w-[88rem] gap-5 md:gap-6 lg:grid-cols-[0.3fr_0.7fr] lg:items-start lg:gap-7">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.58, ease: "easeOut" }}
          className="relative min-w-0 max-w-full rounded-xl border border-[#8b4114]/10 bg-white p-4 text-[#8b4114] shadow-[0_18px_45px_rgba(54,67,64,0.10)] sm:-rotate-[1deg] sm:rounded-[2.5rem_1.25rem_2.75rem_1.5rem] sm:p-6 lg:sticky lg:top-20"
        >
          <span className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-2 bg-[#d6bea1]/55 backdrop-blur-[1px]" aria-hidden="true" />
          <span className="absolute -right-3 top-24 h-5 w-5 rounded-full bg-[#7d876d]" aria-hidden="true" />
          <span className="absolute -right-7 top-16 h-3 w-3 rounded-full bg-[#ddb8a6]" aria-hidden="true" />
          <p className="inline-flex items-center gap-2 font-sans text-[0.68rem] font-normal uppercase tracking-[0.2em] text-[#76877e]">
            <Brush className="h-3.5 w-3.5" aria-hidden="true" />
            Serviços do ateliê
          </p>
          <h2 className="mt-3 max-w-xl font-sans text-[1.7rem] font-extralight leading-[1.15] text-[#8b4114] sm:text-[2rem]">
            Ilustrações personalizadas com afeto, detalhe e um toque de{" "}
            <span className="relative inline-block whitespace-nowrap">
              delicadeza.
              <svg className="absolute -bottom-2 left-0 h-3 w-full text-[#c68043]" viewBox="0 0 180 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7c40-7 88 5 176-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="mt-4 max-w-md font-sans text-[0.82rem] font-light leading-6 text-[#8b4114]/75">
            Cada pedido nasce de uma ideia simples: uma pessoa, uma memória, um desenho ou uma peça que merece ganhar forma.
          </p>

          <div className="mt-5 rounded-xl bg-[#f8f1e9] p-3.5 sm:mt-6 sm:rounded-[1.5rem_0.8rem_1.5rem_0.8rem] sm:p-4">
            <p className="font-sans text-[0.68rem] font-normal uppercase tracking-[0.18em] text-[#76877e]">
              Como nasce
            </p>
            <ol className="mt-3 space-y-2.5">
              {processNotes.map((note, index) => (
                <li key={note} className="grid grid-cols-[2rem_1fr] items-start gap-2.5 font-sans text-[0.78rem] font-light leading-5 text-[#8b4114]/75">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[0.68rem] font-medium text-[#8b4114] ${index === 0 ? "rotate-[-6deg] bg-[#ddb8a6]" : index === 1 ? "rotate-[5deg] bg-[#f9e7d6]" : "rotate-[-3deg] bg-[#e4e7d9]"}`}>
                    {index + 1}
                  </span>
                  <span className="pt-1">{note}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>

        <div className="min-w-0">
          <div className="-mx-5 flex max-w-[calc(100%+2.5rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:max-w-none sm:snap-none sm:grid-cols-2 sm:items-stretch sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 xl:gap-5">
            {services.map((service, index) => {
              const Icon = service.icon;
              const style = cardStyles[index];

              return (
                <motion.article
                  key={service.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.48, delay: index * 0.05, ease: "easeOut" }}
                  className={`group relative flex min-w-[78vw] snap-center flex-col overflow-hidden rounded-xl border border-[#8b4114]/10 bg-white p-4 shadow-[0_16px_35px_rgba(54,67,64,0.09)] transition-[transform,box-shadow] duration-300 hover:z-10 hover:rotate-0 hover:-translate-y-1 hover:shadow-[0_22px_44px_rgba(54,67,64,0.14)] sm:min-w-0 sm:rounded-[1.6rem_1rem_1.9rem_1.1rem] sm:p-5 lg:min-h-[292px] xl:min-h-[276px] ${style.card}`}
                >
                  
                  <span className={`absolute bottom-5 right-5 h-2.5 w-2.5 rounded-full ${style.color}`} aria-hidden="true" />
                  <div className="grid grid-cols-[minmax(0,1fr)_2.5rem] items-start gap-4">
                    <div className="min-w-0">
                      <p className="flex items-start gap-2 font-sans text-[0.62rem] font-normal uppercase leading-4 tracking-[0.12em] text-[#76877e]">
                        <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.58rem] font-medium leading-none text-[#ffffff] ${style.color}`}>{service.number}</span>
                        <span className="min-w-0 pt-1">{service.eyebrow}</span>
                      </p>
                      <h3 className="mt-2 break-words font-sans text-lg font-light leading-tight text-[#8b4114] xl:text-xl">{service.title}</h3>
                    </div>
                    <span className={`relative flex h-10 w-10 shrink-0 rotate-3 items-center justify-center rounded-[45%_55%_42%_58%] text-[#8b4114] transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${style.icon}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  <p className="mt-4 flex-1 font-sans text-[0.8rem] font-light leading-5 text-[#8b4114]/75">{service.text}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {service.details.map((detail, detailIndex) => (
                      <span
                        key={detail}
                        className={`inline-flex min-h-7 items-center rounded-full border border-[#8b4114]/10 px-2.5 py-1 font-sans text-[0.66rem] font-light leading-4 text-[#8b4114]/75 ${style.detail}`}
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </motion.article>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.48, ease: "easeOut" }}
            className="relative mt-4 overflow-hidden rounded-[1.3rem_2.5rem_1.5rem_2.2rem] border border-[#8b4114]/10 bg-[#fffaf5] px-5 py-3 text-[#8b4114] shadow-[0_14px_30px_rgba(54,67,64,0.07)] sm:flex sm:items-center sm:justify-between sm:gap-5 sm:rotate-[0.5deg]"
          >
            <p className="font-sans text-[0.78rem] font-light leading-5 text-[#8b4114]/75">
              Não precisa chegar com tudo pronto. Uma referência ou uma ideia já bastam para começar.
            </p>
            <a
              href="#pedido"
              className="mt-3 inline-flex h-10 shrink-0 -rotate-1 items-center justify-center rounded-full bg-[#8b4114] px-4 font-sans text-xs font-medium text-white transition-transform hover:rotate-0 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b4114]/40 focus-visible:ring-offset-2 sm:mt-0"
            >
              Começar pedido
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
