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
  tagIds: string[];
  imageUrl: string;
  date_taken: Date | null;
  edition_id: string | null;
  edition_name: string | null;
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
        edition: true,
        categories: {
          select: { id: true }
        }
      }
    });

    // Map to the format expected by the client
    const photos: Photo[] = dbPhotos.map(photo => ({
      id: photo.id,
      title: photo.title || 'Sin título',
      description: photo.description,
      author: photo.user?.discord_name || 'Anónimo',
      tagIds: photo.categories.map(c => c.id),
      imageUrl: photo.url,
      date_taken: photo.date_taken,
      edition_id: photo.edition_id,
      edition_name: photo.edition?.name || null
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
      author: photo.user?.discord_name || 'Anónimo',
      tagIds: photo.categories.map(c => c.id),
      imageUrl: photo.url,
      date_taken: photo.date_taken,
      edition_id: photo.edition_id,
      edition_name: photo.edition?.name || null
    };
  } catch (error) {
    console.error(`Error fetching photo by id ${id}:`, error);
    return null;
  }
}
