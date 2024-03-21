<template>
  <div class="absolute">
    <VaModal v-model="isOpenChild" ok-text="Submit" hide-default-actions close-button @close="handleModalClose">
      <div v-if="!isOrderProductsTableShowing">
        <h6 class="va-h6 mt-4 flex">{{ t('loads.informations.loadOrders.modal.title') }} {{ props.loadCode }}</h6>
        <table v-if="dataExists" class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th>{{ t('loads.informations.loadOrders.modal.table.headers.code') }}</th>
              <th>{{ t('loads.informations.loadOrders.modal.table.headers.bay') }}</th>
              <th>{{ t('loads.informations.loadOrders.modal.table.headers.created_date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loadOrder in loadOrders" :key="loadOrder.id">
              <td class="code-row" @click="handleCodeClick(loadOrder.id, loadOrder.code)">{{ loadOrder.code }}</td>
              <td>{{ loadOrder.bay }}</td>
              <td v-if="loadOrder.created_date">{{ formatDate(loadOrder.created_date.toString()) }}</td>
            </tr>
          </tbody>
        </table>
        <span v-if="!dataExists" class="block text-center">{{
          t('loads.informations.loadOrders.modal.not_found')
        }}</span>
      </div>
      <OrderProducts
        v-if="isOrderProductsTableShowing"
        :order-id="orderId"
        :order-code="orderCode"
        @handleBackIconClick="handleIsOrderProductsTableShowingValueChange"
      />
    </VaModal>
  </div>
</template>

<script setup lang="ts">
  import { ref, defineEmits, defineProps, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'
  import ordersService from '../../../../../services/api/orders'
  import { OrderDto } from '../../../../../dtos'
  import formatDate from '../../../../../services/utils/dateConverter'
  import OrderProducts from './OrderProducts.vue'

  const { t } = useI18n()
  const { init } = useToast()

  const props = defineProps(['isOpen', 'loadId', 'loadCode'])
  const emits = defineEmits(['isOpenValueChange'])

  const loadOrders = ref<OrderDto[]>([])
  const sortDirection = ref('asc')
  const dataExists = ref(true)
  const orderId = ref(-1)
  const orderCode = ref('')
  const isOrderProductsTableShowing = ref(false)
  const isOpenChild = ref(props.isOpen)

  const handleCodeClick = (id: number, code: string) => {
    console.log(id, code)
    orderId.value = id
    orderCode.value = code
    isOrderProductsTableShowing.value = !isOrderProductsTableShowing.value
  }

  const handleModalClose = () => {
    isOpenChild.value = false
    emits('isOpenValueChange', isOpenChild.value)
  }

  const fetchLoadOrders = async () => {
    try {
      const response = await ordersService.list({
        load_id: props.loadId,
        sortColumn: 'created_at',
        sortDirection: sortDirection.value,
      })

      if (response.status === 204) {
        dataExists.value = false
        loadOrders.value = []
        return
      } else loadOrders.value = response.data.orders
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleIsOrderProductsTableShowingValueChange = (value: boolean) => {
    console.log(value)
    isOrderProductsTableShowing.value = value
  }

  fetchLoadOrders()
</script>

<style lang="scss" scoped>
  .code-row {
    &:hover {
      color: #ff0000;
    }

    cursor: pointer;
  }
</style>
