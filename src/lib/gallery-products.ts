import type { GalleryProject } from "@/components/landing/GalleryModal";

export type GalleryCarouselType = "prontas" | "kits" | "personalizadas";
export type GalleryFrameFormat = "landscape" | "portrait" | "square" | "wide" | "classic";

export type GalleryProduct = GalleryProject & {
  carouselType?: GalleryCarouselType;
  frameFormat: GalleryFrameFormat;
  name: string;
  sortOrder?: number;
};

export const galleryCarouselOptions: readonly { value: GalleryCarouselType; label: string; description: string }[] = [
  { value: "prontas", label: "Galerias prontas", description: "Artes prontas para escolher e customizar." },
  { value: "kits", label: "Kits decorativos", description: "Composicoes com quadros que se conversam." },
  { value: "personalizadas", label: "Sob medida", description: "Produtos para projetos criados do zero." },
];

export const galleryFrameFormatOptions: readonly {
  value: GalleryFrameFormat;
  label: string;
  aspectRatio: string;
  width: number;
}[] = [
  { value: "landscape", label: "Horizontal", aspectRatio: "16 / 9", width: 350 },
  { value: "portrait", label: "Vertical", aspectRatio: "4 / 5", width: 270 },
  { value: "square", label: "Quadrado", aspectRatio: "1 / 1", width: 260 },
  { value: "wide", label: "Panoramico", aspectRatio: "5 / 3", width: 370 },
  { value: "classic", label: "Classico", aspectRatio: "5 / 4", width: 310 },
];

export const galleryProductsStorageKey = "maiara-gallery-products";
export const galleryProductsUpdatedEvent = "maiara-gallery-products-updated";

const galleryStaticImage = "/image/fotoExemplo.jpeg";
const galleryHoverImage = "/image/fotoExemplo1.jpeg";

export const defaultGalleryProducts: readonly GalleryProduct[] = [
  {
    id: "galeria-01",
    number: "01",
    name: "Kit Jardim de Casa",
    title: "Jardim de Casa",
    category: "Galeria Pronta",
    carouselType: "prontas",
    frameFormat: "landscape",
    price: "R$ 380,00",
    originalPrice: "R$ 440,00",
    dimensions: "Composição 120x60cm",
    includedItems: [
      "3 Quadros ilustrados (30x40cm cada)",
      "1 Quadro Familinha Central (20x30cm)",
      "Molduras em madeira natural inclusas",
      "Certificado de autenticidade assinado",
    ],
    description: "Três quadros florais que conversam entre si, com uma Familinha para deixar a parede com memória e afeto.",
    placeholder: "Galeria Pronta",
    src: galleryStaticImage,
    hoverSrc: galleryHoverImage,
    surface: "#ead4c6",
    width: 350,
    aspectRatio: "16 / 9",
    offset: 78,
    rotate: -0.4,
  },
  {
    id: "galeria-02",
    number: "02",
    name: "Kit Brincadeira Suave",
    title: "Brincadeira Suave",
    category: "Cores Customizaveis",
    carouselType: "prontas",
    frameFormat: "portrait",
    price: "R$ 320,00",
    dimensions: "Composição 90x50cm",
    includedItems: ["2 Quadros decorativos ludicos", "1 Quadro Familinha em destaque", "Paleta de cores customizavel"],
    description: "Uma base pronta que pode ganhar outra paleta de cores para combinar com o quarto, sala ou brinquedoteca.",
    placeholder: "Galeria Customizavel",
    src: galleryStaticImage,
    hoverSrc: galleryHoverImage,
    surface: "#e4e7d9",
    width: 270,
    aspectRatio: "4 / 5",
    offset: 44,
    rotate: -1.2,
  },
  {
    id: "galeria-03",
    number: "03",
    name: "Kit Pequeno Universo",
    title: "Pequeno Universo",
    category: "Kit Decorativo",
    carouselType: "kits",
    frameFormat: "classic",
    price: "R$ 410,00",
    originalPrice: "R$ 460,00",
    dimensions: "Composição 110x70cm",
    includedItems: ["3 Quadros tematicos infantis", "1 Arte Familinha sob medida", "Acabamento em vidro anti-reflexo"],
    description: "Artes prontas com clima infantil, pensadas como conjunto para criar ritmo e harmonia na parede.",
    placeholder: "Kit de Quadros",
    src: galleryStaticImage,
    hoverSrc: galleryHoverImage,
    surface: "#f0dfd4",
    width: 310,
    aspectRatio: "5 / 4",
    offset: 92,
    rotate: -1.5,
  },
  {
    id: "galeria-04",
    number: "04",
    name: "Kit Familinha Central",
    title: "Familinha Central",
    category: "Retrato Afetivo",
    carouselType: "kits",
    frameFormat: "portrait",
    price: "R$ 290,00",
    dimensions: "Composição 80x40cm",
    includedItems: ["1 Quadro Familinha Ilustrado a mao", "2 Minis ilustracoes complementares", "Moldura pastel a escolha"],
    description: "A Familinha entra como o ponto focal da composição, trazendo os personagens reais da sua casa.",
    placeholder: "Familinha Central",
    src: galleryStaticImage,
    hoverSrc: galleryHoverImage,
    surface: "#e1d7c8",
    width: 250,
    aspectRatio: "3 / 4",
    offset: 28,
    rotate: 1.6,
  },
  {
    id: "galeria-05",
    number: "05",
    name: "Projeto Galeria Personalizada",
    title: "Galeria Personalizada",
    category: "Projeto Sob Medida",
    carouselType: "personalizadas",
    frameFormat: "square",
    price: "A partir de R$ 480,00",
    dimensions: "Tamanho sob consulta",
    includedItems: [
      "Projeto conceitual criado do zero",
      "Escolha de temas, cores, nomes e pets",
      "Acompanhamento e aprovacao do esboco",
      "Consultoria de disposicao na parede",
    ],
    description: "Para quem quer uma composição criada totalmente do zero: tema, cores, nomes e símbolos afetivos.",
    placeholder: "Orcar do Zero",
    src: galleryStaticImage,
    hoverSrc: galleryHoverImage,
    surface: "#e6d8cf",
    width: 230,
    aspectRatio: "1 / 1",
    offset: 4,
    rotate: 1.3,
  },
];

