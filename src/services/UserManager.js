// Mock for C++ UserManager singleton

class UserManager {
    constructor() {
        this._currentUser = {
            id: 1,
            username: "admin",
            firstName: "Admin",
            lastName: "User",
            company: "EFAS",
            email: "admin@efas.com",
            position: "Manager"
        }
    }

    currentUserInfo() {
        // In C++ this returned a QObject with properties. Here we return a JS object.
        // We mimic the function calls as properties or functions depending on usage.
        // QML usage: UserManager.currentUserInfo().username()
        const user = this._currentUser
        return {
            username: () => user.username,
            first_name: () => user.firstName,
            last_name: () => user.lastName,
            company: () => user.company,
            position: () => user.position,
            email: () => user.email,
            id: () => user.id
        }
    }

    isAccountExist(username) {
        // Mock check
        return username.toLowerCase() === 'admin'
    }
}

export default new UserManager()
