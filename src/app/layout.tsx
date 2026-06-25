import type { Metadata } from "next";
import "./globals.scss";
import NewNavbar from "@/components/shared/Navbar/NewNavbar";
import PaletteInit from "@/components/PaletteInit";
import { SidebarProvider } from "@/features/sidebar/SidebarContext";

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
        <SidebarProvider>
          <NewNavbar />
          <PaletteInit />
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
