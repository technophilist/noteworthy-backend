import Router from "express"
import {login, registerNewUser} from "../controllers/auth-controller.js"

const authRouter = Router()

/**
 * POST route for user registration.
 *
 * @param req Express.Request object containing the user's credentials.
 * @param res Express.Response object used to send a response to the client.
 */
authRouter.post("/register", registerNewUser)

/**
 * POST route for user login.
 * @param req Express.Request object containing the user's login credentials.
 * @param res Express.Response object used to send a response to the client.
 */
authRouter.post("/login", login)

export default authRouter