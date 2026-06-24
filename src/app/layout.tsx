import type { Metadata } from "next";
import "./globals.scss";
import NewNavbar from "@/components/shared/Navbar/NewNavbar";
import PaletteInit from "@/components/PaletteInit";
import { PaletteHistoryProvider } from "@/features/history/PaletteHistoryContext";

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
        <PaletteHistoryProvider>
          <NewNavbar />
          <PaletteInit />
          {children}
        </PaletteHistoryProvider>
      </body>
    </html>
  );
}
