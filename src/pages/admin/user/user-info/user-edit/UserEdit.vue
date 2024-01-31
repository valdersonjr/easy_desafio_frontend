<template>
  <div>
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <h3 class="va-h3">User Edit</h3>
      <form class="flex flex-col gap-3" @submit.prevent="handleFormSubmit">
        <va-input v-model="name" label="Name" type="text" />
        <va-input
          v-model="email"
          label="Email"
          :error="!!emailErrors.length"
          :error-messages="emailErrors"
          type="email"
        />
        <va-input
          v-model="password"
          label="Password"
          :error="!!passwordErrors.length"
          :error-messages="passwordErrors"
          type="password"
          placeholder="********"
        />
        <va-input
          v-model="passwordConfirmation"
          label="Password Confirmation"
          :error="!!passwordConfirmationErrors.length"
          :error-messages="passwordConfirmationErrors"
          type="password"
          placeholder="********"
        />
        <va-select v-model="profile" label="Profile" :options="profileOptions" />
        <va-button type="submit">Submit</va-button>
      </form>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, computed } from 'vue'
  import usersService from '../../../../../services/api/users'
  import { ApiResponseDto } from '../../../../../dtos'
  import { validateEmailFormat } from '../../../../../services/utils/validations'

  const props = defineProps(['isOpen', 'user'])

  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)

  const name = ref(props.user.name)
  const email = ref(props.user.email)
  const password = ref('')
  const passwordConfirmation = ref('')
  const profile = ref(props.user.profile.charAt(0).toUpperCase() + props.user.profile.slice(1))

  const profileOptions = ref(['Admin', 'Client'])

  const nameErrors = ref([])
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])
  const passwordConfirmationErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const formReady = computed(() => {
    return !(
      nameErrors.value.length ||
      emailErrors.value.length ||
      passwordErrors.value.length ||
      passwordConfirmationErrors.value.length
    )
  })

  const handleFormSubmit = () => {
    emailErrors.value = email.value ? [] : ['Email is required']
    if (!validateEmailFormat(email.value)) emailErrors.value = ['Invalid format']
    passwordErrors.value = password.value ? [] : ['Password is required']
    passwordConfirmationErrors.value = passwordConfirmation.value ? [] : ['Password confirmation is required']
    passwordConfirmationErrors.value =
      passwordConfirmation.value === password.value ? [] : ['Password confirmation must be equal to password']

    if (formReady.value) {
      usersService
        .updateById({
          id: props.user.id,
          name: name.value,
          email: email.value,
          password: password.value,
          password_confirmation: passwordConfirmation.value,
          profile: profile.value.toLowerCase(),
        })
        .then((response: ApiResponseDto) => {
          if (response.status === 200) handleModalClose()
        })
        .catch((error: any) => {
          console.log(error)
        })
    }
  }
</script>
