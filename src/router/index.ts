import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        redirect: () => ({ name: 'login' }) // placeholder, handled by beforeEach
    },
    {
        path: '/login',
        name: 'login',
        meta: { guestOnly: true },
        component: () => import('../views/Login.vue')
    },
    {
        path: '/app',
        component: () => import('../layouts/MainLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: 'dashboard',
                name: 'dashboard',
                component: () => import('../views/Dashboard.vue')
            },
            {
                path: 'map',
                name: 'map',
                component: () => import('../views/Map.vue')
            },
            {
                path: 'zones',
                name: 'zones',
                component: () => import('../views/Zones.vue')
            },
            {
                path: 'management',
                name: 'management',
                component: () => import('../views/Management.vue')
            },
            {
                path: 'support',
                name: 'support',
                component: () => import('../views/Support.vue')
            },
            {
                path: 'settings',
                name: 'settings',
                component: () => import('../views/Settings.vue')
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    // Helper: attempt to restore session via refresh token cookie
    const tryRestoreSession = async (): Promise<boolean> => {
        if (authStore.accessToken) return true
        try {
            console.log('No access token, attempting refresh...')
            await authStore.refresh()
            await authStore.fetchUser()
            console.log('Session restored.')
            return true
        } catch {
            return false
        }
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const isGuestOnly  = to.matched.some(record => record.meta.guestOnly)
    const isHome       = to.name === 'home'

    if (requiresAuth) {
        // Protected route: must be authenticated
        const authenticated = await tryRestoreSession()
        if (authenticated) {
            next()
        } else {
            console.warn('Auth check failed, redirecting to login.')
            next({ name: 'login' })
        }
    } else if (isGuestOnly || isHome) {
        // /login and / : redirect to dashboard if already logged in
        const authenticated = await tryRestoreSession()
        if (authenticated) {
            next({ name: 'dashboard' })
        } else {
            next()
        }
    } else {
        next()
    }
})

export default router
