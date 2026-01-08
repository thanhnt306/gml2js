<template>
  <div class="relative w-screen h-screen overflow-hidden bg-[#202020]">
    <div class="absolute inset-0 z-0">
       <!-- Video Background Placeholder (since we can't easily auto-play video in some browsers without interaction, but we try) -->
       <!-- In QML it was a video next to the login form, but let's make it a nice background or split view as per QML design -->
       <!-- QML Design: RowLayout with VideoContainer (left) and AuthenContainer (right). Both in a rounded rectangle. -->
       
       <!-- Main Background Gradient -->
       <div class="absolute inset-0 bg-gradient-to-br from-[#404045] to-[#202020]"></div>
    </div>

    <!-- Centered Card -->
    <div class="relative z-10 flex items-center justify-center min-h-screen">
        <div class="flex bg-[#202020] rounded-[15px] shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-80" 
             style="width: 907px; height: 628px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
            
            <!-- Video Section (Left) -->
            <div class="w-[442px] h-full p-3">
                <div class="w-full h-full rounded-[15px] overflow-hidden relative">
                    <video 
                        autoplay 
                        muted 
                        loop 
                        class="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="@/assets/videos/water_video.mp4" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <!-- Overlay Mask if needed -->
                    <div class="absolute inset-0 bg-black/10"></div>
                </div>
            </div>

            <!-- Login Form Section (Right) -->
            <div class="flex-1 h-full p-3 flex items-center justify-center">
                 <LoginForm />
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '../components/auth/LoginForm.vue'
</script>
