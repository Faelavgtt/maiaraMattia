import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Circle, Home, Loader2, MessageCircle } from "lucide-react";
import { getOrderStatus, type OrderStatusValue } from "@/lib/api";
import { buildWhatsappUrl } from "@/lib/whatsapp";

const statusSteps: Array<{ status: OrderStatusValue; label: string }> = [
  { status: "awaiting_payment", label: "Pedido recebido" },
  { status: "payment_confirmed", label: "Pagamento confirmado" },
  { status: "in_production", label: "Em produção" },
  { status: "awaiting_approval", label: "Aguardando aprovação" },
  { status: "finished", label: "Finalizado" },
];

const OrderStatus = () => {
  const { code } = useParams();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const hasToken = Boolean(token);
  const orderCode = code ?? "";
  const statusQuery = useQuery({
    queryKey: ["order-status", orderCode, token],
    queryFn: () => getOrderStatus(orderCode, token),
    enabled: Boolean(orderCode && token),
    retry: false,
  });

  const currentStep = getCurrentStep(statusQuery.data?.status);
  const whatsappUrl = buildWhatsappUrl(
    statusQuery.data
      ? `Oi, quero falar sobre o pedido ${statusQuery.data.code}.`
      : `Oi, quero falar sobre meu pedido ${orderCode}.`,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#d19c88] px-5 py-10 text-[#8b4114]">
      <section className="w-full max-w-2xl rounded-md border border-[#8b4114] bg-white p-6 shadow-sm md:p-8">
        <p className="font-sans text-sm font-light uppercase tracking-[0.18em] text-[#76877e]">Acompanhamento</p>
        <h1 className="mt-2 font-sans text-4xl font-extralight">Pedido {orderCode || "não encontrado"}</h1>
        <p className="mt-3 font-sans text-lg font-light text-[#8b4114]">
          {!hasToken
            ? "Para proteger o pedido, use o link completo enviado após a compra."
            : statusQuery.isLoading
              ? "Carregando o andamento atualizado do pedido..."
              : statusQuery.isError
                ? "Não foi possível abrir este acompanhamento. Confira se o link está completo."
                : "Seu desenho já está no ateliê digital. Aqui fica o andamento da produção."}
        </p>

        {statusQuery.isLoading && hasToken ? (
          <div className="mt-8 flex items-center gap-3 rounded-md bg-[#f8f1e9] px-4 py-3 font-sans text-sm font-light">
            <Loader2 className="h-4 w-4 animate-spin" />
            Atualizando pedido...
          </div>
        ) : statusQuery.isError || !hasToken ? (
          <div className="mt-8 flex items-start gap-3 rounded-md bg-[#f8f1e9] px-4 py-3 font-sans text-sm font-light">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Se você recebeu o link pelo WhatsApp, abra exatamente o endereço enviado, incluindo o código depois de `token=`.</span>
          </div>
        ) : (
          <>
            {statusQuery.data?.product && (
              <div className="mt-6 rounded-md bg-[#f8f1e9] px-4 py-3 font-sans text-sm font-light">
                <p className="font-medium">Pedido de {statusQuery.data.customerName}</p>
                <p className="mt-1 text-[#8b4114]/75">{statusQuery.data.product}</p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {statusSteps.map((step, index) => {
                const done = index <= currentStep;

                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-[#76877e] text-white" : "bg-[#ddb8a6] text-[#8b4114]"}`}>
                      {done ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </span>
                    <span className="font-sans text-lg font-light">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappUrl}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#76877e] px-5 font-sans font-medium text-white"
          >
            <MessageCircle className="h-4 w-4" />
            Falar no WhatsApp
          </a>
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-[#8b4114] px-5 font-sans font-light text-[#8b4114]"
          >
            <Home className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </section>
    </main>
  );
};

function getCurrentStep(status?: OrderStatusValue) {
  if (!status) return 0;
  if (status === "received") return 0;
  return Math.max(0, statusSteps.findIndex((step) => step.status === status));
}

export default OrderStatus;
