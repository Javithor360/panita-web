'use server'

import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { User as PrismaUser, Role, Emblem, Edition, UserEdition } from "@/lib/generated/prisma/client"
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function checkAdmin() {
  const session = await getSession()
  if (!session?.userId) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { roles: true }
  })
  
  if (!user || !user.roles.some((r: Role) => r.id === 'admin' || r.id === 'mod')) {
    throw new Error("Unauthorized: Admin or Mod only")
  }
}

// --- USERS ---

export async function getUsers(search?: string, take: number = 5, skip: number = 0): Promise<{ users: (PrismaUser & { roles: Role[], emblems: Emblem[], editions: UserEdition[] })[], total: number }> {
  await checkAdmin()
  
  const where = search ? {
    OR: [
      { ign: { contains: search, mode: 'insensitive' as const } },
      { discord_name: { contains: search, mode: 'insensitive' as const } }
    ]
  } : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        roles: { orderBy: { position: 'asc' } },
        emblems: { orderBy: { position: 'asc' } },
        editions: true
      },
      orderBy: [
        { joined_at: 'desc' },
        { id: 'asc' }
      ],
      take,
      skip
    }),
    prisma.user.count({ where })
  ])

  return { users, total }
}

export async function updateUser(userId: number, data: {
  ign?: string | null,
  discord_name?: string,
  enabled?: boolean,
  trusted_author?: boolean,
  joined_at?: Date,
  rolesAdded?: string[],
  rolesRemoved?: string[],
  emblemsAdded?: string[],
  emblemsRemoved?: string[],
  editionsAdded?: string[],
  editionsRemoved?: string[]
}) {
  await checkAdmin()

  // 1. Update basic scalar data
  const updateData: Record<string, unknown> = {
    ign: data.ign,
    discord_name: data.discord_name,
    enabled: data.enabled,
    trusted_author: data.trusted_author,
    joined_at: data.joined_at,
  };

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  // 2. Apply roles individually (loop) to avoid multiple connect bugs
  if (data.rolesRemoved?.length) {
    for (const roleId of data.rolesRemoved) {
      await prisma.user.update({
        where: { id: userId },
        data: { roles: { disconnect: { id: roleId } } }
      });
    }
  }
  
  if (data.rolesAdded?.length) {
    for (const roleId of data.rolesAdded) {
      await prisma.user.update({
        where: { id: userId },
        data: { roles: { connect: { id: roleId } } }
      });
    }
  }

  // 3. Apply emblems individually
  if (data.emblemsRemoved?.length) {
    for (const emblemId of data.emblemsRemoved) {
      await prisma.user.update({
        where: { id: userId },
        data: { emblems: { disconnect: { id: emblemId } } }
      });
    }
  }

  if (data.emblemsAdded?.length) {
    for (const emblemId of data.emblemsAdded) {
      await prisma.user.update({
        where: { id: userId },
        data: { emblems: { connect: { id: emblemId } } }
      });
    }
  }

  // 4. Apply editions individually
  if (data.editionsRemoved?.length) {
    await prisma.userEdition.deleteMany({
      where: { user_id: userId, edition_id: { in: data.editionsRemoved } }
    });
  }

  if (data.editionsAdded?.length) {
    for (const edId of data.editionsAdded) {
      await prisma.userEdition.upsert({
        where: { user_id_edition_id: { user_id: userId, edition_id: edId } },
        update: {},
        create: { user_id: userId, edition_id: edId }
      });
    }
  }

  revalidatePath('/profile')
  return { success: true }
}

// --- ROLES ---

export async function getRoles() {
  await checkAdmin()
  return await prisma.role.findMany({
    orderBy: { position: 'asc' }
  })
}

export async function saveRole(id: string, name: string, color: string, discord_role_id: string | null, isNew: boolean) {
  await checkAdmin()
  
  try {
    if (isNew) {
      await prisma.role.create({
        data: { id, name, color, discord_role_id }
      })
    } else {
      await prisma.role.update({
        where: { id },
        data: { name, color, discord_role_id }
      })
    }
    revalidatePath('/profile')
    return { success: true }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'Ya existe un rango con ese ID.' }
    }
    return { error: 'Error inesperado al guardar el rango.' }
  }
}

export async function deleteRole(id: string) {
  await checkAdmin()
  await prisma.role.delete({ where: { id } })
  revalidatePath('/profile')
  return { success: true }
}

export async function updateRolePositions(positions: { id: string, position: number }[]) {
  await checkAdmin()
  
  await prisma.$transaction(
    positions.map(p => 
      prisma.role.update({
        where: { id: p.id },
        data: { position: p.position }
      })
    )
  )
  
  revalidatePath('/profile')
  return { success: true }
}

// --- EMBLEMS ---

export async function getEmblems(): Promise<(Emblem & { edition: Edition | null })[]> {
  await checkAdmin()
  return await prisma.emblem.findMany({
    include: { edition: true },
    orderBy: { position: 'asc' }
  })
}

