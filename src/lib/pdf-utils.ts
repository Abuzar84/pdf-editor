import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { TextAnnotation } from "@/types";

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

export async function downloadEditedPdf(
  file: File,
  annotations: TextAnnotation[]
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    if (!ann.text.trim()) continue;

    // page numbers in our app are 1-based
    const pageIndex = ann.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    // Convert % coordinates (top-left origin) → PDF points (bottom-left origin)
    const x = (ann.x / 100) * width;
    const y = height - (ann.y / 100) * height - ann.fontSize * 0.3;

    const color = hexToRgb(ann.color || "#000000");

    page.drawText(ann.text, {
      x,
      y,
      size: ann.fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = file.name.replace(/\.pdf$/i, "") + "-edited.pdf";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
