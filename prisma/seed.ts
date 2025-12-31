import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.doctor.createMany({
    data: [
      { id: 'doc_001', name: 'Dr. Andi', specialization: 'Umum' },
      { id: 'doc_002', name: 'Dr. Budi', specialization: 'Gigi' },
    ],
    skipDuplicates: true,
  });

  await prisma.patient.createMany({
    data: [
      { id: 'pat_001', name: 'Siti', phone: '08123456789' },
      { id: 'pat_002', name: 'Ayu', phone: '08987654321' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed data inserted');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
