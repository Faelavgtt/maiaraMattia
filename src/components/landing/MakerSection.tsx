import { ChangeEvent, FormEvent, ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Paintbrush, Send, Upload, WandSparkles } from "lucide-react";

const backgroundOptions = [
  { name: "Branco", value: "#ffffff" },
  { name: "Rosa chá", value: "#ddb8a6" },
  { name: "Argila", value: "#d39a7e" },
  { name: "Terracota", value: "#c68043" },
  { name: "Oliva", value: "#979f8a" },
  { name: "Verde folha", value: "#7d876d" },
];

const outlineOptions = [
  { name: "Marrom", value: "#8b4114" },
  { name: "Preto suave", value: "#000000" },
  { name: "Branco", value: "#ffffff" },
  { name: "Terracota", value: "#c68043" },
  { name: "Verde folha", value: "#7d876d" },
];

const exampleOptions = [
  {
    id: "caveirinha",
    label: "Caveirinha",
    caption: "Maria Flor Moretto, 3 anos",
    title: "CAVEIRINHA",
    subtitle: "Maria Flor Moretto, 3 anos",
  },
  {
    id: "menino",
    label: "O menino",
    caption: "Martin Moretto, 3 anos",
    title: "O MENINO",
    subtitle: "Martin Moretto, 3 anos",
  },
];

const svgExamples: Record<string, { src: string; label: string; sizeClass: string }> = {
  caveirinha: {
    src: "/image/desenhos/caveirinha.svg",
    label: "Caveirinha",
    sizeClass: "inset-8 md:inset-10",
  },
  menino: {
    src: "/image/desenhos/oMenino.svg",
    label: "O menino",
    sizeClass: "inset-5 md:inset-7",
  },
};

const makerProcessSteps = [
  {
    title: "Como funciona",
    text: "Envie o desenho do seu pequeno artista e nós o transformaremos em uma obra de arte. Manteremos cada detalhe especial, traduzindo o desenho para um traço minimalista, em uma única cor escolhida por você.",
    icon: Send,
  },
  {
    title: "Cores e tamanho",
    text: "Escolha a cor e tamanho que mais combina com seu ambiente.",
    icon: Paintbrush,
  },
  {
    title: "Nome da obra de arte e do artista",
    text: "Escreva o nome do pequeno artista e de sua obra de arte. Essa parte vai estar no projeto impresso como o exemplo abaixo.",
    icon: WandSparkles,
  },

] as const;

const makerAcceptedFileTypes = new Set(["image/png", "image/jpeg", "application/pdf"]);
const makerMaxFileBytes = 50 * 1024 * 1024;

