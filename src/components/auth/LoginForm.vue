<template>
  <div class="w-[345px] flex flex-col items-center">
    <!-- Header -->
    <div class="flex items-center space-x-2 mb-8">
      <img src="@/assets/images/logo_57x57.png" alt="Logo" class="w-[57px] h-[57px]" />
      <span class="text-4xl font-montserrat font-medium text-white tracking-tight">GAILL</span>
    </div>

    <!-- Title / State Header -->
    <div class="w-full mb-2">
      <h2 class="text-3xl font-montserrat font-bold text-white leading-tight">
        {{ stateTitle }}
      </h2>
    </div>

    <!-- Switch State (Sign In <-> Sign Up) -->
    <div class="w-full flex items-center mb-5 h-[30px]" v-if="showSwitchState">
      <span class="text-[#A7A7A7] font-montserrat font-light text-sm mr-1">
        {{ switchStateText }}
      </span>
      <button 
        @click="toggleState"
        class="text-[#A7A7A7] hover:text-[#5D5D5D] font-montserrat font-semibold text-sm transition-colors"
      >
        {{ switchStateButtonText }}
      </button>
    </div>

    <!-- Form Fields -->
    <form @submit.prevent="handleSubmit" class="w-full space-y-4">
      
      <!-- Sign Up Fields -->
      <div v-if="currentState === 'signUp'" class="flex space-x-4">
          <div class="w-1/2 flex flex-col space-y-2">
            <label class="text-white font-montserrat font-medium text-sm">First Name</label>
            <input 
              v-model="form.firstName"
              type="text" 
              placeholder="Your first name"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <div class="w-1/2 flex flex-col space-y-2">
            <label class="text-white font-montserrat font-medium text-sm">Last Name</label>
             <input 
              v-model="form.lastName"
              type="text" 
              placeholder="Your last name"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
          </div>
      </div>

      <div v-if="currentState === 'signUp'" class="flex flex-col space-y-2">
        <label class="text-white font-montserrat font-medium text-sm">Email</label>
        <div class="relative">
            <input 
              v-model="form.email"
              type="email" 
              placeholder="Enter your email"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 pr-10 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
            <img src="@/assets/images/email.png" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-[17px] h-[17px] opacity-70" />
        </div>
      </div>

      <!-- Common Fields (Username/Password) -->
      <div v-if="['signIn', 'signUp'].includes(currentState)" class="flex flex-col space-y-2">
        <label class="text-white font-montserrat font-medium text-sm">Username</label>
        <div class="relative">
             <input 
              v-model="form.username"
              type="text" 
              placeholder="Enter your username"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 pr-10 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
            <img src="@/assets/images/user.png" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-[17px] h-[17px] opacity-70" />
        </div>
      </div>

      <div v-if="['signIn', 'signUp'].includes(currentState)" class="flex flex-col space-y-2">
        <label class="text-white font-montserrat font-medium text-sm">Password</label>
        <div class="relative">
             <input 
              v-model="form.password"
              type="password" 
              placeholder="Enter your password"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 pr-10 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
            <img src="@/assets/images/lock.png" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-[17px] h-[17px] opacity-70" />
        </div>
      </div>

      <!-- Forgot Password -->
      <div v-if="currentState === 'signIn'" class="flex justify-end pt-1">
        <button type="button" class="text-[#A7A7A7] text-sm hover:text-white font-montserrat font-semibold">
          Forget password?
        </button>
      </div>

      <!-- License Key Field -->
      <div v-if="currentState === 'activateLicense'" class="flex flex-col space-y-2">
          <label class="text-white font-montserrat font-medium text-sm">License key</label>
           <div class="relative">
             <input 
              v-model="form.licenseKey"
              type="text" 
              placeholder="Enter your License key"
              class="w-full h-10 bg-transparent border border-[#5D5D5D] rounded-lg px-3 pr-10 text-[#bebebe] placeholder-[#5D5D5D] focus:outline-none focus:border-white transition-colors"
            />
            <img src="@/assets/images/key.png" class="absolute right-3 top-1/2 transform -translate-y-1/2 w-[17px] h-[17px] opacity-70" />
        </div>
      </div>
    
      <!-- Submit Button -->
      <div class="flex justify-end pt-4">
        <button 
          type="submit"
          class="w-[220px] h-[50px] rounded-lg font-montserrat font-semibold text-xl text-white transition-colors duration-200"
          :class="isSubmitting ? 'bg-[#529B26]/70 cursor-wait' : 'bg-[#529B26] hover:bg-[#6cc537] active:bg-[#4a8b22]'"
          :disabled="isSubmitting"
        >
          {{ submitButtonText }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserManager from '@/services/UserManager'

const router = useRouter()
const authStore = useAuthStore()

// State: 'signIn' | 'signUp' | 'activateLicense' | 'licenseContact' | 'passwordContact'
const currentState = ref('signIn')
const isSubmitting = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  licenseKey: ''
})

// Computed Properties for UI Text
const stateTitle = computed(() => {
  switch (currentState.value) {
    case 'signUp': return 'Create your account'
    case 'signIn': return 'Welcome Back!'
    case 'activateLicense': return 'Activate Your License'
    case 'licenseContact': return 'Contact us to get your license'
    case 'passwordContact': return 'Contact us to reset your password'
    default: return ''
  }
})

const switchStateText = computed(() => {
  switch (currentState.value) {
    case 'signUp': return 'Already have an account ?'
    case 'signIn': return "Don't have an account ?"
    case 'activateLicense': return 'Info about getting a License?'
    default: return ''
  }
})

const switchStateButtonText = computed(() => {
  switch (currentState.value) {
    case 'signUp': return 'Sign in'
    case 'signIn': return 'Sign up'
    case 'activateLicense': return 'Contact us'
    default: return ''
  }
})

const showSwitchState = computed(() => {
  return ['signIn', 'signUp', 'activateLicense'].includes(currentState.value)
})

const submitButtonText = computed(() => {
  switch (currentState.value) {
    case 'signUp': return 'Sign up'
    case 'signIn': return 'Log in'
    case 'activateLicense': return 'Get started'
    default: return 'Submit'
  }
})

// Logic
const toggleState = () => {
  if (currentState.value === 'signUp') currentState.value = 'signIn'
  else if (currentState.value === 'signIn') currentState.value = 'signUp'
  else if (currentState.value === 'activateLicense') currentState.value = 'licenseContact'
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
      if (currentState.value === 'signIn') {
          const success = await authStore.login(form.username, form.password)
          if (success) {
               console.log("Login success")
               router.push('/app/dashboard')
          } else {
              alert("Login failed! (Mock: try admin/admin)")
          }
      } 
      else if (currentState.value === 'signUp') {
          // Mock Create User
          // UserManager.createUser(...)
          console.log("Sign up called", form)
          // Simulate success, move to license
          currentState.value = 'activateLicense'
      }
      else if (currentState.value === 'activateLicense') {
           console.log("Activating license", form.licenseKey)
           // Mock check
           if (form.licenseKey.length > 0) {
               // Auto login
               const success = await authStore.login(form.username, form.password)
               if (success) router.push('/app/dashboard')
           } else {
               alert("Please enter a license key")
           }
      }
  } catch (e) {
      console.error(e)
  } finally {
      isSubmitting.value = false
  }
}
</script>