export function getGalleryFrameFormat(format?: string | null): (typeof galleryFrameFormatOptions)[number] {
  if (!format) return galleryFrameFormatOptions[0];

  const normalized = String(format).trim().toLowerCase();

  const exactMatch = galleryFrameFormatOptions.find((item) => item.value.toLowerCase() === normalized);
  if (exactMatch) return exactMatch;

  const labelMatch = galleryFrameFormatOptions.find((item) => item.label.toLowerCase() === normalized);
  if (labelMatch) return labelMatch;

  if (normalized.includes("vert") || normalized === "retrato" || normalized === "em pé" || normalized === "em pe") {
    return galleryFrameFormatOptions.find((item) => item.value === "portrait") ?? galleryFrameFormatOptions[1];
  }
  if (normalized.includes("horiz") || normalized === "paisagem" || normalized === "deitado") {
    return galleryFrameFormatOptions.find((item) => item.value === "landscape") ?? galleryFrameFormatOptions[0];
  }
  if (normalized.includes("quadr") || normalized === "1:1" || normalized === "1/1") {
    return galleryFrameFormatOptions.find((item) => item.value === "square") ?? galleryFrameFormatOptions[2];
  }
  if (normalized.includes("panoram") || normalized.includes("panorâm") || normalized === "wide") {
    return galleryFrameFormatOptions.find((item) => item.value === "wide") ?? galleryFrameFormatOptions[3];
  }
  if (normalized.includes("classic") || normalized.includes("clássic") || normalized === "padrao") {
    return galleryFrameFormatOptions.find((item) => item.value === "classic") ?? galleryFrameFormatOptions[4];
  }

  return galleryFrameFormatOptions[0];
}

export function readGalleryProducts(): GalleryProduct[] {
  if (typeof window === "undefined") return [...defaultGalleryProducts];

  try {
    const stored = window.localStorage.getItem(galleryProductsStorageKey);
    if (!stored) return [...defaultGalleryProducts];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [...defaultGalleryProducts];

    return parsed.map(normalizeGalleryProduct);
  } catch {
    return [...defaultGalleryProducts];
  }
}

export function writeGalleryProducts(products: GalleryProduct[]) {
  window.localStorage.setItem(galleryProductsStorageKey, JSON.stringify(products));
  window.dispatchEvent(new Event(galleryProductsUpdatedEvent));
}

export function normalizeGalleryProduct(product: GalleryProduct): GalleryProduct {
  const frameFormat = getGalleryFrameFormat(product.frameFormat);

  return {
    ...product,
    name: product.name || product.title,
    frameFormat: frameFormat.value,
    aspectRatio: frameFormat.aspectRatio,
    width: frameFormat.width,
    offset: Number.isFinite(product.offset) ? product.offset : 24,
    rotate: Number.isFinite(product.rotate) ? product.rotate : 0,
    includedItems: Array.isArray(product.includedItems) ? product.includedItems : [],
  };
}

export function galleryProductFromApi(row: {
  id: string;
  name: string;
  title: string;
  price: string;
  originalPrice: string | null;
  category: string;
  dimensions: string;
  includedItems: string[];
  description: string;
  placeholder: string;
  staticImage: string;
  hoverImage: string | null;
  surface: string;
  frameFormat: string;
  width: number;
  aspectRatio: string;
  offset: number;
  rotate: number;
  sortOrder?: number;
}): GalleryProduct {
  const frameFormat = getGalleryFrameFormat(row.frameFormat);

  return normalizeGalleryProduct({
    id: row.id,
    number: "00",
    name: row.name,
    title: row.title,
    category: row.category,
    frameFormat: frameFormat.value,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    dimensions: row.dimensions,
    includedItems: row.includedItems,
    description: row.description,
    placeholder: row.placeholder,
    src: row.staticImage,
    hoverSrc: row.hoverImage ?? undefined,
    surface: row.surface,
    width: frameFormat.width,
    aspectRatio: frameFormat.aspectRatio,
    offset: row.offset,
    rotate: row.rotate,
    sortOrder: row.sortOrder,
  });
}

export function numberGalleryProducts(products: GalleryProduct[]) {
  return products.map((product, index) => ({
    ...product,
    number: String(index + 1).padStart(2, "0"),
    offset: product.offset || 12 + ((index + 1) % 4) * 18,
    rotate: product.rotate || ((index + 1) % 2 === 0 ? 1 : -1) * (0.4 + ((index + 1) % 3) * 0.35),
  }));
}
