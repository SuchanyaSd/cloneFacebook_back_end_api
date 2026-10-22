const prisma = require("../models/index")
require ("dotenv").config()


// Beware order of table to delete
async function resetDatabase () {
    const tableNames = Object.keys(prisma).filter(key => !key.startsWith("$") && !key.startsWith("_"))
    console.log(tableNames)

    for(let table of tableNames) {
        console.log(`Reset DB & Auto_increment : ${table}`)
        await prisma[table].deleteMany()
        await prisma.$executeRawUnsafe(`Alter Table \`${table}\` auto_increment = 1 `)
    }
}

console.log("Reset Database.....")
resetDatabase()