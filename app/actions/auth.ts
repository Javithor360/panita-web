'use server'

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { loginSession, logoutSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const ign = formData.get('ign') as string;
  const password = formData.get('password') as string;

  if (!ign || !password) {
    return { error: 'Por favor ingresa IGN y contraseña.' };
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { ign: { equals: ign, mode: 'insensitive' } },
          { discord_name: { equals: ign, mode: 'insensitive' } }
        ]
      }
    });

    if (!user) {
      return { error: 'Credenciales incorrectas o usuario no encontrado.' };
    }

    if (!user.enabled) {
      return { error: 'Esta cuenta aún no ha sido activada o está deshabilitada.' };
    }

    if (!user.password) {
      return { error: 'Esta cuenta no tiene contraseña configurada. Debes activarla primero.' };
    }

    async function verifyPassword(password: string, hash: string) {
      return await bcrypt.compare(password, hash);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return { error: 'Credenciales incorrectas.' };
    }

    await loginSession(user.id);
  } catch (error) {
    // Si es un error de redirección de Next.js, lo dejamos pasar
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error('Error in loginAction:', error);
    return { error: 'Ocurrió un error inesperado al intentar iniciar sesión.' };
  }

  redirect('/profile');
}

export async function logoutAction() {
  await logoutSession();
  redirect('/');
}
