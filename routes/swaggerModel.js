/**
 * @typedef Error 
 * @property {string} message
 */


/**
 * @typedef User
 * @property {string} id.required
 * @property {string} name.required
 * @property {string} email.required
 * @property {string} password.required
 * @property {enum} role.required  - Một trong các role sau đây: - eg: student, teacher, admin
 * @property {string} qrUrl
 * @property {string} avtUrl
 * @property {string[]} classes
 * @property {string} token
 */