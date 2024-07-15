import Router from "express"
import {
    createNewNoteForUser,
    deleteNoteOfUserWithId,
    getAllNotesOfUserWithId,
    updateNoteOfUserWithId
} from "../controllers/notes-controller.js";

const notesRouter = Router()

// create
notesRouter.post("/new", createNewNoteForUser)
// read
notesRouter.get("/all", getAllNotesOfUserWithId)
// update
notesRouter.put("/update", updateNoteOfUserWithId)
// delete
notesRouter.delete("/delete", deleteNoteOfUserWithId)

export default notesRouter