import express from "express";
import dotEnv from "dotenv";
const app = express();
dotEnv.config({ path: import.meta.dirname + "/../.env" });
app.get("/", (req, res) => {
    res.send("<h1>Let's do this!</h1");
});
// listen for requests
const PORT = process.env.SERVER_LISTEN_PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
