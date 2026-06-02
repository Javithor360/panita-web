'use server'

import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/generated/prisma/client';

export interface GalleryFilters {
  page?: number;
  pageSize?: number;
  editionId?: string | null;
  categoryId?: string | null;
  year?: string | null;
  search?: string | null;
}

export async function getPhotos(filters: GalleryFilters = {}) {
  try {
    const { 
      page = 1, 
      pageSize = 15, 
      editionId, 
      categoryId,
      year,
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

    if (editionId) {
      where.edition_id = editionId;
    }

    if (categoryId) {
      where.categories = {
        some: { id: categoryId }
      };
    }

    if (year) {
      const yearStart = new Date(`${year}-01-01T00:00:00.000Z`);
      const yearEnd = new Date(`${year}-12-31T23:59:59.999Z`);
      where.date_taken = {
        gte: yearStart,
        lte: yearEnd,
      };
    }

    if (search) {
      // Simple search: in author's name, in title or in description
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { 
          user: {
            discord_name: { contains: search, mode: 'insensitive' }
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
        categories: {
          select: { id: true }
        }
      }
    });

    // Map to the format expected by PhotoCard
    const photos = dbPhotos.map(photo => ({
      id: photo.id,
      title: photo.title || 'Sin título',
      author: photo.user?.discord_name || 'Anónimo',
      tagIds: photo.categories.map(c => c.id),
      imageUrl: photo.url,
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
