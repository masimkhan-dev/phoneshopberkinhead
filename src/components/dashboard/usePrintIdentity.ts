import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings } from "@/lib/settings.functions";
import { resolveShopIdentity } from "@/lib/shop-identity";

export function usePrintIdentity() {
  const getSettingsFn = useServerFn(getSettings);
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getSettingsFn(),
  });
  return { identity: resolveShopIdentity(settings), settings };
}
