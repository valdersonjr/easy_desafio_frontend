<template>
  <div class="flex flex-col items-center mt-32">
    <va-card>
      <va-card-title>
        {{ t('profile.form.title') }}
      </va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-3 pb-6" @submit.prevent="handleFormSubmit">
          <va-input
            v-model="user.name"
            :label="t('profile.form.input.name')"
            placeholder="Name"
            :disabled="disabledField"
            type="text"
          />
          <va-input
            v-model="user.email"
            :label="t('profile.form.input.email')"
            placeholder="Email"
            :disabled="disabledField"
            type="email"
            required
          />
          <div v-if="isEditMode" class="flex flex-col gap-3">
            <va-input
              v-model="password"
              :label="t('profile.form.input.password')"
              placeholder="******"
              :disabled="disabledField"
              type="password"
              required
            />
            <va-input
              v-model="passwordConfirmation"
              :label="t('profile.form.input.password_confirmation')"
              placeholder="******"
              :disabled="disabledField"
              type="password"
              required
              :error="!!passwordConfirmationErrors.length"
              :error-messages="passwordConfirmationErrors"
            />
          </div>
          <va-select
            v-model="user.profile"
            :label="t('profile.form.input.profile')"
            :options="profileOptions"
            :disabled="disabledField"
          />
          <div class="flex flex-row justify-around">
            <va-button class="w-[6rem]" preset="secondary" @click="enableEditMode">
              {{ t('profile.form.button.edit') }}
            </va-button>
            <va-button class="w-[6rem]" type="submit" :disabled="!isEditMode">
              {{ t('profile.form.button.save') }}
            </va-button>
          </div>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useGlobalStore } from '../../../stores/global-store'
  import usersService from '../../../services/api/users'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'

  const { init } = useToast()
  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const user = ref({ ...GlobalStore.user })

  const password = ref('')
  const passwordConfirmation = ref('')
  const disabledField = ref(true)
  const isEditMode = ref(false)
  const profileOptions = ['admin', 'client']

  const passwordConfirmationErrors = ref<string[]>([])

  const formReady = computed(() => {
    return !passwordConfirmationErrors.value.length
  })

  const enableEditMode = () => {
    isEditMode.value = true
    disabledField.value = false
  }

  const disableEditMode = () => {
    isEditMode.value = false
    disabledField.value = true
    password.value = ''
    passwordConfirmation.value = ''
  }

  const handleFormSubmit = () => {
    userEdit()
  }

  const userEdit = () => {
    passwordConfirmationErrors.value =
      passwordConfirmation.value === password.value ? [] : ['Password confirmation must be equal to password']

    if (localStorage.getItem('user')) {
      const profile = JSON.parse(localStorage.getItem('user') as string).profile
      if (profile && profile.toLowerCase() !== 'admin' && user.value.profile.toLowerCase() === 'admin') {
        init({ message: `${t('messages.toast.profile_permission.error')}: ${profile.toUpperCase()}`, color: 'danger' })
        disableEditMode()
        user.value.profile = profile
        return
      }
    }

    if (formReady.value) {
      usersService
        .update({
          name: user.value.name,
          email: user.value.email,
          password: password.value,
          password_confirmation: passwordConfirmation.value,
          profile: user.value.profile,
        })
        .then((response: any) => {
          if (response.status === 200) {
            isEditMode.value = false
            user.value = response.data.user
            GlobalStore.setUser({
              id: user.value.id,
              name: user.value.name,
              email: user.value.email,
              profile: user.value.profile,
              created_at: user.value.created_at,
            })
            init({ message: t('messages.toast.profile.edit.success'), color: 'success' })
          }
        })
        .catch((error) => {
          init({ message: t('messages.toast.profile.edit.error'), color: 'danger' })
          console.log(error)
        })
        .finally(() => {
          disableEditMode()
        })
    }
  }
</script>
