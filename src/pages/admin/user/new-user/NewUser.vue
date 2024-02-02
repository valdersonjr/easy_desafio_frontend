<template>
  <div class="flex flex-col items-center">
    <va-card class="px-3 py-4 mt-32">
      <va-card-title>{{ t('users.newUser.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-4" @submit.prevent="onsubmit">
          <va-input v-model="name" type="text" placeholder="Easy Pallet" :label="t('users.newUser.form.inputs.name')" />
          <va-input
            v-model="email"
            type="email"
            placeholder="easy@pallet.com"
            :label="t('users.newUser.form.inputs.email')"
            :error="!!emailErrors.length"
            :error-messages="emailErrors"
          />
          <va-input
            v-model="password"
            type="password"
            placeholder="******"
            :label="t('users.newUser.form.inputs.password')"
            :error="!!passwordErrors.length"
            :error-messages="passwordErrors"
          />
          <va-input
            v-model="password_confirmation"
            type="password"
            placeholder="******"
            :label="t('users.newUser.form.inputs.password_confirmation')"
            :error="!!passwordConfirmationErrors.length"
            :error-messages="passwordConfirmationErrors"
          />
          <va-select
            v-model="profile"
            :label="t('users.newUser.form.inputs.profile')"
            text-by="description"
            track-by="id"
            :options="profileOptions"
            :error="!!profileErrors.length"
            :error-messages="profileErrors"
          />
          <div class="flex flex-row justify-around">
            <va-button type="reset" preset="secondary" class="w-[6rem]">
              {{ t('users.newUser.form.buttons.reset') }}
            </va-button>
            <va-button class="w-[6rem]" type="submit">
              <div v-if="!loadingStatus">
                {{ t('users.newUser.form.buttons.submit') }}
              </div>
              <FulfillingSquareSpinner v-if="loadingStatus" color="#fff" :size="14" :animation-duration="2000" />
            </va-button>
          </div>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { ApiResponseDto } from '../../../../dtos'
  import { validateEmailFormat } from '../../../../services/utils/validations'
  import usersService from '../../../../services/api/users'
  import router from '../../../../router'
  import { FulfillingSquareSpinner } from 'epic-spinners'
  import { useGlobalStore } from '../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const { init } = useToast()
  const GlobalStore = useGlobalStore()
  const { t } = useI18n()
  const profileOptions = ['Admin', 'Client']

  const name = ref('')
  const email = ref('')
  const password = ref('')
  const password_confirmation = ref('')
  const profile = ref('')
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])
  const passwordConfirmationErrors = ref<string[]>([])
  const profileErrors = ref<string[]>([])
  const loadingStatus = ref(false)

  const formReady = computed(() => {
    return !(
      emailErrors.value.length ||
      passwordErrors.value.length ||
      passwordConfirmationErrors.value.length ||
      profileErrors.value.length
    )
  })

  const onsubmit = () => {
    emailErrors.value = email.value ? [] : ['Email is required']
    if (!validateEmailFormat(email.value)) emailErrors.value = ['Invalid format']
    passwordErrors.value = password.value ? [] : ['Password is required']
    passwordConfirmationErrors.value = password_confirmation.value ? [] : ['Password confirmation is required']
    passwordConfirmationErrors.value =
      password_confirmation.value === password.value ? [] : ['Password confirmation must be equal to password']
    profileErrors.value = profile.value ? [] : ['Profile is required']

    if (profile.value !== '') {
      profileErrors.value =
        profile.value === 'Admin' && GlobalStore.user.profile === 'admin' ? [] : ['Only admin can create admin profile']
    }

    if (formReady.value) {
      loadingStatus.value = true

      usersService
        .signUp({
          name: name.value,
          email: email.value,
          password: password.value,
          password_confirmation: password_confirmation.value,
          profile: profile.value.toLocaleLowerCase(),
        })
        .then((response: ApiResponseDto) => {
          if (response.status === 200) {
            router.push({ name: 'user-info' })
            init({ message: t('messages.toast.user.new.success'), color: 'success' })
          }
        })
        .catch((error: any) => {
          console.log('Error:', error)
          if (error.response.status === 422) emailErrors.value = ['Email already exists']
          init({ message: t('messages.toast.user.new.error'), color: 'success' })
        })
        .finally(() => {
          loadingStatus.value = false
        })
    }
  }
</script>
