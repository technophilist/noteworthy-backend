import environmentVariables from "../environment-variables.js"
import bcrypt from "bcrypt"
import mysql, {RowDataPacket} from "mysql2/promise"
import {randomUUID} from "node:crypto";

// db config and credentials
const hostName = environmentVariables.dbConfig.hostName,
    databaseUsername = environmentVariables.dbConfig.username,
    databasePassword = environmentVariables.dbConfig.password,
    databaseName = environmentVariables.dbConfig.databaseName

/**
 * Establish a connection with the MySQL database
 * @returns {Promise<mysql.Connection>} A promise that resolves to the database connection
 */
const establishConnectionWithDatabase = async (): Promise<mysql.Connection> => {
    return await mysql.createConnection({
        host: hostName,
        database: databaseName,
        user: databaseUsername,
        password: databasePassword
    })
}

/**
 * Register a new user with the provided email and password
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<string>} A promise that resolves to the new user's user id.
 */
const registerUser = async (email: string, password: string): Promise<string> => {
    const connection = await establishConnectionWithDatabase()
    try {
        const userId = randomUUID()
        const passwordHash = await bcrypt.hash(password, 4)
        await connection.query(`INSERT IGNORE INTO users (user_id, email, password_hash) values (?, ?, ?);`, [userId, email, passwordHash])
        return userId
    } finally {
        await connection.end()
    }

}

/**
 * Unregister a user with the provided email
 * @param {string} userId - The id of the user to be unregistered
 * @returns {Promise<void>} A promise that resolves when the user is unregistered
 */

const unregisterUser = async (userId: string): Promise<void> => {
    const connection = await establishConnectionWithDatabase()
    try {
        await connection.query("DELETE FROM users WHERE user_id = ?", [userId])
    } finally {
        await connection.end()
    }
}


/**
 * Authenticate a user with the provided email and password
 * @param {string} email - The email of the user
 * @param {string} password - The password of the user
 * @returns {Promise<boolean>} A promise that resolves to a boolean value (true if authentication is successful)
 * or null if no user with the specified email exists.
 */

const authenticateUser = async (email: string, password: string): Promise<boolean | null> => {
    const connection = await establishConnectionWithDatabase()
    try {
        const [results] = await connection.query<RowDataPacket[]>("SELECT * FROM USERS WHERE email = ?", [email])
        const user = results[0]
        if (!user) return null
        return await bcrypt.compare(password, user.password_hash)
    } finally {
        await connection.end()
    }
}

/**
 * An entity representing containing the attributes of a user entity.
 * @property {number} id - The user's ID
 * @property {string} email - The user's email
 */
type UserEntity = {
    id: string,
    email: string
}

/**
 * Get a list of all registered users
 * @returns {Promise<Array<UserEntity>>} A promise that resolves to an array of UserEntity objects
 */
const getRegisteredUsers = async (): Promise<Array<UserEntity>> => {
    const connection = await establishConnectionWithDatabase()
    try {
        const [results] = await connection.query<RowDataPacket[]>("SELECT * FROM users;")
        return results.map((row) => {
            return {id: row.user_id, email: row.email}
        })
    } finally {
        await connection.end()
    }
}


/**
 * Check if a user with the provided email is registered
 * @param {string} email - The email of the user
 * @returns {Promise<boolean>} A promise that resolves to true if the user is registered, otherwise false
 */

const isUserRegistered = async (email: string): Promise<boolean> => {
    const connection = await establishConnectionWithDatabase()
    try {
        const [results] = await connection.query<RowDataPacket[]>("SELECT COUNT(*) as count FROM users where email = ?", [email])
        return results[0].count !== 0
    } finally {
        await connection.end()
    }
}

export {UserEntity, registerUser, isUserRegistered, unregisterUser, authenticateUser, getRegisteredUsers}



