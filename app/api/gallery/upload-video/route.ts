import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getMedalClipMeta } from '@/lib/medal';
import { uploadToYouTube } from '@/lib/youtube';
import { revalidatePath } from 'next/cache';

// Disable the built-in body parser so we can handle the raw multipart stream.
export const runtime = 'nodejs';

// Allow up to 500 MB bodies for video uploads.
export const maxDuration = 300; // 5 minutes — Vercel Pro / hobby limit

/**
 * POST /api/gallery/upload-video
 *
 * Handles two upload modes:
 *  - "medal"  — body contains `medalUrl`; server fetches the clip and re-uploads to YouTube.
 *  - "file"   — body contains a `file` blob; server uploads the file directly to YouTube.
 *
 * Common fields in FormData:
 *   title       (required)
 *   description (optional)
 *   edition_id  (required)
 *   tagIds      (required, JSON array string)
 *   mode        "medal" | "file"
 *   medalUrl    (required when mode = "medal")
 *   file        (required when mode = "file")
 *   author_id   (optional, admin/mod only)
 *   date_taken  (optional, admin/mod only)
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAdminOrMod = user?.roles.some((r: any) => r.id === 'admin' || r.id === 'mod');

    if (!user || (!user.trusted_author && !isAdminOrMod)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only trusted authors can upload videos' },
        { status: 403 },
      );
    }

    // ── Parse form ────────────────────────────────────────────────────────────
    const formData = await req.formData();

    const mode = formData.get('mode') as 'medal' | 'file' | null;
    const title = (formData.get('title') as string | null)?.trim();
    const description = (formData.get('description') as string | null)?.trim() ?? '';
    const editionId = formData.get('edition_id') as string | null;
    const tagIdsString = formData.get('tagIds') as string | null;

    if (!mode || !title || !editionId || !tagIdsString) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const tagIds: string[] = JSON.parse(tagIdsString);
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return NextResponse.json({ error: 'At least one tag is required' }, { status: 400 });
    }

    if (tagIds.includes('members_choice') && !isAdminOrMod) {
      return NextResponse.json(
        { error: "Unauthorized: Only Admins or Mods can assign the 'Elección del Público' tag" },
        { status: 403 },
      );
    }

    // ── Determine final author and date ───────────────────────────────────────
    const authorIdStr = formData.get('author_id') as string | null;
    const dateTakenStr = formData.get('date_taken') as string | null;

    let finalUserId: number | null = user.id;
    let finalDateTaken: Date = new Date();

    if (isAdminOrMod) {
      if (authorIdStr === 'null') {
        finalUserId = null;
      } else if (authorIdStr) {
        finalUserId = parseInt(authorIdStr, 10);
      }
      if (dateTakenStr) {
        finalDateTaken = new Date(dateTakenStr);
      }
    }

    const uploaderName = user.ign ?? user.discord_name;

    // ── Acquire video buffer ──────────────────────────────────────────────────
    let videoBuffer: Buffer;
    let mimeType = 'video/mp4';

    if (mode === 'medal') {
      const medalUrl = formData.get('medalUrl') as string | null;
      if (!medalUrl) {
        return NextResponse.json({ error: 'Missing medalUrl for medal mode' }, { status: 400 });
      }

      // Fetch the direct .mp4 URL from Medal's oEmbed API.
      const clipMeta = await getMedalClipMeta(medalUrl);

      // Download the clip from Medal's CDN.
      const videoResponse = await fetch(clipMeta.videoUrl);
      if (!videoResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to download clip from Medal CDN' },
          { status: 502 },
        );
      }

      const arrayBuffer = await videoResponse.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
    } else if (mode === 'file') {
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Missing file for file mode' }, { status: 400 });
      }

      mimeType = file.type || 'video/mp4';
      const arrayBuffer = await file.arrayBuffer();
      videoBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json({ error: 'Invalid mode — must be "medal" or "file"' }, { status: 400 });
    }

    // ── Upload to YouTube ─────────────────────────────────────────────────────
    const ytResult = await uploadToYouTube({
      videoBuffer,
      title,
      uploaderName,
      mimeType,
    });

    // ── Persist in DB ─────────────────────────────────────────────────────────
    const newPhoto = await prisma.photo.create({
      data: {
        url: ytResult.thumbnailUrl,
        title,
        description: description || null,
        enabled: true,
        date_taken: finalDateTaken,
        user_id: finalUserId,
        edition_id: editionId,
        media_type: 'video',
        youtube_id: ytResult.youtubeId,
        categories: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
    });

    revalidatePath('/gallery');
    if (user.ign || user.discord_name) {
      revalidatePath(`/profile/${user.ign ?? user.discord_name}`);
    }

    return NextResponse.json({
      success: true,
      photoId: newPhoto.id,
      youtubeId: ytResult.youtubeId,
      watchUrl: ytResult.watchUrl,
    });
  } catch (error: unknown) {
    console.error('[upload-video] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during video upload';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
