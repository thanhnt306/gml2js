import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)

    const login = async (username, password) => {
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

    const logout = () => {
        user.value = null
        isAuthenticated.value = false
    }

    return { user, isAuthenticated, login, logout }
})
