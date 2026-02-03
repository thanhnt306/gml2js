import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
    id: number
    username: string
    firstName: string
    lastName: string
    company: string
    email: string
    position: string
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isAuthenticated = ref<boolean>(false)

    const login = async (username: string, password: string): Promise<boolean> => {
        // Mock login logic
        console.log(`Attempting login for ${username}`)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (username === 'admin' && password === 'admin') {
            user.value = {
                id: 1,
                username: 'admin',
                firstName: 'Admin',
                lastName: 'User',
                company: 'EFAS',
                email: 'admin@efas.com',
                position: 'Administrator'
            }
            isAuthenticated.value = true
            return true
        }
        return false
    }

    const logout = (): void => {
        user.value = null
        isAuthenticated.value = false
    }

    return { user, isAuthenticated, login, logout }
})
