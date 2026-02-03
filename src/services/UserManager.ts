// Mock for C++ UserManager singleton

export interface User {
    id: number
    username: string
    firstName: string
    lastName: string
    company: string
    email: string
    position: string
}

export interface UserInfo {
    username: () => string
    first_name: () => string
    last_name: () => string
    company: () => string
    position: () => string
    email: () => string
    id: () => number
}

class UserManager {
    private _currentUser: User

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

    currentUserInfo(): UserInfo {
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

    isAccountExist(username: string): boolean {
        // Mock check
        return username.toLowerCase() === 'admin'
    }
}

export default new UserManager()
