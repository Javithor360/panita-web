"use client";

import { useState } from "react";
import Image from "next/image";
import { Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditionIconProps {
  editionId: string;
  className?: string;
  alt?: string;
}

export function EditionIcon({
  editionId,
  className,
  alt = "Edition icon",
}: EditionIconProps) {
  const [error, setError] = useState(false);

  if (error || !editionId) {
    return <Map className={className} />;
  }

  return (
    <Image
      src={`/assets/edition_logos/icon_${editionId}.png`}
      alt={alt}
      width={64}
      height={64}
      className={cn("object-contain", className)}
      onError={() => setError(true)}
    />
  );
}
