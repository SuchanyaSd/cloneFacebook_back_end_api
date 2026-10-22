const express = require("express")
const { login, getMe, register } = require("../controllers/auth_controller")
const authenticate = require("../middlewares/authenticate")
const authRoute = express.Router()

authRoute.post("/register", register)
authRoute.post("/login", login)
authRoute.get("/me", authenticate, getMe)

module.exports = authRoute