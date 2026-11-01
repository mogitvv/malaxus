import type { JSX } from "react";
import { statusFlow, statusLabels, type OrderStatus } from "@/lib/types";
import { ChestIcon, AnvilIcon, MinecartIcon, CheckIcon, XMarkIcon } from "@/components/icons/PixelIcons";

const stepIcons: Record<OrderStatus, (props: { size?: number }) => JSX.Element> = {
  received: ChestIcon,
  accepted: ChestIcon,
  processing: AnvilIcon,
  ready: MinecartIcon,
  delivered: CheckIcon,
  rejected: XMarkIcon,
  cancelled: XMarkIcon,
};

const statusColor: Record<OrderStatus, string> = {
  received: "#3b6ec1",
  accepted: "#4f9e3a",
  processing: "#c99a1a",
  ready: "#1fa8b8",
  delivered: "#2f6b20",
  rejected: "#d2453f",
  cancelled: "#767c88",
};

/** Fortschrittsanzeige für den Bestellstatus, als Kette von Schritten. */
export function StatusTimeline({ status }: { status: OrderStatus }): JSX.Element {
  if (status === "rejected" || status === "cancelled") {
    const Icon = stepIcons[status];
    return (
      <div
        className="flex items-center gap-2 p-2 rounded"
        style={{ background: `${statusColor[status]}1a`, color: statusColor[status] }}
      >
        <Icon size={24} />
        <span className="font-pixel text-xs">{statusLabels[status]}</span>
      </div>
    );
  }

  const currentIndex = statusFlow.indexOf(status);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded font-pixel text-xs"
        style={{ background: `${statusColor[status]}22`, color: statusColor[status] }}
      >
        {(() => {
          const Icon = stepIcons[status];
          return <Icon size={20} />;
        })()}
        Aktueller Status: {statusLabels[status]}
      </div>

      <div className="flex items-center w-full overflow-x-auto py-1">
        {statusFlow.map((step, i) => {
          const Icon = stepIcons[step];
          const done = i < currentIndex;
          const active = i === currentIndex;
          const upcoming = i > currentIndex;
          return (
            <div key={step} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1 w-20">
                <div
                  className="mc-slot flex items-center justify-center"
                  style={{
                    width: 42,
                    height: 42,
                    opacity: upcoming ? 0.45 : 1,
                    boxShadow: active
                      ? `inset 2px 2px 0 rgba(0,0,0,0.18), inset -2px -2px 0 rgba(255,255,255,0.5), 0 0 0 3px ${statusColor[step]}`
                      : undefined,
                  }}
                >
                  <Icon size={done || active ? 26 : 20} />
                </div>
                <span
                  className="text-[9px] text-center leading-tight font-semibold"
                  style={{ color: done || active ? "var(--mc-text)" : "var(--mc-text-muted)" }}
                >
                  {statusLabels[step]}
                </span>
              </div>
              {i < statusFlow.length - 1 && (
                <div
                  className="h-[4px] w-6 sm:w-10 shrink-0 -mt-4 rounded"
                  style={{ background: i < currentIndex ? "var(--mc-green)" : "#c7cad0" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
