import {registerUser, unregisterUser} from "../../src/services/auth-service"
import {
    createNewNote,
    deleteNoteWithId,
    getAllNotesOfUser,
    NoteEntity, releaseResources,
    updateNoteWithId
} from "../../src/services/notes-service"

// need to mock this because import.meta.* is not supported in jest
jest.mock("../../src/environment-variables", () => {
    return {
        server: {
            listenPort: undefined
        },
        dbConfig: {
            hostName: "localhost",
            username: "root",
            password: "",
            databaseName: "noteworthy_db",
        }
    }
})
describe("Note controller tests", () => {
    const registeredTestUserEmail = "registeredTestUserEmail@email.com", registeredTestUserPassword = "password"

    beforeEach(async () => {
        await registerUser(registeredTestUserEmail, registeredTestUserPassword)
    })

    afterEach(async () => {
        await unregisterUser(registeredTestUserEmail)
        await releaseResources()
    })


    test("New note creation for an already registered user must be successfully created", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserEmail: registeredTestUserEmail,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)
        const notes = (await getAllNotesOfUser(registeredTestUserEmail)).filter((noteWithMetadata) => {
            return noteWithMetadata.registeredUserEmail === registeredTestUserEmail
        })
        expect(notes[0].registeredUserEmail).toBe(registeredTestUserEmail)
        expect(notes[0].title).toBe(testNoteTitle)
        expect(notes[0].content).toBe(testNoteContent)
    })

    test("New note creation for a nonregistered user must throw an error.", async () => {
        const unregisteredTestUserEmail = "abcabc@emailemail.com"
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserEmail: unregisteredTestUserEmail,
            title: testNoteTitle,
            content: testNoteContent
        }
        await expect(createNewNote(note)).rejects.toThrowError()
    })

    test("Get notes test - A request to fetch notes of a specific user must return a valid, existing list of notes.", async () => {
        const insertedNotes: Array<NoteEntity> = [
            {
                registeredUserEmail: registeredTestUserEmail,
                title: "testNoteTitle#1",
                content: "testNoteContent#1"
            },
            {
                registeredUserEmail: registeredTestUserEmail,
                title: "testNoteTitle#2",
                content: "testNoteContent#2"
            },
            {
                registeredUserEmail: registeredTestUserEmail,
                title: "testNoteTitle#3",
                content: "testNoteContent#3"
            }
        ]
        for (const note of insertedNotes) {
            await createNewNote(note);
        }

        const fetchedNotes = (await getAllNotesOfUser(registeredTestUserEmail)).map((noteWithMetadata): NoteEntity => {
            return {
                registeredUserEmail: noteWithMetadata.registeredUserEmail,
                title: noteWithMetadata.title,
                content: noteWithMetadata.content
            }
        })
        expect(fetchedNotes).toEqual(insertedNotes)
    })
    test("A valid existing note must be deleted successfully", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserEmail: registeredTestUserEmail,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)

        const fetchedNoteAfterInserting = (await getAllNotesOfUser(registeredTestUserEmail))[0]
        expect(fetchedNoteAfterInserting.title).toEqual(testNoteTitle)
        expect(fetchedNoteAfterInserting.content).toEqual(testNoteContent)

        await deleteNoteWithId(fetchedNoteAfterInserting.noteId)

        const fetchedNotesListAfterDeleting = await getAllNotesOfUser(registeredTestUserEmail)
        expect(fetchedNotesListAfterDeleting.length).toEqual(0)
    })

    test("An attempt to delete existing note must not throw an exception", async () => {
        expect(async () => await deleteNoteWithId(123123123)).not.toThrow()
    })

    test("A valid existing note must be updated successfully", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserEmail: registeredTestUserEmail,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)

        const fetchedNoteBeforeUpdating = (await getAllNotesOfUser(registeredTestUserEmail))[0]
        expect(fetchedNoteBeforeUpdating.title).toEqual(testNoteTitle)
        expect(fetchedNoteBeforeUpdating.content).toEqual(testNoteContent)
        
        // title
        const updatedTitle = "updatedTitle"
        await updateNoteWithId(fetchedNoteBeforeUpdating.noteId, {updatedTitle: updatedTitle})

        const fetchedNoteAfterUpdatingTitle = (await getAllNotesOfUser(registeredTestUserEmail))[0]
        expect(fetchedNoteAfterUpdatingTitle.title).toEqual(updatedTitle)
        expect(fetchedNoteAfterUpdatingTitle.content).toEqual(testNoteContent)
        
        // content
        const updatedContent = "updatedContent"
        await updateNoteWithId(fetchedNoteBeforeUpdating.noteId, {updatedContent: updatedContent})

        const fetchedNoteAfterUpdatingContent = (await getAllNotesOfUser(registeredTestUserEmail))[0]
        expect(fetchedNoteAfterUpdatingContent.title).toEqual(updatedTitle)
        expect(fetchedNoteAfterUpdatingContent.content).toEqual(updatedContent)
    })

})
    