'use server'

import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';

export interface GalleryFilters {
  page?: number;
  pageSize?: number;
  editionIds?: string[];
  categoryIds?: string[];
  years?: string[];
  search?: string | null;
  randomSeed?: number | null;
}

export interface Photo {
  id: string;
  title: string;
  description: string | null;
  author: string;
  authorIgn?: string | null;
  tagIds: string[];
  imageUrl: string;
  date_taken: Date | null;
  edition_id: string | null;
  edition_name: string | null;
  enabled: boolean;
  authorId: number | null;
}

export async function getPhotos(filters: GalleryFilters = {}) {
  try {
    const { 
      page = 1, 
      pageSize = 15, 
      editionIds = [], 
      categoryIds = [],
      years = [],
      search 
    } = filters;

    const skip = (page - 1) * pageSize;

    // Construct the where clause dynamically
    const where: Prisma.PhotoWhereInput = {
      enabled: true,
      NOT: [
        { url: { endsWith: '.mp4', mode: 'insensitive' } },
        { url: { endsWith: '.webm', mode: 'insensitive' } }
      ]
    };

    if (editionIds.length > 0) {
      where.edition_id = { in: editionIds };
    }

    if (categoryIds.length > 0) {
      where.categories = {
        some: { id: { in: categoryIds } }
      };
    }

    if (years.length > 0) {
      where.OR = years.map(year => {
        const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
        const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
        return {
          date_taken: {
            gte: yearStart,
            lte: yearEnd,
          }
        };
      });
    }

    if (search) {
      // Simple search: in author's name, in title or in description
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          user: {
            OR: [
              { discord_name: { contains: search, mode: 'insensitive' } },
              { ign: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    // Fetch the total count for pagination
    const totalCount = await prisma.photo.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    let dbPhotos;
    if (filters.randomSeed) {
      const allIds = await prisma.photo.findMany({
        where,
        select: { id: true },
        orderBy: { id: 'asc' }
      });
      
      const rng = (function mulberry32(a: number) {
        return function() {
          let t = a += 0x6D2B79F5;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        }
      })(filters.randomSeed);

      allIds.sort(() => rng() - 0.5);
      
      const pageIds = allIds.slice(skip, skip + pageSize).map(item => item.id);
      
      const unsortedDbPhotos = await prisma.photo.findMany({
        where: { id: { in: pageIds } },
        include: {
          user: true,
          edition: true,
          categories: { select: { id: true } }
        }
      });
      
      dbPhotos = pageIds.map(id => unsortedDbPhotos.find(p => p.id === id)).filter(Boolean);
    } else {
      dbPhotos = await prisma.photo.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: {
          user: true,
          edition: true,
          categories: {
            select: { id: true }
          }
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photos: Photo[] = dbPhotos.map((photo: any) => ({
      id: photo.id,
      title: photo.title || 'Sin título',
      description: photo.description,
      author: photo.user?.ign || photo.user?.discord_name || 'Anónimo',
      authorIgn: photo.user?.ign || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tagIds: photo.categories.map((c: any) => c.id),
      imageUrl: photo.url,
      date_taken: photo.date_taken,
      edition_id: photo.edition_id,
      edition_name: photo.edition?.name || null,
      enabled: photo.enabled,
      authorId: photo.user_id
    }));

    return {
      photos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount
      }
    };

  } catch (error) {
    console.error('Error fetching gallery photos:', error);
    return {
      photos: [],
      pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }
    };
  }
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id },
      include: {
        user: true,
        edition: true,
        categories: {
          select: { id: true }
        }
      }
    });

    if (!photo) return null;

    return {
      id: photo.id,
      title: photo.title || 'Sin título',
      description: photo.description,
      author: photo.user?.ign || photo.user?.discord_name || 'Anónimo',
      authorIgn: photo.user?.ign || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tagIds: photo.categories.map((c: any) => c.id),
      imageUrl: photo.url,
      date_taken: photo.date_taken,
      edition_id: photo.edition_id,
      edition_name: photo.edition?.name || null,
      enabled: photo.enabled,
      authorId: photo.user_id
    };
  } catch (error) {
    console.error(`Error fetching photo by id ${id}:`, error);
    return null;
  }
}

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Role } from '@/lib/generated/prisma/client';

