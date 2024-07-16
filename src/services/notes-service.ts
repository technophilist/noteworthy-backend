import environmentVariables from "../environment-variables.js"
import mysql, {RowDataPacket} from "mysql2/promise"
import {Note, NoteMetadata} from "../models/notes/note.js"

/**
 * Creates a new connection pool to the MySQL database using environment variables for configuration.
 *
 * @returns A promise that resolves to the created MySQL connection pool.
 */
const createNewMysqlConnectionPool = () => {
    return mysql.createPool({
        host: environmentVariables.dbConfig.hostName,
        database: environmentVariables.dbConfig.databaseName,
        user: environmentVariables.dbConfig.username,
        password: environmentVariables.dbConfig.password,
        connectionLimit: 12,
        maxIdle: 0
    })
}

let isConnectionPoolClosed = false
let mysqlConnectionPool = createNewMysqlConnectionPool()


/**
 * Releases all resources held by the service.
 * Note: If you are testing and you notice that the tests are running indefinitely without getting completed,
 * there is a very high chance that the issue might be because you did not call this method.
 *
 * @returns A promise that resolves when the connection pool is closed.
 */
const releaseResources = async () => { // after releasing you cannot
    try {
        await mysqlConnectionPool.end()
        isConnectionPoolClosed = true
    } catch (e) {
        console.warn(`An error occurred when closing the mysql connection. - ${e}`)
    }
}

/**
 * Retrieves a connection from the MySQL connection pool, ensuring that the pool is active.
 * If the connection pool is closed, it will be recreated.
 *
 * @returns A promise that resolves to a connection object from the pool.
 */
const getActiveConnectionFromPool = () => {
    if (isConnectionPoolClosed) {
        mysqlConnectionPool = createNewMysqlConnectionPool()
        isConnectionPoolClosed = false
    }
    return mysqlConnectionPool.getConnection()
}

/**
 * Creates a new note in the database.
 *
 * @param note The note to be created.
 *
 * @returns A promise that resolves to the id of the note if it is created successfully.
 */
const createNewNote = async (note: Note): Promise<number | null> => {
    const connection = await getActiveConnectionFromPool()
    try {
        const {associatedUserId, title, content} = note
        const currentDateTimeMillis = String(Date.now())
        const [result] = await connection.query(
            "INSERT INTO notes (user_id, title, content, created_epoch_timestamp) VALUES (?, ?, ?, ?);",
            [associatedUserId, title, content, currentDateTimeMillis]
        )
        // @ts-ignore
        return result.insertId
    } finally {
        connection.release()
    }
}

/**
 * Retrieves all notes associated with a specific user from the database.
 *
 * @param userId The id of the user whose notes should be retrieved.
 *
 * @returns A promise that resolves to an array of objects containing note and metadata information.
 *          Each object contains properties from both the NoteEntity and NoteMetadataEntity types.
 */
const getAllNotesOfUser = async (userId: string): Promise<Array<Note & NoteMetadata>> => {
    const connection = await getActiveConnectionFromPool()
    try {
        const [results] = await connection.query<RowDataPacket[]>("SELECT * FROM notes WHERE user_id = ?", [userId])
        return results.map((row) => {
            return {
                associatedUserId: row.user_id,
                title: row.title,
                content: row.content,
                noteId: row.note_id,
                createdEpochTimestamp: row.created_epoch_timestamp
            }
        })
    } finally {
        connection.release()
    }
}

/**
 * Updates an existing note in the database with the provided information.
 * Only updates title or content if the corresponding property is provided in the updatedNote object.
 *
 * @param noteId The ID of the note to be updated.
 * @param updatedNote An object containing the updated information of the note.
 *
 * @returns Promise<boolean> A promise that resolves to true if the note with the specified note ID was updated successfully,
 * or false if no such note was found or if both of the properties of the updatedNote were unspecified.
 */
const updateNoteWithId = async (noteId: number, updatedNote: { updatedTitle?: string, updatedContent?: string }) => {
    if (!updatedNote.updatedTitle && !updatedNote.updatedContent) return false

    const connection = await getActiveConnectionFromPool()
    try {
        let didNoteExist = false
        if (updatedNote.updatedTitle) {
            const [resultSetHeader] = await connection.query("UPDATE notes SET title = ? where note_id = ?", [updatedNote.updatedTitle, noteId])
            // @ts-ignore
            didNoteExist = didNoteExist || resultSetHeader.fieldCount !== 0
        }
        if (updatedNote.updatedContent) {
            const [resultSetHeader] = await connection.query("UPDATE notes SET content = ? where note_id = ?", [updatedNote.updatedContent, noteId])
            // @ts-ignore
            didNoteExist = didNoteExist || resultSetHeader.fieldCount !== 0
        }
        return didNoteExist
    } finally {
        connection.release()
    }
}

/**
 * Deletes a note from the database identified by the provided ID.
 *
 * @param noteId The ID of the note to be deleted.
 *
 * @returns A promise that resolves to true when the note is deleted or false when a note
 * with the specified noteId was not found.
 */
const deleteNoteWithId = async (noteId: number): Promise<Boolean> => {
    const connection = await getActiveConnectionFromPool()
    try {
        const [resultSetHeader] = await connection.query("DELETE FROM notes where note_id = ?", [noteId])
        // @ts-ignore
        return resultSetHeader.fieldCount !== 0
    } finally {
        connection.release()
    }
}

export {
    createNewNote,
    getAllNotesOfUser,
    updateNoteWithId,
    deleteNoteWithId,
    releaseResources
}