import type { Metadata } from "next";
import "./globals.scss";
import Navbar from "@/components/shared/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Paletto",
  description: "Extract color palettes from images you love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
