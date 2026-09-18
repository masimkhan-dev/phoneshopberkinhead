import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wrench,
  Users,
  Truck,
  ShoppingBag,
  CreditCard,
  Receipt,
  BarChart3,
  Shield,
  Settings as SettingsIcon,
  FileText,
  Smartphone,
  CalendarCheck,
} from "lucide-react";
import { BUSINESS } from "@/lib/business";
import { SITE_MEDIA } from "@/lib/site-content";

export interface MenuItem {
  to: string;
  label: string;
  shortLabel?: string;
  icon: typeof LayoutDashboard;
  roles?: ("admin" | "staff" | "technician")[];
  group: "operations" | "ledger" | "admin";
}

export const menuItems: MenuItem[] = [
  // 1. Counter & High-Frequency Operations
  { to: "/dashboard", label: "Overview", shortLabel: "Overview", icon: LayoutDashboard, group: "operations" },
  { to: "/dashboard/pos", label: "POS Register", shortLabel: "POS", icon: ShoppingCart, roles: ["admin", "staff"], group: "operations" },
  { to: "/dashboard/repairs", label: "Repair Invoices", shortLabel: "Repairs", icon: FileText, group: "operations" },
  { to: "/dashboard/products", label: "Inventory & Parts", shortLabel: "Stock", icon: Package, group: "operations" },
  { to: "/dashboard/phone-buy-sell", label: "Phone Buy & Sell", shortLabel: "Trade", icon: Smartphone, roles: ["admin", "staff"], group: "operations" },
  { to: "/dashboard/daily-sales", label: "Daily Sales Close", shortLabel: "Closing", icon: CalendarCheck, roles: ["admin", "staff"], group: "operations" },

  // 2. Records, Purchasing & Financial Ledger
  { to: "/dashboard/sales", label: "Sales History", shortLabel: "Sales", icon: CreditCard, roles: ["admin", "staff"], group: "ledger" },
  { to: "/dashboard/purchases", label: "Purchases", shortLabel: "Purchases", icon: ShoppingBag, roles: ["admin", "staff"], group: "ledger" },
  { to: "/dashboard/customers", label: "Customers", shortLabel: "Customers", icon: Users, group: "ledger" },
  { to: "/dashboard/suppliers", label: "Suppliers", shortLabel: "Suppliers", icon: Truck, roles: ["admin", "staff"], group: "ledger" },
  { to: "/dashboard/expenses", label: "Expenses", shortLabel: "Expenses", icon: Receipt, roles: ["admin", "staff"], group: "ledger" },
  { to: "/dashboard/reports", label: "Reports", shortLabel: "Reports", icon: BarChart3, roles: ["admin", "staff"], group: "ledger" },

  // 3. System & Administration
  { to: "/dashboard/users", label: "Staff Accounts", shortLabel: "Staff", icon: Shield, roles: ["admin"], group: "admin" },
  { to: "/dashboard/settings", label: "Settings", shortLabel: "Settings", icon: SettingsIcon, roles: ["admin"], group: "admin" },
];

const GROUP_LABELS: Record<MenuItem["group"], string> = {
  operations: "Counter Operations",
  ledger: "Records & Ledger",
  admin: "System & Admin",
};

/**
 * Full expanded sidebar for desktop and mobile drawer
 */
export function DashboardSidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const { location } = useRouterState();
  const { role, user } = useAuth();
  const userRole = role ?? "staff";

  const visibleItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const groups: MenuItem["group"][] = ["operations", "ledger", "admin"];

  return (
    <div className="flex flex-col h-full bg-[#171717] text-white select-none border-r border-[#252525]">
      {/* Brand Header */}
      <div className="h-14 sm:h-15 px-4 flex items-center border-b border-white/10 bg-[#1F1F1F]">
        <Link to="/dashboard" onClick={onItemClick} className="flex items-center gap-3 group min-w-0">
          {SITE_MEDIA.logo ? (
            <div className="w-8 h-8 rounded-lg bg-[#262626] border border-white/10 p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <img src={SITE_MEDIA.logo} alt={BUSINESS.name} className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#AC313F] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
              PSB
            </div>
          )}
          <div className="min-w-0">
            <span className="block text-xs font-extrabold tracking-tight text-white truncate">
              {BUSINESS.name}
            </span>
            <span className="block text-[10px] font-semibold text-[#AB5163] uppercase tracking-wider truncate">
              Counter POS &amp; Workshop
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 scrollbar-thin">
        {groups.map((group) => {
          const groupItems = visibleItems.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="space-y-0.5">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                {GROUP_LABELS[group]}
              </div>
              <div className="space-y-0.5">
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== "/dashboard" && location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onItemClick}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors min-h-[38px] cursor-pointer ${
                        isActive
                          ? "bg-white/10 text-white font-bold border-l-2 border-[#AC313F]"
                          : "text-white/70 hover:text-white hover:bg-white/5 font-medium"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-[#AC313F]" : "text-white/50"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-white/10 bg-[#1F1F1F] text-xs">
        <div className="truncate font-semibold text-white/90 text-[11px]">
          {user?.email ?? "Counter Terminal"}
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px]">
          <span className="font-bold uppercase tracking-wider text-[#AB5163]">
            {userRole}
          </span>
          <span className="text-white/40">16 Borough Pavement</span>
        </div>
      </div>
    </div>
  );
}

/**
 * High-density Tablet Icon Rail (768px – 1023px)
 * Displays compact one-tap icons for rapid counter operations without drawer obstruction.
 */
export function DashboardSidebarRail() {
  const { location } = useRouterState();
  const { role } = useAuth();
  const userRole = role ?? "staff";

  const visibleItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  const groups: MenuItem["group"][] = ["operations", "ledger", "admin"];

  return (
    <div className="flex flex-col h-full w-16 bg-[#171717] text-white select-none border-r border-[#252525] items-center">
      {/* Brand Icon Header */}
      <div className="h-14 sm:h-15 w-full flex items-center justify-center border-b border-white/10 bg-[#1F1F1F]">
        <Link to="/dashboard" title="Phone Shop Birkenhead" className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-[#AC313F] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
            PSB
          </div>
        </Link>
      </div>

      {/* Vertical Icon Rail */}
      <div className="flex-1 w-full overflow-y-auto py-2 px-2 space-y-3 flex flex-col items-center scrollbar-none">
        {groups.map((group, gIdx) => {
          const groupItems = visibleItems.filter((i) => i.group === group);
          if (groupItems.length === 0) return null;

          return (
            <div key={group} className="w-full flex flex-col items-center space-y-1">
              {gIdx > 0 && <div className="w-8 h-px bg-white/10 my-1" />}
              {groupItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/dashboard" && location.pathname.startsWith(item.to));

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    title={`${item.label} (${GROUP_LABELS[group]})`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative cursor-pointer ${
                      isActive
                        ? "bg-white/15 text-white font-bold"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#AC313F] rounded-r" />
                    )}
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#AC313F]" : "text-white/60"}`} />
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Rail Bottom Status */}
      <div className="p-2 border-t border-white/10 w-full flex justify-center bg-[#1F1F1F]">
        <span
          title={`Active Role: ${userRole}`}
          className="w-7 h-7 rounded-md bg-white/10 text-[10px] font-extrabold text-[#AB5163] uppercase flex items-center justify-center"
        >
          {userRole.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

export function DashboardTopbarNav({ onItemClick }: { onItemClick?: () => void }) {
  return <DashboardSidebarContent onItemClick={onItemClick} />;
}

export function DashboardSidebar() {
  return <DashboardSidebarContent />;
}
