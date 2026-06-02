import 'dotenv/config'
import prisma from '../lib/prisma'
import { EDITIONS, CATEGORIES } from '../lib/constants'

async function main() {
  console.log(`Start seeding ...`)
  
  // Seed Editions
  for (const edition of EDITIONS) {
    const existing = await prisma.edition.findFirst({ where: { name: edition.label } })
    if (!existing) {
      const result = await prisma.edition.create({
        data: {
          name: edition.label,
          icon: edition.iconName,
        },
      })
      console.log(`Created edition: ${result.name}`)
    } else {
      await prisma.edition.update({
        where: { id: existing.id },
        data: { icon: edition.iconName }
      })
      console.log(`Updated edition: ${existing.name}`)
    }
  }

  // Seed Categories
  for (const category of CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { name: category.label } })
    if (!existing) {
      const result = await prisma.category.create({
        data: {
          name: category.label,
          icon: category.iconName,
        },
      })
      console.log(`Created category: ${result.name}`)
    } else {
      await prisma.category.update({
        where: { id: existing.id },
        data: { icon: category.iconName }
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
