import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCustomers, saveCustomer, deactivateCustomer } from "@/lib/customers.functions";
import { useDebounce } from "@/hooks/use-debounce";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ModalShell } from "@/components/ui/modal-shell";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  FileText,
  UserCheck,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/customers")({
  component: CustomersPage,
});

interface CustomerFormData {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

const emptyCustomer: CustomerFormData = {
  id: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
};

function CustomersPage() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listCustomers);
  const saveFn = useServerFn(saveCustomer);
  const deactivateFn = useServerFn(deactivateCustomer);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const [page, setPage] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const [form, setForm] = useState<CustomerFormData>({ ...emptyCustomer });
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", debouncedSearch, page],
    queryFn: () => listFn({ data: { search: debouncedSearch, page, limit: 25 } }),
    staleTime: 1000 * 60 * 5, // 5 min caching
  });

  const handleOpenAdd = () => {
    setForm({ ...emptyCustomer });
    setEditing(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setForm({
      id: c.id,
      name: c.name || "",
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      notes: c.notes || "",
    });
    setEditing(true);
    setModalOpen(true);
  };

  const handleOpenDetail = (c: any) => {
    setSelectedCustomer(c);
    setDetailModalOpen(true);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toastError("Please enter the customer's name");
      return;
    }

    setSubmitting(true);
    try {
      await saveFn({
        data: {
          id: form.id || undefined,
          name: form.name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
        },
      });
      toastSuccess(editing ? "Customer record updated" : "New customer registered");
      setModalOpen(false);
      setForm({ ...emptyCustomer });
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: unknown) {
      toastError(err, "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string, name: string) {
    if (!confirm(`Remove "${name}" from active customer directory? Historical records will be safely preserved.`)) return;
    try {
      await deactivateFn({ data: { id } });
      toastSuccess("Customer deactivated");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (err: unknown) {
      toastError(err, "Failed to deactivate customer");
    }
  }

  const totalCount = data?.total ?? 0;

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Customer Directory &amp; CRM</h1>
            <PageHelpButton
              pageTitle="Customers"
              pageKey="customers"
              steps={[
                "Search existing clients by name, phone number, or email address.",
                "Quickly register a new customer profile for warranty & repair tracking.",
                "View contact details, communication notes, and transaction links.",
              ]}
              firstTimeTip="Tip: Check existing records first before adding a new client to prevent duplicate records."
            />
          </div>
          <p className="db-page-subtitle">
            Search client records, manage contact details, and link repair tickets or retail sales.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-primary !py-2.5 !px-4 !text-xs shrink-0 inline-flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Prominent Standardized Search Toolbar (Section 11 & 24) */}
      <div className="p-3.5 bg-white border border-border rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by full name, phone number, or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="db-input !pl-9 text-xs"
          />
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          Showing <strong className="text-foreground">{data?.rows.length ?? 0}</strong> of{" "}
          <strong className="text-foreground">{totalCount}</strong> active clients
        </div>
      </div>

      {/* Standardized Dense Customers Table */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : !data || data.rows.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={<Users className="w-6 h-6 text-brand" />}
              title="No customers matching query"
              description={search ? "Try searching by a different name, phone or email." : "Add your first customer to the directory."}
              actionLabel={search ? "Clear Search" : "+ Add Customer"}
              onAction={search ? () => setSearch("") : handleOpenAdd}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[700px]">
              <thead>
                <tr>
                  <th className="db-th">Client Name</th>
                  <th className="db-th">Phone Number</th>
                  <th className="db-th">Email</th>
                  <th className="db-th">Address / Postcode</th>
                  <th className="db-th">Notes</th>
                  <th className="db-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((c) => (
                  <tr key={c.id} className="db-tr-hover">
                    <td className="db-td font-bold text-ink whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{c.name}</span>
                      </div>
                    </td>
                    <td className="db-td font-mono text-muted-foreground whitespace-nowrap">
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className="hover:text-brand hover:underline inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span>{c.phone}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-muted-foreground whitespace-nowrap">
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          className="hover:text-brand hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-[160px]">{c.email}</span>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-muted-foreground max-w-xs truncate text-xs">
                      {c.address ? (
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{c.address}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="db-td text-xs text-muted-foreground max-w-[180px] truncate">
                      {c.notes || "—"}
                    </td>
                    <td className="db-td text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(c)}
                          aria-label={`View details for ${c.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          title="View Customer Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          aria-label={`Edit ${c.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeactivate(c.id, c.name)}
                          aria-label={`Deactivate ${c.name}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          title="Deactivate Customer"
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

        {/* Pagination */}
        {totalCount > 25 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            <span>
              Showing {page * 25 + 1}–{Math.min((page + 1) * 25, totalCount)} of {totalCount} clients
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                aria-label="Previous page"
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-foreground">
                Page {page + 1} of {Math.ceil(totalCount / 25)}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * 25 >= totalCount}
                aria-label="Next page"
                className="p-1.5 rounded-lg border border-border hover:bg-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal (Section 26) */}
      <ModalShell
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={editing ? "Edit Customer Details" : "Register New Customer"}
        description="Customer profile used for warranty, receipt dispatch, and repair tracking"
        icon={Users}
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
              onClick={(e) => handleSubmit(e as any)}
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
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{editing ? "Update Client Record" : "Save Customer"}</span>
                </>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Full Customer Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Smith"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="db-input text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Phone Number (UK Mobile / Landline)
              </label>
              <input
                type="tel"
                placeholder="e.g. 07123 456789"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="db-input text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Email Address (Receipts &amp; Invoices)
              </label>
              <input
                type="email"
                placeholder="e.g. customer@example.co.uk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="db-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Postal Address / Street
            </label>
            <input
              type="text"
              placeholder="e.g. 12 Grange Road, Birkenhead, CH41 2XX"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="db-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Customer Notes / Preferences
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Preferred contact via SMS, regular business account"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="db-input text-xs"
            />
          </div>
        </form>
      </ModalShell>

      {/* Customer Details Modal (Section 12 requirement: group identity, contact, notes) */}
      {selectedCustomer && (
        <ModalShell
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          title={selectedCustomer.name}
          description="Customer profile and contact overview"
          icon={Users}
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleOpenEdit(selectedCustomer);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-foreground hover:bg-muted cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-brand" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="btn-primary !py-2 !px-4 !text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Identity Card */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Contact &amp; Identity
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Primary Phone</span>
                  <span className="font-bold text-foreground font-mono">
                    {selectedCustomer.phone || "Not recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Email Address</span>
                  <span className="font-semibold text-foreground">
                    {selectedCustomer.email || "Not recorded"}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground block text-[11px]">Address</span>
                  <span className="font-semibold text-foreground">
                    {selectedCustomer.address || "No address on file"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes / Internal History */}
            <div className="p-4 rounded-xl bg-white border border-border space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Account Notes &amp; History
              </span>
              <p className="text-xs text-foreground leading-relaxed">
                {selectedCustomer.notes || "No special notes recorded for this customer."}
              </p>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
