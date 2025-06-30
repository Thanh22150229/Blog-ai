<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
      <h1 class="text-2xl font-bold mb-4"></h1>
      <LoginForm />
    </div>
  </div>
</template>

<script>
import LoginForm from '@/components/Auth/LoginForm.vue';

export default {
  components: { LoginForm },
};
</script>
