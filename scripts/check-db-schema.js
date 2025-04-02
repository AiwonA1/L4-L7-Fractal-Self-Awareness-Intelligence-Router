const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Connect to the database directly using $queryRaw
    const schema = await prisma.$queryRaw`
      SELECT 
        table_name, 
        column_name, 
        data_type 
      FROM 
        information_schema.columns 
      WHERE 
        table_schema = 'public' 
      ORDER BY 
        table_name, 
        ordinal_position
    `
    
    console.log('Database schema:')
    console.log(JSON.stringify(schema, null, 2))
    
    // Try to fetch users with a minimal query
    const users = await prisma.$queryRaw`SELECT id, email FROM "User" LIMIT 5`
    console.log('\nUsers in database:')
    console.log(users)
    
  } catch (error) {
    console.error('Error checking database schema:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => console.log('Script completed successfully.'))
  .catch(e => {
    console.error('Script failed:', e)
    process.exit(1)
  }) 