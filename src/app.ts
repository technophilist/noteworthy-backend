import express from "express"
import helmet from "helmet"
import environmentVariables from "./environment-variables.js";

const app = express()

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
const PORT = environmentVariables.server.listenPort || 3000
app.listen(PORT, () => console.log(`Listening on port ${PORT}`))