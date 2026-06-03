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
  props: Props,
  parent: ResolvingMetadata
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
          locale: 'es_ES',
          type: 'website',
        },
        twitter: {
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
    title: 'Galería | Panitacraft',
    description: 'Galería y museo digital de las ediciones de Panitacraft',
    other: {
      'theme-color': '#5c7cfa',
    }
  };
}

export default function GalleryPage() {
  return (
    <>
      <DynamicBackground />
      <Suspense fallback={<div className="min-h-screen" />}>
        <GalleryContainer />
      </Suspense>
    </>
  );
}
