import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { buildRewardsUrl, resolveRewardsOrigin, HBOX_ENV } from "@hbox/shared";
import { usePlatform } from "@/hooks/usePlatform.js";
import { useHboxIntl } from "@/i18n/IntlProvider.js";
import { useHboxStore } from "@/store/StoreProvider.js";
import { resolveTheme } from "@/useTheme.js";
import { RewardsWebview } from "@/rewards/RewardsWebview.js";

const RewardsContext = createContext<(() => Promise<void>) | null>(null);
export const useOpenRewards = () => useContext(RewardsContext);
export function RewardsProvider({ children, desktop }: { children: ReactNode; desktop: boolean }) {
  const [opened, setOpened] = useState(false);
  const platform = usePlatform();
  const { locale } = useHboxIntl();
  const theme = useHboxStore((s) => s.theme);
  const user = useHboxStore((s) => s.user);
  const openPage = useCallback(async () => {
    if (!user) return;
    if (desktop) setOpened(true);
    else
      await platform.openExternal(
        buildRewardsUrl(
          resolveRewardsOrigin({ env: HBOX_ENV }),
          locale,
          resolveTheme(theme) === "dark" ? "zai-dark" : "zai-light",
        ),
      );
  }, [user, desktop, platform, locale, theme]);
  return (
    <RewardsContext.Provider value={openPage}>
      {children}
      {opened && <RewardsWebview onClose={() => setOpened(false)} />}
    </RewardsContext.Provider>
  );
}