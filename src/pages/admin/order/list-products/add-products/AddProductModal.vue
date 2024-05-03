<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" size="small" hide-default-actions @close="handleModalClose">
      <va-card-title>
        {{ t('orders.listProducts.add_product.modal.title') }}
        <span class="list-text ml-1">{{ props.orderCode }}</span>
      </va-card-title>
      <form class="flex flex-col gap-3">
        <va-input
          v-model="quantity"
          type="number"
          :label="t('orders.listProducts.add_product.modal.form.inputs.quantity')"
          required
          :error="!!quantityErrors.length"
          :error-messages="quantityErrors"
        />
        <va-checkbox v-model="box" :label="t('orders.listProducts.add_product.modal.form.inputs.box')" />
        <div class="flex flex-row justify-center gap-3 mt-6">
          <va-button color="danger" @click="handleModalClose()">{{
            t('orders.listProducts.add_product.modal.form.buttons.cancel')
          }}</va-button>
          <va-button color="success" @click="handleProductAdd()">{{
            t('orders.listProducts.add_product.modal.form.buttons.add')
          }}</va-button>
        </div>
      </form>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps } from 'vue'
  import { useI18n } from 'vue-i18n'
  import orderProductsService from '../../../../../services/api/orderProducts'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()

  const emits = defineEmits(['isOpenValueChange'])
  const props = defineProps(['orderId', 'productId', 'isOpen', 'orderCode'])

  const isOpenChild = ref(props.isOpen)

  const quantity = ref('')
  const box = ref(false)

  const quantityErrors = ref<string[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const handleProductAdd = async () => {
    // try {
    //   const response = await orderProductsService.create(
    //     Number(quantity.value),
    //     box.value,
    //     props.productId,
    //     props.orderId,
    //   )
    //   if (response.status === 201) {
    //     handleModalClose()
    //     init({ message: t('messages.toast.order.add_product.success'), color: 'success' })
    //   }
    // } catch (error: any) {
    //   if (error.response.status === 422) {
    //     if (error.response.data.message.includes('Quantity must be greater than 0'))
    //       quantityErrors.value.push(t('orders.listProducts.add_product.modal.form.errors.quantity'))
    //   } else {
    //     init({ message: t('messages.toast.order.add_product.error'), color: 'danger' })
    //   }
    // }
  }
</script>

<style lang="scss" scoped>
  .list-text {
    text-decoration: underline;
  }
</style>
