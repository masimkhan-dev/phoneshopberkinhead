import { resolveShopIdentity } from "@/lib/shop-identity";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings, saveSettings } from "@/lib/settings.functions";
import { toastSuccess, toastError } from "@/lib/toast";
import {
  PageHelpButton,
  isTrainingModeEnabled,
  setTrainingModeEnabled,
} from "@/components/dashboard/PageHelpButton";
import {
  Settings,
  Save,
  Store,
  Receipt,
  ShieldAlert,
  Shield,
  Loader2,
  Sparkles,
  CheckCircle2,
  FileText,
  Sliders,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: DashboardSettingsPage,
});

function DashboardSettingsPage() {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const getSettingsFn = useServerFn(getSettings);
  const saveSettingsFn = useServerFn(saveSettings);

  const [trainingMode, setTrainingMode] = useState<boolean>(isTrainingModeEnabled());

  const { data: settings, isLoading } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getSettingsFn(),
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });

  const [formData, setFormData] = useState({
    business_name: "",
    address_line: "",
    email: "",
    phone: "",
    whatsapp: "",
    vat_registered: "false",
    vat_number: "",
    vat_rate_percent: "",
    company_number: "",
    default_warranty_days: "",
    allow_negative_stock: "false",
    require_adj_approval: "true",
    door_to_door_charge_pence: "0",
    receipt_footer: "",
  });

  useEffect(() => {
    if (settings) {
      const identity = resolveShopIdentity(settings);
      setFormData({
        business_name: identity.name,
        address_line: identity.address,
        email: identity.email,
        phone: identity.phone,
        whatsapp: identity.whatsapp,
        vat_registered: settings.vat_registered || "false",
        vat_number: settings.vat_number || "",
        vat_rate_percent: settings.vat_rate_percent || "",
        company_number: settings.company_number || "",
        default_warranty_days: settings.default_warranty_days || "",
        allow_negative_stock: settings.allow_negative_stock || "false",
        require_adj_approval: settings.require_adj_approval || "true",
        door_to_door_charge_pence: settings.door_to_door_charge_pence || "0",
        receipt_footer: identity.footer,
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (patch: typeof formData) => saveSettingsFn({ data: patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      toastSuccess("Store settings updated successfully.");
    },
    onError: (err: Error) => {
      toastError(err, "Failed to save settings");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  function handleToggleTrainingMode() {
    const next = !trainingMode;
    setTrainingMode(next);
    setTrainingModeEnabled(next);
    toastSuccess(`Interactive workflow training hints turned ${next ? "ON" : "OFF"}.`);
  }

  if (!isAdmin) {
    return (
      <div className="db-page max-w-xl mx-auto p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          Only store administrators have authorization to modify store configuration.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const inputCls =
    "w-full px-3.5 py-2.5 bg-white border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-all";
  const labelCls = "block text-xs font-bold text-foreground mb-1";

  return (
    <div className="db-page max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Store Configuration &amp; Settings</h1>
            <PageHelpButton
              pageTitle="Settings"
              pageKey="settings"
              steps={[
                "Configure official shop identity, registered address, and phone numbers.",
                "Review VAT registration status and Companies House numbers.",
                "Manage POS receipt footer disclaimers and default repair warranty windows.",
                "Toggle onboarding training guidance hints across ERP modules.",
              ]}
              firstTimeTip="Tip: Changes made here update customer receipts, thermal printouts, and tax invoices."
            />
          </div>
          <p className="db-page-subtitle">
            Authoritative shop identity, contact records, VAT tax parameters, and ERP operational rules.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="btn-primary !py-2.5 !px-5 !text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          {mutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Changes</span>
        </button>
      </div>

      {/* Training Tips Preferences Card (Section 21) */}
      <div className="db-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-brand/5 border-brand/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <Sparkles className="w-4 h-4 text-brand" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-foreground">Interactive Training &amp; Workflow Hints</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Show contextual introductory tooltips and step-by-step guidance cards when navigating register screens.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggleTrainingMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer border shrink-0 ${
            trainingMode
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-white text-muted-foreground border-border hover:bg-muted"
          }`}
        >
          {trainingMode ? "Training Mode: ON" : "Training Mode: OFF"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Store & Business Identity (Section 21) */}
        <div className="db-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Store className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              1. Shop Identity &amp; Contact Records
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Trading Name</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => handleChange("business_name", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Printed on receipts, invoices, and customer notices.</p>
            </div>

            <div>
              <label className={labelCls}>Counter Telephone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Public retail customer telephone contact.</p>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Physical Store Address</label>
              <input
                type="text"
                value={formData.address_line}
                onChange={(e) => handleChange("address_line", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Full high-street retail premises location.</p>
            </div>

            <div>
              <label className={labelCls}>Contact / Support Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>WhatsApp Messaging Number</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* 2. VAT & Company Registration */}
        <div className="db-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Receipt className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              2. VAT &amp; Company Registration
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>VAT Registration Status</label>
              <select
                value={formData.vat_registered}
                onChange={(e) => handleChange("vat_registered", e.target.value)}
                className={inputCls}
              >
                <option value="false">Not Registered (No VAT applied to receipts)</option>
                <option value="true">VAT Registered (Standard UK VAT)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>VAT Registration Number</label>
              <input
                type="text"
                placeholder="e.g. GB 123 4567 89"
                value={formData.vat_number}
                onChange={(e) => handleChange("vat_number", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>VAT Rate Percentage (%)</label>
              <input
                type="number"
                placeholder="20"
                value={formData.vat_rate_percent}
                onChange={(e) => handleChange("vat_rate_percent", e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Companies House Registered Number</label>
              <input
                type="text"
                placeholder="e.g. 12345678"
                value={formData.company_number}
                onChange={(e) => handleChange("company_number", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* 3. ERP Operational Controls & Invoicing */}
        <div className="db-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sliders className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              3. Register &amp; Invoicing Operational Controls
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Default Warranty Duration (Days)</label>
              <input
                type="number"
                placeholder="e.g. 90 or 365"
                value={formData.default_warranty_days}
                onChange={(e) => handleChange("default_warranty_days", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Default warranty period applied when booking new repairs.</p>
            </div>

            <div>
              <label className={labelCls}>Door-to-Door Pickup Charge (Pence)</label>
              <input
                type="number"
                placeholder="0"
                value={formData.door_to_door_charge_pence}
                onChange={(e) => handleChange("door_to_door_charge_pence", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Surcharge for local callout or collection bookings.</p>
            </div>

            <div>
              <label className={labelCls}>Stock Adjustment Manager Approval</label>
              <select
                value={formData.require_adj_approval}
                onChange={(e) => handleChange("require_adj_approval", e.target.value)}
                className={inputCls}
              >
                <option value="true">Yes (Administrator authorization required)</option>
                <option value="false">No (Staff can post stock adjustments)</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Negative Stock Invoicing</label>
              <select
                value={formData.allow_negative_stock}
                onChange={(e) => handleChange("allow_negative_stock", e.target.value)}
                disabled
                className={`${inputCls} opacity-60 cursor-not-allowed`}
              >
                <option value="false">Disallowed (Strict DB CHECK enforcement enabled)</option>
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">Database constraints prevent inventory from drifting below zero.</p>
            </div>

            <div className="md:col-span-2">
              <label className={labelCls}>Thermal &amp; A4 Receipt Footer Notice</label>
              <textarea
                rows={3}
                value={formData.receipt_footer}
                onChange={(e) => handleChange("receipt_footer", e.target.value)}
                className={inputCls}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Printed at the bottom of all customer checkout and repair receipts.</p>
            </div>
          </div>
        </div>

        {/* 4. Repair & Warranty Standards (Section 21) */}
        <div className="db-card p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Shield className="w-4 h-4 text-brand" />
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
              4. Repair Warranty Defaults &amp; Policy Matrix
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Standard shop warranty guidelines by replacement component type. Individual tickets snapshot their agreed terms.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "Standard Screen", days: "90 Days", cat: "Display Assemblies" },
              { title: "Premium Screen", days: "180 Days", cat: "OLED / Grade A+ Parts" },
              { title: "Genuine Screen", days: "365 Days", cat: "OEM / Service Pack" },
              { title: "Battery Replacement", days: "90 Days", cat: "Power & Cycles" },
              { title: "Charging Port Repair", days: "90 Days", cat: "Flex & Soldering" },
              { title: "Camera Module", days: "90 Days", cat: "Lens & Sensor" },
              { title: "Logic Board Repair", days: "30 Days", cat: "Microsoldering" },
              { title: "Liquid Damage Service", days: "0 Days", cat: "Diagnostic Only" },
              { title: "Customer Supplied Part", days: "90 Days", cat: "Workmanship Only" },
            ].map((t) => (
              <div
                key={t.title}
                className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-1 text-xs"
              >
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>{t.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-extrabold">
                    {t.days}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{t.cat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            All modifications update system records across POS and receipts upon save.
          </span>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary !py-2.5 !px-6 !text-xs flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
