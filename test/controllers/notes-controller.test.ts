import {Request, Response} from "express"
import {Note, NoteMetadata} from "../../src/models/notes/note";
import {randomUUID} from "node:crypto";
import {createNewNoteForUser, getAllNotesOfUserWithId} from "../../src/controllers/notes-controller";


jest.mock("../../src/services/notes-service", () => {
    const map = new Map<string, Array<Note & NoteMetadata>>()
    const existingTestUserId = "userIdOfTestUser"
    map.set(existingTestUserId, [
        {
            associatedUserId: existingTestUserId,
            title: "title #1",
            content: "content #1",
            noteId: 1,
            createdEpochTimestamp: String(Date.now())
        },
        {
            associatedUserId: existingTestUserId,
            title: "title #2",
            content: "content #2",
            noteId: 2,
            createdEpochTimestamp: String(Date.now())
        },
        {
            associatedUserId: existingTestUserId,
            title: "title #3",
            content: "content #3",
            noteId: 3,
            createdEpochTimestamp: String(Date.now())
        }
    ])

    return {
        createNewNote: async (note: Note) => {
            let notesArray = []
            if (map.has(note.associatedUserId)) {
                notesArray = map.get(note.associatedUserId)!
            } else {
                map.set(note.associatedUserId, [])
            }
            notesArray.push({
                ...note,
                noteId: randomUUID(),
                createdEpochTimestamp: String(Date.now()),
            })
        },
        getAllNotesOfUser: async (userId: string) => map.get(userId) ?? [],
        updateNoteWithId: async () => {
            throw Error("Not implemented")
        },
        deleteNoteWithId: async () => {
            throw Error("Not implemented")
        },
        releaseResources: jest.fn()
    }
})

describe("notes-controller test", () => {

    const existingTestUserId = "userIdOfTestUser" // ensure that this is used in jest.mock()!


    test("Request to create new note with missing body must return a response with status code set to 400", async () => {
        const request: Partial<Request> = {}
        const response: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const statusSpy = jest.spyOn(response, "status")
        
        await createNewNoteForUser(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(400)
    })

    test("Request to create a valid new note must return a response with status code set to 200", async () => {
        const request: Partial<Request> = {
            body: {
                userId: "userId",
                title: "title",
                content: "content"
            }
        }
        const response: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const statusSpy = jest.spyOn(response, "status")

        await createNewNoteForUser(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(200)
    })

    test("Request to get all notes of a non-existent user must return an empty list", async () => {
        const request: Partial<Request> = {
            query: {userId: "randomUserId"}
        }
        const response: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const statusSpy = jest.spyOn(response, "status")
        const jsonSpy = jest.spyOn(response, "json")

        await getAllNotesOfUserWithId(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(200)
        expect(jsonSpy).toHaveBeenCalledWith([])
    })

    test("Request to get all notes of an existing user must returns a non empty list", async () => {
        const request: Partial<Request> = {
            query: {userId: existingTestUserId}
        }
        const response: Partial<Response> = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const statusSpy = jest.spyOn(response, "status")
        const jsonSpy = jest.spyOn(response, "json")

        await getAllNotesOfUserWithId(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(200)
        expect(jsonSpy).not.toHaveBeenLastCalledWith([])
    })

})