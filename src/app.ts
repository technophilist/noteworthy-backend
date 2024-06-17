import express from "express"
import dotEnv from "dotenv"
import helmet from "helmet"


const app = express()
dotEnv.config({path: import.meta.dirname + "/../.env"})

app.get("/", (req, res) => {
    res.send("<h1>Let's do this!</h1")
})

// middlewares
// CRITICAL!: Without this, the rate limiter will consider proxies like load balancers
// as a single person trying to communicate with the server. Since all requests
// are routed through the proxies, the app will incorrectly rate limit the proxy,
// effectively rate limiting the entire website.
app.set("trust proxy", 1)
app.use(helmet())

// listen for requests
const PORT = process.env.SERVER_LISTEN_PORT || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))