<template>
  <div
    class="flex flex-col bg-[#060606] h-full transition-all duration-300 border-r border-gray-800"
    :class="[isCollapsed ? 'w-[65px]' : 'w-[22.2vw] min-w-[300px] max-w-[400px]']"
  >
    <!-- Header / Logo -->
    <div class="flex items-center mt-8 mb-16 pl-6 pr-4">
      <div v-if="!isCollapsed" class="flex items-center space-x-3 flex-1">
        <img src="../assets/images/logo_45x45.png" alt="Logo" class="w-[45px] h-[45px]" />
        <span class="text-white font-montserrat font-medium text-3xl">GAILL</span>
      </div>
      <button 
        @click="isCollapsed = !isCollapsed"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10"
      >
        <img :src="isCollapsed ? '/src/assets/images/expand_left_24x24.svg' : '/src/assets/images/expand_24x24.png'" alt="Toggle" />
      </button>
    </div>

    <!-- Menu Items -->
    <div class="flex-1 flex flex-col space-y-2">
      <NavButton
        v-for="item in menuItems"
        :key="item.name"
        :label="item.label"
        :icon="item.icon"
        :icon-active="item.iconActive"
        :active="currentRoute === item.route"
        :collapsed="isCollapsed"
        @click="$router.push(item.route)"
      />
    </div>

    <!-- Bottom Actions -->
    <div class="mb-4 flex flex-col space-y-2">
        <NavButton
            label="Support"
            icon="support_unpressed_26x26.svg"
            icon-active="support_pressed_26x26.svg"
            :active="currentRoute === '/app/support'"
            :collapsed="isCollapsed"
            @click="$router.push('/app/support')"
      />
       <NavButton
            label="Settings"
            icon="settings_unpressed_24x24.svg"
            icon-active="settings_pressed_24x24.svg"
            :active="currentRoute === '/app/settings'"
            :collapsed="isCollapsed"
            @click="$router.push('/app/settings')"
      />
      <NavButton
            label="Logout"
            icon="logout_unpressed_24x24.svg"
            icon-active="logout_unpressed_24x24.svg"
            :collapsed="isCollapsed"
            @click="logout"
      />
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavButton from './NavButton.vue'

const isCollapsed = ref(false)
const route = useRoute()
const router = useRouter()

const currentRoute = computed(() => route.path)

const menuItems = [
  { name: 'dashboard', label: 'Dashboard', route: '/app/dashboard', icon: 'dashboard_unpressed_24x24.svg', iconActive: 'dashboard_pressed_24x24.svg' },
  { name: 'zones', label: 'Zones', route: '/app/zones', icon: 'zones_unpressed_24x24.svg', iconActive: 'zones_pressed_24x24.svg' },
  { name: 'management', label: 'Management', route: '/app/management', icon: 'management_unpressed_26x26.svg', iconActive: 'management_pressed_26x26.svg' },
  { name: 'map', label: 'Map', route: '/app/map', icon: 'map_unpressed_26x26.svg', iconActive: 'map_pressed_26x26.svg' }
]

const logout = () => {
    // TODO: Implement logout logic
    router.push('/login')
}
</script>
