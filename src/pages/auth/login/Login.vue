<template>
  <form @submit.prevent="onsubmit">
    <va-input
      v-model="email"
      class="mb-4"
      type="email"
      :label="t('auth.email')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
      placeholder="easy@pallet.com"
    />

    <va-input
      v-model="password"
      class="mb-4"
      type="password"
      :label="t('auth.password')"
      :error="!!passwordErrors.length"
      :error-messages="passwordErrors"
      placeholder="******"
    />

    <div class="auth-layout__options flex items-center justify-between">
      <router-link class="ml-1 va-link" :to="{ name: 'recover-password' }">{{
        t('auth.recover_password')
      }}</router-link>
    </div>

    <div class="flex justify-center mt-4">
      <va-button class="my-0" @click="onsubmit">{{ t('auth.login') }}</va-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import usersService from '../../../services/api/users'
  import { validateEmailFormat } from '../../../services/utils/validations'
  import { useGlobalStore } from '../../../stores/global-store'
  import { ApiResponseDto } from '../../../dtos'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()
  const GlobalStore = useGlobalStore()

  const email = ref('')
  const password = ref('')
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])
  const router = useRouter()
  const loadingStatus = ref(false)

  const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)

  function onsubmit() {
    emailErrors.value = email.value ? [] : ['Email is required']
    if (!validateEmailFormat(email.value)) emailErrors.value = ['Invalid format']
    passwordErrors.value = password.value ? [] : ['Password is required']

    if (formReady.value) {
      loadingStatus.value = true

      usersService
        .signIn({
          email: email.value,
          password: password.value,
        })
        .then((response: ApiResponseDto) => {
          if (response.status === 200) {
            GlobalStore.setToken(response.headers.authorization.split(' ')[1])
            GlobalStore.setUser(response.data.data)
            init({ message: `${t('messages.toast.login.success')} ${GlobalStore.user.name}!`, color: 'success' })
            router.push({ name: 'dashboard' })
          }
        })
        .catch((error) => {
          if (error.response.status === 401) {
            passwordErrors.value = ['Invalid credentials']
          }
          init({ message: t('messages.toast.login.error'), color: 'danger' })
        })
        .finally(() => {
          loadingStatus.value = false
        })
    }
  }
</script>
