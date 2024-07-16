import {Request, Response} from "express"
import {createNewNote, deleteNoteWithId, getAllNotesOfUser, updateNoteWithId} from "../services/notes-service.js"
import {Note} from "../models/notes/note.js";
import {isValidNote} from "../validations/note-validations.js";


const INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error."
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
        return res.status(500).json({error: INTERNAL_SERVER_ERROR_MESSAGE})
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
        res.status(500).json({error: INTERNAL_SERVER_ERROR_MESSAGE})
    }
}

/**
 * Updates a note associated with the provided user ID.
 *
 * @param req - The incoming HTTP request object with the body set to a json object containing the
 * noteId, title and content.
 * @param res - The outgoing HTTP response object.
 */
const updateNoteOfUserWithId = async (req: Request, res: Response) => {
    const noteId = Number(req.body?.noteId)
    const newTitle = req.body?.title
    const newContent = req.body?.content

    if (!noteId || !newTitle || !newContent || Number.isNaN(noteId)) {
        res.status(400).json({error: "Missing or invalid request body."})
        return
    }

    try {
        const didNoteExist = await updateNoteWithId(noteId, {updatedTitle: newTitle, updatedContent: newContent})
        if (!didNoteExist) res.status(404).json({error: `Note with ${noteId} does not exist.`})
        else res.status(200).json({
            noteId: noteId,
            title: newTitle,
            content: newContent
        })
    } catch (error) {
        res.status(500).json({error: INTERNAL_SERVER_ERROR_MESSAGE})
    }
}
/**
 * Deletes a note associated with a specific user ID.
 *
 * Expects a request object (`req`) with a query parameter named `noteId` containing the ID of the note to delete.
 *
 * @param req - The HTTP request object with a query paramater named `noteId` containing the ID of the note.
 * @param res - The outgoing HTTP response object.
 */
const deleteNoteOfUserWithId = async (req: Request, res: Response) => {
    const noteId = req.query?.noteId

    if (!noteId) {
        res.status(400).json({error: "Missing or invalid noteId parameter"})
        return
    }

    try {
        const didNoteExist = await deleteNoteWithId(Number(noteId))

        if (!didNoteExist) res.status(404).json({error: `Note with ${noteId} does not exist.`})
        else res.status(200).json({success: "Successfully deleted the note."})

    } catch (error) {
        res.status(500).json({error: INTERNAL_SERVER_ERROR_MESSAGE})
    }
}
export {
    createNewNoteForUser,
    getAllNotesOfUserWithId,
    updateNoteOfUserWithId,
    deleteNoteOfUserWithId
}
