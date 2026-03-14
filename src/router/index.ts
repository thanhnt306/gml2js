import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'login',
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

    if (to.matched.some(record => record.meta.requiresAuth)) {
        // If we don't have an access token in memory
        if (!authStore.accessToken) {
            try {
                console.log('No access token, attempting refresh...')
                // Try to refresh the token using the HttpOnly cookie
                await authStore.refresh()
                console.log('Refresh successful, fetching user...')
                // If successful, we can also fetch the user profile if needed here, 
                // or let the components handle it. Let's fetch it to be safe.
                await authStore.fetchUser()
                console.log('Auth check complete, proceeding.')
                next()
            } catch (error) {
                console.warn('Auth check failed:', error)
                // Refresh failed (no cookie, expired, etc.), must login
                next({ name: 'login' })
            }
        } else {
            // Token exists in memory, proceed
            next()
        }
    } else {
        // Route doesn't require auth
        next()
    }
})

export default router
