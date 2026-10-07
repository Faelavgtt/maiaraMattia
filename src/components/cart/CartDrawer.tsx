import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const location = useLocation();
  const { items, isOpen, itemCount, openCart, closeCart, removeItem, updateQuantity, checkout } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const submitCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setWhatsappUrl(null);

    const data = new FormData(event.currentTarget);

    try {
      const result = await checkout({
        customerName: String(data.get("customerName") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        notes: String(data.get("notes") ?? ""),
      });

      setMessage(`Pedido ${result.code} enviado com sucesso.`);
      setWhatsappUrl(result.whatsappUrl);
      event.currentTarget.reset();
      if (result.whatsappUrl) {
        const openedWindow = window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
        if (!openedWindow) {
          setMessage(`Pedido ${result.code} enviado com sucesso. Clique em Abrir WhatsApp para finalizar o pagamento.`);
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      <motion.button
        type="button"
        onClick={openCart}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-[#8b4114] px-4 font-sans text-xs font-medium text-white shadow-[0_18px_36px_rgba(93,51,29,0.22)] sm:bottom-5 sm:right-5 sm:h-14 sm:px-5 sm:text-sm"
        aria-label="Abrir carrinho"
      >
        <ShoppingBag className="h-5 w-5" />
        Pedido
        {itemCount > 0 && (
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs text-[#8b4114]">
            {itemCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[1000]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="absolute inset-0 bg-[#1f1713]/60 backdrop-blur-xs"
              onClick={closeCart}
              aria-label="Fechar carrinho"
            />
            <motion.aside
              initial={isMobileView ? { y: "100%" } : { x: "100%" }}
              animate={isMobileView ? { y: 0 } : { x: 0 }}
              exit={isMobileView ? { y: "100%" } : { x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="absolute bottom-0 right-0 flex h-[min(100svh,92vh)] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-[#fffaf5] pb-[env(safe-area-inset-bottom,0px)] shadow-2xl sm:top-0 sm:h-full sm:rounded-none sm:pb-0"
            >
            <div className="flex items-center justify-between border-b border-[#8b4114]/12 px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="font-sans text-xs font-light uppercase tracking-[0.18em] text-[#76877e]">Carrinho</p>
                <h2 className="font-sans text-xl font-extralight text-[#8b4114] sm:text-2xl">Seu pedido</h2>
              </div>
              <button type="button" onClick={closeCart} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8b4114]/10 text-[#8b4114]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              {message && (
                <div className="mb-4 rounded-md border border-[#8b4114]/15 bg-white p-3 font-sans text-sm font-light text-[#8b4114]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#7d876d]" />
                    <div>
                      <p>{message}</p>
                      {whatsappUrl && (
                        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex text-sm font-medium text-[#7d876d]">
                          Abrir WhatsApp para finalizar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-[#8b4114]/20 bg-white/70 px-4 py-10 text-center font-sans text-sm font-light text-[#8b4114]/70">
                  Sua sacola está vazia. Escolha um produto na galeria ou em outros projetos para montar o pedido.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <article key={item.id} className="grid grid-cols-[3.75rem_1fr] gap-3 rounded-md border border-[#8b4114]/15 bg-white p-3 sm:grid-cols-[4.5rem_1fr]">
                      <div className="aspect-square overflow-hidden rounded-md bg-[#f0dfd4]">
                        {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-sans text-sm font-medium leading-tight text-[#8b4114]">{item.title}</p>
                            <p className="mt-0.5 font-sans text-xs font-light text-[#8b4114]/60">{item.price ?? item.category ?? "Produto personalizado"}</p>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)} className="text-[#8b4114]/55 hover:text-[#8b4114]" aria-label={`Remover ${item.title}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                          <div className="inline-flex h-9 items-center rounded-full border border-[#ddb8a6] bg-[#fffaf5]">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center" aria-label="Diminuir quantidade">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-6 text-center font-sans text-sm text-[#8b4114]">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center" aria-label="Aumentar quantidade">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="font-sans text-[11px] font-light text-[#8b4114]/60 sm:text-xs">{item.dimensions}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {items.length > 0 && (
                <form onSubmit={submitCheckout} className="mt-4 space-y-2.5 rounded-md border border-[#8b4114]/15 bg-white p-3.5 sm:mt-5 sm:space-y-3 sm:p-4">
                  <label className="block font-sans text-xs font-light text-[#8b4114]">
                    Seu nome
                    <input
                      name="customerName"
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                      className="mt-1 h-11 sm:h-11 w-full rounded-full border border-[#ddb8a6] px-4 text-base sm:text-sm outline-none focus:border-[#c68043]"
                    />
                  </label>
                  <label className="block font-sans text-xs font-light text-[#8b4114]">
                    WhatsApp
                    <input
                      name="phone"
                      type="tel"
                      required
                      minLength={10}
                      maxLength={20}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern="[0-9()+\-\s]{10,20}"
                      title="Informe um WhatsApp com DDD."
                      className="mt-1 h-11 sm:h-11 w-full rounded-full border border-[#ddb8a6] px-4 text-base sm:text-sm outline-none focus:border-[#c68043]"
                    />
                  </label>
                  <label className="block font-sans text-xs font-light text-[#8b4114]">
                    E-mail opcional
                    <input
                      name="email"
                      type="email"
                      maxLength={120}
                      autoComplete="email"
                      className="mt-1 h-11 sm:h-11 w-full rounded-full border border-[#ddb8a6] px-4 text-base sm:text-sm outline-none focus:border-[#c68043]"
                    />
                  </label>
                  <label className="block font-sans text-xs font-light text-[#8b4114]">
                    Observações do pedido
                    <textarea
                      name="notes"
                      rows={2}
                      maxLength={600}
                      className="mt-1 w-full resize-none rounded-xl border border-[#ddb8a6] p-3 text-base sm:text-sm outline-none focus:border-[#c68043] sm:min-h-20"
                      placeholder="Cores, nomes, prazo ou detalhes importantes."
                    />
                  </label>
                  <button disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#7d876d] px-5 font-sans text-sm font-medium text-white disabled:opacity-60">
                    {isSubmitting ? "Enviando..." : "Finalizar pedido"}
                  </button>
                </form>
              )}
            </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
