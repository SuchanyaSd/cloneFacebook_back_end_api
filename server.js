require("dotenv").config()
const express = require("express")
const notFound = require("./middlewares/notFound")
const errorMiddleware = require("./middlewares/errorMiddleware")
const authRoute = require("./routes/auth-route")
const postRoute = require("./routes/post-route")
const morgan = require("morgan")
const cors = require("cors")
const helmet = require("helmet")
const authenticate = require("./middlewares/authenticate")
const commentRoute = require('./routes/comment-route')
const likeRoute = require("./routes/like-route")
const app = express()

// app.use(cors({
//    origin : "http://localhost:5173"
// }))

app.use(morgan("dev"))
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use("/auth", authRoute)
app.use("/post", authenticate, postRoute)
app.use("/comment", authenticate, commentRoute)
app.use("/like", authenticate, likeRoute)

// notFound
app.use(notFound)

//error Middleware
app.use(errorMiddleware)

const port = process.env.PORT || 8000
app.listen(port, () => console.log(`Sever on ${port}`))
