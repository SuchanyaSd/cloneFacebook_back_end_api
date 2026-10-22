const prisma = require("../models/index")
require ("dotenv").config()


// Beware order of table to delete
async function resetDatabase () {
    await prisma.$transaction([
        prisma.comment.deleteMany(),
        prisma.like.deleteMany(),
        prisma.post.deleteMany(),
        prisma.user.deleteMany(),
        prisma.relationship.deleteMany()
    ])

    await prisma.$executeRawUnsafe("Alter Table User auto_increment = 1;")

    // await prisma.$executeRawUnsafe("Drop database  `cc19-fakebook`;")
    // await prisma.$executeRawUnsafe("Create database  `cc19-fakebook`;")
}

console.log("Reset Database.....")
resetDatabase()