async function checkAdminOrMod() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { roles: true }
  });
  
  if (!user || !user.roles.some((r: Role) => r.id === 'admin' || r.id === 'mod')) {
    throw new Error("Unauthorized: Admin or Mod only");
  }
}

export async function updatePhoto(id: string, data: {
  title?: string,
  description?: string | null,
  date_taken?: Date | null,
  enabled?: boolean,
  edition_id?: string | null,
  user_id?: number | null,
  categoryIds?: string[]
}) {
  await checkAdminOrMod();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = { ...data };
  
  if (data.categoryIds) {
    updateData.categories = {
      set: data.categoryIds.map(catId => ({ id: catId }))
    };
    delete updateData.categoryIds;
  }

  await prisma.photo.update({
    where: { id },
    data: updateData
  });

  revalidatePath('/gallery');
  return { success: true };
}
export async function getUserPhotos(userId: number, skip: number = 0, take: number = 50) {
  try {
    const dbPhotos = await prisma.photo.findMany({
      where: { 
        user_id: userId,
        enabled: true,
        NOT: [
          { url: { endsWith: '.mp4', mode: 'insensitive' } },
          { url: { endsWith: '.webm', mode: 'insensitive' } }
        ]
      },
      orderBy: { created_at: 'desc' },
      skip,
      take,
      include: {
        user: true,
        edition: true,
        categories: true,
      }
    });

    return dbPhotos.map(p => ({
      id: p.id,
      title: p.title || 'Sin título',
      description: p.description,
      author: p.user?.ign || p.user?.discord_name || 'Desconocido',
      authorIgn: p.user?.ign || null,
      authorId: p.user_id,
      tagIds: p.categories.map(c => c.id),
      imageUrl: p.url,
        date_taken: p.date_taken,
      edition_id: p.edition_id,
      edition_name: p.edition?.name || 'Desconocida',
      enabled: p.enabled
    }));
  } catch (error) {
    console.error("Error fetching user photos:", error);
    return [];
  }
}

import { v2 as cloudinary } from 'cloudinary';

// Ensure cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadPhoto(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { roles: true }
  });

  const isAdminOrMod = user?.roles.some((r: any) => r.id === 'admin' || r.id === 'mod');

  if (!user || (!user.trusted_author && !isAdminOrMod)) {
    throw new Error("Unauthorized: Only trusted authors can upload photos");
  }

  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const edition_id = formData.get('edition_id') as string;
  const tagIdsString = formData.get('tagIds') as string;

  if (!file || !title || !edition_id || !tagIdsString) {
    throw new Error("Missing required fields");
  }

  const tagIds = JSON.parse(tagIdsString);
  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    throw new Error("At least one tag is required");
  }

  if (tagIds.includes('members_choice') && !isAdminOrMod) {
    throw new Error("Unauthorized: Only Admins or Mods can assign the 'Elección del Público' tag");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // According to structure: panita-web/gallery/[edition]/[user]
  const folder = `panita-web/gallery/${edition_id}/${user.discord_name}`;

  try {
    // Ensure the user's folder exists (Cloudinary creates it if it doesn't)
    await cloudinary.api.create_folder(folder).catch(() => {
      // If the folder already exists, Cloudinary might throw an error, we ignore it
    });

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const cloudinaryResult = uploadResult as any;

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

    const newPhoto = await prisma.photo.create({
      data: {
        url: cloudinaryResult.secure_url,
        title,
        description: description || null,
        enabled: true,
        date_taken: finalDateTaken,
        user_id: finalUserId,
        edition_id: edition_id,
        categories: {
          connect: tagIds.map((id: string) => ({ id }))
        }
      }
    });

    revalidatePath('/gallery');
    revalidatePath(`/profile/${user.ign || user.discord_name}`);
    return { success: true, photoId: newPhoto.id };
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload photo to Cloudinary or DB");
  }
}
