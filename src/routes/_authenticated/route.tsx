import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    // Auth bypass active: return current user or dev admin fallback
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user };
    }
    return {
      user: {
        id: "dev-admin-user",
        email: "staff@phoneshopbirkenhead.co.uk",
        user_metadata: { full_name: "Counter Staff (Dev)" },
      } as any,
    };
  },
  component: () => <Outlet />,
});
