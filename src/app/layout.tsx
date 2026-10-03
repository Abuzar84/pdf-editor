import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Editor | Abuzar Sayyed",
  description: "Modern web-based PDF Editor – upload, annotate, edit and download PDFs easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
