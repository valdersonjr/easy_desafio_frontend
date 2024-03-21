<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <h3 class="va-h3">{{ t('orders.informations.edit.modal.title') }}</h3>
      <form class="flex flex-col gap-3" @submit.prevent="handleFormSubmit">
        <va-input
          v-model="code"
          :label="t('orders.informations.edit.modal.form.inputs.code')"
          :error="!!codeErrors.length"
          :error-messages="codeErrors"
          type="text"
        />
        <va-input
          v-model="bay"
          :label="t('orders.informations.edit.modal.form.inputs.bay')"
          type="text"
          :error="!!bayErrors.length"
          :error-messages="bayErrors"
        />
        <va-input
          v-model="load_id"
          :label="t('orders.informations.edit.modal.form.inputs.load_id')"
          type="text"
          :error="!!load_idErrors.length"
          :error-messages="load_idErrors"
        />
        <div class="flex flex-row justify-around">
          <va-button preset="secondary" class="min-w-[6rem]" type="Cancel" @click="handleModalClose">{{
            t('orders.informations.edit.modal.form.buttons.cancel')
          }}</va-button>
          <va-button class="min-w-[6rem]" type="submit">{{
            t('orders.informations.edit.modal.form.buttons.save')
          }}</va-button>
        </div>
      </form>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, computed } from 'vue'
  import ordersService from '../../../../../services/api/orders'
  import { ApiResponseDto } from '../../../../../dtos'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()

  const props = defineProps(['isOpen', 'order'])

  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)

  const code = ref(props.order.code)
  const bay = ref(props.order.bay)
  const load_id = ref(props.order.load_id)

  const codeErrors = ref<string[]>([])
  const bayErrors = ref<string[]>([])
  const load_idErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const formReady = computed(() => {
    return !(codeErrors.value.length || bayErrors.value.length || load_idErrors.value.length)
  })

  const handleFormSubmit = () => {
    codeErrors.value = code.value ? [] : ['Order code is required']
    bayErrors.value = bay.value ? [] : ['Bay is required']
    load_idErrors.value = load_id.value ? [] : ['Load ID is required']

    if (formReady.value) {
      ordersService
        .update({ id: props.order.id, code: code.value, bay: bay.value, load_id: load_id.value })
        .then((response: ApiResponseDto) => {
          if (response.status === 200) {
            handleModalClose()
            init({ message: t('messages.toast.order.edit.success'), color: 'success' })
          }
        })
        .catch((error: any) => {
          if (error.response.status === 422)
            init({ message: t('messages.toast.order.edit.error_code'), color: 'danger' })
          else init({ message: t('messages.toast.order.edit.error'), color: 'danger' })
        })
    }
  }
</script>
