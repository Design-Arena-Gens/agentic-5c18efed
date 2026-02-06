import { NextResponse } from "next/server";
import { z } from "zod";
import { parseHtml } from "@/lib/scrape";

const scrapeSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (value) => {
        const parsed = new URL(value);
        return ["http:", "https:"].includes(parsed.protocol);
      },
      { message: "Only http and https URLs are allowed." },
    ),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { url } = scrapeSchema.parse(json);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; AgenticScraper/1.0; +https://agentic-5c18efed.vercel.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch resource (HTTP ${response.status}).` },
        { status: response.status },
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "Only HTML documents can be scraped." },
        { status: 400 },
      );
    }

    const html = await response.text();
    const data = parseHtml(html, response.url);

    return NextResponse.json({ data, fetchedUrl: response.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }

    console.error("Scrape error", error);
    return NextResponse.json({ error: "Unexpected error scraping URL." }, { status: 500 });
  }
}
