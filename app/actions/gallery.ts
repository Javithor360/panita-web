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

    // Fetch the actual photos
    const dbPhotos = await prisma.photo.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: [
        { date_taken: 'desc' },
        { id: 'desc' }
      ],
      include: {
        user: true,
        edition: true,
        categories: {
          select: { id: true }
        }
      }
    });

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
