'use server'

import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const session = await getSession()
  if (!session?.userId) throw new Error("Unauthorized")
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { roles: true }
  })
  
  if (!user || !user.roles.some(r => r.id === 'admin')) {
    throw new Error("Unauthorized: Admin only")
  }
}

// --- USERS ---

export async function getUsers(search?: string, take: number = 5, skip: number = 0) {
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
        roles: true,
        emblems: true
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
  joined_at?: Date,
  roles?: string[],
  emblems?: string[]
}) {
  await checkAdmin()

  const updateData: any = {
    ign: data.ign,
    discord_name: data.discord_name,
    enabled: data.enabled,
    joined_at: data.joined_at,
  };

  if (data.roles) {
    updateData.roles = {
      set: data.roles.map(id => ({ id }))
    }
  }

  if (data.emblems) {
    updateData.emblems = {
      set: data.emblems.map(id => ({ id }))
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  revalidatePath('/profile')
  return { success: true }
}

// --- ROLES ---

export async function getRoles() {
  await checkAdmin()
  return await prisma.role.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function saveRole(id: string, name: string, color: string, isNew: boolean) {
  await checkAdmin()
  
  if (isNew) {
    await prisma.role.create({
      data: { id, name, color }
    })
  } else {
    await prisma.role.update({
      where: { id },
      data: { name, color }
    })
  }
  revalidatePath('/profile')
  return { success: true }
}

export async function deleteRole(id: string) {
  await checkAdmin()
  await prisma.role.delete({ where: { id } })
  revalidatePath('/profile')
  return { success: true }
}

// --- EMBLEMS ---

export async function getEmblems() {
  await checkAdmin()
  return await prisma.emblem.findMany({
    include: { edition: true },
    orderBy: { name: 'asc' }
  })
}

export async function getEditions() {
  await checkAdmin()
  return await prisma.edition.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function saveEmblem(id: string, data: {
  name: string,
  description: string,
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
