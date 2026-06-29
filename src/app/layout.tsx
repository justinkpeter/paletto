import type { Metadata } from "next";
import "./globals.scss";
import Navbar from "@/components/shared/Navbar/Navbar";
import PaletteInit from "@/components/PaletteInit";
import { SidebarProvider } from "@/features/sidebar/SidebarContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Paletto | Color Palette Generator",
  description: "Generate color palettes from images you love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <SidebarProvider>
          <Navbar />
          <PaletteInit />
          {children}
          <Toaster position="bottom-center" />
        </SidebarProvider>
      </body>
    </html>
  );
}
