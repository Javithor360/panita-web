import { Suspense } from "react";
import { DynamicBackground } from "@/components/ui/DynamicBackground";
import { GalleryContainer } from "@/components/gallery/GalleryContainer";

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
