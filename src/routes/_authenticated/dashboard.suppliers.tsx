import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSuppliers, saveSupplier, deleteSupplier } from "@/lib/suppliers.functions";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  Truck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/suppliers")({
  component: DashboardSuppliersPage,
});

interface SupplierFormData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const emptySupplier: SupplierFormData = {
  id: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function DashboardSuppliersPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listSuppliers);
  const saveFn = useServerFn(saveSupplier);
  const deleteFn = useServerFn(deleteSupplier);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<SupplierFormData>({ ...emptySupplier });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => listFn(),
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });

  const filtered = suppliers.filter(
    (s: any) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").includes(search),
  );

  const handleOpenAdd = () => {
    setEditing(null);
    setForm({ ...emptySupplier });
    setModalOpen(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditing(s);
    setForm({
      id: s.id,
      name: s.name || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      notes: s.notes || "",
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toastError("Please enter the supplier company name");
      return;
    }

    setSubmitting(true);
    try {
      await saveFn({
        data: {
          id: form.id || undefined,
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
        },
      });
      toastSuccess(editing ? "Supplier details updated" : "Supplier added to procurement directory");
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (err: any) {
      toastError(err, "Failed to save supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete supplier "${name}"? Existing purchase orders will maintain history.`)) return;
    try {
      await deleteFn({ data: { id } });
      toastSuccess("Supplier removed");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    } catch (err: any) {
      toastError(err, "Failed to delete supplier");
    }
  };

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Wholesale Supplier Directory</h1>
            <PageHelpButton
              pageTitle="Suppliers"
              pageKey="suppliers"
              steps={[
                "Manage verified component distributors, screen vendors, and wholesale device suppliers.",
                "Store contact phone numbers, email addresses, and account notes.",
                "Suppliers are selectable when generating purchase orders for stock replenishment.",
              ]}
              firstTimeTip="Tip: Add parts and wholesale suppliers here before issuing purchase orders."
            />
          </div>
          <p className="db-page-subtitle">
            Wholesale suppliers, parts distributors, and component procurement accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary !py-2.5 !px-4 !text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Supplier</span>
        </button>
      </div>

      {/* Standardized Search Toolbar */}
      <div className="p-3.5 bg-white border border-border rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search supplier name, phone, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="db-input !pl-9 text-xs"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
          <strong className="text-foreground">{suppliers.length}</strong> suppliers
        </div>
      </div>

      {/* Standardized Dense Suppliers Table */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Truck className="w-6 h-6 text-brand" />}
              title="No suppliers found"
              description={search ? "Try adjusting your search query." : "Add wholesale suppliers to enable purchase orders."}
              actionLabel={search ? "Clear Search" : "+ Add Supplier"}
              onAction={search ? () => setSearch("") : handleOpenAdd}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[700px]">
              <thead>
                <tr>
                  <th className="db-th">Supplier / Company</th>
                  <th className="db-th">Phone</th>
                  <th className="db-th">Email</th>
                  <th className="db-th">Address</th>
                  <th className="db-th">Notes</th>
                  <th className="db-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any) => (
                  <tr key={s.id} className="db-tr-hover">
                    <td className="db-td font-bold text-ink whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-muted border border-border text-brand flex items-center justify-center font-bold text-xs shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-brand" />
                        </div>
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="db-td font-mono text-muted-foreground whitespace-nowrap text-xs">
                      {s.phone ? (
                        <a
                          href={`tel:${s.phone}`}
                          className="hover:text-brand hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{s.phone}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-muted-foreground whitespace-nowrap text-xs">
                      {s.email ? (
                        <a
                          href={`mailto:${s.email}`}
                          className="hover:text-brand hover:underline inline-flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span>{s.email}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-muted-foreground text-xs max-w-xs truncate">
                      {s.address ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{s.address}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-xs text-muted-foreground max-w-xs truncate">
                      {s.notes || "—"}
                    </td>
                    <td className="db-td text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          aria-label={`Edit ${s.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id, s.name)}
                          aria-label={`Delete ${s.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Delete Supplier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Supplier Modal (Section 26: ModalShell) */}
      <ModalShell
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Supplier Details" : "Add Wholesale Supplier"}
        description="Supplier details used for purchase orders and parts replenishment"
        icon={Truck}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-outline !py-2 !px-4 !text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e as any)}
              disabled={submitting}
              className="btn-primary !py-2 !px-5 !text-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{editing ? "Update Supplier" : "Add Supplier"}</span>
                </>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Supplier / Company Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Birkenhead Tech Wholesale Ltd"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="db-input text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="e.g. 0151 555 0192"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="db-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Orders Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. orders@supplier.co.uk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="db-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Supplier Address / Warehouse Location
            </label>
            <input
              type="text"
              placeholder="e.g. Unit 4, Commercial Way, Wirral"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="db-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Procurement Notes &amp; Account Ref
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Trade account #TR-9921, next-day cutoff 4pm"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="db-input text-xs"
            />
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
