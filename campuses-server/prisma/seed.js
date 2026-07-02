const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const campus1 = await prisma.campus.create({
    data: {
      name: 'Hunter College',
      address: '695 Park Ave, New York, NY',
      description: 'A CUNY senior college in Manhattan.',
    },
  })

  const campus2 = await prisma.campus.create({
    data: {
      name: 'Baruch College',
      address: '55 Lexington Ave, New York, NY',
      description: 'A CUNY senior college known for business.',
    },
  })

  await prisma.student.createMany({
    data: [
      { firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com', gpa: 3.8, campusId: campus1.id },
      { firstName: 'Bob', lastName: 'Jones', email: 'bob@example.com', gpa: 3.2, campusId: campus1.id },
      { firstName: 'Carla', lastName: 'Diaz', email: 'carla@example.com', gpa: 3.9, campusId: campus2.id },
      { firstName: 'Dan', lastName: 'Lee', email: 'dan@example.com', gpa: 2.9, campusId: null },
    ],
  })
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())