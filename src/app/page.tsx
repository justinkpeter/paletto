import { redirect } from "next/navigation";
import { generatePalette } from "@/features/palette/colorUtils";

export default function RootPage() {
  const colors = generatePalette("analogous", "any", true, 5);
  const slug = colors.map((c) => c.replace("#", "").toLowerCase()).join("-");
  redirect(`/${slug}`);
}
