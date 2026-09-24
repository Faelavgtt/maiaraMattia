import type { FormEvent } from "react";
import { ImagePlus, Save, X } from "lucide-react";
import { AdminHelpTooltip } from "@/components/admin/AdminHelpTooltip";
import { galleryFrameFormatOptions, type GalleryFrameFormat } from "@/lib/gallery-products";
import { CurrencyInput, Field, ImageSlot, inputClassName, PanelTitle, textareaClassName } from "./AdminGalleryFormControls";
import type { ImageField, ProductForm, UpdateProductForm } from "./AdminGalleryTypes";

export function AdminGalleryProductForm({
  form,
  isSaving,
  isEditing,
  onSubmit,
  onCancelEdit,
  onUpdateForm,
  onUpdateCurrencyField,
  onUpdateFrameFormat,
  onOpenLibrary,
}: {
  form: ProductForm;
  isSaving: boolean;
  isEditing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onUpdateForm: UpdateProductForm;
  onUpdateCurrencyField: (key: "price" | "originalPrice", value: string) => void;
  onUpdateFrameFormat: (frameFormat: GalleryFrameFormat) => void;
  onOpenLibrary: (field: ImageField) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-white p-4 shadow-[0_18px_40px_rgba(93,51,29,0.08)] sm:p-5">
      <div className="mb-4 flex flex-col gap-3 border-b border-[#8b4114]/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7d876d] text-white">
            <ImagePlus className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-xl font-light text-[#8b4114]">{isEditing ? "Editar produto" : "Novo produto"}</h2>
              <AdminHelpTooltip label="Este formulário altera o conteúdo do produto sem mudar o modelo do carrossel." />
            </div>
            <p className="mt-0.5 font-sans text-xs font-light text-[#8b4114]/65">
              Preencha o que a cliente vai ver no card do produto.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing && (
            <button type="button" onClick={onCancelEdit} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#8b4114]/15 bg-white px-4 font-sans text-xs font-medium text-[#8b4114] transition-colors hover:bg-[#fffaf5]">
              <X className="h-4 w-4" />
              Cancelar
            </button>
          )}
          <button type="submit" disabled={isSaving} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#8b4114] px-5 font-sans text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#72340e] disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-[#fffaf5] p-4">
          <div className="flex items-center gap-2">
            <PanelTitle>1. Informacoes do card</PanelTitle>
            <AdminHelpTooltip label="Use esta área para definir nome, categoria, tamanho e descrição do produto." />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Nome para organizar" help="Uso interno do painel. Ajuda você a identificar o produto na lista.">
              <input required value={form.name} onChange={(event) => onUpdateForm("name", event.target.value)} className={inputClassName} placeholder="Ex.: Kit jardim" />
            </Field>
            <Field label="Nome que aparece no site" help="Título principal mostrado para a cliente.">
              <input required value={form.title} onChange={(event) => onUpdateForm("title", event.target.value)} className={inputClassName} placeholder="Ex.: Jardim de Casa" />
            </Field>
            <Field label="Tipo do produto" help="Texto curto que aparece acima do nome no card.">
              <input required value={form.category} onChange={(event) => onUpdateForm("category", event.target.value)} className={inputClassName} placeholder="Ex.: Galeria Pronta" />
            </Field>
            <Field label="Tamanho / composição" help="Informe o tamanho ou a composição do produto. Exemplo: Composição 120x60cm.">
              <input required value={form.dimensions} onChange={(event) => onUpdateForm("dimensions", event.target.value)} className={inputClassName} placeholder="Ex.: Composicao 120x60cm" />
            </Field>
          </div>
          <Field label="Descrição para a cliente" help="Escreva um resumo simples do que torna esse produto especial." className="mt-3 flex min-h-0 flex-1 flex-col">
            <textarea required value={form.description} onChange={(event) => onUpdateForm("description", event.target.value)} className={`${textareaClassName} min-h-[7rem] flex-1 resize-y`} placeholder="Ex.: Tres quadros florais que combinam com uma Familinha central..." />
          </Field>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-[#fffaf5] p-4">
          <div className="flex items-center gap-2">
            <PanelTitle>2. Preco e textos do card</PanelTitle>
            <AdminHelpTooltip label="Use esta área para definir preço, itens inclusos e texto de apoio do card." />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <Field label="Preço principal" help="Informe o valor normal do produto. Se não houver desconto, este será o preço mostrado.">
              <CurrencyInput required value={form.originalPrice} onChange={(value) => onUpdateForm("originalPrice", value)} onBlur={(value) => onUpdateCurrencyField("originalPrice", value)} placeholder="440,00" />
            </Field>
            <Field label="Preço promocional" help="Campo opcional. Preencha apenas quando quiser mostrar desconto.">
              <CurrencyInput value={form.price} onChange={(value) => onUpdateForm("price", value)} onBlur={(value) => onUpdateCurrencyField("price", value)} placeholder="380,00" />
            </Field>
          </div>
          <Field label="Itens inclusos" help="Escreva um item por linha. Ex.: 3 quadros, molduras inclusas, certificado." className="mt-3">
            <textarea required value={form.includedItems} onChange={(event) => onUpdateForm("includedItems", event.target.value)} className={`${textareaClassName} min-h-[8rem] resize-y`} placeholder="Um item por linha" />
          </Field>
          <Field label="Texto alternativo" help="Texto usado como apoio quando a imagem ainda não estiver carregada." className="mt-3">
            <input value={form.placeholder} onChange={(event) => onUpdateForm("placeholder", event.target.value)} className={inputClassName} placeholder="Ex.: Galeria Pronta" />
          </Field>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-[#fffaf5] p-4">
          <div className="flex items-center gap-2">
            <PanelTitle>3. Imagens</PanelTitle>
            <AdminHelpTooltip label="A imagem principal aparece primeiro. A imagem de hover aparece quando a cliente passa o mouse." />
          </div>
          <div className="mt-4 grid min-h-0 gap-4 md:grid-cols-2">
            <ImageSlot label="Imagem principal" value={form.staticImage} required onChoose={() => onOpenLibrary("staticImage")} onClear={() => onUpdateForm("staticImage", "")} />
            <ImageSlot label="Imagem ao passar o mouse" value={form.hoverImage} onChoose={() => onOpenLibrary("hoverImage")} onClear={() => onUpdateForm("hoverImage", "")} />
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-[#8b4114]/15 bg-[#fffaf5] p-4">
          <div className="flex items-center gap-2">
            <PanelTitle>4. Formato do card</PanelTitle>
            <AdminHelpTooltip label="Escolha a proporção visual do card sem alterar o modelo do carrossel." />
          </div>
          <div className="mt-4 min-h-0">
            <p className="font-sans text-[0.72rem] font-medium uppercase tracking-[0.12em] text-[#76877e]">Proporcao visual</p>
            <div className="mt-2 grid min-h-0 grid-cols-2 gap-2 sm:grid-cols-3">
              {galleryFrameFormatOptions.map((option) => (
                <button key={option.value} type="button" onClick={() => onUpdateFrameFormat(option.value)} className={`flex h-[6.75rem] flex-col justify-between overflow-hidden rounded-xl border p-2.5 text-left transition-colors ${form.frameFormat === option.value ? "border-[#7d876d] bg-white shadow-sm ring-1 ring-[#7d876d]/30" : "border-[#8b4114]/15 bg-[#fffaf5] hover:bg-white"}`} aria-label={option.label}>
                  <span className="flex h-12 w-full shrink-0 items-center justify-center">
                    <span className="block max-h-12 max-w-24 rounded-sm border border-[#ddb8a6] bg-[#f0dfd4]" style={{ aspectRatio: option.aspectRatio, height: "100%" }} />
                  </span>
                  <span className="block w-full pt-1.5 font-sans text-xs font-light leading-snug text-[#8b4114]/75">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
