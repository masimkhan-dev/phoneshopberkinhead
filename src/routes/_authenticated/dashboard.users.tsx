import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, setUserRole, removeUserRole } from "@/lib/users.functions";
import { useAuth } from "@/lib/auth-context";
import { toastSuccess, toastError } from "@/lib/toast";
import { PageHelpButton } from "@/components/dashboard/PageHelpButton";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { Loader2, Shield, User, Wrench, ShieldAlert, Check, UserCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/users")({
  component: UsersPage,
});

type AppRole = "admin" | "staff" | "technician";

const ROLE_DEFINITIONS: Record<AppRole, { label: string; desc: string; color: string; activeBadge: string }> = {
  admin: {
    label: "ADMIN",
    desc: "Full administrative access: settings, void authorization, financials, and staff roles.",
    color: "text-brand",
    activeBadge: "bg-brand text-white border-brand shadow-xs",
  },
  staff: {
    label: "STAFF",
    desc: "Counter register: POS checkout, daily sales entry, customer service, and inventory lookup.",
    color: "text-blue-700",
    activeBadge: "bg-blue-700 text-white border-blue-700 shadow-xs",
  },
  technician: {
    label: "TECHNICIAN",
    desc: "Bench workshop: repair tickets, diagnostics, parts usage, and repair status updates.",
    color: "text-emerald-700",
    activeBadge: "bg-emerald-700 text-white border-emerald-700 shadow-xs",
  },
};

function UsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const listUsersFn = useServerFn(listUsers);
  const setRoleFn = useServerFn(setUserRole);
  const removeRoleFn = useServerFn(removeUserRole);

  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => listUsersFn(),
    staleTime: 1000 * 60 * 10, // 10 mins cache
  });

  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function toggleRole(userId: string, role: AppRole, hasRole: boolean) {
    if (userId === user?.id) {
      toastError("You cannot modify your own administrative roles. Ask another store administrator.");
      return;
    }
    const key = `${userId}-${role}`;
    setSavingKey(key);
    try {
      if (hasRole) {
        await removeRoleFn({ data: { user_id: userId, role } });
        toastSuccess(`Role '${ROLE_DEFINITIONS[role].label}' revoked`);
      } else {
        await setRoleFn({ data: { user_id: userId, role } });
        toastSuccess(`Role '${ROLE_DEFINITIONS[role].label}' granted`);
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err: unknown) {
      toastError(err, "Role update failed");
    } finally {
      setSavingKey(null);
    }
  }

  if (error) {
    return (
      <div className="db-page max-w-xl mx-auto p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
        <p className="text-xs text-muted-foreground">
          Only store administrators have authorization to manage staff roles and system access.
        </p>
      </div>
    );
  }

  return (
    <div className="db-page space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="db-page-header">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand" />
            <h1 className="db-page-title">Staff Accounts &amp; Access Controls</h1>
            <PageHelpButton
              pageTitle="Staff Accounts"
              pageKey="users"
              steps={[
                "Admins can configure permissions for team members.",
                "Click role badges (ADMIN, STAFF, TECHNICIAN) to grant or revoke access.",
                "Users require at least one active role to operate system modules.",
                "Self-demotion is blocked to prevent accidental admin lockout.",
              ]}
              firstTimeTip="Tip: Toggle badges to grant staff specific administrative, counter, or repair technician permissions."
            />
          </div>
          <p className="db-page-subtitle">
            Admin role management: assign permissions across Counter Register, Repair Workshop, and Store Administration.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-muted-foreground shadow-xs shrink-0 self-start sm:self-auto">
          <UserCheck className="w-3.5 h-3.5 text-brand" />
          <span>Total Accounts: <strong className="text-foreground">{data?.length ?? 0}</strong></span>
        </div>
      </div>

      {/* Role Definitions Reference Card (Section 20 requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["admin", "staff", "technician"] as const).map((roleKey) => {
          const r = ROLE_DEFINITIONS[roleKey];
          return (
            <div key={roleKey} className="p-3.5 rounded-xl bg-white border border-border shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider ${r.color}`}>
                  {r.label}
                </span>
                <Shield className={`w-3.5 h-3.5 ${r.color}`} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Standardized Dense Accounts Table */}
      <div className="db-card !p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <TableSkeleton rows={4} cols={3} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="db-table min-w-[600px]">
              <thead>
                <tr>
                  <th className="db-th">Staff Member</th>
                  <th className="db-th">Full Name</th>
                  <th className="db-th">Assigned Operational Roles</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((u) => {
                  const roles =
                    (u.user_roles as { role: string }[] | null)?.map((r) => r.role) || [];
                  const isSelf = u.user_id === user?.id;
                  const initial = (u.full_name?.charAt(0) || u.email?.charAt(0) || "U").toUpperCase();

                  return (
                    <tr key={u.id} className="db-tr-hover">
                      <td className="db-td font-semibold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-foreground text-xs">{u.email}</span>
                            {isSelf && (
                              <span className="ml-2 text-[9px] font-extrabold bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">
                                CURRENT USER
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="db-td text-muted-foreground text-xs">
                        {u.full_name || "—"}
                      </td>
                      <td className="db-td">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {(["admin", "staff", "technician"] as const).map((role) => {
                            const key = `${u.user_id}-${role}`;
                            const isActive = roles.includes(role);
                            const isSaving = savingKey === key;
                            const rDef = ROLE_DEFINITIONS[role];

                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => toggleRole(u.user_id, role, isActive)}
                                disabled={isSaving || isSelf}
                                aria-label={`${isActive ? "Revoke" : "Grant"} ${rDef.label} role for ${u.email}`}
                                title={
                                  isSelf
                                    ? "You cannot modify your own roles"
                                    : `${isActive ? "Click to revoke" : "Click to grant"} ${rDef.label} permission`
                                }
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-lg border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isActive
                                    ? rDef.activeBadge
                                    : "bg-white border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                                }`}
                              >
                                {isSaving ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : isActive ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                                )}
                                <span>{rDef.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
