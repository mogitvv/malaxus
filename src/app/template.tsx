/**
 * Anders als layout.tsx wird template.tsx bei jeder Navigation neu erzeugt –
 * dadurch läuft die mc-page-enter-Animation (von unten reinploppen) bei
 * jedem Seitenwechsel erneut ab.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="mc-page-enter">{children}</div>;
}
