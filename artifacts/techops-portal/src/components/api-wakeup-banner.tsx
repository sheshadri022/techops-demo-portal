import { useEffect, useState } from "react";
import { useIsFetching } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";

const SLOW_THRESHOLD_MS = 4000;
const HEALTHZ_URL = "/api/healthz";

export function ApiWakeupBanner() {
  const isFetching = useIsFetching();
  const [slow, setSlow] = useState(false);
  const [awake, setAwake] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const ping = async () => {
      try {
        const res = await fetch(HEALTHZ_URL, { cache: "no-store" });
        if (res.ok) setAwake(true);
      } catch {}
    };

    ping();

    timer = setTimeout(() => {
      if (!awake) setSlow(true);
    }, SLOW_THRESHOLD_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isFetching === 0 && slow) {
      setSlow(false);
    }
  }, [isFetching, slow]);

  if (!slow) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border border-primary/30 bg-card shadow-lg px-5 py-3 text-sm text-foreground animate-in slide-in-from-bottom-4 duration-300">
      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
      <span>
        <span className="font-semibold text-primary">Server is starting up</span>
        <span className="text-muted-foreground"> — free tier wakes on first request. Should be ready in ~30s.</span>
      </span>
      <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
    </div>
  );
}
