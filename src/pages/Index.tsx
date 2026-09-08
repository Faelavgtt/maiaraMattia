import { FormEvent, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Footer } from "@/components/landing/Footer";
import { FeedbacksSection } from "@/components/landing/FeedbacksSection";
import { FamilinhaSection } from "@/components/landing/FamilinhaSection";
import { GallerySection } from "@/components/landing/GallerySection";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { MakerSection } from "@/components/landing/MakerSection";
import { OrderSection } from "@/components/landing/OrderSection";
import { OtherProjectsSection } from "@/components/landing/OtherProjectsSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { WorkShowcaseSection } from "@/components/landing/WorkShowcaseSection";
import { createOrder, uploadOrderFile } from "@/lib/api";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type PendingMakerOrder = {
  customerName: string;
  phone: string;
  email: string;
  productTitle: string;
  makerSizeLabel: string;
  colors: string;
  notes: string;
  imageUrl: string;
  file: File | null;
};

const Index = () => {
  const [backgroundColor, setBackgroundColor] = useState("#ddb8a6");
  const [outlineColor, setOutlineColor] = useState("#8b4114");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [size, setSize] = useState<"small" | "medium" | "large">("small");
  const [title, setTitle] = useState("CAVEIRINHA");
  const [subtitle, setSubtitle] = useState("Maria Flor Moretto, 3 anos");
  const [designerNotes, setDesignerNotes] = useState("");
  const [selectedExample, setSelectedExample] = useState("caveirinha");
  const [uploadFileName, setUploadFileName] = useState("");
  const [makerUploadFile, setMakerUploadFile] = useState<File | null>(null);
  const [makerWhatsappUrl, setMakerWhatsappUrl] = useState("");
  const [pendingMakerOrder, setPendingMakerOrder] = useState<PendingMakerOrder | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmittingMaker, setIsSubmittingMaker] = useState(false);
  const [makerError, setMakerError] = useState("");

  const submitOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const phone = String(data.get("phone") ?? "");
    const projectType = String(data.get("projectType") ?? "");
    const projectIdea = String(data.get("projectIdea") ?? "");
    const deadline = String(data.get("deadline") ?? "");
    const references = String(data.get("references") ?? "");

    const message = [
      "Olá, Maiara! Quero pedir um orçamento.",
      "",
      "Dados do contato:",
      `Nome: ${name}`,
      `WhatsApp: ${phone}`,
      "",
      "Sobre o projeto:",
      `Tipo: ${projectType || "a definir"}`,
      `Ideia inicial: ${projectIdea || "a conversar"}`,
      `Prazo ou data: ${deadline || "sem prazo definido"}`,
      `Referências/arquivo: ${references || uploadFileName || "posso enviar depois"}`,
      "",
      "Podemos conversar sobre possibilidades, prazo e valores?",
    ].join("\n");

    window.location.href = buildWhatsappUrl(message);
  };

  const submitMakerOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const customerName = String(data.get("customerName") ?? "");
    const phone = String(data.get("phone") ?? "");
    const email = String(data.get("email") ?? "");
    const selectedBackground = backgroundColor;
    const selectedOutline = outlineColor;
    const makerSizeLabel = size === "small" ? "Pequeno - A4 digital" : size === "medium" ? "Médio - A3 digital" : "Grande - alta resolução";
    const productTitle = title.trim() ? `Maker: ${title.trim()}` : "Maker de desenho infantil";
    const notes = [
      `Subtítulo: ${subtitle || "não informado"}`,
      `Orientação: ${orientation === "portrait" ? "Retrato" : "Paisagem"}`,
      `Fundo: ${selectedBackground}`,
      `Traco: ${selectedOutline}`,
      `Arquivo enviado: ${uploadFileName || "cliente enviará pelo WhatsApp"}`,
      `Observações da designer: ${designerNotes || "sem observações"}`,
    ].join("\n");

    setMakerError("");
    setPendingMakerOrder({
      customerName,
      phone,
      email,
      productTitle,
      makerSizeLabel,
      colors: `Fundo ${selectedBackground}, traço ${selectedOutline}`,
      notes,
      imageUrl: `/image/desenhos/${selectedExample === "menino" ? "oMenino.svg" : "caveirinha.svg"}`,
      file: makerUploadFile,
    });
    setIsConfirmOpen(true);
  };

  const confirmMakerOrder = async () => {
    if (!pendingMakerOrder) return;

    setIsSubmittingMaker(true);
    setMakerError("");

    try {
      const result = await createOrder({
        customerName: pendingMakerOrder.customerName,
        phone: pendingMakerOrder.phone,
        email: pendingMakerOrder.email,
        orderType: "maker",
        source: "maker",
        product: pendingMakerOrder.productTitle,
        size: pendingMakerOrder.makerSizeLabel,
        colors: pendingMakerOrder.colors,
        notes: pendingMakerOrder.notes,
        items: [
          {
            title: pendingMakerOrder.productTitle,
            category: "Maker",
            orderType: "maker",
            dimensions: pendingMakerOrder.makerSizeLabel,
            quantity: 1,
            notes: pendingMakerOrder.notes,
            imageUrl: pendingMakerOrder.imageUrl,
          },
        ],
      });

      if (pendingMakerOrder.file) {
        await uploadOrderFile(result.uploadUrl, pendingMakerOrder.file);
      }

      const nextWhatsappUrl = result.whatsappUrl ?? "";
      setMakerWhatsappUrl(nextWhatsappUrl);
      setIsConfirmOpen(false);
      setPendingMakerOrder(null);

      if (nextWhatsappUrl) {
        window.location.href = nextWhatsappUrl;
      }
    } catch (error) {
      setMakerError(error instanceof Error ? error.message : "Não foi possível criar o pedido.");
    } finally {
      setIsSubmittingMaker(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ddb8a6] text-[#8b4114]">
      <Header />
      <HeroSection phrase={title} />
      <FamilinhaSection />
      <GallerySection />
      <OtherProjectsSection />
      <ServicesSection />
      <MakerSection
        backgroundColor={backgroundColor}
        outlineColor={outlineColor}
        orientation={orientation}
        size={size}
        title={title}
        subtitle={subtitle}
        designerNotes={designerNotes}
        selectedExample={selectedExample}
        uploadFileName={uploadFileName}
        onBackgroundColorChange={setBackgroundColor}
        onOutlineColorChange={setOutlineColor}
        onOrientationChange={setOrientation}
        onSizeChange={setSize}
        onTitleChange={setTitle}
        onSubtitleChange={setSubtitle}
        onDesignerNotesChange={setDesignerNotes}
        onExampleChange={setSelectedExample}
        onUploadFileChange={(file) => {
          setMakerUploadFile(file);
          setUploadFileName(file?.name ?? "");
        }}
        onSubmit={submitMakerOrder}
      />
      <AlertDialog open={isConfirmOpen} onOpenChange={(open) => !isSubmittingMaker && setIsConfirmOpen(open)}>
        <AlertDialogContent className="border-[#ddb8a6] bg-white text-[#8b4114]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-2xl font-light text-[#8b4114]">
              Confirmar pedido Maker?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans text-sm font-light leading-6 text-[#8b4114]/75">
              Ao confirmar, o pedido será criado no painel como Maker e ficará aguardando pagamento. A foto enviada ficará anexada ao pedido, e você será redirecionada para o WhatsApp da Maiara para finalizar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingMakerOrder && (
            <div className="rounded-lg border border-[#ddb8a6]/80 bg-[#f0dfd4]/45 p-4 font-sans text-sm font-light text-[#8b4114]">
              <p><strong className="font-medium">Cliente:</strong> {pendingMakerOrder.customerName}</p>
              <p><strong className="font-medium">Projeto:</strong> {pendingMakerOrder.productTitle}</p>
              <p><strong className="font-medium">Tamanho:</strong> {pendingMakerOrder.makerSizeLabel}</p>
              <p><strong className="font-medium">Arquivo:</strong> {pendingMakerOrder.file?.name ?? "sem arquivo anexado"}</p>
            </div>
          )}
          {makerError && <p className="font-sans text-sm font-medium text-red-700">{makerError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmittingMaker} className="border-[#ddb8a6] text-[#8b4114]">
              Revisar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmittingMaker}
              onClick={(event) => {
                event.preventDefault();
                confirmMakerOrder();
              }}
              className="bg-[#8b4114] text-white hover:bg-[#8b4114]/90"
            >
              {isSubmittingMaker ? "Enviando..." : "Confirmar pedido"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {makerWhatsappUrl && (
        <a href={makerWhatsappUrl} className="sr-only">
          Abrir WhatsApp do pedido Maker
        </a>
      )}
      <FeedbacksSection />

      <OrderSection onSubmit={submitOrder} />
      <Footer />
    </main>
  );
};

export default Index;
