<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <h3 class="va-h3">{{ t('loads.informations.edit.modal.title') }}</h3>
      <form class="flex flex-col gap-3" @submit.prevent="handleFormSubmit">
        <va-input
          v-model="code"
          :label="t('loads.informations.edit.modal.form.inputs.code')"
          :error="!!codeErrors.length"
          :error-messages="codeErrors"
          type="text"
        />
        <VueDatePicker v-model="deliveryDate" :enable-time-picker="false" format="dd/MM/yy" required />
        <div class="flex flex-row justify-around">
          <va-button preset="secondary" class="min-w-[6rem]" type="Cancel" @click="handleModalClose">{{
            t('loads.informations.edit.modal.form.buttons.cancel')
          }}</va-button>
          <va-button class="min-w-[6rem]" type="submit">{{
            t('loads.informations.edit.modal.form.buttons.save')
          }}</va-button>
        </div>
      </form>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, computed } from 'vue'
  import loadsService from '../../../../../services/api/loads'
  import { ApiResponseDto } from '../../../../../dtos'
  import { useI18n } from 'vue-i18n'
  import VueDatePicker from '@vuepic/vue-datepicker'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()

  const props = defineProps(['isOpen', 'load'])

  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)

  const code = ref(props.load.code)

  const dateParts = props.load.delivery_date.split('-')
  const year = parseInt(dateParts[0])
  const month = parseInt(dateParts[1]) - 1
  const day = parseInt(dateParts[2])
  const deliveryDate = ref(new Date(year, month, day))

  const codeErrors = ref<string[]>([])
  const deliveryDateErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const formReady = computed(() => {
    return !(codeErrors.value.length || deliveryDateErrors.value.length)
  })

  const handleFormSubmit = () => {
    codeErrors.value = code.value ? [] : ['Name is required']
    deliveryDateErrors.value = deliveryDate.value ? [] : ['Ballast is required']

    if (formReady.value) {
      loadsService
        .update({ id: props.load.id, code: code.value, delivery_date: deliveryDate.value })
        .then((response: ApiResponseDto) => {
          console.log(response)
          if (response.status === 200) {
            handleModalClose()
            init({ message: t('messages.toast.load.edit.success'), color: 'success' })
          }
        })
        .catch((error: any) => {
          console.log(error)
          if (error.response.status === 422)
            init({ message: t('messages.toast.load.edit.error_code'), color: 'danger' })
          else init({ message: t('messages.toast.load.edit.error'), color: 'danger' })
        })
    }
  }
</script>
