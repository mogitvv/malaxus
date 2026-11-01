const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Bitte eine Bilddatei auswählen (JPG, PNG, WebP…).";
  if (file.size > MAX_UPLOAD_BYTES) return "Das Bild ist grösser als 8 MB.";
  return null;
}

/** Verkleinert ein Bild clientseitig auf maximal maxDim Pixel Kantenlänge, als WebP. */
export async function resizeImageFile(file: File, maxDim = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas wird nicht unterstützt");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Bild konnte nicht verarbeitet werden"))),
      "image/webp",
      0.85,
    );
  });
}
