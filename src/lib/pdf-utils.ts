import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { Annotation } from "@/types";

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
  annotations: Annotation[]
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  for (const ann of annotations) {
    const pageIndex = ann.page - 1;
    if (pageIndex < 0 || pageIndex >= pages.length) continue;

    const page = pages[pageIndex];
    const { width, height } = page.getSize();

    if (ann.type === "text") {
      if (!ann.text.trim()) continue;
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

    if (ann.type === "highlight") {
      const x = (ann.x / 100) * width;
      const w = (ann.width / 100) * width;
      const h = (ann.height / 100) * height;
      const y = height - (ann.y / 100) * height - h;
      const color = hexToRgb(ann.color || "#fef08a");
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        color: rgb(color.r, color.g, color.b),
        opacity: 0.4,
        borderWidth: 0,
      });
    }

    if (ann.type === "draw" && ann.points.length >= 2) {
      const color = hexToRgb(ann.color || "#ef4444");
      for (let i = 0; i < ann.points.length - 1; i++) {
        const p1 = ann.points[i];
        const p2 = ann.points[i + 1];
        page.drawLine({
          start: {
            x: (p1.x / 100) * width,
            y: height - (p1.y / 100) * height,
          },
          end: {
            x: (p2.x / 100) * width,
            y: height - (p2.y / 100) * height,
          },
          thickness: ann.strokeWidth || 2,
          color: rgb(color.r, color.g, color.b),
          lineCap: 1,
        });
      }
    }
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
