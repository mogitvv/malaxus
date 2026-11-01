/** Formatiert einen ISO-Zeitstempel als relative Zeitangabe, z. B. "vor 5 Min." */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `vor ${diffHours} Std.`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;

  return new Date(iso).toLocaleDateString("de-CH", { day: "2-digit", month: "2-digit" });
}
