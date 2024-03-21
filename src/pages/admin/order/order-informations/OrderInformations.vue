<template>
  <div class="flex flex-col gap-3 items-center">
    <OrderEdit
      v-if="isOrderEditModalOpen"
      :is-open="isOrderEditModalOpen"
      :order="orderShow"
      @isOpenValueChange="handleIsOrderEditModalOpenValueChange"
    />
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('orders.informations.delete.confirmation_modal.title')"
      :ok-text="t('orders.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('orders.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <OrderProducts
      v-if="isOrderProductModalOpen"
      :is-open="isOrderProductModalOpen"
      :order-id="orderId"
      :order-code="orderCode"
      @isOpenValueChange="handleIsOrderProductModalOpenValueChange"
    />
    <va-card class="w-full pb-4">
      <va-card-title>{{ t('orders.informations.filter.title') }}</va-card-title>
      <form class="flex flex-row gap-3 px-3 justify-center items-center" @submit.prevent="onFormSubmit">
        <va-input
          v-model="codeFilter"
          type="text"
          :label="t('orders.informations.filter.form.inputs.code')"
          placeholder="OR1234"
        />
        <va-input
          v-model="bayFilter"
          type="text"
          :label="t('orders.informations.filter.form.inputs.bay')"
          placeholder="2"
        />
        <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear">{{
          t('orders.informations.filter.form.buttons.clear')
        }}</va-button>
        <va-button type="submit" class="px-2" color="info">{{
          t('orders.informations.filter.form.buttons.search')
        }}</va-button>
      </form>
    </va-card>
    <va-card class="w-full">
      <va-card-title>{{ t('orders.informations.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th @click="handleSorting('code')">
                <sorting-icon-div :text="t('orders.informations.table.headers.code')" />
              </th>
              <th @click="handleSorting('bay')">
                <sorting-icon-div :text="t('orders.informations.table.headers.bay')" />
              </th>
              <th>
                {{ t('orders.informations.table.headers.load_code') }}
              </th>
              <th>
                {{ t('orders.informations.table.headers.products') }}
              </th>
              <th>{{ t('orders.informations.table.headers.update') }}</th>
              <th>{{ t('orders.informations.table.headers.delete') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td class="w-[20%]">{{ order.code }}</td>
              <td class="w-[20%]">{{ order.bay }}</td>
              <td>{{ order.load_code }}</td>
              <td>
                <button class="px-2" @click="handleListOrderProducts(order.id, order.code)">
                  <va-icon name="vuestic-iconset-notepad" />
                </button>
              </td>
              <td>
                <va-button class="px-2" color="info" icon="edit" plain @click="handleOrderUpdate(order.id)" />
              </td>
              <td>
                <va-button class="px-2" color="danger" icon="delete" plain @click="handleOrderDeletion(order.id)" />
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <VaPagination v-model="currentPage" :pages="totalPages" :visible-pages="3" buttons-preset="secondary" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ordersService from '../../../../services/api/orders'
  import { OrderDto } from '../../../../dtos'
  import { useGlobalStore } from '../../../../stores/global-store'
  import OrderEdit from './order-edit/OrderEdit.vue'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import { useToast } from 'vuestic-ui'
  import SortingIconDiv from '../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import OrderProducts from './order-products/OrderProducts.vue'

  const { init } = useToast()
  const { t } = useI18n()
  const GlobalStore = useGlobalStore()

  const isConfirmationModalOpen = ref(false)
  const isOrderEditModalOpen = ref(false)
  const isConfirmationModalLoading = ref(false)
  const isOrderProductModalOpen = ref(false)

  const codeFilter = ref('')
  const bayFilter = ref('')

  const orderShow = ref({} as OrderDto)
  const orders = ref([] as OrderDto[])
  const orderIdToDelete = ref(-1)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const sortColumn = ref('code')
  const sortDirection = ref('asc')
  const orderId = ref(-1)
  const orderCode = ref('')

  const onFormSubmit = () => {
    fetchOrders()
  }

  const handleFilterClear = () => {
    codeFilter.value = ''
    bayFilter.value = ''
    fetchOrders()
  }

  const fetchOrders = async () => {
    try {
      const response = await ordersService.list({
        page: currentPage.value,
        perPage: 10,
        code: codeFilter.value,
        bay: bayFilter.value,
        sortColumn: sortColumn.value,
        sortDirection: sortDirection.value,
      })

      if (response.status === 204) {
        clearOrdersList()
        return
      }

      orders.value = response.data.orders
      currentPage.value = response.data.pagination_meta?.current_page || 1
      totalPages.value = response.data.pagination_meta?.total_pages || 1
    } catch (error: any) {
      clearOrdersList()
    }
  }

  const fetchOrder = async (id: number) => {
    try {
      const response = await ordersService.show(id)
      orderShow.value = response.data.order
      isOrderEditModalOpen.value = true
    } catch (error) {
      console.log('Error fetching user:', error)
    }
  }

  const handleListOrderProducts = (id: number, code: string) => {
    orderId.value = id
    orderCode.value = code
    isOrderProductModalOpen.value = true
  }

  const handleOrderUpdate = (id: number) => {
    if (GlobalStore.user.profile === 'admin') fetchOrder(id)
    else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const handleOrderDeletion = (id: number) => {
    if (GlobalStore.user.profile === 'admin') {
      isConfirmationModalOpen.value = true
      orderIdToDelete.value = id
    } else
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${GlobalStore.user.profile.toUpperCase()}`,
        color: 'danger',
      })
  }

  const deleteOrder = async (id: number) => {
    try {
      const response = await ordersService.delete(id)
      console.log(response)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchOrders()
        init({ message: t('messages.toast.order.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.log('Error deleting user:', error)
      init({ message: t('messages.toast.order.delete.error'), color: 'danger' })
    }
  }

  const handleIsOrderEditModalOpenValueChange = (newValue: boolean) => {
    isOrderEditModalOpen.value = newValue
    if (!isOrderEditModalOpen.value) fetchOrders()
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  const handleIsOrderProductModalOpenValueChange = (newValue: boolean) => {
    isOrderProductModalOpen.value = newValue
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchOrders()
  }

  const clearOrdersList = () => {
    orders.value = []
    currentPage.value = 1
    totalPages.value = 1
  }

  fetchOrders()
  watch(() => currentPage.value, fetchOrders)
  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) deleteOrder(orderIdToDelete.value)
    },
  )
</script>
