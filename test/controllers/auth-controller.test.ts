import {login, registerNewUser} from "../../src/controllers/auth-controller";
import {Request, Response} from "express"
// TODO: STOPSHIP// 1) In auth-controller.ts, import statement with .js makes jest not work, but without that running the app wont work

// jest.mock cannot be called inside before*(), because jest needs to run this call to mock
// before the import statements to switch out the dependencies.
// And that would not be possible to do in before*() because when the compiler reaches
// the point where before*() needs to get executed, the import statements would've
// been already executed.
jest.mock("../../src/services/auth-service", () => {
    const usersMap = new Map<string, string>()
    return {
        registerUser: async (email: string, password: string) => {
            usersMap.set(email, password)
            return Promise.resolve()
        },
        unregisterUser: async (email: string) => {
            if (usersMap.has(email)) {
                usersMap.delete(email)
            }
            return Promise.resolve()
        },
        authenticateUser: async (email: string, password: string) => {
            if (!usersMap.has(email)) {
                return Promise.resolve(null)
            }
            if (password !== usersMap.get(email)) {
                return Promise.resolve(false)
            }
            return Promise.resolve(true)
        },
        getRegisteredUsers: async () => {
            const users: Array<{ id: number, email: string }> = []
            let id = 0
            for (const [email, _] of usersMap) {
                users.push({id: id, email: email})
                id++
            }
            return Promise.resolve(users)
        },
        isUserRegistered: async (email: string) => Promise.resolve(usersMap.has(email))
    }
})

describe("auth-controller - registration tests", () => {
    
    test("A request to register a user with valid credentials must return a response with status 200", async () => {
        const request: Partial<Request> = {
            body: {
                email: "testemail@testemail.com",
                password: "password"
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }
        
        const statusSpy = jest.spyOn(response,"status")
        statusSpy.mockImplementation(jest.fn().mockReturnThis())
        

        await registerNewUser(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(200)
    })
    
    test("A request to register a user with invalid credentials must return a response with status 400", async () => {
        const request: Partial<Request> = {
            body: {
                email: "emailWithoutDomain",
                password: "password"
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }
        
        const statusSpy = jest.spyOn(response,"status")
        statusSpy.mockImplementation(jest.fn().mockReturnThis())
        

        await registerNewUser(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(400)
    })
})

describe("auth-controller - login tests", () => {

    const emailOfRegisteredTestUser = "test@test.com", passwordOfRegisteredTestUser = "password"

    beforeAll(async () => {
        const request: Partial<Request> = {
            body: {
                email: emailOfRegisteredTestUser,
                password: passwordOfRegisteredTestUser
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }
        
        const statusSpy = jest.spyOn(response,"status")
        statusSpy.mockImplementation(jest.fn().mockReturnThis())
        
        await registerNewUser(request as Request, response as Response)
        expect(statusSpy).toHaveBeenCalledWith(200)
    })

    test("A request to login without a req body returns a respose with status 400", async () => {
        const request: Partial<Request> = {}

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }

        const statusMethodSpy = jest.spyOn(response, "status")
        statusMethodSpy.mockImplementation(jest.fn().mockReturnThis())

        await login(request as Request, response as Response)
        expect(statusMethodSpy).toHaveBeenCalledWith(400)
    })

    test("A request to login with only the email in the req body returns a response with status 400", async () => {
        const request: Partial<Request> = {
            body: {
                email: "email"
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }

        const statusMethodSpy = jest.spyOn(response, "status")
        statusMethodSpy.mockImplementation(jest.fn().mockReturnThis())

        await login(request as Request, response as Response)
        expect(statusMethodSpy).toHaveBeenCalledWith(400)
    })

    test("A request to login with only the password in the req body returns a response with status 400", async () => {
        const request: Partial<Request> = {
            body: {
                password: "password"
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }

        const statusMethodSpy = jest.spyOn(response, "status")
        statusMethodSpy.mockImplementation(jest.fn().mockReturnThis())

        await login(request as Request, response as Response)
        expect(statusMethodSpy).toHaveBeenCalledWith(400)
    })

    test("A request to login with a registered user returns a response with status 200", async () => {
        const request: Partial<Request> = {
            body: {
                email: emailOfRegisteredTestUser,
                password: passwordOfRegisteredTestUser
            }
        }

        const response: Partial<Response> = {
            status: jest.fn(),
            send: jest.fn()
        }

        const statusMethodSpy = jest.spyOn(response, "status")
        statusMethodSpy.mockImplementation(jest.fn().mockReturnThis())

        await login(request as Request, response as Response)
        expect(statusMethodSpy).toHaveBeenCalledWith(200)
    })

})