export async function updateEmblemPositions(positions: { id: string, position: number }[]) {
  await checkAdmin()
  
  await prisma.$transaction(
    positions.map(p => 
      prisma.emblem.update({
        where: { id: p.id },
        data: { position: p.position }
      })
    )
  )
  
  revalidatePath('/profile')
  return { success: true }
}

export async function getEditions() {
  await checkAdmin()
  return await prisma.edition.findMany({
    orderBy: [
      { started_at: { sort: 'desc', nulls: 'last' } },
      { name: 'asc' }
    ]
  })
}

export async function saveEmblem(id: string, data: {
  name: string,
  description: string | null,
  icon_url: string,
  edition_id: string | null
}, isNew: boolean) {
  await checkAdmin()

  if (isNew) {
    await prisma.emblem.create({
      data: { id, ...data }
    })
  } else {
    await prisma.emblem.update({
      where: { id },
      data
    })
  }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteEmblem(id: string) {
  await checkAdmin()
  await prisma.emblem.delete({ where: { id } })
  revalidatePath('/profile')
  return { success: true }
}

export async function uploadEmblemIcon(formData: FormData) {
  await checkAdmin();
  
  const file = formData.get('file') as File;
  const editionId = formData.get('editionId') as string;
  
  if (!file) {
    return { error: 'No file provided' };
  }
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const folder = `panita-web/profile/emblem/${editionId || 'extra'}`;
  
  try {
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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cloudinaryResult = uploadResult as any;
    
    return { success: true, url: cloudinaryResult.secure_url };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error uploading emblem icon:", error);
    return { error: `Failed to upload icon to Cloudinary: ${error?.message || JSON.stringify(error) || 'Unknown error'}` };
  }
}

export async function getEmblemUsers(emblemId: string) {
  await checkAdmin()
  const emblem = await prisma.emblem.findUnique({
    where: { id: emblemId },
    include: {
      users: {
        select: { id: true, ign: true, discord_name: true, discord_id: true }
      }
    }
  })
  return emblem?.users || []
}

export async function searchUsersForAssignment(query: string) {
  await checkAdmin()
  if (!query || query.length < 2) return []
  return await prisma.user.findMany({
    where: {
      OR: [
        { ign: { contains: query, mode: 'insensitive' } },
        { discord_name: { contains: query, mode: 'insensitive' } },
        { discord_id: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: { id: true, ign: true, discord_name: true, discord_id: true },
    take: 10
  })
}

export async function toggleUserEmblem(userId: number, emblemId: string, assign: boolean) {
  await checkAdmin()
  await prisma.user.update({
    where: { id: userId },
    data: {
      emblems: assign ? { connect: { id: emblemId } } : { disconnect: { id: emblemId } }
    }
  })
  revalidatePath('/profile')
  return { success: true }
}

// --- PHOTOS ---

export async function getHiddenPhotos() {
  await checkAdmin()
  return await prisma.photo.findMany({
    where: { enabled: false },
    orderBy: { created_at: 'desc' }
  })
}

export async function deleteHiddenPhotosBulk(ids: string[]) {
  await checkAdmin()
  
  // First get the photos to extract their Cloudinary public IDs
  const photos = await prisma.photo.findMany({
    where: { id: { in: ids } }
  })
  
  // Delete from Cloudinary
  const deletePromises = photos.map(async (photo) => {
    try {
      if (photo.url.includes('res.cloudinary.com')) {
        const urlParts = photo.url.split('/upload/');
        if (urlParts.length > 1) {
          // Remove version if present and extension
          const pathWithExt = urlParts[1].replace(/^v\d+\//, '');
          const publicId = pathWithExt.replace(/\.[^/.]+$/, '');
          await cloudinary.uploader.destroy(publicId);
        }
      }
    } catch (e) {
      console.error(`Error eliminando foto de Cloudinary: ${photo.url}`, e);
    }
  });
  
  await Promise.all(deletePromises);
  
  // Delete from database
  await prisma.photo.deleteMany({
    where: { id: { in: ids } }
  });
  
  revalidatePath('/profile');
  revalidatePath('/gallery');
  return { success: true };
}

// --- USER EDITIONS (TRAJECTORY) ---

export async function assignUserToEdition(userId: number, editionId: string, joinedAt?: Date | null) {
  await checkAdmin()
  
  await prisma.userEdition.upsert({
    where: {
      user_id_edition_id: {
        user_id: userId,
        edition_id: editionId
      }
    },
    update: {
      joined_at: joinedAt
    },
    create: {
      user_id: userId,
      edition_id: editionId,
      joined_at: joinedAt
    }
  })
  
  revalidatePath('/profile')
  return { success: true }
}

export async function removeUserFromEdition(userId: number, editionId: string) {
  await checkAdmin()
  
  await prisma.userEdition.delete({
    where: {
      user_id_edition_id: {
        user_id: userId,
        edition_id: editionId
      }
    }
  }).catch(() => {}) // Ignore if not exists
  
  revalidatePath('/profile')
  return { success: true }
}
