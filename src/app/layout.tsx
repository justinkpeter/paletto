import type { Metadata } from "next";
import "./globals.scss";
import NewNavbar from "@/components/shared/Navbar/NewNavbar";

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
        <NewNavbar />
        {children}
      </body>
    </html>
  );
}
