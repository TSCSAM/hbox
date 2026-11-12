import { useHboxStoreWithDefault } from "@/store/StoreProvider.js";

export function useIsOfficeMode(): boolean {
  return useHboxStoreWithDefault((state) => state.interfaceMode === "office", false);
}
