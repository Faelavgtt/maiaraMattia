import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";

const readableHeaderBackground = "rgba(209, 156, 136, 0.68)";

export function Header() {
  const [hasScrolled, setHasScrolled] = useState(false);

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

  const headerBackgroundColor = hasScrolled ? readableHeaderBackground : "transparent";
  const shouldShowShadow = hasScrolled;
  const headerAccentColor = "#f9e7d6";
  const navTextColor = "#ffffff";

  return (
    <header
      className={`fixed left-0 top-0 z-30 w-full transition-all duration-500 ${
        shouldShowShadow ? "shadow-[0_10px_30px_rgba(93,51,29,0.08)] backdrop-blur" : ""
      }`}
      style={{ backgroundColor: headerBackgroundColor }}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-5">
        <a
          href="#inicio"
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
        <div
          className="hidden items-center gap-7 font-sans text-sm font-normal transition-colors duration-500 md:flex"
          style={{ color: navTextColor }}
        >
          <a href="#familinha">Personalizados</a>
          <a href="#outros-projetos">Produtos</a>
          <a href="#maker">Pequeno Artista</a>
          <a href="#feedbacks">Clientes</a>
          <a href="#pedido">Contato</a>

          
        </div>
        <a href="#pedido" className="inline-flex h-9 items-center gap-2 rounded-full bg-[#7d876d] px-3.5 font-sans text-xs font-medium text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] sm:h-10 sm:px-4 sm:text-sm">
          <MessageCircle className="h-4 w-4" />
          Encomendar
        </a>
      </nav>
    </header>
  );
}
