const { PrismaClient } = require('@prisma/client');

async function checkCalculations() {
  const prisma = new PrismaClient();
  
  try {
    const calcs = await prisma.property_calculations.findMany();
    console.log('Calculations count:', calcs.length);
    console.log('First calculation:', calcs[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCalculations();