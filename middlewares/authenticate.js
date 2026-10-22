const createError = require("../utils/createError");
const jwt = require("jsonwebtoken");
const prisma = require("../models/index");

module.exports = async (req, res, next) => {
  try {
    // check headers ของ http request ต้องมี authorization
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      createError(401, "Unzuthorized 1");
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      createError(401, "Unzuthorized 2");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload);

    // เอา payload.id ไปหา user
    const foundUser = await prisma.user.findUnique({
      where: { id: payload.id },
    });
    console.log(foundUser);

    // สร้าง userData ที่ไม่มี key : password, createdAt, updatedAt
    const { password, createdAt, updatedAt, ...userData } = foundUser;
    console.log(userData);

    // ฝากข้อมูล user ไว้ที่ req object : key ชื่อ
    req.user = userData;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
