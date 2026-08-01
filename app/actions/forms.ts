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
  
  if (!user || !user.roles.some((r) => r.id === 'admin' || r.id === 'mod')) {
    throw new Error("Unauthorized: Admin or Mod only")
  }
  return user.id;
}

export async function getAdminForms() {
  await checkAdmin();
  return prisma.form.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      _count: {
        select: { responses: true, sections: true }
      }
    }
  });
}

export async function createForm(title: string, slug: string) {
  const userId = await checkAdmin();
  
  try {
    const form = await prisma.form.create({
      data: {
        title,
        slug,
        creator_id: userId,
        // Create an initial empty section
        sections: {
          create: {
            title: 'Sección 1',
            position: 0
          }
        }
      }
    });
    revalidatePath('/admin/forms');
    revalidatePath('/profile');
    return { success: true, formId: form.id };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: 'Ya existe un formulario con ese enlace (slug).' };
    }
    return { error: 'Error interno al crear el formulario.' };
  }
}

export async function toggleFormStatus(id: string, isOpen: boolean) {
  await checkAdmin();
  await prisma.form.update({
    where: { id },
    data: { is_open: isOpen }
  });
  revalidatePath('/admin/forms');
  revalidatePath('/profile');
  return { success: true };
}

export async function deleteForm(id: string) {
  await checkAdmin();
  await prisma.form.delete({ where: { id } });
  revalidatePath('/admin/forms');
  revalidatePath('/profile');
  return { success: true };
}

export async function getFormFull(id: string) {
  await checkAdmin();
  return prisma.form.findUnique({
    where: { id },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: {
          questions: {
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateFormStructure(formId: string, title: string, description: string | null, sections: any[]) {
  await checkAdmin();
  
  // We need to do a smart upsert to not lose answers for existing questions.
  // 1. Get current sections and questions to know what to delete
  const current = await prisma.form.findUnique({
    where: { id: formId },
    include: { sections: { include: { questions: true } } }
  });
  
  if (!current) return { error: 'Formulario no encontrado' };

  const newSectionIds = sections.filter(s => !s.isNew).map(s => s.id);
  const newQuestionIds = sections.flatMap(s => s.questions).filter(q => !q.isNew).map(q => q.id);

  const sectionsToDelete = current.sections.filter(s => !newSectionIds.includes(s.id)).map(s => s.id);
  const questionsToDelete = current.sections.flatMap(s => s.questions).filter(q => !newQuestionIds.includes(q.id)).map(q => q.id);

  // 2. Transaction
  await prisma.$transaction(async (tx) => {
    // Update form details
    await tx.form.update({
      where: { id: formId },
      data: { title, description }
    });

    // Delete removed items
    if (questionsToDelete.length > 0) {
      await tx.formQuestion.deleteMany({ where: { id: { in: questionsToDelete } } });
    }
    if (sectionsToDelete.length > 0) {
      await tx.formSection.deleteMany({ where: { id: { in: sectionsToDelete } } });
    }

    // Upsert sections
    for (let sIndex = 0; sIndex < sections.length; sIndex++) {
      const sec = sections[sIndex];
      let dbSectionId = sec.id;
      
      if (sec.isNew) {
        const created = await tx.formSection.create({
          data: {
            form_id: formId,
            title: sec.title,
            description: sec.description,
            position: sIndex
          }
        });
        dbSectionId = created.id;
      } else {
        await tx.formSection.update({
          where: { id: sec.id },
          data: { title: sec.title, description: sec.description, position: sIndex }
        });
      }

      // Upsert questions
      for (let qIndex = 0; qIndex < sec.questions.length; qIndex++) {
        const q = sec.questions[qIndex];
        
        if (q.isNew) {
          await tx.formQuestion.create({
            data: {
              section_id: dbSectionId,
              title: q.title,
              description: q.description,
              type: q.type,
              is_required: q.is_required,
              position: qIndex,
              options: q.options ? JSON.stringify(q.options) : undefined
            }
          });
        } else {
          await tx.formQuestion.update({
            where: { id: q.id },
            data: {
              section_id: dbSectionId,
              title: q.title,
              description: q.description,
              type: q.type,
              is_required: q.is_required,
              position: qIndex,
              options: q.options ? JSON.stringify(q.options) : undefined
            }
          });
        }
      }
    }
  });

  revalidatePath(`/admin/forms/${formId}/edit`);
  revalidatePath('/admin/forms');
  return { success: true };
}

export async function getPublicFormBySlug(slug: string, userId?: number) {
  const form = await prisma.form.findUnique({
    where: { slug },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: {
          questions: {
            orderBy: { position: 'asc' }
          }
        }
      }
    }
  });

  if (!form) return null;

  let hasResponded = false;
  if (userId) {
    const existing = await prisma.formResponse.findUnique({
      where: { form_id_user_id: { form_id: form.id, user_id: userId } }
    });
    hasResponded = !!existing;
  }

  return { form, hasResponded };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitFormResponse(formId: string, answers: Record<string, string | string[]>) {
  const session = await getSession();
  if (!session?.userId) return { error: "Debes iniciar sesión para votar" };
  
  const userId = session.userId;

  // Verify form is open
  const form = await prisma.form.findUnique({ where: { id: formId } });
  if (!form) return { error: "Formulario no encontrado" };
  if (!form.is_open) return { error: "Este formulario ya no acepta respuestas" };

  try {
    // We use a transaction to create the response and all answers at once
    await prisma.$transaction(async (tx) => {
      const response = await tx.formResponse.create({
        data: {
          form_id: formId,
          user_id: userId
        }
      });

      const answerData = Object.entries(answers).map(([questionId, value]) => ({
        response_id: response.id,
        question_id: questionId,
        value: Array.isArray(value) ? JSON.stringify(value) : value
      }));

      if (answerData.length > 0) {
        await tx.formAnswer.createMany({
          data: answerData
        });
      }
    });

    revalidatePath(`/forms/${form.slug}`);
    revalidatePath('/profile');
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "Ya has completado este formulario" };
    }
    console.error("Error submitting form:", error);
    return { error: "Error interno al enviar tus respuestas" };
  }
}

export async function getFormResults(formId: string) {
  await checkAdmin();
  
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      sections: {
        orderBy: { position: 'asc' },
        include: {
          questions: {
            orderBy: { position: 'asc' },
            include: {
              answers: true
            }
          }
        }
      },
      responses: {
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: { id: true, ign: true, discord_name: true }
          },
          answers: true
        }
      }
    }
  });

  return form;
}

export async function deleteFormResponse(responseId: string) {
  await checkAdmin();
  
  try {
    await prisma.$transaction([
      prisma.formAnswer.deleteMany({ where: { response_id: responseId } }),
      prisma.formResponse.delete({ where: { id: responseId } })
    ]);
    
    // We don't know the exact paths to revalidate here easily, but the client will refresh the router or we can revalidate common paths.
    revalidatePath('/admin/forms');
    
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting form response:", error);
    return { error: "Error interno al eliminar la respuesta" };
  }
}
