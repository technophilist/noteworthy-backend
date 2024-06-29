/**
 * Regular expression to validate an email address.
 */
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

/**
 * Checks if the provided credentials object contains valid email and password fields.
 *
 * @param {Object} credentials - The credentials object containing email and password.
 * @param {string} [credentials.email] - The email address to be validated.
 * @param {string} [credentials.password] - The password to be validated.
 * @returns {boolean} Returns true if both email and password are valid, otherwise false.
 */
const areValidCredentials = (credentials?: { email?: string, password?: string }): boolean => {
    if (!credentials) return false

    const email = credentials.email, password = credentials.password
    if (!email || !password) return false

    // email
    const isEmailBlankEmptyOrBlank = email.length === 0 || email.trim().length === 0
    if (isEmailBlankEmptyOrBlank || !emailRegex.test(email)) return false

    // todo: password validations

    return true
}

export {areValidCredentials}