'use server'

import prisma from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"

const userProfileInclude = {
  roles: {
    orderBy: { position: "asc" as const },
  },
  emblems: {
    orderBy: { position: "asc" as const },
    include: {
      edition: true,
      _count: {
        select: { users: true },
      },
    },
  },
  editions: {
    include: { edition: true },
    orderBy: { edition: { started_at: "asc" as const } },
  },
};

export type UserProfilePayload = Prisma.UserGetPayload<{
  include: typeof userProfileInclude;
}>;

export async function getPersonalProfileData(userId: number): Promise<UserProfilePayload | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: userProfileInclude,
  });
  return user as UserProfilePayload | null;
}

export async function getPublicProfileData(ign: string): Promise<UserProfilePayload | null> {
  const user = await prisma.user.findFirst({
    where: {
      ign: {
        equals: ign,
        mode: "insensitive",
      },
    },
    include: userProfileInclude,
  });
  return user as UserProfilePayload | null;
}

export async function getDefaultRole() {
  return await prisma.role.findUnique({
    where: { id: "default" },
  });
}

export async function getGlobalEditions() {
  return await prisma.edition.findMany({
    orderBy: [
      { started_at: { sort: "desc", nulls: "last" } },
      { name: "asc" },
    ],
  });
}

export async function getUserForms(userId: number) {
  return await prisma.form.findMany({
    orderBy: { created_at: "desc" },
    include: {
      responses: {
        where: { user_id: userId },
      },
    },
  });
}
