import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const client = new Anthropic();
const model = "claude-sonnet-4-5";

export async function POST(req: Request) {
  const { colors } = await req.json();

  const response = await client.messages.create({
    model: model,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a creative director with a talent for naming colors evocatively.
Given these hex color codes, give each one a short, evocative, design-forward name.
Names should be 1-3 words max. Think: "Smoked Plum", "Dry Sage", "Burnt Coast", "Fog Linen".
Avoid generic names like "Dark Blue" or "Light Green".

Colors: ${colors.join(", ")}

Respond ONLY with a JSON array of strings in the same order as the input. No preamble, no markdown backticks. Example: ["Smoked Plum", "Dry Sage", "Burnt Coast"]`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "[]";

  try {
    const names = JSON.parse(text);
    return NextResponse.json({ names });
  } catch {
    return NextResponse.json({ names: colors.map(() => "") });
  }
}
