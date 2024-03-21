<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <div class="px-6 flex flex-col">
        <h6 class="va-h6 text-center">{{ t('orders.informations.order_products.title') }} {{ props.orderCode }}</h6>
        <table v-if="dataExists" class="mt-4 va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th>{{ t('orders.informations.order_products.table.headers.name') }}</th>
              <th>{{ t('orders.informations.order_products.table.headers.ballast') }}</th>
              <th>{{ t('orders.informations.order_products.table.headers.quantity') }}</th>
              <th>{{ t('orders.informations.order_products.table.headers.box') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="orderProduct in orderProducts" :key="orderProduct.id">
              <td>{{ orderProduct.product.name }}</td>
              <td>{{ orderProduct.product.ballast }}</td>
              <td>{{ orderProduct.quantity }}</td>
              <td>{{ String(orderProduct.box).toUpperCase() }}</td>
            </tr>
          </tbody>
        </table>
        <span v-if="!dataExists" class="text-center">{{ t('orders.informations.order_products.not_found') }}</span>
      </div>
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import formatDate from '../../../../../services/utils/dateConverter'
  import orderProductsService from '../../../../../services/api/orderProducts'
  import { OrderProductDto } from '../../../../../dtos'

  const { t } = useI18n()
  const { init } = useToast()

  const props = defineProps(['isOpen', 'orderId', 'orderCode'])
  const emits = defineEmits(['isOpenValueChange'])

  const isOpenChild = ref(props.isOpen)
  const dataExists = ref(true)
  const orderProducts = ref<OrderProductDto[]>([])

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const fetchOrderProducts = async () => {
    try {
      const response = await orderProductsService.list({
        order_id: props.orderId,
      })
      if (response.status === 204) {
        dataExists.value = false
      } else orderProducts.value = response.data.orderProducts
    } catch (error: any) {
      console.log(error)
    }
  }

  fetchOrderProducts()
</script>
