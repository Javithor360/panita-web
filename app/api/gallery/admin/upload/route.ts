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

    for (const file of resources) {
      const publicId = file.public_id; // e.g: panita-web/gallery/panitamon/javithor360/46_1_1_2026-01-28_16.42.09
      const secureUrl = file.secure_url;

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
      if (dateMatch) {
        dateTaken = new Date(dateMatch[0]);
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
        await prisma.photo.create({
          data: {
            url: secureUrl,
            edition_id: editionId,
            user_id: user.id,
            date_taken: dateTaken,
            enabled: true,
          }
        });
        insertedPhotos++;
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
