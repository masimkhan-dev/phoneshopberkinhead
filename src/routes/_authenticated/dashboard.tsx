import { createFileRoute, Outlet, Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/auth-context";
import { DashboardSidebarContent, DashboardSidebarRail, menuItems } from "@/components/dashboard/Sidebar";
import { WelcomeToast, clearWelcomeToastFlag } from "@/components/dashboard/WelcomeToast";
import { getOpenShift } from "@/lib/shifts.functions";
import { LogOut, Globe, Menu, X, ShoppingCart, Wrench, CircleDot, AlertCircle } from "lucide-react";
import { BUSINESS } from "@/lib/business";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { signOut, user, role } = useAuth();
  const router = useRouter();
  const { location } = useRouterState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live Till / Shift Status
  const getShiftFn = useServerFn(getOpenShift);
  const { data: openShift } = useQuery({
    queryKey: ["open-shift"],
    queryFn: () => getShiftFn(),
    staleTime: 1000 * 30,
  });

  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  async function handleSignOut() {
    clearWelcomeToastFlag();
    await signOut();
    router.navigate({ to: "/", replace: true });
  }

  // Determine current page title from active route
  const activeItem = menuItems.find(
    (item) =>
      location.pathname === item.to ||
      (item.to !== "/dashboard" && location.pathname.startsWith(item.to)),
  );
  const pageTitle = activeItem ? activeItem.label : "Dashboard Overview";

  return (
    <div className="min-h-screen flex bg-[#F7F7F7] text-[#171717] font-sans antialiased">
      <WelcomeToast />

      {/* ── 1. Desktop Persistent Left Sidebar (240px / w-60) ── */}
      <aside className="hidden lg:flex w-60 flex-col fixed inset-y-0 left-0 z-30 shadow-xs border-r border-[#252525]">
        <DashboardSidebarContent />
      </aside>

      {/* ── 2. Tablet Persistent Icon Rail (64px / w-16) ── */}
      <aside className="hidden md:flex lg:hidden w-16 flex-col fixed inset-y-0 left-0 z-30 shadow-xs border-r border-[#252525]">
        <DashboardSidebarRail />
      </aside>

      {/* ── 3. Mobile Drawer Navigation (< 768px) ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-68 max-w-[85vw] shadow-2xl z-10 flex flex-col bg-[#171717]">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <DashboardSidebarContent onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── 4. Main Counter Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-16 lg:pl-60">
        {/* Compact Operational Top Bar (56–60px) */}
        <header className="sticky top-0 z-20 h-14 sm:h-15 bg-white border-b border-[#E5E5E5] px-3.5 sm:px-5 flex items-center justify-between gap-3 shadow-2xs">
          {/* Left: Mobile trigger & Context Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-lg border border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-center text-[#171717] hover:bg-[#EAEAEA] transition-colors shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight truncate leading-tight">
                {pageTitle}
              </h1>
              <span className="hidden xl:inline-block text-[11px] font-medium text-[#666666] truncate leading-tight">
                {BUSINESS.name} • 16 Borough Pavement
              </span>
            </div>
          </div>

          {/* Center / Right: Operational Status & Fast Shortcuts */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Till Shift Indicator */}
            {openShift ? (
              <Link
                to="/dashboard/pos"
                title="Active till shift is open. Click to open POS register."
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <CircleDot className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />
                <span className="hidden sm:inline">Till</span> Open
              </Link>
            ) : (
              <Link
                to="/dashboard/pos"
                title="No active till shift. Click to open float at POS register."
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Till</span> Closed
              </Link>
            )}

            {/* Quick Operational Action: POS */}
            <Link
              to="/dashboard/pos"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] hover:border-[#AC313F] hover:text-[#AC313F] transition-colors text-xs font-bold"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-[#AC313F]" />
              <span>POS</span>
            </Link>

            {/* Quick Operational Action: Repairs */}
            <Link
              to="/dashboard/repairs"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F7F7] border border-[#E5E5E5] text-[#171717] hover:border-[#AC313F] hover:text-[#AC313F] transition-colors text-xs font-bold"
            >
              <Wrench className="w-3.5 h-3.5 text-[#AC313F]" />
              <span>Repairs</span>
            </Link>

            {/* Role Badge */}
            <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md bg-[#171717]/8 text-[#171717] text-[10px] font-extrabold uppercase tracking-wider">
              {role ?? "staff"}
            </span>

            {/* View Public Website */}
            <Link
              to="/"
              target="_blank"
              title="Open Public Website in new tab"
              className="text-xs font-semibold text-[#666666] hover:text-[#AC313F] p-1.5 rounded-lg hover:bg-[#F7F7F7] transition-colors"
            >
              <Globe className="w-4 h-4" />
            </Link>

            {/* Sign Out Action */}
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out of counter terminal"
              className="text-xs font-bold text-[#AC313F] hover:text-white hover:bg-[#AC313F] px-2.5 py-1.5 rounded-lg border border-[#AC313F]/30 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* High-density Main Route Content */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 min-w-0 max-w-[1920px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
