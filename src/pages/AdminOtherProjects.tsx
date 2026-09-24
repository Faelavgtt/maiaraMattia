import { useEffect, useState, type FormEvent } from "react";
import { AdminGalleryHeader } from "@/components/admin/AdminGalleryHeader";
import { AdminGalleryImageLibraryModal } from "@/components/admin/AdminGalleryImageLibraryModal";
import { AdminGalleryProductForm } from "@/components/admin/AdminGalleryProductForm";
import { AdminGalleryProductsList } from "@/components/admin/AdminGalleryProductsList";
import { formatBrazilianCurrencyInput } from "@/components/admin/AdminGalleryFormControls";
import type { ImageField, ProductForm } from "@/components/admin/AdminGalleryTypes";
import {
  createAdminOtherProject,
  deleteAdminOtherProject,
  listAdminOtherProjects,
  updateAdminOtherProject,
} from "@/lib/admin-api";
import {
  adminDraftKeys,
  readAdminProductDraft,
  removeAdminProductDraft,
  writeAdminProductDraft,
} from "@/lib/admin-drafts";
import {
  getGalleryFrameFormat,
  numberGalleryProducts,
  type GalleryFrameFormat,
} from "@/lib/gallery-products";
import {
  otherProjectFromApi,
  readOtherProjects,
  writeOtherProjects,
  type OtherProjectProduct,
} from "@/lib/other-projects";

const defaultFrameFormat = getGalleryFrameFormat("portrait");

const emptyForm: ProductForm = {
  name: "",
  title: "",
  category: "Peca especial",
  price: "",
  originalPrice: "",
  dimensions: "Formato sob consulta",
  includedItems: "Pintura manual personalizada\nConversa inicial sobre tema e uso\nAcabamento conforme a peca",
  description: "",
  placeholder: "Produto especial",
  staticImage: "",
  hoverImage: "",
  frameFormat: defaultFrameFormat.value,
  surface: "#ead4c6",
  width: defaultFrameFormat.width,
  offset: 0,
  rotate: 0,
};

