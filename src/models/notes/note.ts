/**
 * Represents a note.
 *
 * @property {object} Note
 * @property {string} associatedUserId - The ID of the user associated with this note.
 * @property {string} title - The title of the note.
 * @property {string} content - The content of the note.
 */
type Note = {
    associatedUserId: string,
    title: string,
    content: string
}

/**
 * Metadata for a note.
 *
 * @property {number} noteId - The unique identifier of the note.
 * @property {string} createdEpochTimestamp - The timestamp when the note was created, in epoch format.
 */
type NoteMetadata = {
    noteId: number,
    createdEpochTimestamp: string
}

export {Note, NoteMetadata}