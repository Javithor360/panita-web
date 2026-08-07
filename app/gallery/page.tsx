import { Suspense } from "react";
import { Metadata, ResolvingMetadata } from "next";
import { DynamicBackground } from "@/components/ui/DynamicBackground";
import { GalleryContainer } from "@/components/gallery/GalleryContainer";
import { getPhotoById } from "@/app/actions/gallery";

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  props: Props
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const photoId = searchParams?.photo as string | undefined;

  if (photoId) {
    const photo = await getPhotoById(photoId);
    if (photo) {
      const description = photo.description || `Foto capturada por ${photo.author}.`;
      const title = `${photo.title}`;
      
      // Optimize the image for Discord/WhatsApp: less than 300KB, max 800px width
      let ogImageUrl = photo.imageUrl;
      if (ogImageUrl.includes('res.cloudinary.com') && ogImageUrl.includes('/upload/')) {
        ogImageUrl = ogImageUrl.replace('/upload/', '/upload/c_limit,w_800,h_800,q_auto,f_jpg/');
      }
      // Ensure the thumbnail always has an image extension, particularly for Cloudinary videos
      ogImageUrl = ogImageUrl.replace(/\.mp4$/, '.jpg');
      
      // maxresdefault.jpg sometimes returns a 404 if the YouTube video doesn't have a high-res thumbnail.
      // This causes Discord embeds to fail silently. hqdefault.jpg is guaranteed to exist.
      if (ogImageUrl.includes('maxresdefault.jpg')) {
        ogImageUrl = ogImageUrl.replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
      
      return {
        title,
        description,
        openGraph: {
          title: photo.title,
          description,
          url: `https://panita.vercel.app/gallery?photo=${photoId}`,
          siteName: 'Panitacraft',
          images: [
            {
              url: ogImageUrl,
              alt: photo.title,
              type: 'image/jpeg',
            },
          ],
          videos: photo.media_type === 'video' ? (
            photo.youtube_id ? [
              {
                url: `https://www.youtube.com/embed/${photo.youtube_id}`,
                width: 1280,
                height: 720,
                type: 'text/html',
              }
            ] : [
              {
                url: photo.imageUrl,
                width: 1280,
                height: 720,
                type: 'video/mp4',
              }
            ]
          ) : undefined,
          locale: 'es_ES',
          type: photo.media_type === 'video' ? 'video.other' : 'website',
        },
        twitter: photo.media_type === 'video' && photo.youtube_id ? {
          card: 'player',
          title: photo.title,
          description,
          images: [ogImageUrl],
          players: [
            {
              playerUrl: `https://www.youtube.com/embed/${photo.youtube_id}`,
              streamUrl: `https://www.youtube.com/embed/${photo.youtube_id}`,
              width: 1280,
              height: 720,
            }
          ]
        } : {
          card: 'summary_large_image',
          title: photo.title,
          description,
          images: [ogImageUrl],
        },
        other: {
          'theme-color': '#5c7cfa',
        }
      };
    }
  }

  return {
    title: 'Galería de Recuerdos - Panitacraft',
    description: 'Descubre cientos de fotografías y videos históricos a través del tiempo y diferentes ediciones del servidor.',
    openGraph: {
      title: 'Galería de Recuerdos',
      description: 'Descubre cientos de fotografías y videos históricos a través del tiempo y diferentes ediciones del servidor.',
      siteName: 'Panitacraft',
      url: 'https://panita.vercel.app/gallery',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Galería de Recuerdos',
      description: 'Descubre cientos de fotografías y videos históricos a través del tiempo y diferentes ediciones del servidor.',
    },
    other: {
      'theme-color': '#5c7cfa',
    }
  };
}

import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Role } from "@/lib/generated/prisma/client";

export default async function GalleryPage() {
  const session = await getSession();
  let canEdit = false;
  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: true }
    });
    if (user?.roles.some((r: Role) => r.id === 'admin' || r.id === 'mod')) {
      canEdit = true;
    }
  }

  return (
    <>
      <DynamicBackground pattern="squares" />
      <Suspense fallback={<div className="min-h-screen" />}>
        <GalleryContainer canEdit={canEdit} />
      </Suspense>
    </>
  );
}
