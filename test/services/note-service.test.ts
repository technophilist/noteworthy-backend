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
    let registeredUserId: string

    beforeEach(async () => {
        registeredUserId = await registerUser(registeredTestUserEmail, registeredTestUserPassword)
    })

    afterEach(async () => {
        await unregisterUser(registeredUserId)
        await releaseResources()
    })


    test("New note creation for an already registered user must be successfully created", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserId: registeredUserId,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)
        const notes = (await getAllNotesOfUser(registeredUserId)).filter((noteWithMetadata) => {
            return noteWithMetadata.registeredUserId === registeredUserId
        })
        expect(notes[0].registeredUserId).toBe(registeredUserId)
        expect(notes[0].title).toBe(testNoteTitle)
        expect(notes[0].content).toBe(testNoteContent)
    })

    test("New note creation for a nonregistered user must throw an error.", async () => {
        const unregisteredTestUserEmail = "abcabc@emailemail.com"
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserId: unregisteredTestUserEmail,
            title: testNoteTitle,
            content: testNoteContent
        }
        await expect(createNewNote(note)).rejects.toThrowError()
    })

    test("Get notes test - A request to fetch notes of a specific user must return a valid, existing list of notes.", async () => {
        const insertedNotes: Array<NoteEntity> = [
            {
                registeredUserId: registeredUserId,
                title: "testNoteTitle#1",
                content: "testNoteContent#1"
            },
            {
                registeredUserId: registeredUserId,
                title: "testNoteTitle#2",
                content: "testNoteContent#2"
            },
            {
                registeredUserId: registeredUserId,
                title: "testNoteTitle#3",
                content: "testNoteContent#3"
            }
        ]
        for (const note of insertedNotes) {
            await createNewNote(note);
        }

        const fetchedNotes = (await getAllNotesOfUser(registeredUserId)).map((noteWithMetadata): NoteEntity => {
            return {
                registeredUserId: noteWithMetadata.registeredUserId,
                title: noteWithMetadata.title,
                content: noteWithMetadata.content
            }
        })
        expect(fetchedNotes).toEqual(insertedNotes)
    })
    test("A valid existing note must be deleted successfully", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserId: registeredUserId,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)

        const fetchedNoteAfterInserting = (await getAllNotesOfUser(registeredUserId))[0]
        expect(fetchedNoteAfterInserting.title).toEqual(testNoteTitle)
        expect(fetchedNoteAfterInserting.content).toEqual(testNoteContent)

        await deleteNoteWithId(fetchedNoteAfterInserting.noteId)

        const fetchedNotesListAfterDeleting = await getAllNotesOfUser(registeredUserId)
        expect(fetchedNotesListAfterDeleting.length).toEqual(0)
    })

    test("An attempt to delete existing note must not throw an exception", async () => {
        expect(async () => await deleteNoteWithId(123123123)).not.toThrow()
    })

    test("A valid existing note must be updated successfully", async () => {
        const testNoteTitle = "testNoteTitle", testNoteContent = "testNoteContent"
        const note: NoteEntity = {
            registeredUserId: registeredUserId,
            title: testNoteTitle,
            content: testNoteContent
        }
        await createNewNote(note)

        const fetchedNoteBeforeUpdating = (await getAllNotesOfUser(registeredUserId))[0]
        expect(fetchedNoteBeforeUpdating.title).toEqual(testNoteTitle)
        expect(fetchedNoteBeforeUpdating.content).toEqual(testNoteContent)

        // title
        const updatedTitle = "updatedTitle"
        await updateNoteWithId(fetchedNoteBeforeUpdating.noteId, {updatedTitle: updatedTitle})

        const fetchedNoteAfterUpdatingTitle = (await getAllNotesOfUser(registeredUserId))[0]
        expect(fetchedNoteAfterUpdatingTitle.title).toEqual(updatedTitle)
        expect(fetchedNoteAfterUpdatingTitle.content).toEqual(testNoteContent)

        // content
        const updatedContent = "updatedContent"
        await updateNoteWithId(fetchedNoteBeforeUpdating.noteId, {updatedContent: updatedContent})

        const fetchedNoteAfterUpdatingContent = (await getAllNotesOfUser(registeredUserId))[0]
        expect(fetchedNoteAfterUpdatingContent.title).toEqual(updatedTitle)
        expect(fetchedNoteAfterUpdatingContent.content).toEqual(updatedContent)
    })

})
    