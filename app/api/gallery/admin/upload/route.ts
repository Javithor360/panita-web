import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../../../../../lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { folderPath } = body;

    if (!folderPath) {
      return NextResponse.json({ error: 'El campo folderPath es requerido en el body (ej: panita-web/gallery/panitamon)' }, { status: 400 });
    }

    // Get resources from the folder using Cloudinary search API
    let resources: any[] = [];
    let nextCursor = null;

    do {
      // Use /* to include all subfolders (players) within the edition folder
      const result: any = await cloudinary.search
        .expression(`folder:"${folderPath}/*"`)
        .sort_by('public_id', 'asc')
        .max_results(500)
        .next_cursor(nextCursor)
        .execute();

      resources = resources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    if (resources.length === 0) {
      return NextResponse.json({ message: 'No se encontraron imágenes en la carpeta especificada.' });
    }

    let insertedPhotos = 0;
    let newUsers = 0;

    // Fetch all editions to map their names for the titles
    const editions = await prisma.edition.findMany();
    const editionMap = new Map(editions.map(e => [e.id, e.name]));

    // Fetch current counts for iterators
    const counts = await prisma.photo.groupBy({
      by: ['edition_id'],
      _count: { id: true }
    });
    const editionCounters: Record<string, number> = {};
    counts.forEach(c => {
      if (c.edition_id) editionCounters[c.edition_id] = c._count.id;
    });

    for (const file of resources) {
      const publicId = file.public_id;
      const secureUrl = file.secure_url;
      const format = file.format;
      const resourceType = file.resource_type;

      if (resourceType === 'video' || format === 'mp4' || format === 'webm') {
        console.warn(`Saltando archivo de video (omisión temporal): ${publicId}`);
        continue;
      }

      // Split the path by slashes
      const parts = publicId.split('/');
      
      const galleryIndex = parts.indexOf('gallery');
      if (galleryIndex === -1 || parts.length < galleryIndex + 4) {
        console.warn(`Saltando archivo con ruta no esperada: ${publicId}`);
        continue;
      }

      // According to structure: panita-web/gallery/[edition]/[user]/[file]
      const editionId = parts[galleryIndex + 1];
      const username = parts[galleryIndex + 2];
      const filename = parts[galleryIndex + 3];

      // Try to extract date (YYYY-MM-DD) from filename
      const dateMatch = filename.match(/\d{4}-\d{2}-\d{2}/);
      let dateTaken = null;
      let monthYearStr = '';
      if (dateMatch) {
        dateTaken = new Date(dateMatch[0]);
        const formattedDate = dateTaken.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        monthYearStr = formattedDate.replace(' de ', ' ');
        monthYearStr = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1);
      }

      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: { discord_name: username }
      });

      // If not exists, create with default values
      if (!user) {
        user = await prisma.user.create({
          data: {
            discord_name: username,
            discord_id: `pending_${username}_${Date.now()}`,
            enabled: false,
          }
        });
        newUsers++;
      }

      // Check if photo already exists by URL to avoid duplicates if run twice
      const existingPhoto = await prisma.photo.findFirst({
        where: { url: secureUrl }
      });

      if (!existingPhoto) {
        editionCounters[editionId] = (editionCounters[editionId] || 0) + 1;
        const iterator = editionCounters[editionId];
        const editionName = editionMap.get(editionId) || editionId;
        
        const titleStr = dateTaken 
          ? `#${iterator} - ${editionName} (${monthYearStr})`
          : `#${iterator} - ${editionName}`;

        await prisma.photo.create({
          data: {
            url: secureUrl,
            edition_id: editionId,
            user_id: user.id,
            date_taken: dateTaken,
            title: titleStr,
            enabled: true,
          }
        });
        insertedPhotos++;
      } else {
        // Update existing photos to ensure they have the latest title format
        editionCounters[editionId] = (editionCounters[editionId] || 0) + 1;
        const iterator = editionCounters[editionId];
        const editionName = editionMap.get(editionId) || editionId;
        
        const titleStr = dateTaken 
          ? `#${iterator} - ${editionName} (${monthYearStr})`
          : `#${iterator} - ${editionName}`;

        // Only update if the title actually changed
        if (existingPhoto.title !== titleStr) {
          await prisma.photo.update({
            where: { id: existingPhoto.id },
            data: { title: titleStr }
          });
          insertedPhotos++; // Counted as processed/updated
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Procesamiento completado.`,
      stats: {
        totalArchivosEncontrados: resources.length,
        fotosNuevasInsertadas: insertedPhotos,
        usuariosNuevosCreados: newUsers
      }
    });

  } catch (error: any) {
    console.error('Error en el proceso de ingesta masiva:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
