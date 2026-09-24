import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  ExternalLink,
  FolderKanban,
  Layers3,
  LogOut,
  Menu,
  PackageOpen,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { getAdminSession, signOutAdmin, type AdminSession } from "@/lib/admin-auth";
import { clearAdminDrafts } from "@/lib/admin-drafts";

const navigationItems = [
  { label: "Painel", href: "/admin", icon: BarChart3 },
  { label: "Pedidos", href: "/admin/pedidos", icon: FolderKanban },
  { label: "Galeria", href: "/admin/galeria", icon: Layers3 },
  { label: "Outros projetos", href: "/admin/outros", icon: PackageOpen },
  { label: "Arquivos", href: "/admin/bucket", icon: Database },
  { label: "Usuários", href: "/admin/usuarios", icon: Users, ownerOnly: true },
];

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const location = useLocation();

  useEffect(() => {
    getAdminSession().then(setSession);
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", clearAdminDrafts);
    return () => {
      window.removeEventListener("beforeunload", clearAdminDrafts);
      clearAdminDrafts();
    };
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname]);

  const visibleNavigationItems = useMemo(
    () => navigationItems.filter((item) => !item.ownerOnly || session?.role === "owner"),
    [session?.role],
  );

  const currentPage = useMemo(() => {
    const current = visibleNavigationItems.find((item) => {
      if (item.href === "/admin") return location.pathname === "/admin";
      return location.pathname.startsWith(item.href);
    });
    return current?.label ?? "Painel";
  }, [location.pathname, visibleNavigationItems]);

  const signOut = () => {
    signOutAdmin();
  };

  const userInitial = session?.username ? session.username.charAt(0).toUpperCase() : "A";

  return (
    <main className="min-h-screen bg-[#f8f1e9] text-[#8b4114] antialiased">
      <div
        className={`grid min-h-screen transition-[grid-template-columns] duration-300 ${
          isSidebarOpen ? "lg:grid-cols-[15.5rem_1fr] 2xl:grid-cols-[17.5rem_1fr]" : "lg:grid-cols-[5.25rem_1fr]"
        }`}
      >
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden border-r border-[#8b4114]/10 bg-[#fffaf5] px-3.5 py-5 shadow-[4px_0_24px_rgba(93,51,29,0.03)] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-between">
          <div>
            {/* Logo / Brand Header */}
            <div className={`flex items-center ${isSidebarOpen ? "justify-between px-2" : "justify-center"}`}>
              <a
                href="/admin"
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-85"
                title="Ateliê Maiara Admin"
              >
                <div
                  aria-hidden="true"
                  className={`${isSidebarOpen ? "h-11 w-28" : "h-10 w-10"} bg-[#8b4114] transition-all duration-300`}
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

              {isSidebarOpen && (
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8b4114]/12 bg-white text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                  aria-label="Recolher menu"
                  title="Recolher menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>

            {!isSidebarOpen && (
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="mx-auto mt-4 flex h-8 w-8 items-center justify-center rounded-lg border border-[#8b4114]/12 bg-white text-[#8b4114] transition-colors hover:bg-[#f0dfd4]"
                aria-label="Expandir menu"
                title="Expandir menu"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {isSidebarOpen && (
              <div className="mt-5 px-2.5">
                <span className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#76877e]">
                  Menu do painel
                </span>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="mt-2.5 space-y-1">
              {visibleNavigationItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    end={item.href === "/admin"}
                    className={({ isActive }) =>
                      `group relative flex h-10 items-center rounded-xl font-sans text-sm transition-all duration-150 ${
                        isSidebarOpen ? "gap-3 px-3" : "justify-center px-0"
                      } ${
                        isActive
                          ? "bg-[#8b4114] font-medium text-white shadow-[0_4px_16px_rgba(139,65,20,0.18)]"
                          : "font-light text-[#8b4114]/85 hover:bg-[#f0dfd4]/70 hover:text-[#8b4114]"
                      }`
                    }
                    title={isSidebarOpen ? undefined : item.label}
                  >
                    <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Footer Actions */}
          <div className="border-t border-[#8b4114]/10 pt-4">
            <div
              className={`flex items-center rounded-xl bg-white p-2 border border-[#8b4114]/10 shadow-sm ${
                isSidebarOpen ? "justify-between" : "justify-center"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8b4114] font-sans text-xs font-semibold text-white">
                  {userInitial}
                </div>
                {isSidebarOpen && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-sans text-xs font-medium text-[#8b4114]">
                      {session?.username ?? "Administrador"}
                    </p>
                    <p className="truncate font-sans text-[0.68rem] text-[#76877e]">
                      {session?.role === "owner" ? "Administrador principal" : "Administrador"}
                    </p>
                  </div>
                )}
              </div>

              {isSidebarOpen && (
                <button
                  type="button"
                  onClick={signOut}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8b4114]/70 transition-colors hover:bg-[#f0dfd4] hover:text-[#8b4114]"
                  title="Sair do painel"
                  aria-label="Sair do painel"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>

            {!isSidebarOpen && (
              <button
                type="button"
                onClick={signOut}
                className="mt-2 flex h-9 w-full items-center justify-center rounded-xl border border-[#8b4114]/10 bg-white text-[#8b4114]/70 transition-colors hover:bg-red-50 hover:text-red-700"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex min-w-0 flex-col">
          {/* Top Header Bar */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#8b4114]/10 bg-[#fffaf5]/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            {/* Left: Mobile Menu Toggle & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#8b4114]/15 bg-white text-[#8b4114] lg:hidden"
                aria-label="Abrir navegação"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 font-sans text-xs sm:text-sm">
                <span className="hidden text-[#76877e] sm:inline">Ateliê Maiara</span>
                <span className="hidden text-[#8b4114]/30 sm:inline">/</span>
                <span className="font-medium text-[#8b4114]">{currentPage}</span>
              </div>
            </div>

            {/* Right: Status Pill & View Storefront Button */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-[#76877e]/25 bg-[#eef4f0] px-3 py-1 text-xs text-[#2d523a] md:inline-flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#407a53] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#407a53]" />
                </span>
                <span>Painel ativo</span>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#8b4114]/15 bg-white px-3 font-sans text-xs font-light text-[#8b4114] shadow-sm transition-all hover:bg-[#f0dfd4] hover:shadow"
                title="Abrir site público"
              >
                <span>Ver site</span>
                <ExternalLink className="h-3.5 w-3.5 text-[#76877e]" />
              </a>
            </div>
          </header>

          {/* MOBILE DRAWER */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-[#1f1713]/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-hidden="true"
              />

              {/* Drawer Sheet */}
              <div className="relative flex w-full max-w-xs flex-1 flex-col bg-[#fffaf5] p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#8b4114]/10 pb-4">
                  <div
                    aria-hidden="true"
                    className="h-10 w-24 bg-[#8b4114]"
                    style={{
                      WebkitMaskImage: 'url("/logoMaiara.svg")',
                      maskImage: 'url("/logoMaiara.svg")',
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "left center",
                      maskPosition: "left center",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#8b4114]/15 bg-white text-[#8b4114]"
                    aria-label="Fechar menu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
                  {visibleNavigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === "/admin"}
                        className={({ isActive }) =>
                          `flex h-11 items-center gap-3 rounded-xl px-3 font-sans text-sm transition-colors ${
                            isActive
                              ? "bg-[#8b4114] font-medium text-white shadow-sm"
                              : "text-[#8b4114] hover:bg-[#f0dfd4]"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="border-t border-[#8b4114]/10 pt-4">
                  <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-[#8b4114]/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#8b4114] font-sans text-xs font-semibold text-white">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-sans text-xs font-medium text-[#8b4114]">
                          {session?.username ?? "Administrador"}
                        </p>
                        <p className="truncate font-sans text-[0.68rem] text-[#76877e]">
                          {session?.role === "owner" ? "Administrador principal" : "Administrador"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={signOut}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0dfd4] text-[#8b4114]"
                      aria-label="Sair"
                      title="Sair"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
