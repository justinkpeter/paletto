import type { Metadata } from "next";
import "./globals.scss";
import Navbar from "@/components/shared/Navbar/Navbar";
import PaletteInit from "@/components/PaletteInit";
import { SidebarProvider } from "@/features/sidebar/SidebarContext";
import { Toaster } from "sonner";
import Footer from "@/components/shared/Footer/Footer";

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
          <Footer />
        </SidebarProvider>
      </body>
    </html>
  );
}
