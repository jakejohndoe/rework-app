const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkResume() {
  const resume = await prisma.resume.findUnique({
    where: { id: 'cmbb3jplu0001sbqljb4j690j' }
  })
  console.log('Resume data:', JSON.stringify(resume, null, 2))
}

checkResume()
