import {
    UserEntity,
    authenticateUser,
    getRegisteredUsers,
    registerUser,
    unregisterUser,
    isUserRegistered
} from "../../src/services/auth-service"

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

describe("Auth Service Test", () => {
    afterEach(async () => {
        const registeredUsers = await getRegisteredUsers()
        for (const user of registeredUsers) {
            await unregisterUser(user.id)
        }
    })

    test("User with valid credentials is registered && unregistered successfully", async () => {
        const testEmail = "craig-federighi@email.com"
        const testPassword = "hair-force-one"

        const userId = await registerUser(testEmail, testPassword)
        let registeredUsers = await getRegisteredUsers()

        expect(registeredUsers.some((user) => user.email === testEmail)).toBe(true)

        await unregisterUser(userId)
        registeredUsers = await getRegisteredUsers()

        expect(registeredUsers.every((user) => user.email !== testEmail)).toBe(true)
    })

    test("Unregistering a non-existent user shouldn't throw an exception", async () => {
        await unregisterUser("0000-0000-0000-0000")
    })

    test("User authentication test - Registered user is authenticated successfully", async () => {
        const testEmail = "craig-federighi@email.com"
        const testPassword = "hair-force-one"

        const userId = await registerUser(testEmail, testPassword)
        const isUserAuthenticated = await authenticateUser(testEmail, testPassword)

        expect(isUserAuthenticated).not.toBe("wrong-password" )
        expect(isUserAuthenticated).not.toBe("non-existent-user")

        await unregisterUser(userId)
    })

    test("User authentication test - Non-existent user is not authenticated successfully", async () => {
        const testEmail = "craig-federighi@email.com"
        const testPassword = "hair-force-one"

        const isUserAuthenticated = await authenticateUser(testEmail, testPassword)
        expect(isUserAuthenticated).toBe("non-existent-user")

    })

    test("Registered users are fetched successfully", async () => {
        const emails = ["test1", "test2", "test3"]
        for (const email of emails) {
            await registerUser(email, "");
        }

        let registeredEmails = (await getRegisteredUsers()).map((user) => user.email)
        expect(registeredEmails.sort()).toEqual(emails.sort())

        for (const email of emails) {
            await unregisterUser(email);
        }

        registeredEmails = (await getRegisteredUsers()).map((user) => user.email)
        expect(registeredEmails).not.toEqual(emails)
    })

    test("Is user registered test - returns true if user is registered, else false", async () => {
        const testEmail = "craig-federighi@email.com"
        const testPassword = "hair-force-one"

        const userId = await registerUser(testEmail, testPassword)
        expect(await isUserRegistered(testEmail)).toBe(true)

        await unregisterUser(userId)
        expect(await isUserRegistered(testEmail)).toBe(false)
    })

})