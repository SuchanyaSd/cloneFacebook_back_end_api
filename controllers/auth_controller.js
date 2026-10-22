const createError = require("../utils/createError");
const prisma = require("../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tryCatch = require("../utils/tryCatch");

function checkEmailorMobile(identity) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[0-9]{10,15}$/;

  let identityKey = "";
  if (emailRegex.test(identity)) {
    identityKey = "email";
  }
  if (mobileRegex.test(identity)) {
    identityKey = "mobile";
  }
  if (!identityKey) {
    createError(400, "Only Email or Mobile phone");
  }
  return identityKey;
}

module.exports.register = async (req, res, next) => {
  try {
    const { identity, firstName, lastName, password, confirmPassword } =
      req.body;
    // validation
    if (
      !(
        identity.trim() &&
        firstName.trim() &&
        lastName.trim() &&
        password.trim() &&
        confirmPassword.trim()
      )
    ) {
      createError(400, "Please fill all data");
    }

    if (password !== confirmPassword) {
      return createError(400, "please check confirm-password");
    }

    // identity เป็น email หรือ phone number
    const identityKey = checkEmailorMobile(identity);

    // หาว่ามี user นี้แล้วหรือยัง ???
    const findIdentity = await prisma.user.findUnique({
      where: {
        [identityKey]: identity,
      },
    });
    if (findIdentity) {
      createError(409, `Already have this user : ${identity}`);
    }

    const newUser = {
      [identityKey]: identity,
      password: bcrypt.hashSync(password, 10),
      firstName: firstName,
      lastName: lastName,
    };
    console.log(newUser);

    const result = await prisma.user.create({ data: newUser });
    console.log(result);

    res.json({ message: `Register successful`, result });
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { identity, password } = req.body;

    //validation
    if (!identity.trim() || !password.trim()) {
      createError(400, "Please fill all data");
    }
    //check email or mobile
    const identityKey = checkEmailorMobile(identity);

    //find user
    const foundUser = await prisma.user.findUnique({
      where: { [identityKey]: identity },
    });

    if (!foundUser) {
      createError(401, "Invalid Login");
    }

    //check password
    let passwordOk = await bcrypt.compare(password, foundUser.password);
    if (!passwordOk) {
      createError(401, "Invalid Login");
    }

    // create jwt token
    const payload = { id: foundUser.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    // delete foundUser.password
    // delete foundUser.createdAt
    // delete foundUser.updatedAt

    const {password : pw, createdAt, updatedAt, ...userData} = foundUser

    res.json({ message: "Login successful", token: token, user: userData });
  } catch (err) {
    next(err);
  }
};

// module.exports.login = tryCatch(async (req, res, next) => {
// 	    const { identity, password } = req.body;
	
// 	    //validation
// 	    if (!identity.trim() || !password.trim()) {
// 	      createError(400, "Please fill all data");
// 	    }
// 	    //check email or mobile
// 	    const identityKey = checkEmailorMobile(identity);
	
// 	    //find user
// 	    const foundUser = await prisma.user.findUnique({
// 	      where: { [identityKey]: identity },
// 	    });
	
// 	    if (!foundUser) {
// 	      createError(401, "Invalid Login");
// 	    }
	
// 	    //check password
// 	    let passwordOk = await bcrypt.compare(password, foundUser.password);
// 	    if (!passwordOk) {
// 	      createError(401, "Invalid Login");
// 	    }
	
// 	    // create jwt token
// 	    const payload = { id: foundUser.id };
// 	    const token = jwt.sign(payload, process.env.JWT_SECRET, {
// 	      expiresIn: "15d",
// 	    });
	
// 	    res.json({ message: "Login successful", token: token, user: foundUser });
// 	})

module.exports.getMe = async (req, res, next) => {
  try {
    res.json({ user : req.user });
  } catch (err) {
    next(err);
  }
};
