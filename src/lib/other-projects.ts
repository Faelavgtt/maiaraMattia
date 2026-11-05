import type { GalleryProduct } from "@/lib/gallery-products";
import {
  galleryProductFromApi,
  getGalleryFrameFormat,
  numberGalleryProducts,
  type GalleryFrameFormat,
} from "@/lib/gallery-products";
import type { OtherProjectApiRow } from "@/lib/api";

export type OtherProjectProduct = GalleryProduct;

export const otherProjectsStorageKey = "maiara-other-projects";
export const otherProjectsUpdatedEvent = "maiara-other-projects-updated";

export const defaultOtherProjects: readonly OtherProjectProduct[] = [
  {
    id: "outros-01",
    number: "01",
    name: "Banquinho pintado",
    title: "Banquinhos pintados",
    category: "Pintura em objeto",
    frameFormat: "portrait",
    price: "R$ 180,00",
    dimensions: "Banquinho ou peça sob consulta",
    includedItems: [
      "Pintura manual personalizada",
      "Paleta criada para combinar com o ambiente",
      "Acabamento protetor conforme o uso da peça",
    ],
    description: "Peças utilitárias ganham cor, flor, nome ou um pequeno universo visual para entrar na casa com afeto.",
    placeholder: "Banquinho pintado",
    src: "/image/desenhos/desenhos.jpeg",
    hoverSrc: "/image/desenhos/desenhos2.jpeg",
    surface: "#ead4c6",
    width: 300,
    aspectRatio: "4 / 5",
    offset: 0,
    rotate: -1.4,
  },
  {
    id: "outros-02",
    number: "02",
    name: "Objeto afetivo",
    title: "Objetos afetivos",
    category: "Peças sob medida",
    frameFormat: "portrait",
    price: "R$ 120,00",
    dimensions: "Formato combinado por projeto",
    includedItems: [
      "Conversa inicial sobre tema e uso",
      "Aplicação de nomes, flores ou pequenos símbolos",
      "Arte ajustada ao objeto escolhido",
    ],
    description: "Caixas, plaquinhas, lembranças e objetos especiais que não cabem em uma categoria pronta.",
    placeholder: "Objeto afetivo",
    src: "/image/desenhos/galeria.jpeg",
    hoverSrc: "/image/desenhos/quadroFamilinha.jpeg",
    surface: "#e4e7d9",
    width: 300,
    aspectRatio: "4 / 5",
    offset: 0,
    rotate: 0.9,
  },
  {
    id: "outros-03",
    number: "03",
    name: "Pintura solta",
    title: "Pinturas soltas",
    category: "Experimentações",
    frameFormat: "portrait",
    price: "R$ 90,00",
    dimensions: "Tamanhos pequenos e médios",
    includedItems: [
      "Pintura ou estudo autoral",
      "Opção de moldura sob consulta",
      "Peça única ou pequena série",
    ],
    description: "Estudos, flores, personagens e composições livres que nascem no ateliê entre uma encomenda e outra.",
    placeholder: "Pintura solta",
    src: "/image/desenhos/desenhos2.jpeg",
    hoverSrc: "/image/desenhos/galeria.jpeg",
    surface: "#f0dfd4",
    width: 300,
    aspectRatio: "4 / 5",
    offset: 0,
    rotate: -0.6,
  },
  {
    id: "outros-04",
    number: "04",
    name: "Pequeno presente",
    title: "Pequenos presentes",
    category: "Datas e memórias",
    frameFormat: "portrait",
    price: "R$ 75,00",
    dimensions: "Peça pequena personalizada",
    includedItems: [
      "Personalização com nome, data ou frase curta",
      "Formato definido conforme a ocasião",
      "Embalagem simples para presente",
    ],
    description: "Projetos menores para aniversários, quarto infantil, mesa posta, festa ou um cantinho especial.",
    placeholder: "Presente pequeno",
    src: "/image/desenhos/quadroFamilinha3.jpeg",
    hoverSrc: "/image/desenhos/quadroFamilinha2.jpeg",
    surface: "#e9d7cb",
    width: 300,
    aspectRatio: "4 / 5",
    offset: 0,
    rotate: 1.2,
  },
];

export function readOtherProjects(): OtherProjectProduct[] {
  if (typeof window === "undefined") return [...defaultOtherProjects];

  try {
    const stored = window.localStorage.getItem(otherProjectsStorageKey);
    if (!stored) return [...defaultOtherProjects];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...defaultOtherProjects];

    return numberGalleryProducts(parsed.map(normalizeOtherProject));
  } catch {
    return [...defaultOtherProjects];
  }
}

export function writeOtherProjects(products: OtherProjectProduct[]) {
  window.localStorage.setItem(otherProjectsStorageKey, JSON.stringify(products));
  window.dispatchEvent(new Event(otherProjectsUpdatedEvent));
}

export function otherProjectFromApi(row: OtherProjectApiRow): OtherProjectProduct {
  return normalizeOtherProject({
    ...galleryProductFromApi(row),
    number: row.number,
  });
}

function normalizeOtherProject(product: OtherProjectProduct): OtherProjectProduct {
  const frameFormat = getGalleryFrameFormat(product.frameFormat);

  return {
    ...product,
    name: product.name || product.title,
    frameFormat: frameFormat.value,
    aspectRatio: frameFormat.aspectRatio,
    width: frameFormat.width,
    offset: Number.isFinite(product.offset) ? product.offset : 0,
    rotate: Number.isFinite(product.rotate) ? product.rotate : 0,
    includedItems: Array.isArray(product.includedItems) ? product.includedItems : [],
  };
}
