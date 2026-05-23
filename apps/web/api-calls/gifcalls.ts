/* eslint-disable @typescript-eslint/no-explicit-any */
// Your existing searchGifs function
const TENOR_KEY = process.env.NEXT_PUBLIC_TENOR_API_KEY ?? "";

interface GifResult {
  url: string;
  preview: string;
  title: string;
}


export async function searchGifs(query: string): Promise<GifResult[] | []> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=20`
    );

    const json = await res.json();

const gifs: GifResult[] = (json.results ?? [])
  .map((item: any) => {
    const media = item.media?.[0];

    if (!media) return null;

    // only keep variants where:
    // url ends with .gif
    // preview ends with .png
    const validFormats = Object.values(media).filter((m: any) => {
      return (
        typeof m?.url === "string" &&
        typeof m?.preview === "string" &&
        m.url.endsWith(".gif") &&
      (m.preview.endsWith(".png") || m.preview.endsWith(".jpg") || m.preview.endsWith(".jpeg"))
      );
    });

    if (validFormats.length === 0) return null;

    // get shortest duration
    const shortest: any = validFormats.reduce((a: any, b: any) => {
      const aDuration = Number(a.duration) || Infinity;
      const bDuration = Number(b.duration) || Infinity;

      return aDuration < bDuration ? a : b;
    });

    return {
      title: item.content_description,
      url: shortest.url,
      preview: shortest.preview,
    };
  })
  .filter(Boolean) as GifResult[];

    return gifs;
  } catch {
    return [];
  }
}