type MakerSectionProps = {
  backgroundColor: string;
  outlineColor: string;
  orientation: "portrait" | "landscape";
  size: "small" | "medium" | "large";
  title: string;
  subtitle: string;
  designerNotes: string;
  selectedExample: string;
  uploadFileName: string;
  onBackgroundColorChange: (value: string) => void;
  onOutlineColorChange: (value: string) => void;
  onOrientationChange: (value: "portrait" | "landscape") => void;
  onSizeChange: (value: "small" | "medium" | "large") => void;
  onTitleChange: (value: string) => void;
  onSubtitleChange: (value: string) => void;
  onDesignerNotesChange: (value: string) => void;
  onExampleChange: (value: string) => void;
  onUploadFileChange: (file: File | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function MakerSection({
  backgroundColor,
  outlineColor,
  orientation,
  size,
  title,
  subtitle,
  designerNotes,
  selectedExample,
  uploadFileName,
  onBackgroundColorChange,
  onOutlineColorChange,
  onOrientationChange,
  onSizeChange,
  onTitleChange,
  onSubtitleChange,
  onDesignerNotesChange,
  onExampleChange,
  onUploadFileChange,
  onSubmit,
}: MakerSectionProps) {
  const selectedBackground = backgroundOptions.find((option) => option.value === backgroundColor)?.name ?? "Personalizado";
  const selectedOutline = outlineOptions.find((option) => option.value === outlineColor)?.name ?? "Personalizado";
  const selectedArtwork = exampleOptions.find((example) => example.id === selectedExample) ?? exampleOptions[0];
  const previewTitle = title.trim() || selectedArtwork.title;
  const previewSubtitle = subtitle.trim() || selectedArtwork.subtitle;
  const [uploadError, setUploadError] = useState("");

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && !makerAcceptedFileTypes.has(file.type)) {
      event.target.value = "";
      onUploadFileChange(null);
      setUploadError("Envie um arquivo PNG, JPG ou PDF.");
      return;
    }

    if (file && file.size > makerMaxFileBytes) {
      event.target.value = "";
      onUploadFileChange(null);
      setUploadError("O arquivo precisa ter até 50 MB.");
      return;
    }

    setUploadError("");
    onUploadFileChange(file ?? null);
  };

  const selectExample = (example: (typeof exampleOptions)[number]) => {
    onExampleChange(example.id);
  };

  return (
    <section id="maker" className="relative overflow-hidden bg-[#7d876d]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-white opacity-5"
        style={{
          WebkitMaskImage: 'url("/image/desenhos/fundoDesenhosCriança.svg")',
          maskImage: 'url("/image/desenhos/fundoDesenhosCriança.svg")',
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "cover",
          maskSize: "cover",
        }}
      />
      <div className="relative z-10 mx-auto max-w-screen-2xl px-5 py-4 sm:px-8 xl:px-5">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mb-4 max-w-5xl pt-4 md:mb-5"
        >
          <p className="font-sans text-xs font-normal uppercase tracking-[0.22em] text-white">Pequeno Artista</p>
          <h2 className="mt-1 font-sans text-[1.85rem] font-extralight leading-tight text-white sm:text-3xl md:text-[2.2rem] xl:text-4xl">
            Do rabisco espontâneo ao quadro pronto para guardar
          </h2>
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.55, delay: 0.06, ease: "easeOut" }}
          className="mb-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {makerProcessSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, delay: (index + 1) * 0.05, ease: "easeOut" }}
                  className="rounded-xl border border-white/35 bg-white p-3 text-[#8b4114] shadow-[0_12px_30px_rgba(0,0,0,0.07)] sm:p-3.5"
                >
                  <span className="font-sans text-xs font-light text-[#7d876d]">0{index + 1}</span>
                  <div className="mt-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#ddb8a6] bg-[#ddb8a6]/45 text-[#8b4114] sm:mt-4 sm:h-10 sm:w-10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 font-sans text-base font-light leading-tight text-[#8b4114] sm:mt-4 sm:text-lg xl:text-xl">{step.title}</h3>
                  <p className="mt-2 font-sans text-xs font-light leading-5 text-[#8b4114] sm:text-sm sm:leading-6">{step.text}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>

        <div className="grid items-start gap-4 xl:grid-cols-[0.72fr_1.28fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="rounded-xl border border-white/35 bg-white p-3 shadow-[0_18px_48px_rgba(0,0,0,0.12)] sm:p-4">
              <p className="mb-2 text-center font-sans text-[10px] font-light uppercase tracking-[0.14em] text-[#8b4114]/70 sm:mb-3 sm:text-[11px]">
                Exemplo de como irá ficar
              </p>
              <div className="flex min-h-[280px] items-center justify-center rounded-lg bg-[#ddb8a6]/35 p-3 sm:min-h-[320px] sm:p-4 md:min-h-[360px] xl:min-h-[390px]">
                <div className={`rounded-md bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] ${orientation === "portrait" ? "w-full max-w-[240px] sm:max-w-[285px] xl:max-w-[330px]" : "w-full max-w-[330px] sm:max-w-[390px] xl:max-w-[470px]"}`}>
                  <div className={`bg-white p-3 sm:p-4 xl:p-5 ${orientation === "portrait" ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                    <div className="flex h-full flex-col">
                      <div
                        className="relative flex-1 overflow-hidden"
                        style={{ backgroundColor }}
                      >
                        <SketchPreview outlineColor={outlineColor} selectedExample={selectedExample} />
                      </div>
                      <div className="flex min-h-[66px] flex-col items-center justify-center bg-white px-3 py-3 text-center text-black sm:min-h-[76px] xl:min-h-[86px] xl:px-4 xl:py-4">
                        <p className="font-poppins text-sm font-normal leading-none tracking-wide sm:text-base xl:text-lg">
                          "{previewTitle}"
                        </p>
                        <p className="mt-1.5 font-poppins text-xs font-normal leading-tight sm:text-sm xl:mt-2">
                          {previewSubtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {exampleOptions.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => selectExample(example)}
                  className={`h-10 rounded-full border px-3.5 font-sans text-xs font-light sm:h-11 sm:px-4 sm:text-sm ${
                    selectedExample === example.id
                      ? "border-[#8b4114] bg-[#ddb8a6] text-[#8b4114]"
                      : "border-[#ddb8a6] bg-white text-[#8b4114]"
                  }`}
                  title={example.caption}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
            className="rounded-xl border border-white/35 bg-white p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.10)] sm:p-4 md:p-5"
          >
            <div className="grid gap-x-5 gap-y-0 lg:grid-cols-2 2xl:grid-cols-3">
            <ConfigBlock title="Contato" className="lg:col-span-2 2xl:col-span-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="customerName"
                  required
                  className="h-10 w-full rounded-full border border-[#ddb8a6] px-4 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                  placeholder="Seu nome"
                />
                <input
                  name="phone"
                  required
                  className="h-10 w-full rounded-full border border-[#ddb8a6] px-4 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                  placeholder="WhatsApp"
                />
                <input
                  name="email"
                  type="email"
                  className="h-10 w-full rounded-full border border-[#ddb8a6] px-4 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                  placeholder="E-mail opcional"
                />
              </div>
            </ConfigBlock>

            <ConfigBlock title="Cor do fundo">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {backgroundOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onBackgroundColorChange(option.value)}
                    className={`h-9 w-9 rounded-full border sm:h-10 sm:w-10 ${backgroundColor === option.value ? "border-[#8b4114] ring-2 ring-[#8b4114]/25" : "border-[#ddb8a6]"}`}
                    style={{ backgroundColor: option.value }}
                    aria-label={`Selecionar fundo ${option.name}`}
                  />
                ))}
              </div>
              <p className="mt-2 font-sans text-xs font-light text-[#8b4114]">Sua cor: {selectedBackground}</p>
            </ConfigBlock>

            <ConfigBlock title="Cor do traço">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {outlineOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onOutlineColorChange(option.value)}
                    className={`h-9 w-9 rounded-full border sm:h-10 sm:w-10 ${outlineColor === option.value ? "border-[#8b4114] ring-2 ring-[#8b4114]/25" : "border-[#ddb8a6]"}`}
                    style={{ backgroundColor: option.value }}
                    aria-label={`Selecionar traço ${option.name}`}
                    title={option.name}
                  />
                ))}
              </div>
              <p className="mt-2 font-sans text-xs font-light text-[#8b4114]">Selecionado: {selectedOutline}</p>
            </ConfigBlock>

            <ConfigBlock title="Orientação">
              <div className="flex flex-wrap gap-3">
                <OptionButton active={orientation === "portrait"} onClick={() => onOrientationChange("portrait")}>Retrato</OptionButton>
                <OptionButton active={orientation === "landscape"} onClick={() => onOrientationChange("landscape")}>Paisagem</OptionButton>
              </div>
            </ConfigBlock>

            <ConfigBlock title="Tamanho">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <RadioLine active={size === "small"} onClick={() => onSizeChange("small")} label="Pequeno" detail="A4 digital" />
                <RadioLine active={size === "medium"} onClick={() => onSizeChange("medium")} label="Médio" detail="A3 digital" />
                <RadioLine active={size === "large"} onClick={() => onSizeChange("large")} label="Grande" detail="Alta resolução" />
              </div>
            </ConfigBlock>

            <ConfigBlock title="Título pessoal" className="lg:col-span-2 2xl:col-span-2">
              <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                className="h-10 w-full rounded-full border border-[#ddb8a6] px-4 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                placeholder="Ex: O mundo da Lia"
              />
              <input
                value={subtitle}
                onChange={(event) => onSubtitleChange(event.target.value)}
                className="h-10 w-full rounded-full border border-[#ddb8a6] px-4 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                placeholder="Ex: primeiro desenho de 2026"
              />
              </div>
            </ConfigBlock>

            <ConfigBlock title="Desenho da criança">
              <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#8b4114]/50 bg-[#ddb8a6]/45 px-4 py-3 text-center font-sans text-xs font-light text-[#8b4114]">
                <Upload className="h-4 w-4 shrink-0" />
                {uploadFileName || "Enviar foto do desenho"}
                <input type="file" accept=".png,.jpg,.jpeg,.pdf,image/png,image/jpeg,application/pdf" required className="sr-only" onChange={handleUpload} />
              </label>
              <p className={`mt-2 font-sans text-[11px] font-light leading-snug ${uploadError ? "text-red-700" : "text-[#8b4114]/70"}`}>
                {uploadError || "PNG, JPG ou PDF. Limite máximo: 50 MB por arquivo."}
              </p>
            </ConfigBlock>

            <ConfigBlock title="Info para a designer" className="2xl:col-span-2">
              <textarea
                value={designerNotes}
                onChange={(event) => onDesignerNotesChange(event.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-[#ddb8a6] p-3 font-sans text-sm font-light outline-none placeholder:text-[#8b4114]/45 focus:border-[#8b4114]"
                placeholder="Ex: manter o sol, remover rabiscos do canto, usar a frase exatamente assim..."
              />
            </ConfigBlock>

            <ConfigBlock title="Incluso" className="lg:col-span-2 2xl:col-span-3">
              <div className="grid gap-2 font-sans text-xs font-light leading-snug text-[#8b4114] sm:grid-cols-3">
                <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0" /> Prévia por WhatsApp</p>
                <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0" /> Arquivo para impressão</p>
                <p className="flex items-center gap-2"><Check className="h-3.5 w-3.5 shrink-0" /> Ajuste manual</p>
              </div>
            </ConfigBlock>

            <div className="z-10 flex justify-end pt-3 lg:col-span-2 2xl:col-span-3">
              <button
                type="submit"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#8b4114] px-5 font-sans text-xs font-medium text-white shadow-[0_10px_20px_rgba(0,0,0,0.12)] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Enviar pedido
                <Send className="h-4 w-4" />
              </button>
            </div>
            </div>
          </motion.form>
        </div>

      </div>
    </section>
  );
}

function ConfigBlock({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-[#ddb8a6]/80 py-3 ${className}`}>
      <h3 className="mb-2 font-sans text-[10px] font-normal uppercase leading-none tracking-[0.16em] text-[#8b4114]">{title}</h3>
      {children}
    </div>
  );
}

