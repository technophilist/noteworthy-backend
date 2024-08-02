import {Request, Response} from "express"
import {authenticateUser, registerUser} from "../services/auth-service.js";
import {areValidCredentials} from "../validations/auth-validations.js";

/**
 * Error message to be sent for internal server errors.
 */
const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error."

/**
 * Error message to be sent when invalid credentials are received.
 */
const INVALID_CREDENTIALS_ERROR_MESSAGE = "Invalid Credentials."

/**
 * Registers a new user.
 *
 * @param {Request} req - The request object from Express, expected to contain user credentials in the body.
 * @param {Response} res - The response object from Express.
 */
const registerNewUser = async (req: Request, res: Response) => {
    const body = req.body

    if (!areValidCredentials(body)) {
        res.status(400).send({error: INVALID_CREDENTIALS_ERROR_MESSAGE})
        return
    }

    const email = body.email, password = body.password

    try {
        const userId = await registerUser(email, password)
        res.status(200).send({userId: userId})
    } catch (error) {
        res.status(500).send({error: INTERNAL_SERVER_ERROR_MESSAGE})
    }
}

/**
 * Authenticates a user.
 *
 * @param {Request} req - The request object from Express, expected to contain user credentials in the body.
 * @param {Response} res - The response object from Express.
 */
const login = async (req: Request, res: Response) => {
    const body = req.body

    if (!areValidCredentials(body)) {
        res.status(400).send({error: INVALID_CREDENTIALS_ERROR_MESSAGE})
        return
    }

    const email = body.email, password = body.password
    try {
        const isUserSuccessfullyAuthenticated = await authenticateUser(email, password)
        if (isUserSuccessfullyAuthenticated === null) {
            res.status(401).send({error: "User with the specified email doesn't exist."})
            return
        }
        if (isUserSuccessfullyAuthenticated) {
            res.status(200).send({success: "User authenticated successfully."})
            return
        }
        res.status(401).send({error: "Invalid credentials - email or password incorrect."})
    } catch (error) {
        res.status(500).send({error: INTERNAL_SERVER_ERROR_MESSAGE})
    }
}

export {registerNewUser, login}




