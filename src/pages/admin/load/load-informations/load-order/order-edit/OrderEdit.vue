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
          v-model="loadCode"
          :label="t('orders.informations.edit.modal.form.inputs.load_code')"
          type="text"
          :error="!!loadCodeErrors.length"
          :error-messages="loadCodeErrors"
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
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import ordersService from '../../../../../../services/api/orders'
  import { ApiResponseDto } from '../../../../../../dtos'
  import loadsService from '../../../../../../services/api/loads'

  const { t } = useI18n()
  const { init } = useToast()

  const props = defineProps(['isOpen', 'order'])

  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)

  const code = ref(props.order.code)
  const bay = ref(props.order.bay)
  const loadCode = ref(props.order.load_code)

  const codeErrors = ref<string[]>([])
  const bayErrors = ref<string[]>([])
  const loadCodeErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const formReady = computed(() => {
    return !(codeErrors.value.length || bayErrors.value.length || loadCodeErrors.value.length)
  })

  const handleFormSubmit = () => {
    codeErrors.value = code.value ? [] : ['Order code is required']
    bayErrors.value = bay.value ? [] : ['Bay is required']
    loadCodeErrors.value = loadCode.value ? [] : ['Load code is required']

    if (formReady.value) {
      findLoadIdByLoadCode(loadCode.value).then((loadId: number) => {
        if (loadId !== -1) {
          updateOrder(props.order.id, code.value, bay.value, loadId)
        } else {
          init({ message: 'Carga não encontrada', color: 'danger' })
        }
      })
    }
  }

  const findLoadIdByLoadCode = async (loadCode: string): Promise<number> => {
    try {
      const response = await loadsService.showByCode(loadCode)
      return response.data.load.id
    } catch (error) {
      return -1
    }
  }

  const updateOrder = (id: number, code: string, bay: string, loadId: number) => {
    ordersService
      .update({ id: id, code: code, bay: bay, load_id: loadId })
      .then((response: ApiResponseDto) => {
        if (response.status === 200) {
          handleModalClose()
          init({ message: t('messages.toast.order.edit.success'), color: 'success' })
        }
      })
      .catch((error: any) => {
        if (error.response.status === 422) init({ message: t('messages.toast.order.edit.error_code'), color: 'danger' })
        else init({ message: "t('messages.toast.order.edit.error')", color: 'danger' })
      })
  }
</script>
