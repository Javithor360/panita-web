import { useState } from 'react';
import { Map } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditionIconProps {
  editionId: string;
  className?: string;
  alt?: string;
}

export function EditionIcon({ editionId, className, alt = "Edition icon" }: EditionIconProps) {
  const [error, setError] = useState(false);

  if (error || !editionId) {
    return <Map className={className} />;
  }

  return (
    <img 
      src={`/assets/edition_logos/icon_${editionId}.png`} 
      alt={alt} 
      className={cn("object-contain", className)} 
      onError={() => setError(true)} 
    />
  );
}
