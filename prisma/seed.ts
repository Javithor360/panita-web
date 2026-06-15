import 'dotenv/config'
import prisma from '../lib/prisma'
import { EDITIONS, CATEGORIES } from '../lib/constants'

async function main() {
  console.log(`Start seeding ...`)
  
  // Seed Editions
  for (const edition of EDITIONS) {
    const existing = await prisma.edition.findUnique({ where: { id: edition.id } })
    if (!existing) {
      const result = await prisma.edition.create({
        data: {
          id: edition.id,
          name: edition.label,
          started_at: edition.started_at ? new Date(edition.started_at) : undefined,
          discord_role_id: edition.discord_role_id,
        },
      })
      console.log(`Created edition: ${result.name}`)
    } else {
      await prisma.edition.update({
        where: { id: edition.id },
        data: { 
          name: edition.label,
          started_at: edition.started_at ? new Date(edition.started_at) : undefined,
          discord_role_id: edition.discord_role_id || undefined,
        }
      })
      console.log(`Updated edition: ${existing.name}`)
    }
  }

  // Seed Categories
  for (const category of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { id: category.id } })
    if (!existing) {
      const result = await prisma.category.create({
        data: {
          id: category.id,
          name: category.label,
          icon: category.iconName,
          color: category.color,
        },
      })
      console.log(`Created category: ${result.name}`)
    } else {
      await prisma.category.update({
        where: { id: category.id },
        data: { 
          name: category.label,
          icon: category.iconName,
          color: category.color,
        }
      })
      console.log(`Updated category: ${existing.name}`)
    }
  }
  
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
