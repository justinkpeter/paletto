import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function savePalette({
  name,
  colors,
  imageDataUrl,
  userId,
}: {
  name: string;
  colors: { hex: string; name: string }[];
  imageDataUrl: string;
  userId: string;
}) {
  // Convert data URL to blob for upload
  const res = await fetch(imageDataUrl);
  const blob = await res.blob();
  const ext = blob.type.split("/")[1] ?? "jpg";
  const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;

  // Upload image to storage
  const { error: uploadError } = await supabase.storage
    .from("palette-images")
    .upload(filePath, blob, { contentType: blob.type });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("palette-images")
    .getPublicUrl(filePath);

  // Save palette to database
  const { data, error } = await supabase
    .from("palettes")
    .insert({
      user_id: userId,
      name,
      colors,
      image_url: urlData.publicUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
