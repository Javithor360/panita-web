/**
 * YouTube Data API v3 upload utility.
 * Uses OAuth2 with a long-lived refresh token to upload videos
 * to the Panitacraft channel on behalf of the channel owner.
 */

import { google } from 'googleapis';
import { Readable } from 'stream';

/** Metadata returned after a successful YouTube upload. */
export interface YouTubeUploadResult {
  /** The YouTube video ID (e.g. "dQw4w9WgXcQ"). */
  youtubeId: string;
  /** YouTube watch URL. */
  watchUrl: string;
  /**
   * High-quality thumbnail URL using YouTube's public thumbnail CDN.
   * Uses maxresdefault first; falls back to hqdefault if unavailable.
   */
  thumbnailUrl: string;
}

/**
 * Creates a pre-authenticated YouTube API client using the stored OAuth2 refresh token.
 * The access token is refreshed automatically by the googleapis library.
 */
function getYouTubeClient() {
  const oauth2 = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
  );

  oauth2.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  return google.youtube({ version: 'v3', auth: oauth2 });
}

export interface YouTubeUploadParams {
  /** The video file as a Node.js Buffer. */
  videoBuffer: Buffer;
  /** Video title — will be used as the YouTube video title. */
  title: string;
  /** Discord / IGN of the uploader. */
  uploaderName: string;
  /** MIME type of the video (e.g. "video/mp4"). */
  mimeType?: string;
}

/**
 * Uploads a video buffer to the Panitacraft YouTube channel.
 *
 * @param params - Upload parameters.
 * @returns Upload result with the YouTube video ID and URLs.
 */
export async function uploadToYouTube(params: YouTubeUploadParams): Promise<YouTubeUploadResult> {
  const { videoBuffer, title, uploaderName, mimeType = 'video/mp4' } = params;

  const youtube = getYouTubeClient();

  // Convert Buffer to a Readable stream for the multipart upload.
  const readableStream = Readable.from(videoBuffer);

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description: `Video subido por: ${uploaderName} para la galería de Panitacraft Web`,
        // Channel ID is set implicitly by the OAuth2 token; categoryId 20 = Gaming
        categoryId: '20',
        defaultLanguage: 'es',
      },
      status: {
        // Public so it appears on the channel and can be embedded.
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      mimeType,
      body: readableStream,
    },
  });

  const youtubeId = response.data.id;
  if (!youtubeId) {
    throw new Error('YouTube API did not return a video ID after upload.');
  }

  return {
    youtubeId,
    watchUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
  };
}

/**
 * Deletes a video from the Panitacraft YouTube channel.
 *
 * @param videoId - The YouTube video ID.
 */
export async function deleteYouTubeVideo(videoId: string): Promise<void> {
  const youtube = getYouTubeClient();
  await youtube.videos.delete({
    id: videoId,
  });
}
