const bcrypt = require('bcrypt');

const emailLookup = (email, database) => {
    for (let userAccount in database) {
        if (database[userAccount]['email'] === email) {
            return userAccount
        }
    }
}

const generateRandomString = () => {
    return Math.random().toString(36).replace('0.', '').substr(0, 6)
}


const loginChecker = (email, password, database) => {
    if (emailLookup(email, database)) {
        let userID = emailLookup(email, database)
        if(bcrypt.compareSync(password, database[userID]['hashedPassword'])) {
            return true
        } else {
            return 'WrongP'
        }
    } else if (!emailLookup(email, database)) {
        return 'NoEmail'
    }
}

const urlsForUser = (id, database) => {
    const newObject = {}
    for (let key in database) {
        if (id === database[key]['userID']) {
            newObject[key] = database[key]
        }
    }
    return newObject
}


module.exports = { emailLookup, generateRandomString, loginChecker, urlsForUser }