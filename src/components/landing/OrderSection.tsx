import { FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

type OrderSectionProps = {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function OrderSection({ onSubmit }: OrderSectionProps) {
  return (
    <section id="pedido" className="relative isolate overflow-hidden bg-[#D19C88] px-5 py-9 text-[#8b4114] sm:px-8 md:py-11 xl:px-5 xl:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(#8b4114_0.8px,transparent_0.8px)] [background-size:26px_26px] opacity-[0.06]" />
        <img src="/image/flor.svg" alt="" className="absolute -bottom-8 -left-10 h-44 w-44 -rotate-12 opacity-45 md:h-64 md:w-64" />
        <img src="/image/flor.svg" alt="" className="absolute -right-12 top-8 h-36 w-36 rotate-45 opacity-30 md:h-52 md:w-52" />
      </div>

      <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative overflow-hidden rounded-xl border border-[#8b4114]/10 bg-[#ffffff] p-5 shadow-[0_18px_45px_rgba(54,67,64,0.10)] sm:p-7 lg:p-8"
        >
          <div className="absolute right-5 top-5 flex gap-2 text-[#7d876d]" aria-hidden="true">
            <Sparkles className="h-5 w-5" />
            <Heart className="h-5 w-5 fill-current" />
          </div>

          <p className="font-sans text-xs font-normal uppercase tracking-[0.22em] text-[#7d876d]">Contato</p>
          <h2 className="mt-4 max-w-md font-sans text-[2.05rem] font-extralight leading-[1.08] text-[#8b4114] sm:text-[2.8rem] lg:text-[3.15rem]">
            Vamos criar algo com a sua história?
          </h2>
          <p className="mt-5 max-w-sm font-sans text-sm font-light leading-6 text-[#8b4114]/72 sm:text-base">
            Envie uma ideia, uma referência ou só o começo do que você imaginou.
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="rounded-xl border border-[#8b4114]/10 bg-white p-4 text-[#8b4114] shadow-[0_18px_45px_rgba(54,67,64,0.10)] sm:p-5 md:p-6 xl:p-7"
        >
          <div className="grid gap-3 md:grid-cols-2 md:gap-4">
            <label className="font-sans text-xs font-normal uppercase tracking-[0.12em] text-[#8b4114]/75">
              Seu nome
              <input name="name" required className="mt-2 h-11 w-full rounded-full border border-[#ddb8a6] bg-white px-4 font-sans text-sm font-light normal-case tracking-normal outline-none focus:border-[#c68043] md:h-12" />
            </label>
            <label className="font-sans text-xs font-normal uppercase tracking-[0.12em] text-[#8b4114]/75">
              WhatsApp
              <input name="phone" required className="mt-2 h-11 w-full rounded-full border border-[#ddb8a6] bg-white px-4 font-sans text-sm font-light normal-case tracking-normal outline-none focus:border-[#c68043] md:h-12" />
            </label>
          </div>

          <label className="mt-4 block font-sans text-xs font-normal uppercase tracking-[0.12em] text-[#8b4114]/75">
            Ideia
            <textarea
              name="projectIdea"
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-[#ddb8a6] bg-white p-3 font-sans text-sm font-light normal-case tracking-normal outline-none focus:border-[#c68043] md:min-h-24"
              placeholder="Retrato, convite, desenho da criança..."
            />
          </label>

          <button type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#7d876d] px-5 font-sans text-sm font-medium text-white transition-transform hover:-translate-y-0.5 md:h-12 md:text-base">
            Enviar no WhatsApp
            <ArrowRight className="h-5 w-5" />
          </button>
        </motion.form>
      </div>
    </section>
  );
}