const AdminOtherProjects = () => {
  const [products, setProducts] = useState<OtherProjectProduct[]>(() => readOtherProjects());
  const [form, setForm] = useState<ProductForm>(() => readAdminProductDraft(adminDraftKeys.otherProject, emptyForm).form);
  const [editingProductId, setEditingProductId] = useState<string | null>(
    () => readAdminProductDraft(adminDraftKeys.otherProject, emptyForm).editingProductId,
  );
  const [statusMessage, setStatusMessage] = useState("Carregando produtos de outros projetos...");
  const [isSaving, setIsSaving] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [activeImageField, setActiveImageField] = useState<ImageField>("staticImage");

  const selectedFormat = getGalleryFrameFormat(form.frameFormat);
  const includedItems = form.includedItems.split("\n").map((item) => item.trim()).filter(Boolean);

  useEffect(() => {
    writeAdminProductDraft(adminDraftKeys.otherProject, { form, editingProductId }, emptyForm);
  }, [editingProductId, form]);

  const updateForm = <Key extends keyof ProductForm>(key: Key, value: ProductForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateCurrencyField = (key: "price" | "originalPrice", value: string) => {
    updateForm(key, formatBrazilianCurrencyInput(value));
  };

  const updateFrameFormat = (frameFormat: GalleryFrameFormat) => {
    const format = getGalleryFrameFormat(frameFormat);
    setForm((current) => ({
      ...current,
      frameFormat,
      width: format.width,
      dimensions: current.dimensions || format.label,
    }));
  };

  const openLibrary = (field: ImageField) => {
    setActiveImageField(field);
    setLibraryOpen(true);
  };

  const startEditingProduct = (product: OtherProjectProduct) => {
    setEditingProductId(product.id);
    setForm(otherProjectToForm(product));
    setStatusMessage(`Editando ${product.title}.`);
  };

  const duplicateProduct = (product: OtherProjectProduct) => {
    setEditingProductId(null);
    setForm({
      ...otherProjectToForm(product),
      name: `${product.name} copia`,
      title: `${product.title} copia`,
    });
    setStatusMessage(`Rascunho duplicado de ${product.title}. Ajuste e salve como novo produto.`);
  };

  const cancelEditingProduct = () => {
    removeAdminProductDraft(adminDraftKeys.otherProject);
    setEditingProductId(null);
    setForm(emptyForm);
    setStatusMessage("Edicao cancelada.");
  };

  useEffect(() => {
    let isMounted = true;

    listAdminOtherProjects()
      .then((data) => {
        if (!isMounted) return;
        const apiProducts = numberGalleryProducts(data.products.map(otherProjectFromApi));
        setProducts(apiProducts);
        writeOtherProjects(apiProducts);
        setStatusMessage("Produtos de outros projetos atualizados.");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatusMessage("Nao foi possivel atualizar agora. Mostrando uma previa local.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.staticImage) {
      setStatusMessage("Escolha uma imagem fixa na biblioteca antes de salvar.");
      return;
    }

    if (includedItems.length === 0) {
      setStatusMessage("Adicione pelo menos um item incluso.");
      return;
    }

    const product = buildOtherProject({
      form,
      includedItems,
      nextIndex: products.length + 1,
      aspectRatio: selectedFormat.aspectRatio,
      existingProduct: editingProductId ? products.find((item) => item.id === editingProductId) : undefined,
    });

    setIsSaving(true);

    try {
      const payload = {
        name: product.name,
        title: product.title,
        category: product.category,
        price: product.price,
        originalPrice: product.originalPrice,
        dimensions: product.dimensions,
        includedItems: [...product.includedItems],
        description: product.description,
        placeholder: product.placeholder,
        staticImage: product.src,
        hoverImage: product.hoverSrc,
        surface: product.surface,
        frameFormat: product.frameFormat,
        width: product.width,
        aspectRatio: product.aspectRatio,
        offset: product.offset,
        rotate: product.rotate,
        sortOrder: product.sortOrder,
      };
      const response = editingProductId
        ? await updateAdminOtherProject(editingProductId, payload)
        : await createAdminOtherProject(payload);
      const savedProduct = otherProjectFromApi(response.product);
      const nextProducts = numberGalleryProducts(
        editingProductId
          ? products.map((item) => (item.id === editingProductId ? savedProduct : item))
          : [...products, savedProduct],
      );
      setProducts(nextProducts);
      writeOtherProjects(nextProducts);
      setStatusMessage(editingProductId ? "Produto atualizado com sucesso." : "Produto salvo com sucesso.");
      removeAdminProductDraft(adminDraftKeys.otherProject);
      setEditingProductId(null);
      setForm(emptyForm);
    } catch {
      const nextProducts = numberGalleryProducts(
        editingProductId
          ? products.map((item) => (item.id === editingProductId ? product : item))
          : [...products, product],
      );
      setProducts(nextProducts);
      writeOtherProjects(nextProducts);
      setStatusMessage(`${editingProductId ? "Produto atualizado" : "Produto salvo"} nesta sessao. Tente salvar novamente mais tarde.`);
      removeAdminProductDraft(adminDraftKeys.otherProject);
      setEditingProductId(null);
      setForm(emptyForm);
    } finally {
      setIsSaving(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (editingProductId === id) {
      setEditingProductId(null);
      setForm(emptyForm);
    }

    try {
      await deleteAdminOtherProject(id);
      setStatusMessage("Produto removido com sucesso.");
    } catch {
      setStatusMessage("Produto removido desta sessao. Tente salvar novamente mais tarde.");
    }

    const nextProducts = numberGalleryProducts(products.filter((product) => product.id !== id));
    setProducts(nextProducts);
    writeOtherProjects(nextProducts);
  };

  return (
    <section className="px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto flex max-w-[96rem] flex-col">
        <AdminGalleryHeader
          statusMessage={statusMessage}
          productsCount={products.length}
          eyebrow="Outros projetos"
          title="Cadastrar produto em outros projetos"
          countLabel="Produtos especiais"
        />

        <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.38fr)_minmax(24rem,0.62fr)] 2xl:items-start">
          <AdminGalleryProductForm
            form={form}
            isSaving={isSaving}
            isEditing={Boolean(editingProductId)}
            onSubmit={saveProduct}
            onCancelEdit={cancelEditingProduct}
            onUpdateForm={updateForm}
            onUpdateCurrencyField={updateCurrencyField}
            onUpdateFrameFormat={updateFrameFormat}
            onOpenLibrary={openLibrary}
          />

          <AdminGalleryProductsList
            products={products}
            onEditProduct={startEditingProduct}
            onDuplicateProduct={duplicateProduct}
            onRemoveProduct={removeProduct}
          />
        </div>
      </div>

      {libraryOpen && (
        <AdminGalleryImageLibraryModal
          activeField={activeImageField}
          selectedUrl={form[activeImageField]}
          onSelect={(url) => {
            updateForm(activeImageField, url);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
          onStatus={setStatusMessage}
        />
      )}
    </section>
  );
};

function buildOtherProject({
  form,
  includedItems,
  nextIndex,
  aspectRatio,
  existingProduct,
}: {
  form: ProductForm;
  includedItems: string[];
  nextIndex: number;
  aspectRatio: string;
  existingProduct?: OtherProjectProduct;
}): OtherProjectProduct {
  const title = form.title.trim();
  const discountPrice = formatBrazilianCurrencyInput(form.price);
  const originalPrice = formatBrazilianCurrencyInput(form.originalPrice);
  const hasDiscount = Boolean(discountPrice && discountPrice !== originalPrice);
  const price = hasDiscount ? discountPrice : originalPrice;

  return {
    id: existingProduct?.id ?? `outros-${Date.now()}`,
    number: existingProduct?.number ?? String(nextIndex).padStart(2, "0"),
    name: form.name.trim(),
    title,
    category: form.category.trim(),
    frameFormat: form.frameFormat,
    price,
    originalPrice: hasDiscount ? originalPrice : undefined,
    dimensions: form.dimensions.trim(),
    includedItems,
    description: form.description.trim(),
    placeholder: form.placeholder.trim() || title || "Produto especial",
    src: form.staticImage,
    hoverSrc: form.hoverImage || undefined,
    surface: form.surface,
    width: form.width,
    aspectRatio,
    offset: form.offset,
    rotate: form.rotate,
    sortOrder: existingProduct?.sortOrder ?? Date.now(),
  };
}

function otherProjectToForm(product: OtherProjectProduct): ProductForm {
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice !== product.price);

  return {
    name: product.name,
    title: product.title,
    category: product.category,
    price: hasDiscount ? product.price : "",
    originalPrice: hasDiscount ? product.originalPrice ?? "" : product.price,
    dimensions: product.dimensions,
    includedItems: product.includedItems.join("\n"),
    description: product.description,
    placeholder: product.placeholder,
    staticImage: product.src,
    hoverImage: product.hoverSrc ?? "",
    frameFormat: product.frameFormat,
    surface: product.surface,
    width: product.width,
    offset: product.offset,
    rotate: product.rotate,
  };
}

export default AdminOtherProjects;
