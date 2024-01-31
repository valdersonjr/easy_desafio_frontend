<template>
  <form @submit.prevent="onsubmit()">
    <va-input v-model="name" class="mb-4" type="text" placeholder="Easy Pallet" :label="t('auth.name')" />
    <va-input
      v-model="email"
      class="mb-4"
      type="email"
      placeholder="easy@pallet.com"
      :label="t('auth.email')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
    />

    <va-input
      v-model="password"
      class="mb-4"
      type="password"
      placeholder="******"
      :label="t('auth.password')"
      :error="!!passwordErrors.length"
      :error-messages="passwordErrors"
    />

    <va-input
      v-model="password_confirmation"
      class="mb-4"
      type="password"
      placeholder="******"
      :label="t('auth.password_confirmation')"
      :error="!!passwordConfirmationErrors.length"
      :error-messages="passwordConfirmationErrors"
    />

    <va-select
      v-model="profile"
      class="mb-4"
      :label="t('auth.profile')"
      text-by="description"
      track-by="id"
      :options="profileOptions"
    />

    <div class="auth-layout__options flex items-center justify-between">
      <router-link class="ml-1 va-link" :to="{ name: 'recover-password' }">
        {{ t('auth.recover_password') }}
      </router-link>
    </div>

    <div class="relative flex items-center justify-center mt-4">
      <va-button :color="'primary'" class="my-0" @click="onsubmit">
        <div v-if="!loadingStatus">
          {{ t('auth.sign_up') }}
        </div>
        <FulfillingSquareSpinner v-if="loadingStatus" :color="'#fff'" :size="14" :animation-duration="2000" />
      </va-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import UsersService from '../../../services/api/users'
  import { validateEmailFormat } from '../../../services/utils/validations'
  import router from '../../../router'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import { ApiResponseDto } from '../../../dtos'

  const { t } = useI18n()

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const password_confirmation = ref('')
  const profile = ref()
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])
  const passwordConfirmationErrors = ref<string[]>([])
  const profileOptions = ref([{ id: 1, description: 'Client' }])
  const loadingStatus = ref(false)

  const formReady = computed(() => {
    return !(emailErrors.value.length || passwordErrors.value.length || passwordConfirmationErrors.value.length)
  })

  function onsubmit() {
    emailErrors.value = email.value ? [] : ['Email is required']
    if (!validateEmailFormat(email.value)) emailErrors.value = ['Invalid format']
    passwordErrors.value = password.value ? [] : ['Password is required']
    passwordConfirmationErrors.value = password_confirmation.value ? [] : ['Password confirmation is required']
    passwordConfirmationErrors.value =
      password_confirmation.value === password.value ? [] : ['Password confirmation must be equal to password']

    if (formReady.value) {
      loadingStatus.value = true

      UsersService.signUp({
        name: name.value,
        email: email.value,
        password: password.value,
        password_confirmation: password_confirmation.value,
        profile: profile.value,
      })
        .then((response: ApiResponseDto) => {
          if (response.status === 200) router.push({ name: 'login' })
        })
        .catch((error: any) => {
          if (error) console.log('Error:', error)
        })
        .finally(() => {
          loadingStatus.value = false
        })
    }
  }
</script>
