import { Menu, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const readableHeaderBackground = "rgba(209, 156, 136, 0.68)";

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let animationFrame = 0;
    let scrollUpdateTimeout = 0;
    let hashUpdateTimeout = 0;
    let initialUpdateTimeout = 0;
    let themeSyncInterval = 0;

    const updateHeader = () => {
      window.cancelAnimationFrame(animationFrame);

      animationFrame = window.requestAnimationFrame(() => {
        setHasScrolled(window.scrollY > 12);
      });
    };

    const updateHeaderAfterHashChange = () => {
      updateHeader();
      window.clearTimeout(hashUpdateTimeout);
      hashUpdateTimeout = window.setTimeout(updateHeader, 120);
    };

    const updateHeaderAfterScroll = () => {
      updateHeader();
      window.clearTimeout(scrollUpdateTimeout);
      scrollUpdateTimeout = window.setTimeout(updateHeader, 120);
    };

    updateHeader();
    initialUpdateTimeout = window.setTimeout(updateHeader, 120);
    themeSyncInterval = window.setInterval(updateHeader, 250);
    window.addEventListener("scroll", updateHeaderAfterScroll, { passive: true });
    window.addEventListener("resize", updateHeader);
    window.addEventListener("hashchange", updateHeaderAfterHashChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(scrollUpdateTimeout);
      window.clearTimeout(hashUpdateTimeout);
      window.clearTimeout(initialUpdateTimeout);
      window.clearInterval(themeSyncInterval);
      window.removeEventListener("scroll", updateHeaderAfterScroll);
      window.removeEventListener("resize", updateHeader);
      window.removeEventListener("hashchange", updateHeaderAfterHashChange);
    };
  }, []);

  const headerBackgroundColor = (hasScrolled || isMobileMenuOpen) ? readableHeaderBackground : "transparent";
  const shouldShowShadow = hasScrolled || isMobileMenuOpen;
  const headerAccentColor = "#f9e7d6";
  const navTextColor = "#ffffff";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`fixed left-0 top-0 z-30 w-full transition-all duration-500 ${
        shouldShowShadow ? "shadow-[0_10px_30px_rgba(93,51,29,0.08)] backdrop-blur-md" : ""
      }`}
      style={{ backgroundColor: headerBackgroundColor }}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-5">
        <a
          href="#inicio"
          onClick={closeMobileMenu}
          aria-label="Maiara Mattia - início"
          className="flex items-center gap-3 transition-colors duration-500"
          style={{ color: headerAccentColor }}
        >
          <span
            aria-hidden="true"
            className="h-10 w-[4.35rem] bg-current sm:h-12 sm:w-[5rem]"
            style={{
              WebkitMaskImage: 'url("/logoMaiara.svg")',
              maskImage: 'url("/logoMaiara.svg")',
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              WebkitMaskSize: "contain",
              maskSize: "contain",
            }}
          />
        </a>

        {/* Desktop Navigation Links */}
        <div
          className="hidden items-center gap-7 font-sans text-sm font-normal transition-colors duration-500 md:flex"
          style={{ color: navTextColor }}
        >
          <a href="#familinha" className="transition-opacity hover:opacity-80">Personalizados</a>
          <a href="#outros-projetos" className="transition-opacity hover:opacity-80">Produtos</a>
          <a href="#maker" className="transition-opacity hover:opacity-80">Pequeno Artista</a>
          <a href="#feedbacks" className="transition-opacity hover:opacity-80">Clientes</a>
          <a href="#pedido" className="transition-opacity hover:opacity-80">Contato</a>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#pedido"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#7d876d] px-3.5 font-sans text-xs font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition-transform hover:scale-105 active:scale-95 sm:h-10 sm:px-4 sm:text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Encomendar</span>
          </a>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? "Fechar menu de navegação" : "Abrir menu de navegação"}
            aria-expanded={isMobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white backdrop-blur-xs transition-colors hover:bg-white/30 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/20 bg-[#d19c88]/95 px-5 py-4 shadow-xl backdrop-blur-md md:hidden"
          >
            <div className="flex flex-col gap-1 font-sans text-sm font-normal text-white">
              <a
                href="#familinha"
                onClick={closeMobileMenu}
                className="flex min-h-[44px] items-center rounded-xl px-3 transition-colors hover:bg-white/15"
              >
                Personalizados
              </a>
              <a
                href="#outros-projetos"
                onClick={closeMobileMenu}
                className="flex min-h-[44px] items-center rounded-xl px-3 transition-colors hover:bg-white/15"
              >
                Produtos
              </a>
              <a
                href="#maker"
                onClick={closeMobileMenu}
                className="flex min-h-[44px] items-center rounded-xl px-3 transition-colors hover:bg-white/15"
              >
                Pequeno Artista
              </a>
              <a
                href="#feedbacks"
                onClick={closeMobileMenu}
                className="flex min-h-[44px] items-center rounded-xl px-3 transition-colors hover:bg-white/15"
              >
                Clientes
              </a>
              <a
                href="#pedido"
                onClick={closeMobileMenu}
                className="flex min-h-[44px] items-center rounded-xl px-3 transition-colors hover:bg-white/15"
              >
                Contato
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
