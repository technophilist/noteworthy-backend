import express from "express"
import helmet from "helmet"
import environmentVariables from "./environment-variables.js";
import authRouter from "./routers/auth-router.js";
import notesRouter from "./routers/notes-router.js";

const app = express()


// middlewares
// CRITICAL!: Without this, the rate limiter will consider proxies like load balancers
// as a single person trying to communicate with the server. Since all requests
// are routed through the proxies, the app will incorrectly rate limit the proxy,
// effectively rate limiting the entire website.
app.set("trust proxy", 1)
app.use(helmet())
app.use(express.json())
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/notes/", notesRouter)

// listen for requests
const PORT = environmentVariables.server.listenPort || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))