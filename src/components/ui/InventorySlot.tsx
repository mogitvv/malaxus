import type { HTMLAttributes, JSX, ReactNode } from "react";

interface InventorySlotProps extends HTMLAttributes<HTMLDivElement> {
  badge?: ReactNode;
  overlay?: ReactNode;
  size?: number;
}

/** Ein einzelnes Inventar-Kästchen, wie ein Item-Slot in Minecraft. */
export function InventorySlot({
  badge,
  overlay,
  size = 64,
  className = "",
  children,
  ...rest
}: InventorySlotProps): JSX.Element {
  return (
    <div
      className={`mc-slot flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
      {badge !== undefined && <span className="mc-slot-badge">{badge}</span>}
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          {overlay}
        </div>
      )}
    </div>
  );
}
