<template>
  <div class="absolute">
    <VaModal v-model="isOpen" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <h3 class="va-h3">{{ t('orders.listProducts.modal.edit.title') }}</h3>
      <form class="flex flex-col gap-3" @submit.prevent="handleFormSubmit">
        <va-input
          v-model="quantity"
          type="number"
          :label="t('orders.listProducts.modal.edit.form.inputs.quantity')"
          required
        />
        <VaCheckbox v-model="box" :label="t('orders.listProducts.modal.edit.form.inputs.box')" />
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
  import { ref, defineProps, defineEmits } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import orderProductsService from '../../../../../../../services/api/orderProducts'

  const { t } = useI18n()
  const { init } = useToast()

  const emits = defineEmits(['handleModalClose'])
  const props = defineProps(['isOpen', 'listProduct'])

  const isOpen = ref(props.isOpen)

  const quantity = ref(props.listProduct.quantity)
  const box = ref(props.listProduct.box)

  const handleModalClose = () => {
    isOpen.value = false
    emits('handleModalClose', false)
  }

  const handleFormSubmit = async () => {
    try {
      const response = await orderProductsService.update(props.listProduct.id, quantity.value, box.value)
      if (response.status === 200) {
        init({ message: t('messages.toast.order.list_products.modal.edit.success'), color: 'success' })
        handleModalClose()
      } else init({ message: t('messages.toast.order.list_products.modal.edit.error'), color: 'error' })
    } catch (error) {
      console.log(error)
      init({ message: t('messages.toast.order.list_products.modal.edit.error'), color: 'error' })
    }
  }
</script>
