import { PrismaClient } from '../lib/generated/prisma/client'
import 'dotenv/config'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting backfill for titles...')

  const editions = await prisma.edition.findMany()
  const editionMap = new Map(editions.map(e => [e.id, e.name]))

  // Get all photos ordered by creation time or id to maintain sequence
  const photos = await prisma.photo.findMany({
    orderBy: { url: 'asc' }
  })

  const editionCounters: Record<string, number> = {};

  let updated = 0;

  for (const photo of photos) {
    if (photo.title) continue; // Skip if already has title

    const editionId = photo.edition_id;
    if (!editionId) continue;

    editionCounters[editionId] = (editionCounters[editionId] || 0) + 1;
    const iterator = editionCounters[editionId];
    const editionName = editionMap.get(editionId) || editionId;

    let monthYearStr = '';
    if (photo.date_taken) {
      monthYearStr = photo.date_taken.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      monthYearStr = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1);
    }

    const titleStr = photo.date_taken
      ? `${editionName} - ${monthYearStr} #${iterator}`
      : `${editionName} #${iterator}`;

    await prisma.photo.update({
      where: { id: photo.id },
      data: { title: titleStr }
    });
    updated++;
  }

  console.log(`Backfill finished. Updated ${updated} photos.`);
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
