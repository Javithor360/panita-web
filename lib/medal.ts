/**
 * Medal.tv clip resolver.
 * Uses the Medal public oEmbed endpoint to extract the direct video URL,
 * a human-readable title, and a thumbnail URL without requiring authentication.
 */

export interface MedalClipMeta {
  /** Direct .mp4 URL of the clip. */
  videoUrl: string;
  /** Title of the clip as set by the uploader. */
  title: string;
  /** Thumbnail image URL. */
  thumbnailUrl: string;
}

/**
 * Resolves a Medal.tv clip URL into its underlying video assets.
 *
 * @param clipUrl - A public Medal clip URL, e.g. https://medal.tv/games/minecraft/clips/xxxxxxx
 * @returns Clip metadata including the direct mp4 URL, title, and thumbnail.
 * @throws Error when the URL is not a valid Medal clip or the API call fails.
 */
export async function getMedalClipMeta(clipUrl: string): Promise<MedalClipMeta> {
  if (!clipUrl.includes('medal.tv')) {
    throw new Error('The provided URL does not appear to be a Medal.tv clip.');
  }

  // 1. Fetch metadata (title, thumbnail) using the oEmbed API
  const oEmbedUrl = `https://medal.tv/api/oembed?url=${encodeURIComponent(clipUrl)}&format=json`;
  const oEmbedRes = await fetch(oEmbedUrl, {
    headers: { 'User-Agent': 'PanitacraftWeb/1.0' },
  });

  if (!oEmbedRes.ok) {
    throw new Error(
      `Medal oEmbed API responded with status ${oEmbedRes.status}. Make sure the clip is public.`,
    );
  }

  const data = await oEmbedRes.json();
  const title = (data.title as string | undefined) ?? 'Medal Clip';
  const thumbnailUrl = (data.thumbnail_url as string | undefined) ?? '';

  // 2. Fetch the actual clip page HTML to extract the direct .mp4 URL
  // Medal's oEmbed no longer returns the raw .mp4, it returns an iframe.
  const pageRes = await fetch(clipUrl, {
    headers: { 'User-Agent': 'PanitacraftWeb/1.0' },
  });

  if (!pageRes.ok) {
    throw new Error(`Failed to fetch Medal clip page (status ${pageRes.status}).`);
  }

  const html = await pageRes.text();
  
  // We extract the URL using a regex that matches the cdn.medal.tv .mp4 link
  // Usually found in 'contentUrl' JSON-LD or og:video tags.
  const videoSrcMatch = html.match(/(https:\/\/[a-zA-Z0-9.-]+\.medal\.tv\/[^"\\]+\.mp4[^"\\]*)/i);

  if (!videoSrcMatch?.[1]) {
    throw new Error(
      'Could not extract video URL from Medal clip page. ' +
        'The clip may be private or the format may have changed.',
    );
  }

  // Some escaped unicode characters might be present (e.g. \u0026 for &)
  const videoUrl = videoSrcMatch[1].replace(/\\u0026/g, '&');

  return {
    videoUrl,
    title,
    thumbnailUrl,
  };
}
