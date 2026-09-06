"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReplayData } from "@/feature/analytics/api";

interface ReplayPlayerProps {
  replay: ReplayData;
}

/**
 * Renders a recorded visitor session with rrweb-player and offers a
 * re-playable .json download of the recording.
 */
export default function ReplayPlayer({ replay }: ReplayPlayerProps) {
  const playerHostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    const host = playerHostRef.current;

    if (!replay.events || replay.events.length < 2) {
      setReady(false);
      return;
    }

    (async () => {
      const [{ default: RRWebPlayer }] = await Promise.all([
        import("rrweb-player"),
        import("rrweb-player/dist/style.css"),
      ]);
      if (disposed || !host) return;

      host.innerHTML = "";
      const PlayerCtor = RRWebPlayer as unknown as new (options: {
        target: HTMLElement;
        props: Record<string, unknown>;
      }) => unknown;
      new PlayerCtor({
        target: host,
        props: {
          events: replay.events,
          autoPlay: true,
          showController: true,
          speedOption: [1, 2, 4, 8],
          width: Number(host.clientWidth) || 800,
        },
      });
      setReady(true);
    })();

    return () => {
      disposed = true;
      if (host) host.innerHTML = "";
    };
  }, [replay]);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(replay)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `replay-${replay.sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasEnoughEvents = !!replay.events && replay.events.length >= 2;

  return (
    <div className="space-y-3">
      <div
        ref={playerHostRef}
        className="mx-auto w-full overflow-hidden rounded-md border bg-slate-900 [&>*]:mx-auto"
        style={{ minHeight: hasEnoughEvents ? 420 : undefined }}
      />
      {hasEnoughEvents && !ready && (
        <p className="text-center text-sm text-gray-500 animate-pulse">
          Loading replay…
        </p>
      )}
      {!hasEnoughEvents && (
        <p className="text-center text-sm text-gray-500">
          Not enough activity recorded to replay this session.
        </p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {replay.count.toLocaleString()} events · session {replay.sessionId.slice(0, 8)}…
        </span>
        <Button variant="outline" size="sm" onClick={downloadJson}>
          Download (.json)
        </Button>
      </div>
    </div>
  );
}
