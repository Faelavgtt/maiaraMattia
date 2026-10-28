import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AlertTriangle, Check, Images, Trash2, Upload, X } from "lucide-react";
import {
  deleteAdminGalleryImage,
  listAdminGalleryImages,
  uploadAdminGalleryImage,
  type GalleryImageAsset,
} from "@/lib/admin-api";
import type { ImageField } from "./AdminGalleryTypes";

const MAX_IMAGE_BYTES = 50 * 1024 * 1024; // 50 MB

type LibraryTab = "quadros" | "outros-projetos" | "todas";

export function AdminGalleryImageLibraryModal({
  area = "quadros",
  activeField,
  selectedUrl,
  onSelect,
  onClose,
  onStatus,
}: {
  area?: "quadros" | "outros-projetos";
  activeField: ImageField;
  selectedUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
  onStatus: (message: string) => void;
}) {
  const [images, setImages] = useState<GalleryImageAsset[]>([]);
  const [activeTab, setActiveTab] = useState<LibraryTab>(area);
  const [cursor, setCursor] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("Carregando biblioteca...");

  const loadImages = async (nextCursor?: string) => {
    setIsLoading(true);

    try {
      const data = await listAdminGalleryImages(nextCursor);
      setImages((current) => (nextCursor ? [...current, ...data.images] : data.images));
      setCursor(data.cursor);
      setTruncated(data.truncated);
      setMessage(data.images.length ? "Biblioteca de imagens atualizada." : "Nenhuma imagem na biblioteca ainda.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível carregar a biblioteca.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  // Update activeTab if area prop changes
  useEffect(() => {
    setActiveTab(area);
  }, [area]);

  const quadrosImages = useMemo(
    () => images.filter((img) => img.isUsedInQuadros || img.area === "quadros"),
    [images]
  );

  const outrosProjetosImages = useMemo(
    () => images.filter((img) => img.isUsedInOtherProjects || img.area === "outros-projetos"),
    [images]
  );

  const visibleImages = useMemo(() => {
    if (activeTab === "quadros") return quadrosImages;
    if (activeTab === "outros-projetos") return outrosProjetosImages;
    return images;
  }, [activeTab, quadrosImages, outrosProjetosImages, images]);

  const uploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    // Client-side 50 MB validation
    for (const file of files) {
      if (file.size > MAX_IMAGE_BYTES) {
        const errorMsg = `A imagem "${file.name}" ultrapassa o limite máximo de 50 MB.`;
        setMessage(errorMsg);
        onStatus(errorMsg);
        event.target.value = "";
        return;
      }
    }

    setIsUploading(true);
    setMessage(`Preparando ${files.length} imagem(ns)... (limite: até 50 MB por foto)`);

    const targetArea = activeTab === "todas" ? area : activeTab;

    try {
      const uploads: GalleryImageAsset[] = [];

      for (const file of files) {
        const webpFile = await convertImageToWebp(file);
        const uploaded = await uploadAdminGalleryImage(webpFile, targetArea);
        uploads.push({
          key: uploaded.objectKey,
          url: uploaded.url,
          size: webpFile.size,
          uploaded: new Date().toISOString(),
          contentType: "image/webp",
          area: targetArea,
          isUsedInQuadros: targetArea === "quadros",
          isUsedInOtherProjects: targetArea === "outros-projetos",
        });
      }

      setImages((current) => [...uploads, ...current]);
      const doneMessage = `${uploads.length} imagem(ns) enviada(s) com sucesso para a área ${
        targetArea === "quadros" ? "Quadros" : "Outros Projetos"
      }.`;
      setMessage(doneMessage);
      onStatus(doneMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Falha ao converter ou enviar imagens.";
      setMessage(errorMessage);
      onStatus(errorMessage);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = async (image: GalleryImageAsset) => {
    const confirmed = window.confirm(
      "ATENÇÃO: Galeria Geral Compartilhada\n\n" +
      "Se você excluir esta imagem, ela será apagada do servidor e deixará de aparecer em todos os produtos ou páginas do site que a utilizam.\n\n" +
      "Tem certeza que deseja excluir esta foto permanentemente?"
    );
    if (!confirmed) return;

    try {
      await deleteAdminGalleryImage(image.key);
      setImages((current) => current.filter((item) => item.key !== image.key));
      const doneMessage = "Imagem excluída permanentemente da biblioteca.";
      setMessage(doneMessage);
      onStatus(doneMessage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Não foi possível excluir a imagem.";
      setMessage(errorMessage);
      onStatus(errorMessage);
    }
  };

  const uploadAreaLabel =
    activeTab === "quadros"
      ? "para Quadros"
      : activeTab === "outros-projetos"
      ? "para Outros Projetos"
      : `(${area === "quadros" ? "Quadros" : "Outros Projetos"})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1713]/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[#8b4114]/15 bg-[#fffaf5] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#8b4114]/10 bg-white p-5">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-sans text-xs font-normal uppercase tracking-[0.18em] text-[#76877e]">
                Biblioteca de imagens
              </p>
              <span className="rounded-full bg-[#f0dfd4] px-2.5 py-0.5 text-[11px] font-medium text-[#8b4114]">
                Área atual: {area === "quadros" ? "Quadros" : "Outros Projetos"}
              </span>
            </div>
            <h2 className="mt-1 font-sans text-2xl font-light text-[#8b4114]">
              Escolher {activeField === "staticImage" ? "imagem fixa" : "imagem hover"}
            </h2>
            <p className="mt-1 font-sans text-xs font-light leading-5 text-[#8b4114]/80">{message}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white text-[#8b4114] hover:bg-[#8b4114] hover:text-white transition"
            aria-label="Fechar biblioteca"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Aviso Galeria Geral */}
        <div className="mx-5 mt-3 flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50/90 p-3 text-amber-950 shadow-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="text-xs leading-relaxed font-sans">
            <strong className="font-semibold text-amber-900">Atenção — Galeria Geral do Site:</strong>{" "}
            Esta biblioteca centraliza as imagens de todo o catálogo. Se você excluir uma foto daqui,{" "}
            <span className="font-medium underline decoration-amber-500 underline-offset-2">
              ela será apagada permanentemente do servidor e deixará de aparecer em todos os produtos ou páginas
            </span>{" "}
            que a utilizam.
          </div>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="flex flex-col gap-3 border-b border-[#8b4114]/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs por Área */}
          <div className="inline-flex rounded-lg bg-[#f0dfd4]/60 p-1 border border-[#8b4114]/10">
            <button
              type="button"
              onClick={() => setActiveTab("quadros")}
              className={`rounded-md px-3.5 py-1.5 font-sans text-xs transition ${
                activeTab === "quadros"
                  ? "bg-white font-medium text-[#8b4114] shadow-sm"
                  : "text-[#8b4114]/70 hover:text-[#8b4114]"
              }`}
            >
              Quadros ({quadrosImages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("outros-projetos")}
              className={`rounded-md px-3.5 py-1.5 font-sans text-xs transition ${
                activeTab === "outros-projetos"
                  ? "bg-white font-medium text-[#8b4114] shadow-sm"
                  : "text-[#8b4114]/70 hover:text-[#8b4114]"
              }`}
            >
              Outros Projetos ({outrosProjetosImages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("todas")}
              className={`rounded-md px-3.5 py-1.5 font-sans text-xs transition ${
                activeTab === "todas"
                  ? "bg-white font-medium text-[#8b4114] shadow-sm"
                  : "text-[#8b4114]/70 hover:text-[#8b4114]"
              }`}
            >
              Todas ({images.length})
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#7d876d] px-5 font-sans text-xs font-light text-white transition-transform hover:-translate-y-0.5">
              <Upload className="h-4 w-4" />
              {isUploading ? "Enviando..." : `Enviar fotos ${uploadAreaLabel}`}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={uploadFiles}
                disabled={isUploading}
              />
            </label>
            <button
              type="button"
              onClick={() => loadImages()}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white px-5 font-sans text-xs font-light text-[#8b4114] hover:bg-[#f0dfd4] disabled:opacity-60 transition"
            >
              Atualizar biblioteca
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {isLoading && images.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center font-sans text-sm font-light text-[#8b4114]">
              Carregando imagens...
            </div>
          ) : visibleImages.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-[#8b4114] p-6">
              <Images className="h-10 w-10 text-[#8b4114]/40" />
              <p className="mt-3 font-sans text-sm font-medium">
                {activeTab === "quadros"
                  ? "Nenhuma imagem encontrada na área de Quadros."
                  : activeTab === "outros-projetos"
                  ? "Nenhuma imagem encontrada na área de Outros Projetos."
                  : "Nenhuma imagem na biblioteca ainda."}
              </p>
              <p className="mt-1 font-sans text-xs font-light text-[#8b4114]/70 max-w-md">
                Você pode enviar novas fotos usando o botão acima (limite de até 50 MB por imagem) ou alternar para a aba "Todas".
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visibleImages.map((image) => {
                const isSelected = isImageSelected(selectedUrl, image);

                return (
                  <article
                    key={image.key}
                    className={`relative flex flex-col overflow-hidden rounded-lg transition-all ${
                      isSelected
                        ? "border-2 border-emerald-500 ring-4 ring-emerald-500/30 bg-emerald-50/20 shadow-lg scale-[1.01]"
                        : "border border-[#8b4114]/15 bg-white hover:border-[#8b4114]/35 shadow-sm"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(image.url)}
                      className="relative block aspect-[4/3] w-full overflow-hidden bg-[#f0dfd4]"
                      title={isSelected ? "Esta foto já está em uso nesta opção" : "Clique para selecionar esta foto"}
                    >
                      <img
                        src={image.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {isSelected && (
                        <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Em uso</span>
                        </div>
                      )}
                    </button>

                    <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                      <p className="truncate font-sans text-[0.68rem] font-light text-[#8b4114]" title={image.key}>
                        {image.key.replace("gallery/", "")}
                      </p>

                      <div className="flex items-center justify-between gap-2">
                        {isSelected ? (
                          <button
                            type="button"
                            disabled
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 font-sans text-[0.72rem] font-medium text-white shadow-sm cursor-default"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            Selecionada
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelect(image.url)}
                            className="inline-flex h-8 items-center justify-center rounded-full bg-[#8b4114] px-3 font-sans text-[0.72rem] font-light text-white transition hover:bg-[#6f330e]"
                          >
                            Selecionar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition"
                          aria-label="Excluir imagem permanentemente"
                          title="Excluir imagem do servidor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {truncated && cursor && (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => loadImages(cursor)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#8b4114]/15 bg-white px-6 font-sans text-xs font-light text-[#8b4114] hover:bg-[#f0dfd4] transition"
              >
                Carregar mais imagens
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function isImageSelected(selectedUrl: string | undefined, image: GalleryImageAsset): boolean {
  if (!selectedUrl) return false;
  const cleanSelected = selectedUrl.trim();
  const cleanUrl = image.url.trim();
  const cleanKey = image.key.trim();
  return (
    cleanSelected === cleanUrl ||
    cleanSelected === cleanKey ||
    cleanSelected.endsWith(cleanKey) ||
    cleanUrl.endsWith(cleanSelected)
  );
}

async function convertImageToWebp(file: File) {
  if (file.type === "image/webp") {
    return file;
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");

  // Preserve high resolution while guarding against extreme dimensions
  const maxDim = 3840;
  let { naturalWidth: width, naturalHeight: height } = image;
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");

  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
  if (!blob) throw new Error(`Não foi possível converter ${file.name}.`);

  const baseName = file.name.replace(/\.[^.]+$/, "") || "imagem";
  return new File([blob], `${baseName}.webp`, { type: "image/webp" });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`O navegador não conseguiu abrir o arquivo ${file.name}.`));
    };
    image.src = url;
  });
}
