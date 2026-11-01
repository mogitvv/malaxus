import type { HTMLAttributes, JSX } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  dark?: boolean;
}

/** Fenster im Stil eines Minecraft-Inventars/Truhenfensters. */
export function Panel({ dark = false, className = "", children, ...rest }: PanelProps): JSX.Element {
  return (
    <div className={`${dark ? "mc-panel-dark" : "mc-panel"} p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}
