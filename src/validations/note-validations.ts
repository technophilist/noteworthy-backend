import {Note} from "../models/notes/note";

/**
 * Validates whether a provided note object is valid or not.
 *
 * @param note The note object to be validated.
 * @returns boolean value indicating whether the note is valid (true) or not (false).
 */
const isValidNote = (note?: Note): boolean => {
    return typeof note !== "undefined"
        && note.title.length !== 0
        && note.content.length !== 0
        && note.associatedUserId.length !== 0

}

export {isValidNote}