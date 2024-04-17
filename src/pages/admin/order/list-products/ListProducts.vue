<template>
  <div class="flex flex-col gap-3">
    <list-products-edit
      :key="isEditModalOpen.toString()"
      :is-open="isEditModalOpen"
      :list-product="listProduct"
      @handleModalClose="handleListProductsEditModalClose"
    />
    <ConfirmationModal
      v-if="isConfirmationModalOpen"
      :is-open="isConfirmationModalOpen"
      :message="t('loads.informations.delete.confirmation_modal.title')"
      :ok-text="t('loads.informations.delete.confirmation_modal.buttons.confirm')"
      :cancel-text="t('loads.informations.delete.confirmation_modal.buttons.deny')"
      :is-loading="isConfirmationModalLoading"
      @isOpenValueChange="handleIsOpenConfirmationModalValueChange"
      @isLoadingValueChange="handleIsLoadingConfirmationModalValueChange"
    />
    <va-card>
      <va-card-title>{{ t('orders.listProducts.filter.title') }}</va-card-title>
      <va-card-content>
        <form class="flex flex-col gap-3" @submit.prevent="onFormSubmit()">
          <div class="flex flex-row gap-3">
            <va-input v-model="nameFilter" type="text" :label="t('orders.listProducts.filter.form.inputs.name')" />
            <va-input
              v-model="quantityFilter"
              type="number"
              :label="t('orders.listProducts.filter.form.inputs.quantity')"
            />
            <va-button class="px-2" color="primary" type="reset" @click="handleFilterClear()">{{
              t('orders.listProducts.filter.form.buttons.clear')
            }}</va-button>
            <va-button type="submit" class="px-2" color="info">{{
              t('orders.listProducts.filter.form.buttons.search')
            }}</va-button>
          </div>
          <VaCheckbox v-model="boxFilter" :label="t('orders.listProducts.filter.form.inputs.box')" />
        </form>
        <va-button class="mt-4" color="success" @click="handleProductAddRedirect()">{{
          t('orders.listProducts.new_product.button')
        }}</va-button>
      </va-card-content>
    </va-card>
    <va-card>
      <va-card-title>{{ t('orders.listProducts.table.title') }}</va-card-title>
      <va-card-content class="overflow-auto">
        <table class="va-table va-table--striped va-table--hoverable w-full">
          <thead>
            <tr>
              <th class="cursor-pointer">
                {{ t('orders.listProducts.table.headers.name') }}
              </th>
              <th class="cursor-pointer" @click="handleSorting('quantity')">
                <sorting-icon-div :text="t('orders.listProducts.table.headers.quantity')" />
              </th>
              <th class="cursor-pointer" @click="handleSorting('box')">
                <sorting-icon-div :text="t('orders.listProducts.table.headers.box')" />
              </th>
              <th>{{ t('orders.listProducts.table.headers.actions') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="orderProduct in orderProducts" :key="orderProduct.id">
              <td class="w-[30%]">{{ orderProduct.product.name }}</td>
              <td class="">{{ orderProduct.quantity }}</td>
              <td class="">{{ String(orderProduct.box).toLocaleUpperCase() }}</td>
              <td>
                <va-button
                  class="action-btn"
                  color="info"
                  icon="edit"
                  plain
                  @click="handleProductListEdition(orderProduct.id, orderProduct.quantity, orderProduct.box)"
                />
                <va-button
                  class="action-btn"
                  color="danger"
                  icon="delete"
                  plain
                  @click="handleProductUnlink(orderProduct.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </va-card-content>
    </va-card>
    <div>
      <va-button class="mt-4" color="primary" @click="router.push({ name: 'order-info' })">{{
        t('orders.listProducts.buttons.back')
      }}</va-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import router from '../../../../router'
  import orderProductsService from '../../../../services/api/orderProducts'
  import SortingIconDiv from '../../../../components/sorting-icon-div/SortingIconDiv.vue'
  import ListProductsEdit from './list-products-edit/ListProductsEdit.vue'
  import ConfirmationModal from '../../../../components/modals/ConfirmationModal.vue'
  import { useGlobalStore } from '../../../../stores/global-store'
  import { useToast } from 'vuestic-ui'

  const { t } = useI18n()
  const { init } = useToast()

  const orderId = ref(Number(router.currentRoute.value.params.id))
  const orderProducts = ref([] as any)

  const nameFilter = ref('')
  const quantityFilter = ref('')
  const boxFilter = ref(false)
  const sortColumn = ref('quantity')
  const sortDirection = ref('desc')

  const isEditModalOpen = ref(false)
  const listProduct = ref({} as any)

  const isConfirmationModalOpen = ref(false)
  const productIdToUnlink = ref(-1)
  const isConfirmationModalLoading = ref(false)

  const onFormSubmit = () => {
    fetchListProducts(orderId.value)
  }

  const handleFilterClear = () => {
    nameFilter.value = ''
    quantityFilter.value = ''
    boxFilter.value = false
    fetchListProducts(orderId.value)
  }

  const handleProductAddRedirect = () => {
    router.push({
      name: 'add-product-to-order',
      params: { id: orderId.value, code: router.currentRoute.value.params.code },
    })
  }

  const handleProductListEdition = (id: number, quantity: number, box: boolean) => {
    if (useGlobalStore().user.profile === 'admin') {
      listProduct.value = { id, quantity, box }
      isEditModalOpen.value = true
    } else {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
    }
  }

  const fetchListProducts = async (orderId: number) => {
    try {
      if (orderId) {
        const response = await orderProductsService.list({
          order_id: orderId,
          productName: nameFilter.value,
          quantity: quantityFilter.value,
          box: boxFilter.value,
          sortColumn: sortColumn.value,
          sortDirection: sortDirection.value,
        })
        if (response.status === 204) orderProducts.value = []
        else if (response.status === 200) orderProducts.value = response.data.orderProducts
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleProductUnlink = (id: number) => {
    if (useGlobalStore().user.profile === 'admin') {
      productIdToUnlink.value = id
      isConfirmationModalOpen.value = true
    } else {
      init({
        message: `${t('messages.toast.profile_permission.error')}: ${useGlobalStore().user.profile.toUpperCase()}`,
        color: 'danger',
      })
    }
  }

  const unlinkProductFromList = async (id: number) => {
    try {
      const response = await orderProductsService.delete(id)
      if (response.status === 200) {
        isConfirmationModalOpen.value = false
        isConfirmationModalLoading.value = false
        fetchListProducts(orderId.value)
        init({ message: t('messages.toast.order.list_products.modal.delete.success'), color: 'success' })
      }
    } catch (error) {
      console.error(error)
      init({ message: t('messages.toast.order.list_products.delete.error'), color: 'danger' })
    }
  }

  const handleSorting = (column: string) => {
    if (sortColumn.value === column) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortColumn.value = column
      sortDirection.value = 'asc'
    }
    fetchListProducts(orderId.value)
  }

  const handleListProductsEditModalClose = (value: boolean) => {
    isEditModalOpen.value = value
    fetchListProducts(orderId.value)
  }

  const handleIsOpenConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalOpen.value = newValue
  }

  const handleIsLoadingConfirmationModalValueChange = (newValue: boolean) => {
    isConfirmationModalLoading.value = newValue
  }

  fetchListProducts(orderId.value)

  watch(
    () => isConfirmationModalLoading.value,
    () => {
      if (isConfirmationModalLoading.value) unlinkProductFromList(productIdToUnlink.value)
    },
  )
</script>
