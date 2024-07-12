import {Request, Response} from "express"
import {createNewNote, getAllNotesOfUser} from "../services/notes-service.js"
import {Note} from "../models/notes/note.js";
import {isValidNote} from "../validations/note-validations.js";

/**
 * Creates a new note for a user.
 * 
 * @param req The Express request object containing the user's note data in the body.
 * The request object must contain an object with the fields title, content and userId.
 * @param res The Express response object used to send responses back to the client.
 */
const createNewNoteForUser = async (req: Request, res: Response) => {
    const requestBody = req.body
    if (!requestBody || !requestBody.title || !requestBody.content || !requestBody.userId) {
        res.status(400).json({error: "Missing or invalid body."});
        return
    }

    const newNote: Note = {
        associatedUserId: requestBody.userId,
        title: requestBody.title,
        content: requestBody.content
    }

    if (!isValidNote(newNote)) {
        res.status(400).json({error: "Missing or invalid body."})
        return
    }

    try {
        const noteId = await createNewNote(newNote)
        res.status(200).json({noteId: noteId})
    } catch (error) {
        return res.status(500).json({error: "Internal server error."})
    }
}

/**
 * Retrieves all notes associated with a specific user ID.
 * 
 * @param req The Express request object containing the user ID in the query parameters.
 * @param res The Express response object used to send responses back to the client.
 */
const getAllNotesOfUserWithId = async (req: Request, res: Response) => {
    const userId = req.query.userId

    if (!userId || typeof userId !== "string") {
        res.status(400).json({error: "Missing or invalid userId parameter"})
        return
    }

    try {
        const notes = await getAllNotesOfUser(userId)
        const notesArray: Array<{ noteId: number, createdAtTimestamp: string, title: string, content: string }> = []
        for (const note of notes) {
            notesArray.push({
                noteId: note.noteId,
                createdAtTimestamp: note.createdEpochTimestamp,
                title: note.title,
                content: note.content
            })
        }
        res.status(200).json(notesArray)
    } catch (error) {
        return res.status(500).json({error: "Internal server error"})
    }

}

export {createNewNoteForUser, getAllNotesOfUserWithId}
