import type { QueryClient } from "@tanstack/react-query";

const CACHE_KEY = "techops:query-cache";
const CACHE_TTL_MS = 5 * 60 * 1000;

interface StoredEntry {
  data: unknown;
  ts: number;
}

type CacheStore = Record<string, StoredEntry>;

function readStore(): CacheStore {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CacheStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: CacheStore) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {}
}

export function restoreQueryCache(queryClient: QueryClient) {
  const store = readStore();
  const now = Date.now();
  for (const [key, entry] of Object.entries(store)) {
    if (now - entry.ts < CACHE_TTL_MS) {
      try {
        queryClient.setQueryData(JSON.parse(key), entry.data);
      } catch {}
    }
  }
}

export function persistQueryCache(queryClient: QueryClient): () => void {
  const cache = queryClient.getQueryCache();
  const unsubscribe = cache.subscribe((event) => {
    if (event.type === "updated" && event.action.type === "success") {
      const query = event.query;
      const data = query.state.data;
      if (data === undefined) return;
      const key = JSON.stringify(query.queryKey);
      const store = readStore();
      store[key] = { data, ts: Date.now() };
      writeStore(store);
    }
  });
  return unsubscribe;
}
