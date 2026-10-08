import { queryOptions } from "@tanstack/react-query";
import { getPublicMenu, getSettings } from "./cafe.functions";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: () => getSettings(),
  staleTime: 60_000,
});

export const menuQuery = queryOptions({
  queryKey: ["menu"],
  queryFn: () => getPublicMenu(),
  staleTime: 30_000,
});