function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-full border px-4 font-sans text-xs font-light ${
        active ? "border-[#8b4114] bg-[#ddb8a6] text-[#8b4114]" : "border-[#ddb8a6] bg-white text-[#8b4114]"
      }`}
    >
      {children}
    </button>
  );
}

function RadioLine({ active, onClick, label, detail }: { active: boolean; onClick: () => void; label: string; detail: string }) {
  return (
    <button type="button" onClick={onClick} className="flex items-start gap-2 text-left">
      <span className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-[#8b4114] ${active ? "bg-[#8b4114]" : "bg-white"}`}>
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span>
        <span className="block font-sans text-[13px] font-medium leading-tight text-[#8b4114]">{label}</span>
        <span className="block font-sans text-[11px] font-light leading-snug text-[#8b4114]">{detail}</span>
      </span>
    </button>
  );
}

function SketchPreview({ outlineColor, selectedExample }: { outlineColor: string; selectedExample: string }) {
  const svgExample = svgExamples[selectedExample];

  if (svgExample) {
    return <SvgTracePreview outlineColor={outlineColor} example={svgExample} />;
  }

  return (
    <div className="absolute inset-10">
      <div className="absolute left-12 top-16 h-40 w-44 rounded-[40%] border-2" style={{ borderColor: outlineColor }} />
      <div className="absolute left-20 top-28 h-16 w-10 rounded-full border-2" style={{ borderColor: outlineColor }} />
      <div className="absolute right-16 top-24 h-24 w-24 rounded-[45%] border-2" style={{ borderColor: outlineColor }} />
      <div className="absolute bottom-24 left-16 h-12 w-40 rounded-b-full border-b-2" style={{ borderColor: outlineColor }} />
      <div className="absolute left-24 top-20 h-20 rotate-[-18deg] border-l-2" style={{ borderColor: outlineColor }} />
    </div>
  );
}

function SvgTracePreview({
  outlineColor,
  example,
}: {
  outlineColor: string;
  example: { src: string; label: string; sizeClass: string };
}) {
  return (
    <div className={`absolute ${example.sizeClass}`}>
      <div
        aria-label={`Prévia do desenho ${example.label}`}
        role="img"
        className="h-full w-full bg-current"
        style={{
          color: outlineColor,
          WebkitMaskImage: `url("${example.src}")`,
          maskImage: `url("${example.src}")`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          WebkitMaskSize: "contain",
          maskSize: "contain",
        }}
      />
    </div>
  );
}
